"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.relationship = relationship;
exports.execute = execute;
exports.steps = steps;
Object.defineProperty(exports, "alterState", {
  enumerable: true,
  get: function () {
    return _languageCommon.alterState;
  }
});
Object.defineProperty(exports, "fn", {
  enumerable: true,
  get: function () {
    return _languageCommon.fn;
  }
});
Object.defineProperty(exports, "arrayToString", {
  enumerable: true,
  get: function () {
    return _languageCommon.arrayToString;
  }
});
Object.defineProperty(exports, "beta", {
  enumerable: true,
  get: function () {
    return _languageCommon.beta;
  }
});
Object.defineProperty(exports, "combine", {
  enumerable: true,
  get: function () {
    return _languageCommon.combine;
  }
});
Object.defineProperty(exports, "dataPath", {
  enumerable: true,
  get: function () {
    return _languageCommon.dataPath;
  }
});
Object.defineProperty(exports, "dataValue", {
  enumerable: true,
  get: function () {
    return _languageCommon.dataValue;
  }
});
Object.defineProperty(exports, "each", {
  enumerable: true,
  get: function () {
    return _languageCommon.each;
  }
});
Object.defineProperty(exports, "field", {
  enumerable: true,
  get: function () {
    return _languageCommon.field;
  }
});
Object.defineProperty(exports, "fields", {
  enumerable: true,
  get: function () {
    return _languageCommon.fields;
  }
});
Object.defineProperty(exports, "http", {
  enumerable: true,
  get: function () {
    return _languageCommon.http;
  }
});
Object.defineProperty(exports, "humanProper", {
  enumerable: true,
  get: function () {
    return _languageCommon.humanProper;
  }
});
Object.defineProperty(exports, "index", {
  enumerable: true,
  get: function () {
    return _languageCommon.index;
  }
});
Object.defineProperty(exports, "join", {
  enumerable: true,
  get: function () {
    return _languageCommon.join;
  }
});
Object.defineProperty(exports, "lastReferenceValue", {
  enumerable: true,
  get: function () {
    return _languageCommon.lastReferenceValue;
  }
});
Object.defineProperty(exports, "map", {
  enumerable: true,
  get: function () {
    return _languageCommon.map;
  }
});
Object.defineProperty(exports, "merge", {
  enumerable: true,
  get: function () {
    return _languageCommon.merge;
  }
});
Object.defineProperty(exports, "referencePath", {
  enumerable: true,
  get: function () {
    return _languageCommon.referencePath;
  }
});
Object.defineProperty(exports, "source", {
  enumerable: true,
  get: function () {
    return _languageCommon.source;
  }
});
Object.defineProperty(exports, "sourceValue", {
  enumerable: true,
  get: function () {
    return _languageCommon.sourceValue;
  }
});
Object.defineProperty(exports, "toArray", {
  enumerable: true,
  get: function () {
    return _languageCommon.toArray;
  }
});
exports.reference = exports.update = exports.upsertIf = exports.upsert = exports.createIf = exports.create = exports.destroy = exports.bulk = exports.query = exports.retrieve = exports.describe = void 0;

var _languageCommon = require("@openfn/language-common");

var _jsforce = _interopRequireDefault(require("jsforce"));

var _lodashFp = require("lodash-fp");

