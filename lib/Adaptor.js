'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.humanProper = exports.alterState = exports.arrayToString = exports.toArray = exports.beta = exports.index = exports.lastReferenceValue = exports.referencePath = exports.dataValue = exports.dataPath = exports.merge = exports.combine = exports.map = exports.sourceValue = exports.source = exports.field = exports.fields = exports.join = exports.each = exports.relationship = exports.lookup = exports.reference = exports.update = exports.upsertIf = exports.upsert = exports.createIf = exports.create = exports.bulk = exports.query = exports.describe = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; /** @module Adaptor */

/**
* @typedef {Object} State
* @property {object} data JSON Data.
* @property {Array<Reference>} references History of all previous operations.
*/

/**
* @typedef {Function} Operation
* @param {State} state
*/

exports.execute = execute;
exports.steps = steps;

var _sourceHelpers = require('./sourceHelpers');

Object.defineProperty(exports, 'lookup', {
  enumerable: true,
  get: function get() {
    return _sourceHelpers.lookup;
  }
});
Object.defineProperty(exports, 'relationship', {
  enumerable: true,
  get: function get() {
    return _sourceHelpers.relationship;
  }
});

var _languageCommon = require('language-common');

Object.defineProperty(exports, 'each', {
  enumerable: true,
  get: function get() {
    return _languageCommon.each;
  }
});
Object.defineProperty(exports, 'join', {
  enumerable: true,
  get: function get() {
    return _languageCommon.join;
  }
});
Object.defineProperty(exports, 'fields', {
  enumerable: true,
  get: function get() {
    return _languageCommon.fields;
  }
});
Object.defineProperty(exports, 'field', {
  enumerable: true,
  get: function get() {
    return _languageCommon.field;
  }
});
Object.defineProperty(exports, 'source', {
  enumerable: true,
  get: function get() {
    return _languageCommon.source;
  }
});
Object.defineProperty(exports, 'sourceValue', {
  enumerable: true,
  get: function get() {
    return _languageCommon.sourceValue;
  }
});
Object.defineProperty(exports, 'map', {
  enumerable: true,
  get: function get() {
    return _languageCommon.map;
  }
});
Object.defineProperty(exports, 'combine', {
  enumerable: true,
  get: function get() {
    return _languageCommon.combine;
  }
});
Object.defineProperty(exports, 'merge', {
  enumerable: true,
  get: function get() {
    return _languageCommon.merge;
  }
});
Object.defineProperty(exports, 'dataPath', {
  enumerable: true,
  get: function get() {
    return _languageCommon.dataPath;
  }
});
Object.defineProperty(exports, 'dataValue', {
  enumerable: true,
  get: function get() {
    return _languageCommon.dataValue;
  }
});
Object.defineProperty(exports, 'referencePath', {
  enumerable: true,
  get: function get() {
    return _languageCommon.referencePath;
  }
});
Object.defineProperty(exports, 'lastReferenceValue', {
  enumerable: true,
  get: function get() {
    return _languageCommon.lastReferenceValue;
  }
});
Object.defineProperty(exports, 'index', {
  enumerable: true,
  get: function get() {
    return _languageCommon.index;
  }
});
Object.defineProperty(exports, 'beta', {
  enumerable: true,
  get: function get() {
    return _languageCommon.beta;
  }
});
Object.defineProperty(exports, 'toArray', {
  enumerable: true,
  get: function get() {
    return _languageCommon.toArray;
  }
});
Object.defineProperty(exports, 'arrayToString', {
  enumerable: true,
  get: function get() {
    return _languageCommon.arrayToString;
  }
});
Object.defineProperty(exports, 'alterState', {
  enumerable: true,
  get: function get() {
    return _languageCommon.alterState;
  }
});
Object.defineProperty(exports, 'humanProper', {
  enumerable: true,
  get: function get() {
    return _languageCommon.humanProper;
  }
});

var _jsforce = require('jsforce');

var _jsforce2 = _interopRequireDefault(_jsforce);

