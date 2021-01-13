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

import { execute as commonExecute } from 'language-common';
import jsforce from 'jsforce';
import { curry, mapValues, flatten } from 'lodash-fp';

/**
 * Outputs basic information about an sObject to `STDOUT`.
 * @public
 * @example
 *  describe('obj_name')
 * @function
 * @param {String} sObject - API name of the sObject.
 * @param {State} state - Runtime state.
 * @returns {State}
 */
export const describe = curry(function (sObject, state) {
  let { connection } = state;

  return connection
    .sobject(sObject)
    .describe()
    .then((result) => {
      console.log('Label : ' + result.label);
      console.log('Num of Fields : ' + result.fields.length);

      return {
        ...state,
        references: [result, ...state.references],
      };
    })
    .catch(function (err) {
      console.error(err);
      return err;
    });
});

/**
 * Retrieves a Salesforce sObject(s).
 * @public
 * @example
 *  retrieve('ContentVersion', '0684K0000020Au7QAE/VersionData');
 * @function
 * @param {String} sObject - The sObject to retrieve
 * @param {String} id - The id of the record
 * @param {Function} callback - A callback to execute once the record is retrieved
 * @param {State} state - Runtime state
 * @returns {State}
 */
export const retrieve = curry(function (sObject, id, callback, state) {
  let { connection } = state;

  const finalId = recursivelyExpandReferences(id)(state);

  return connection
    .sobject(sObject)
    .retrieve(finalId)
    .then((result) => {
      return {
        ...state,
        references: [result, ...state.references],
      };
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
 * @example
 *  query(`SELECT Id FROM Patient__c WHERE Health_ID__c = '${state.data.field1}'`);
 * @function
 * @param {String} qs - A query string.
 * @param {State} state - Runtime state.
 * @returns {Operation}
 */
export const query = curry(function (qs, state) {
  let { connection, references } = state;
  console.log(`Executing query: ${qs}`);

  return connection.query(qs, function (err, result) {
    if (err) {
      return console.error(err);
    }

    console.log(result);

    return {
      ...state,
      references: [result, ...state.references],
    };
  });
});

/**
 * Create and execute a bulk job.
 * @public
 * @example
 *  bulk('Patient__c', 'insert', { failOnError: true }, state => {
 *    return state.data.someArray.map(x => {
 *      return { 'Age__c': x.age, 'Name': x.name }
 *    })
 *  });
 * @function
 * @param {String} sObject - API name of the sObject.
 * @param {String} operation - The bulk operation to be performed
 * @param {String} options - Options passed to the bulk api.
 * @param {Function} fun - A function which takes state and returns an array.
 * @param {State} state - Runtime state.
 * @returns {Operation}
 */
export const bulk = curry(function (sObject, operation, options, fun, state) {
  let { connection, references } = state;
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

  console.info('Creating batch for job.');
  var batch = job.createBatch();

  console.info('Executing batch.');
  batch.execute(finalAttrs);

  return batch
    .on('queue', function (batchInfo) {
      console.info(batchInfo);
      const batchId = batchInfo.id;
      var batch = job.batch(batchId);

      batch.on('error', function (err) {
        job.close();
        console.error('Request error:');
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
        console.error('Errors detected:');
        throw res;
      } else {
        console.log('Result : ' + JSON.stringify(res, null, 2));
        return {
          ...state,
          references: [res, ...state.references],
        };
      }
    });
});

/**
 * Create a new object.
 * @public
 * @example
 *  create('obj_name', {
 *    attr1: "foo",
 *    attr2: "bar"
 *  })
 * @function
 * @param {String} sObject - API name of the sObject.
 * @param {Object} attrs - Field attributes for the new object.
 * @param {State} state - Runtime state.
 * @returns {Operation}
 */
export const create = curry(function (sObject, attrs, state) {
  let { connection, references } = state;
  const finalAttrs = expandReferences(state, attrs);
  console.info(`Creating ${sObject}`, finalAttrs);

  return connection.create(sObject, finalAttrs).then(function (recordResult) {
    console.log('Result : ' + JSON.stringify(recordResult));
    return {
      ...state,
      references: [recordResult, ...state.references],
    };
  });
});

/**
 * Create a new object if conditions are met.
 * @public
 * @example
 *  createIf(true, 'obj_name', {
 *    attr1: "foo",
 *    attr2: "bar"
 *  })
 * @function
 * @param {boolean} logical - a logical statement that will be evaluated.
 * @param {String} sObject - API name of the sObject.
 * @param {Object} attrs - Field attributes for the new object.
 * @param {State} state - Runtime state.
 * @returns {Operation}
 */
export const createIf = curry(function (logical, sObject, attrs, state) {
  let { connection, references } = state;
  const finalAttrs = expandReferences(state, attrs);
  if (logical) {
    console.info(`Creating ${sObject}`, finalAttrs);
  } else {
    console.info(`Not creating ${sObject} because logical is false.`);
  }

  if (logical) {
    return connection.create(sObject, finalAttrs).then(function (recordResult) {
      console.log('Result : ' + JSON.stringify(recordResult));
      return {
        ...state,
        references: [recordResult, ...state.references],
      };
    });
  } else {
    return {
      ...state,
    };
  }
});

/**
 * Upsert an object.
 * @public
 * @example
 *  upsert('obj_name', 'ext_id', {
 *    attr1: "foo",
 *    attr2: "bar"
 *  })
 * @function
 * @param {String} sObject - API name of the sObject.
 * @param {String} externalId - ID.
 * @param {Object} attrs - Field attributes for the new object.
 * @param {State} state - Runtime state.
 * @returns {Operation}
 */
export const upsert = curry(function (sObject, externalId, attrs, state) {
  let { connection, references } = state;
  const finalAttrs = expandReferences(state, attrs);
  console.info(
    `Upserting ${sObject} with externalId`,
    externalId,
    ':',
    finalAttrs
  );

  return connection
    .upsert(sObject, finalAttrs, externalId)
    .then(function (recordResult) {
      console.log('Result : ' + JSON.stringify(recordResult));
      return {
        ...state,
        references: [recordResult, ...state.references],
      };
    });
});

/**
 * Upsert if conditions are met.
 * @public
 * @example
 *  upsertIf(true, 'obj_name', 'ext_id', {
 *    attr1: "foo",
 *    attr2: "bar"
 *  })
 * @function
 * @param {boolean} logical - a logical statement that will be evaluated.
 * @param {String} sObject - API name of the sObject.
 * @param {String} externalId - ID.
 * @param {Object} attrs - Field attributes for the new object.
 * @param {State} state - Runtime state.
 * @returns {Operation}
 */
export const upsertIf = curry(function (
  logical,
  sObject,
  externalId,
  attrs,
  state
) {
  let { connection, references } = state;
  const finalAttrs = expandReferences(state, attrs);
  if (logical) {
    console.info(
      `Upserting ${sObject} with externalId`,
      externalId,
      ':',
      finalAttrs
    );
  } else {
    console.info(`Not upserting ${sObject} because logical is false.`);
  }

  if (logical) {
    return connection
      .upsert(sObject, finalAttrs, externalId)
      .then(function (recordResult) {
        console.log('Result : ' + JSON.stringify(recordResult));
        return {
          ...state,
          references: [recordResult, ...state.references],
        };
      });
  } else {
    return {
      ...state,
    };
  }
});

/**
 * Update an object.
 * @public
 * @example
 *  update('obj_name', {
 *    attr1: "foo",
 *    attr2: "bar"
 *  })
 * @function
 * @param {String} sObject - API name of the sObject.
 * @param {Object} attrs - Field attributes for the new object.
 * @param {State} state - Runtime state.
 * @returns {Operation}
 */
export const update = curry(function (sObject, attrs, state) {
  let { connection, references } = state;
  const finalAttrs = expandReferences(state, attrs);
  console.info(`Updating ${sObject}`, finalAttrs);

  return connection.update(sObject, finalAttrs).then(function (recordResult) {
    console.log('Result : ' + JSON.stringify(recordResult));
    return {
      ...state,
      references: [recordResult, ...state.references],
    };
  });
});

/**
 * Get a reference ID by an index.
 * @public
 * @example
 *  reference(0)
 * @function
 * @param {number} position - Position for references array.
 * @param {State} state - Array of references.
 * @returns {State}
 */
export const reference = curry(function (position, state) {
  const { references } = state;
  return references[position].id;
});

/**
 * Creates a connection.
 * @example
 *  createConnection(state)
 * @function
 * @param {State} state - Runtime state.
 * @returns {State}
 */
function createConnection(state) {
  const { loginUrl } = state.configuration;

  if (!loginUrl) {
    throw new Error('loginUrl missing from configuration.');
  }

  return { ...state, connection: new jsforce.Connection({ loginUrl }) };
}

/**
 * Performs a login.
 * @example
 *  login(state)
 * @function
 * @param {State} state - Runtime state.
 * @returns {State}
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
 * @param {Operation} operations - Operations
 * @returns {State}
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
 * @example
 *  cleanupState(state)
 * @function
 * @param {State} state
 * @returns {State}
 */
function cleanupState(state) {
  delete state.connection;
  return state;
}

/**
 * Flattens an array of operations.
 * @public
 * @example
 *  steps(
 *    createIf(params),
 *    update(params)
 *  )
 * @function
 * @returns {Array}
 */
export function steps(...operations) {
  return flatten(operations);
}

/**
 * Recursively expand object|number|string|boolean|array, each time resolving function calls and returning the resolved values
 * @param {any} thing - Thing to expand
 * @returns {object|number|string|boolean|array} expandedResult
 */
export function recursivelyExpandReferences(thing) {
  return (state) => {
    if (typeof thing !== 'object')
      return typeof thing == 'function' ? thing(state) : thing;
    let result = mapValues(function (value) {
      if (Array.isArray(value)) {
        return value.map((item) => {
          return recursivelyExpandReferences(item)(state);
        });
      } else {
        return recursivelyExpandReferences(value)(state);
      }
    })(thing);
    if (Array.isArray(thing)) result = Object.values(result);
    return result;
  };
}

/**
 * Expands references.
 * @example
 *  expandReferences(
 *    state,
 *    {
 *      attr1: "foo",
 *      attr2: "bar"
 *    }
 *  )
 * @function
 * @param {State} state - Runtime state.
 * @param {Object} attrs - Field attributes for the new object.
 * @returns {State}
 */
function expandReferences(state, attrs) {
  return mapValues(function (value) {
    return typeof value == 'function' ? value(state) : value;
  })(attrs);
}

export { lookup, relationship } from './sourceHelpers';

// Note that we expose the entire axios package to the user here.
import axios from 'axios';
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
} from 'language-common';