var _axios = _interopRequireDefault(require("axios"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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

/**
 * Adds a lookup relation or 'dome insert' to a record.
 * @public
 * @example
 * Data Sourced Value:
 *  relationship("relationship_name__r", "externalID on related object", dataSource("path"))
 * Fixed Value:
 *  relationship("relationship_name__r", "externalID on related object", "hello world")
 * @constructor
 * @param {string} relationshipName - `__r` relationship field on the record.
 * @param {string} externalId - Salesforce ExternalID field.
 * @param {string} dataSource - resolvable source.
 * @returns {object}
 */
function relationship(relationshipName, externalId, dataSource) {
  return (0, _languageCommon.field)(relationshipName, state => {
    if (typeof dataSource == 'function') {
      return {
        [externalId]: dataSource(state)
      };
    }

    return {
      [externalId]: dataSource
    };
  });
}
/**
 * Outputs basic information about an sObject to `STDOUT`.
 * @public
 * @example
 * describe('obj_name')
 * @constructor
 * @param {String} sObject - API name of the sObject.
 * @param {State} state - Runtime state.
 * @returns {State}
 */


const describe = (0, _lodashFp.curry)(function (sObject, state) {
  let {
    connection
  } = state;
  return connection.sobject(sObject).describe().then(result => {
    console.log('Label : ' + result.label);
    console.log('Num of Fields : ' + result.fields.length);
    return { ...state,
      references: [result, ...state.references]
    };
  });
});
/**
 * Retrieves a Salesforce sObject(s).
 * @public
 * @example
 * retrieve('ContentVersion', '0684K0000020Au7QAE/VersionData');
 * @constructor
 * @param {String} sObject - The sObject to retrieve
 * @param {String} id - The id of the record
 * @param {Function} callback - A callback to execute once the record is retrieved
 * @param {State} state - Runtime state
 * @returns {State}
 */

exports.describe = describe;
const retrieve = (0, _lodashFp.curry)(function (sObject, id, callback, state) {
  let {
    connection
  } = state;
  const finalId = (0, _languageCommon.expandReferences)(id)(state);
  return connection.sobject(sObject).retrieve(finalId).then(result => {
    return { ...state,
      references: [result, ...state.references]
    };
  }).then(state => {
    if (callback) {
      return callback(state);
    }

    return state;
  });
});
/**
 * Execute an SOQL query.
 * Note that in an event of a query error,
 * error logs will be printed but the operation will not throw the error.
 * @public
 * @example
 * query(`SELECT Id FROM Patient__c WHERE Health_ID__c = '${state.data.field1}'`);
 * @constructor
 * @param {String} qs - A query string.
 * @param {State} state - Runtime state.
 * @returns {Operation}
 */

exports.retrieve = retrieve;
const query = (0, _lodashFp.curry)(function (qs, state) {
  let {
    connection
  } = state;
  qs = (0, _languageCommon.expandReferences)(qs)(state);
  console.log(`Executing query: ${qs}`);
  return connection.query(qs, function (err, result) {
    if (err) {
      return console.error(err);
    }

    console.log(result);
    return { ...state,
      references: [result, ...state.references]
    };
  });
});
/**
 * Create and execute a bulk job.
 * @public
 * @example
 * bulk('Patient__c', 'insert', { failOnError: true, pollInterval: 3000, pollTimeout: 240000 }, state => {
 *   return state.data.someArray.map(x => {
 *     return { 'Age__c': x.age, 'Name': x.name }
 *   })
 * });
 * @constructor
 * @param {String} sObject - API name of the sObject.
 * @param {String} operation - The bulk operation to be performed
 * @param {Object} options - Options passed to the bulk api.
 * @param {Function} fun - A function which takes state and returns an array.
 * @param {State} state - Runtime state.
 * @returns {Operation}
 */

exports.query = query;
const bulk = (0, _lodashFp.curry)(function (sObject, operation, options, fun, state) {
  const {
    connection
  } = state;
  const {
    failOnError,
    allowNoOp,
    pollTimeout,
    pollInterval
  } = options;
  const finalAttrs = fun(state);
  return new Promise((resolve, reject) => {
    if (allowNoOp && finalAttrs.length === 0) {
      console.info(`No items in ${sObject} array. Skipping bulk ${operation} operation.`);
      resolve(state);
      return state;
    }

    const timeout = pollTimeout || 240000;
    const interval = pollInterval || 6000;
    console.info(`Creating bulk ${operation} job for ${sObject}`, finalAttrs);
    const job = connection.bulk.createJob(sObject, operation, options);
    job.on('error', err => reject(err));
    console.info('Creating batch for job.');
    var batch = job.createBatch();
    console.info('Executing batch.');
    batch.execute(finalAttrs);
    batch.on('error', function (err) {
      job.close();
      console.error('Request error:');
      reject(err);
    });
    return batch.on('queue', function (batchInfo) {
      console.info(batchInfo);
      const batchId = batchInfo.id;
      var batch = job.batch(batchId);
      batch.poll(interval, timeout);
    }).then(res => {
      job.close();
      const errors = res.map((r, i) => ({ ...r,
        position: i + 1
      })).filter(item => {
        return !item.success;
      });
      errors.forEach(err => {
        err[`${options.extIdField}`] = finalAttrs[err.position - 1][options.extIdField];
      });

      if (failOnError && errors.length > 0) {
        console.error('Errors detected:');
        reject(JSON.stringify(errors, null, 2));
      } else {
        console.log('Result : ' + JSON.stringify(res, null, 2));
        resolve({ ...state,
          references: [res, ...state.references]
        });
        return { ...state,
          references: [res, ...state.references]
        };
      }
    });
  });
});
/**
 * Delete records of an object.
 * @public
 * @example
 * destroy('obj_name', [
 *  '0060n00000JQWHYAA5',
 *  '0090n00000JQEWHYAA5
 * ], { failOnError: true })
 * @constructor
 * @param {String} sObject - API name of the sObject.
 * @param {Object} attrs - Array of IDs of records to delete.
 * @param {Object} options - Options for the bulk delete operation.
 * @param {State} state - Runtime state.
 * @returns {Operation}
 */

exports.bulk = bulk;
const destroy = (0, _lodashFp.curry)(function (sObject, attrs, options, state) {
  let {
    connection
  } = state;
  const finalAttrs = (0, _languageCommon.expandReferences)(attrs)(state);
  const {
    failOnError
  } = options;
  console.info(`Deleting ${sObject} records`);
  return connection.sobject(sObject).del(finalAttrs).then(function (result) {
    const successes = result.filter(r => r.success);
    console.log('Sucessfully deleted: ', JSON.stringify(successes, null, 2));
    const failures = result.filter(r => !r.success);
    console.log('Failed to delete: ', JSON.stringify(failures, null, 2));
    if (failOnError && result.some(r => !r.success)) throw 'Some deletes failed; exiting with failure code.';
    return { ...state,
      references: [result, ...state.references]
    };
  });
});
/**
 * Create a new object.
 * @public
 * @example
 * create('obj_name', {
 *   attr1: "foo",
 *   attr2: "bar"
 * })
 * @constructor
 * @param {String} sObject - API name of the sObject.
 * @param {Object} attrs - Field attributes for the new object.
 * @param {State} state - Runtime state.
 * @returns {Operation}
 */

exports.destroy = destroy;
const create = (0, _lodashFp.curry)(function (sObject, attrs, state) {
  let {
    connection
  } = state;
  const finalAttrs = (0, _languageCommon.expandReferences)(attrs)(state);
  console.info(`Creating ${sObject}`, finalAttrs);
  return connection.create(sObject, finalAttrs).then(function (recordResult) {
    console.log('Result : ' + JSON.stringify(recordResult));
    return { ...state,
      references: [recordResult, ...state.references]
    };
  });
});
/**
 * Create a new object if conditions are met.
 * @public
 * @example
 * createIf(true, 'obj_name', {
 *   attr1: "foo",
 *   attr2: "bar"
 * })
 * @constructor
 * @param {boolean} logical - a logical statement that will be evaluated.
 * @param {String} sObject - API name of the sObject.
 * @param {Object} attrs - Field attributes for the new object.
 * @param {State} state - Runtime state.
 * @returns {Operation}
 */

exports.create = create;
const createIf = (0, _lodashFp.curry)(function (logical, sObject, attrs, state) {
  let {
    connection
  } = state;
  const finalAttrs = (0, _languageCommon.expandReferences)(attrs)(state);
  logical = (0, _languageCommon.expandReferences)(logical)(state);

  if (logical) {
    console.info(`Creating ${sObject}`, finalAttrs);
  } else {
    console.info(`Not creating ${sObject} because logical is false.`);
  }

  if (logical) {
    return connection.create(sObject, finalAttrs).then(function (recordResult) {
      console.log('Result : ' + JSON.stringify(recordResult));
      return { ...state,
        references: [recordResult, ...state.references]
      };
    });
  } else {
    return { ...state
    };
  }
});
/**
 * Upsert an object.
 * @public
 * @example
 * upsert('obj_name', 'ext_id', {
 *   attr1: "foo",
 *   attr2: "bar"
 * })
 * @constructor
 * @param {String} sObject - API name of the sObject.
 * @param {String} externalId - ID.
 * @param {Object} attrs - Field attributes for the new object.
 * @param {State} state - Runtime state.
 * @returns {Operation}
 */

exports.createIf = createIf;
const upsert = (0, _lodashFp.curry)(function (sObject, externalId, attrs, state) {
  let {
    connection
  } = state;
  const finalAttrs = (0, _languageCommon.expandReferences)(attrs)(state);
  console.info(`Upserting ${sObject} with externalId`, externalId, ':', finalAttrs);
  return connection.upsert(sObject, finalAttrs, externalId).then(function (recordResult) {
    console.log('Result : ' + JSON.stringify(recordResult));
    return { ...state,
      references: [recordResult, ...state.references]
    };
  });
});
/**
 * Upsert if conditions are met.
 * @public
 * @example
 * upsertIf(true, 'obj_name', 'ext_id', {
 *   attr1: "foo",
 *   attr2: "bar"
 * })
 * @constructor
 * @param {boolean} logical - a logical statement that will be evaluated.
 * @param {String} sObject - API name of the sObject.
 * @param {String} externalId - ID.
 * @param {Object} attrs - Field attributes for the new object.
 * @param {State} state - Runtime state.
 * @returns {Operation}
 */

exports.upsert = upsert;
const upsertIf = (0, _lodashFp.curry)(function (logical, sObject, externalId, attrs, state) {
  let {
    connection
  } = state;
  const finalAttrs = (0, _languageCommon.expandReferences)(attrs)(state);
  logical = (0, _languageCommon.expandReferences)(logical)(state);

  if (logical) {
    console.info(`Upserting ${sObject} with externalId`, externalId, ':', finalAttrs);
  } else {
    console.info(`Not upserting ${sObject} because logical is false.`);
  }

  if (logical) {
    return connection.upsert(sObject, finalAttrs, externalId).then(function (recordResult) {
      console.log('Result : ' + JSON.stringify(recordResult));
      return { ...state,
        references: [recordResult, ...state.references]
      };
    });
  } else {
    return { ...state
    };
  }
});
/**
 * Update an object.
 * @public
 * @example
 * update('obj_name', {
 *   attr1: "foo",
 *   attr2: "bar"
 * })
 * @constructor
 * @param {String} sObject - API name of the sObject.
 * @param {Object} attrs - Field attributes for the new object.
 * @param {State} state - Runtime state.
 * @returns {Operation}
 */

exports.upsertIf = upsertIf;
const update = (0, _lodashFp.curry)(function (sObject, attrs, state) {
  let {
    connection
  } = state;
  const finalAttrs = (0, _languageCommon.expandReferences)(attrs)(state);
  console.info(`Updating ${sObject}`, finalAttrs);
  return connection.update(sObject, finalAttrs).then(function (recordResult) {
    console.log('Result : ' + JSON.stringify(recordResult));
    return { ...state,
      references: [recordResult, ...state.references]
    };
  });
});
/**
 * Get a reference ID by an index.
 * @public
 * @example
 * reference(0)
 * @constructor
 * @param {number} position - Position for references array.
 * @param {State} state - Array of references.
 * @returns {State}
 */

exports.update = update;
const reference = (0, _lodashFp.curry)(function (position, state) {
  const {
    references
  } = state;
  return references[position].id;
});
/**
 * Creates a connection.
 * @example
 * createConnection(state)
 * @function
 * @param {State} state - Runtime state.
 * @returns {State}
 */

exports.reference = reference;

function createConnection(state) {
  const {
    loginUrl
  } = state.configuration;

  if (!loginUrl) {
    throw new Error('loginUrl missing from configuration.');
  }

  return { ...state,
    connection: new _jsforce.default.Connection({
      loginUrl
    })
  };
}
/**
 * Performs a login.
 * @example
 * login(state)
 * @function
 * @param {State} state - Runtime state.
 * @returns {State}
 */


function login(state) {
  const {
    username,
    password,
    securityToken
  } = state.configuration;
  let {
    connection
  } = state;
  console.info(`Logging in as ${username}.`);
  return connection.login(username, password + securityToken) // NOTE: Uncomment this to debug connection issues.
  // .then(response => {
  //   console.log(connection);
  //   console.log(response);
  //   return state;
  // })
  .then(() => state);
}
/**
 * Executes an operation.
 * @function
 * @param {Operation} operations - Operations
 * @returns {State}
 */


function execute(...operations) {
  const initialState = {
    logger: {
      info: console.info.bind(console),
      debug: console.log.bind(console)
    },
    references: [],
    data: null,
    configuration: {}
  };
  return state => {
    // Note: we no longer need `steps` anymore since `commonExecute`
    // takes each operation as an argument.
    return (0, _languageCommon.execute)(createConnection, login, ...(0, _lodashFp.flatten)(operations), cleanupState)({ ...initialState,
      ...state
    });
  };
}
/**
 * Removes unserializable keys from the state.
 * @example
 * cleanupState(state)
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
 * @example
 * steps(
 *   createIf(params),
 *   update(params)
 * )
 * @function
 * @returns {Array}
 */


function steps(...operations) {
  return (0, _lodashFp.flatten)(operations);
} // Note that we expose the entire axios package to the user here.


exports.axios = _axios.default;