var _lodashFp = require('lodash-fp');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

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
var describe = exports.describe = (0, _lodashFp.curry)(function (sObject, state) {
  var connection = state.connection;


  return connection.sobject(sObject).describe().then(function (meta) {
    console.log('Label : ' + meta.label);
    console.log('Num of Fields : ' + meta.fields.length);

    return state;
  }).catch(function (err) {
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
var query = exports.query = (0, _lodashFp.curry)(function (qs, state) {
  var connection = state.connection,
      references = state.references;


  return connection.query(qs, function (err, result) {
    if (err) {
      return console.error(err);
    }

    console.log(result);

    return _extends({}, state, { references: [result].concat(_toConsumableArray(state.references))
    });
  });
});

/**
 * Create and execute a bulk job.
 * @public
 * @example
 *  bulk('Patient__c', 'insert', { failOnError: true }, state => {
 *    return state.data.someArray.map(item => {
 *      return { 'Age__c': f.age, 'Name': f.name }
 *    })
 *  });
 * @function
 * @param {String} sObject - API name of the sObject.
 * @param {String} operation - API name of the sObject.
 * @param {String} options - API name of the sObject.
 * @param {Function} fun - A function which takes state and returns an array.
 * @param {State} state - Runtime state.
 * @returns {Operation}
 */
var bulk = exports.bulk = (0, _lodashFp.curry)(function (sObject, operation, options, fun, state) {
  var connection = state.connection,
      references = state.references;

  var finalAttrs = fun(state);

  console.info('Creating bulk ' + operation + ' job for ' + sObject, finalAttrs);
  var job = connection.bulk.createJob(sObject, operation, options);

  console.info('Creating batch for job.');
  var batch = job.createBatch();

  console.info('Executing batch.');
  batch.execute(finalAttrs);

  return batch.on("queue", function (batchInfo) {

    console.info(batchInfo);
    var batchId = batchInfo.id;
    var batch = job.batch(batchId);

    batch.on('error', function (err) {
      console.error("Request error:");
      throw err;
    });

    batch.poll(3 * 1000, 120 * 1000);
  }).then(function (res) {

    var errors = res.filter(function (item) {
      return item.success === false;
    });

    if (options.failOnError && errors.length > 0) {
      console.error("Errors detected:");
      throw res;
    } else {
      console.log('Result : ' + JSON.stringify(res, null, 2));
      return _extends({}, state, { references: [res].concat(_toConsumableArray(state.references))
      });
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
var create = exports.create = (0, _lodashFp.curry)(function (sObject, attrs, state) {
  var connection = state.connection,
      references = state.references;

  var finalAttrs = expandReferences(state, attrs);
  console.info('Creating ' + sObject, finalAttrs);

  return connection.create(sObject, finalAttrs).then(function (recordResult) {
    console.log('Result : ' + JSON.stringify(recordResult));
    return _extends({}, state, { references: [recordResult].concat(_toConsumableArray(state.references))
    });
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
var createIf = exports.createIf = (0, _lodashFp.curry)(function (logical, sObject, attrs, state) {
  var connection = state.connection,
      references = state.references;

  var finalAttrs = expandReferences(state, attrs);
  if (logical) {
    console.info('Creating ' + sObject, finalAttrs);
  } else {
    console.info('Not creating ' + sObject + ' because logical is false.');
  };

  if (logical) {
    return connection.create(sObject, finalAttrs).then(function (recordResult) {
      console.log('Result : ' + JSON.stringify(recordResult));
      return _extends({}, state, { references: [recordResult].concat(_toConsumableArray(state.references))
      });
    });
  } else {
    return _extends({}, state);
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
var upsert = exports.upsert = (0, _lodashFp.curry)(function (sObject, externalId, attrs, state) {
  var connection = state.connection,
      references = state.references;

  var finalAttrs = expandReferences(state, attrs);
  console.info('Upserting ' + sObject + ' with externalId', externalId, ":", finalAttrs);

  return connection.upsert(sObject, finalAttrs, externalId).then(function (recordResult) {
    console.log('Result : ' + JSON.stringify(recordResult));
    return _extends({}, state, { references: [recordResult].concat(_toConsumableArray(state.references))
    });
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
var upsertIf = exports.upsertIf = (0, _lodashFp.curry)(function (logical, sObject, externalId, attrs, state) {
  var connection = state.connection,
      references = state.references;

  var finalAttrs = expandReferences(state, attrs);
  if (logical) {
    console.info('Upserting ' + sObject + ' with externalId', externalId, ":", finalAttrs);
  } else {
    console.info('Not upserting ' + sObject + ' because logical is false.');
  };

  if (logical) {
    return connection.upsert(sObject, finalAttrs, externalId).then(function (recordResult) {
      console.log('Result : ' + JSON.stringify(recordResult));
      return _extends({}, state, { references: [recordResult].concat(_toConsumableArray(state.references))
      });
    });
  } else {
    return _extends({}, state);
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
var update = exports.update = (0, _lodashFp.curry)(function (sObject, attrs, state) {
  var connection = state.connection,
      references = state.references;

  var finalAttrs = expandReferences(state, attrs);
  console.info('Updating ' + sObject, finalAttrs);

  return connection.update(sObject, finalAttrs).then(function (recordResult) {
    console.log('Result : ' + JSON.stringify(recordResult));
    return _extends({}, state, { references: [recordResult].concat(_toConsumableArray(state.references))
    });
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
var reference = exports.reference = (0, _lodashFp.curry)(function (position, state) {
  var references = state.references;

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
  var loginUrl = state.configuration.loginUrl;


  if (!loginUrl) {
    throw new Error("loginUrl missing from configuration.");
  }

  return _extends({}, state, { connection: new _jsforce2.default.Connection({ loginUrl: loginUrl }) });
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
  var _state$configuration = state.configuration,
      username = _state$configuration.username,
      password = _state$configuration.password,
      securityToken = _state$configuration.securityToken;
  var connection = state.connection;

  console.info('Logging in as ' + username + '.');

  return connection.login(username, password + securityToken).then(function () {
    return state;
  });
}

/**
 * Executes an operation.
 * @function
 * @param {Operation} operations - Operations
 * @returns {State}
 */
function execute() {
  for (var _len = arguments.length, operations = Array(_len), _key = 0; _key < _len; _key++) {
    operations[_key] = arguments[_key];
  }

  var initialState = {
    logger: {
      info: console.info.bind(console),
      debug: console.log.bind(console)
    },
    references: [],
    data: null,
    configuration: {}
  };

  return function (state) {
    // Note: we no longer need `steps` anymore since `commonExecute`
    // takes each operation as an argument.
    return _languageCommon.execute.apply(undefined, [createConnection, login].concat(_toConsumableArray((0, _lodashFp.flatten)(operations)), [cleanupState]))(_extends({}, initialState, state));
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
function steps() {
  for (var _len2 = arguments.length, operations = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
    operations[_key2] = arguments[_key2];
  }

  return (0, _lodashFp.flatten)(operations);
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
  return (0, _lodashFp.mapValues)(function (value) {
    return typeof value == 'function' ? value(state) : value;
  })(attrs);
}

function commonExpandReferences(obj) {
  return function (state) {
    return (0, _lodashFp.mapValues)(function (value) {
      return typeof value == 'function' ? value(state) : value;
    })(obj);
  };
}
