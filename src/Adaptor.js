/** @module Adaptor */

/**
 * @typedef {Object} State
 * @property {object} data JSON Data.
 * @property {Array<Reference>} references History of all previous operations.
 */

/**
 * @typedef {Function} Operation
 * @param {State} state
 */

import {
  execute as commonExecute,
  composeNextState,
  recursivelyExpandReferences,
} from "language-common";
import jsforce from "jsforce";
import { curry, mapValues, flatten } from "lodash-fp";

/**
 * Outputs basic information about an sObject to `STDOUT`.
 * @public
 * @function
 * @param {string} sObject - API name of the sObject.
 * @param {state} state - Runtime state.
 * @param {operation} callback - Function which takes state and returns a Promise
 * @returns {state} state
 * @example
 *  describe('obj_name');
 */
export const describe = curry(function (sObject, state, callback) {
  let { connection } = state;

  return connection
    .sobject(sObject)
    .describe()
    .then((result) => {
      console.log("Label : " + result.label);
      console.log("Num of Fields : " + result.fields.length);
      return composeNextState(state, result);
    })
    .then((state) => {
      if (callback) {
        return callback(state);
      }
      return state;
    })
    .catch(function (err) {
      console.error(err);
      return err;
    });
});

/**
 * Retrieves a Salesforce sObject(s).
 * @public
 * @function
 * @param {string} sObject - The sObject to retrieve
 * @param {string} id - The id of the record
 * @param {operation} callback - Function which takes state and returns a Promise
 * @param {state} state - Runtime state
 * @returns {state} state
 * @example
 *  retrieve('ContentVersion', '0684K0000020Au7QAE/VersionData');
 */
export const retrieve = curry(function (sObject, id, callback, state) {
  let { connection } = state;

  const finalId = recursivelyExpandReferences(id)(state);

  return connection
    .sobject(sObject)
    .retrieve(finalId)
    .then((result) => {
      return composeNextState(state, result);
    })
    .then((state) => {
      if (callback) {
        return callback(state);
      }
      return state;
    })
    .catch(function (err) {
      console.error(err);
      return err;
    });
});

/**
 * Execute an SOQL query.
 * @public
 * @function
 * @param {string} qs - A query string.
 * @param {state} state - Runtime state.
 * @param {operation} callback - Function which takes state and returns a Promise
 * @returns {state} state
 * @example
 *  query(`SELECT Id FROM Patient__c WHERE Health_ID__c = '${state.data.field1}'`);
 */
export const query = curry(function (qs, state, callback) {
  let { connection } = state;
  const finalQs = recursivelyExpandReferences(qs)(state);
  console.log(`Executing query: ${finalQs}`);

  return connection.query(finalQs, function (err, result) {
    if (err) {
      return console.error(err);
    }

    console.log(result);
    const nextState = composeNextState(state, result);
    if (callback) return callback(nextState);
    return nextState;
  });
});

/**
 * Create and execute a bulk job.
 * @public
 * @function
 * @param {string} sObject - API name of the sObject.
 * @param {string} operation - The bulk operation to be performed
 * @param {string} options - Options passed to the bulk api.
 * @param {function} fun - A function which takes state and returns an array.
 * @param {state} state - Runtime state.
 * @param {operation} callback - Function which takes state and returns a Promise
 * @returns {state} state
 * @example
 *  bulk('Patient__c', 'insert', { failOnError: true }, state => {
 *    return state.data.someArray.map(x => {
 *      return { 'Age__c': x.age, 'Name': x.name }
 *    })
 *  });
 */
export const bulk = curry(function (
  sObject,
  operation,
  options,
  fun,
  state,
  callback
) {
  let { connection } = state;
  let { failOnError, allowNoOp } = options;
  const finalAttrs = fun(state);

  if (allowNoOp && finalAttrs.length === 0) {
    console.info(
      `No items in ${sObject} array. Skipping bulk ${operation} operation.`
    );
    return state;
  }

  console.info(`Creating bulk ${operation} job for ${sObject}`, finalAttrs);
  const job = connection.bulk.createJob(sObject, operation, options);

  console.info("Creating batch for job.");
  var batch = job.createBatch();

  console.info("Executing batch.");
  batch.execute(finalAttrs);

  return batch
    .on("queue", function (batchInfo) {
      console.info(batchInfo);
      const batchId = batchInfo.id;
      var batch = job.batch(batchId);

      batch.on("error", function (err) {
        job.close();
        console.error("Request error:");
        throw err;
      });

      batch.poll(3 * 1000, 120 * 1000);
    })
    .then((res) => {
      job.close();
      const errors = res.filter((item) => {
        return item.success === false;
      });

      if (failOnError && errors.length > 0) {
        console.error("Errors detected:");
        throw res;
      } else {
        console.log("Result : " + JSON.stringify(res, null, 2));
        const nextState = composeNextState(state, res);
        if (callback) return callback(nextState);
        return nextState;
      }
    });
});

/**
 * Create a new object.
 * @public
 * @function
 * @param {string} sObject - API name of the sObject.
 * @param {object} attrs - Field attributes for the new object.
 * @param {state} state - Runtime state.
 * @param {operation} callback - Function which takes state and returns a Promise
 * @returns {state} state
 * @example
 *  create('obj_name', {
 *    attr1: "foo",
 *    attr2: "bar"
 *  })
 */
export const create = curry(function (sObject, attrs, state, callback) {
  let { connection, references } = state;
  const finalAttrs = recursivelyExpandReferences(attrs)(state);
  console.info(`Creating ${sObject}`, finalAttrs);

  return connection.create(sObject, finalAttrs).then(function (recordResult) {
    console.log("Result : " + JSON.stringify(recordResult));
    const nextState = composeNextState(state, recordResult);
    if (callback) return callback(nextState);
    return nextState;
  });
});

/**
 * Create a new object if conditions are met.
 * @public
 * @function
 * @param {boolean} logical - a logical statement that will be evaluated.
 * @param {string} sObject - API name of the sObject.
 * @param {object} attrs - Field attributes for the new object.
 * @param {state} state - Runtime state.
 * @param {operation} callback - Function which takes state and returns a Promise
 * @returns {state} state
 * @example
 *  createIf(true, 'obj_name', {
 *    attr1: "foo",
 *    attr2: "bar"
 *  })
 */
export const createIf = curry(function (
  logical,
  sObject,
  attrs,
  state,
  callback
) {
  let { connection } = state;
  const finalAttrs = recursivelyExpandReferences(attrs)(state);
  if (logical) {
    console.info(`Creating ${sObject}`, finalAttrs);
  } else {
    console.info(`Not creating ${sObject} because logical is false.`);
  }

  if (logical) {
    return connection.create(sObject, finalAttrs).then(function (recordResult) {
      console.log("Result : " + JSON.stringify(recordResult));
      const nextState = composeNextState(state, recordResult);
      if (callback) return callback(nextState);
      return nextState;
    });
  } else {
    const nextState = {
      ...state,
    };
    if (callback) return callback(nextState);
    return nextState;
  }
});

/**
 * Upsert an object.
 * @public
 * @function
 * @param {string} sObject - API name of the sObject.
 * @param {string} externalId - ID.
 * @param {object} attrs - Field attributes for the new object.
 * @param {state} state - Runtime state.
 * @param {operation} callback - Function which takes state and returns a Promise
 * @returns {state} state
 * @example
 *  upsert('obj_name', 'ext_id', {
 *    attr1: "foo",
 *    attr2: "bar"
 *  })
 */
export const upsert = curry(function (
  sObject,
  externalId,
  attrs,
  state,
  callback
) {
  let { connection } = state;
  const finalAttrs = recursivelyExpandReferences(attrs)(state);
  const finalExternalId = recursivelyExpandReferences(externalId)(state);
  console.info(
    `Upserting ${sObject} with externalId`,
    finalExternalId,
    ":",
    finalAttrs
  );

  return connection
    .upsert(sObject, finalAttrs, finalExternalId)
    .then(function (recordResult) {
      console.log("Result : " + JSON.stringify(recordResult));
      const nextState = composeNextState(state, recordResult);
      if (callback) return callback(nextState);
      return nextState;
    });
});

/**
 * Upsert if conditions are met.
 * @public
 * @function
 * @param {boolean} logical - a logical statement that will be evaluated.
 * @param {string} sObject - API name of the sObject.
 * @param {string} externalId - ID.
 * @param {object} attrs - Field attributes for the new object.
 * @param {state} state - Runtime state.
 * @param {operation} callback - Function which takes state and returns a Promise
 * @returns {state} state
 * @example
 *  upsertIf(true, 'obj_name', 'ext_id', {
 *    attr1: "foo",
 *    attr2: "bar"
 *  })
 */
export const upsertIf = curry(function (
  logical,
  sObject,
  externalId,
  attrs,
  state,
  callback
) {
  let { connection } = state;
  const finalAttrs = recursivelyExpandReferences(attrs)(state);
  const finalExternalId = recursivelyExpandReferences(externalId)(state);
  if (logical) {
    console.info(
      `Upserting ${sObject} with externalId`,
      finalExternalId,
      ":",
      finalAttrs
    );
  } else {
    console.info(`Not upserting ${sObject} because logical is false.`);
  }

  if (logical) {
    return connection
      .upsert(sObject, finalAttrs, finalExternalId)
      .then(function (recordResult) {
        console.log("Result : " + JSON.stringify(recordResult));
        const nextState = composeNextState(state, recordResult);
        if (callback) return callback(nextState);
        return nextState;
      });
  } else {
    const nextState = {
      ...state,
    };
    if (callback) return callback(nextState);
    return nextState;
  }
});

/**
 * Update an object.
 * @public
 * @function
 * @param {string} sObject - API name of the sObject.
 * @param {object} attrs - Field attributes for the new object.
 * @param {state} state - Runtime state.
 * @param {operation} callback - Function which takes state and returns a Promise
 * @returns {state} state
 * @example
 *  update('obj_name', {
 *    attr1: "foo",
 *    attr2: "bar"
 *  })
 */
export const update = curry(function (sObject, attrs, state, callback) {
  let { connection } = state;
  const finalAttrs = recursivelyExpandReferences(attrs)(state);
  console.info(`Updating ${sObject}`, finalAttrs);

  return connection.update(sObject, finalAttrs).then(function (recordResult) {
    console.log("Result : " + JSON.stringify(recordResult));
    const nextState = composeNextState(state, recordResult);
    if (callback) return callback(nextState);
    return nextState;
  });
});

/**
 * Get a reference ID by an index.
 * @public
 * @function
 * @param {number} position - Position for references array.
 * @param {state} state - Runtime state.
 * @param {operation} [callback] - Function which takes state and returns a Promise
 * @returns {state} state
 * @example
 *  reference(0)
 */
export const reference = curry(function (position, state, callback) {
  const { references } = state;
  const nextState = composeNextState(state, references[position].id);
  if (callback) return callback(nextState);
  return nextState;
});

/**
 * Creates a connection.
 * @function
 * @param {state} state - Runtime state.
 * @returns {state} state
 * @example
 * createConnection(state)
 */
function createConnection(state) {
  const { loginUrl } = state.configuration;

  if (!loginUrl) {
    throw new Error("loginUrl missing from configuration.");
  }

  return { ...state, connection: new jsforce.Connection({ loginUrl }) };
}

/**
 * Performs a login.
 * @function
 * @param {state} state - Runtime state.
 * @returns {state} state
 * @example
 *  login(state)
 */
function login(state) {
  const { username, password, securityToken } = state.configuration;
  let { connection } = state;
  console.info(`Logging in as ${username}.`);

  return (
    connection
      .login(username, password + securityToken)
      // NOTE: Uncomment this to debug connection issues.
      // .then(response => {
      //   console.log(connection);
      //   console.log(response);
      //   return state;
      // })
      .then(() => state)
  );
}

/**
 * Executes an operation.
 * @function
 * @param {operation} operations - Operations
 * @returns {state}
 */
export function execute(...operations) {
  const initialState = {
    logger: {
      info: console.info.bind(console),
      debug: console.log.bind(console),
    },
    references: [],
    data: null,
    configuration: {},
  };

  return (state) => {
    // Note: we no longer need `steps` anymore since `commonExecute`
    // takes each operation as an argument.
    return commonExecute(
      createConnection,
      login,
      ...flatten(operations),
      cleanupState
    )({ ...initialState, ...state });
  };
}

/**
 * Removes unserializable keys from the state.
 * @function
 * @param {state} state - Runtime state.
 * @returns {state} state
 * @example
 *  cleanupState(state)
 */
function cleanupState(state) {
  delete state.connection;
  return state;
}

/**
 * Flattens an array of operations.
 * @public
 * @function
 * @returns {array}
 * @example
 *  steps(
 *    createIf(params),
 *    update(params)
 *  )
 */
export function steps(...operations) {
  return flatten(operations);
}

export { lookup, relationship } from "./sourceHelpers";

// Note that we expose the entire axios package to the user here.
import axios from "axios";
exports.axios = axios;

export {
  alterState,
  arrayToString,
  beta,
  combine,
  dataPath,
  dataValue,
  each,
  field,
  fields,
  humanProper,
  index,
  join,
  lastReferenceValue,
  map,
  merge,
  referencePath,
  source,
  sourceValue,
  toArray,
} from "language-common";
