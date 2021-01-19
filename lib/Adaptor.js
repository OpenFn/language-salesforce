"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.toArray = exports.sourceValue = exports.source = exports.referencePath = exports.merge = exports.map = exports.lastReferenceValue = exports.join = exports.index = exports.humanProper = exports.fields = exports.field = exports.each = exports.dataValue = exports.dataPath = exports.combine = exports.beta = exports.arrayToString = exports.alterState = exports.relationship = exports.lookup = exports.reference = exports.update = exports.upsertIf = exports.upsert = exports.createIf = exports.create = exports.bulk = exports.query = exports.retrieve = exports.describe = undefined;

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

var _sourceHelpers = require("./sourceHelpers");

Object.defineProperty(exports, "lookup", {
  enumerable: true,
  get: function get() {
    return _sourceHelpers.lookup;
  }
});
Object.defineProperty(exports, "relationship", {
  enumerable: true,
  get: function get() {
    return _sourceHelpers.relationship;
  }
});

var _languageCommon = require("language-common");

Object.defineProperty(exports, "alterState", {
  enumerable: true,
  get: function get() {
    return _languageCommon.alterState;
  }
});
Object.defineProperty(exports, "arrayToString", {
  enumerable: true,
  get: function get() {
    return _languageCommon.arrayToString;
  }
});
Object.defineProperty(exports, "beta", {
  enumerable: true,
  get: function get() {
    return _languageCommon.beta;
  }
});
Object.defineProperty(exports, "combine", {
  enumerable: true,
  get: function get() {
    return _languageCommon.combine;
  }
});
Object.defineProperty(exports, "dataPath", {
  enumerable: true,
  get: function get() {
    return _languageCommon.dataPath;
  }
});
Object.defineProperty(exports, "dataValue", {
  enumerable: true,
  get: function get() {
    return _languageCommon.dataValue;
  }
});
Object.defineProperty(exports, "each", {
  enumerable: true,
  get: function get() {
    return _languageCommon.each;
  }
});
Object.defineProperty(exports, "field", {
  enumerable: true,
  get: function get() {
    return _languageCommon.field;
  }
});
Object.defineProperty(exports, "fields", {
  enumerable: true,
  get: function get() {
    return _languageCommon.fields;
  }
});
Object.defineProperty(exports, "humanProper", {
  enumerable: true,
  get: function get() {
    return _languageCommon.humanProper;
  }
});
Object.defineProperty(exports, "index", {
  enumerable: true,
  get: function get() {
    return _languageCommon.index;
  }
});
Object.defineProperty(exports, "join", {
  enumerable: true,
  get: function get() {
    return _languageCommon.join;
  }
});
Object.defineProperty(exports, "lastReferenceValue", {
  enumerable: true,
  get: function get() {
    return _languageCommon.lastReferenceValue;
  }
});
Object.defineProperty(exports, "map", {
  enumerable: true,
  get: function get() {
    return _languageCommon.map;
  }
});
Object.defineProperty(exports, "merge", {
  enumerable: true,
  get: function get() {
    return _languageCommon.merge;
  }
});
Object.defineProperty(exports, "referencePath", {
  enumerable: true,
  get: function get() {
    return _languageCommon.referencePath;
  }
});
Object.defineProperty(exports, "source", {
  enumerable: true,
  get: function get() {
    return _languageCommon.source;
  }
});
Object.defineProperty(exports, "sourceValue", {
  enumerable: true,
  get: function get() {
    return _languageCommon.sourceValue;
  }
});
Object.defineProperty(exports, "toArray", {
  enumerable: true,
  get: function get() {
    return _languageCommon.toArray;
  }
});

var _jsforce = require("jsforce");

var _jsforce2 = _interopRequireDefault(_jsforce);

var _lodashFp = require("lodash-fp");

var _axios = require("axios");

var _axios2 = _interopRequireDefault(_axios);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

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
var describe = exports.describe = (0, _lodashFp.curry)(function (sObject, state, callback) {
  var connection = state.connection;


  return connection.sobject(sObject).describe().then(function (result) {
    console.log("Label : " + result.label);
    console.log("Num of Fields : " + result.fields.length);
    return (0, _languageCommon.composeNextState)(state, result);
  }).then(function (state) {
    if (callback) {
      return callback(state);
    }
    return state;
  }).catch(function (err) {
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
var retrieve = exports.retrieve = (0, _lodashFp.curry)(function (sObject, id, callback, state) {
  var connection = state.connection;


  var finalId = (0, _languageCommon.recursivelyExpandReferences)(id)(state);

  return connection.sobject(sObject).retrieve(finalId).then(function (result) {
    return (0, _languageCommon.composeNextState)(state, result);
  }).then(function (state) {
    if (callback) {
      return callback(state);
    }
    return state;
  }).catch(function (err) {
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
var query = exports.query = (0, _lodashFp.curry)(function (qs, state, callback) {
  var connection = state.connection;

  var finalQs = (0, _languageCommon.recursivelyExpandReferences)(qs)(state);
  console.log("Executing query: " + finalQs);

  return connection.query(finalQs, function (err, result) {
    if (err) {
      return console.error(err);
    }

    console.log(result);
    var nextState = (0, _languageCommon.composeNextState)(state, result);
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
var bulk = exports.bulk = (0, _lodashFp.curry)(function (sObject, operation, options, fun, state, callback) {
  var connection = state.connection;
  var failOnError = options.failOnError,
      allowNoOp = options.allowNoOp;

  var finalAttrs = fun(state);

  if (allowNoOp && finalAttrs.length === 0) {
    console.info("No items in " + sObject + " array. Skipping bulk " + operation + " operation.");
    return state;
  }

  console.info("Creating bulk " + operation + " job for " + sObject, finalAttrs);
  var job = connection.bulk.createJob(sObject, operation, options);

  console.info("Creating batch for job.");
  var batch = job.createBatch();

  console.info("Executing batch.");
  batch.execute(finalAttrs);

  return batch.on("queue", function (batchInfo) {
    console.info(batchInfo);
    var batchId = batchInfo.id;
    var batch = job.batch(batchId);

    batch.on("error", function (err) {
      job.close();
      console.error("Request error:");
      throw err;
    });

    batch.poll(3 * 1000, 120 * 1000);
  }).then(function (res) {
    job.close();
    var errors = res.filter(function (item) {
      return item.success === false;
    });

    if (failOnError && errors.length > 0) {
      console.error("Errors detected:");
      throw res;
    } else {
      console.log("Result : " + JSON.stringify(res, null, 2));
      var nextState = (0, _languageCommon.composeNextState)(state, res);
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
var create = exports.create = (0, _lodashFp.curry)(function (sObject, attrs, state, callback) {
  var connection = state.connection,
      references = state.references;

  var finalAttrs = (0, _languageCommon.recursivelyExpandReferences)(attrs)(state);
  console.info("Creating " + sObject, finalAttrs);

  return connection.create(sObject, finalAttrs).then(function (recordResult) {
    console.log("Result : " + JSON.stringify(recordResult));
    var nextState = (0, _languageCommon.composeNextState)(state, recordResult);
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
var createIf = exports.createIf = (0, _lodashFp.curry)(function (logical, sObject, attrs, state, callback) {
  var connection = state.connection;

  var finalAttrs = (0, _languageCommon.recursivelyExpandReferences)(attrs)(state);
  if (logical) {
    console.info("Creating " + sObject, finalAttrs);
  } else {
    console.info("Not creating " + sObject + " because logical is false.");
  }

  if (logical) {
    return connection.create(sObject, finalAttrs).then(function (recordResult) {
      console.log("Result : " + JSON.stringify(recordResult));
      var nextState = (0, _languageCommon.composeNextState)(state, recordResult);
      if (callback) return callback(nextState);
      return nextState;
    });
  } else {
    var nextState = _extends({}, state);
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
var upsert = exports.upsert = (0, _lodashFp.curry)(function (sObject, externalId, attrs, state, callback) {
  var connection = state.connection;

  var finalAttrs = (0, _languageCommon.recursivelyExpandReferences)(attrs)(state);
  var finalExternalId = (0, _languageCommon.recursivelyExpandReferences)(externalId)(state);
  console.info("Upserting " + sObject + " with externalId", finalExternalId, ":", finalAttrs);

  return connection.upsert(sObject, finalAttrs, finalExternalId).then(function (recordResult) {
    console.log("Result : " + JSON.stringify(recordResult));
    var nextState = (0, _languageCommon.composeNextState)(state, recordResult);
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
var upsertIf = exports.upsertIf = (0, _lodashFp.curry)(function (logical, sObject, externalId, attrs, state, callback) {
  var connection = state.connection;

  var finalAttrs = (0, _languageCommon.recursivelyExpandReferences)(attrs)(state);
  var finalExternalId = (0, _languageCommon.recursivelyExpandReferences)(externalId)(state);
  if (logical) {
    console.info("Upserting " + sObject + " with externalId", finalExternalId, ":", finalAttrs);
  } else {
    console.info("Not upserting " + sObject + " because logical is false.");
  }

  if (logical) {
    return connection.upsert(sObject, finalAttrs, finalExternalId).then(function (recordResult) {
      console.log("Result : " + JSON.stringify(recordResult));
      var nextState = (0, _languageCommon.composeNextState)(state, recordResult);
      if (callback) return callback(nextState);
      return nextState;
    });
  } else {
    var nextState = _extends({}, state);
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
var update = exports.update = (0, _lodashFp.curry)(function (sObject, attrs, state, callback) {
  var connection = state.connection;

  var finalAttrs = (0, _languageCommon.recursivelyExpandReferences)(attrs)(state);
  console.info("Updating " + sObject, finalAttrs);

  return connection.update(sObject, finalAttrs).then(function (recordResult) {
    console.log("Result : " + JSON.stringify(recordResult));
    var nextState = (0, _languageCommon.composeNextState)(state, recordResult);
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
var reference = exports.reference = (0, _lodashFp.curry)(function (position, state, callback) {
  var references = state.references;

  var nextState = (0, _languageCommon.composeNextState)(state, references[position].id);
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
  var loginUrl = state.configuration.loginUrl;


  if (!loginUrl) {
    throw new Error("loginUrl missing from configuration.");
  }

  return _extends({}, state, { connection: new _jsforce2.default.Connection({ loginUrl: loginUrl }) });
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
  var _state$configuration = state.configuration,
      username = _state$configuration.username,
      password = _state$configuration.password,
      securityToken = _state$configuration.securityToken;
  var connection = state.connection;

  console.info("Logging in as " + username + ".");

  return connection.login(username, password + securityToken)
  // NOTE: Uncomment this to debug connection issues.
  // .then(response => {
  //   console.log(connection);
  //   console.log(response);
  //   return state;
  // })
  .then(function () {
    return state;
  });
}

/**
 * Executes an operation.
 * @function
 * @param {operation} operations - Operations
 * @returns {state}
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
function steps() {
  for (var _len2 = arguments.length, operations = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
    operations[_key2] = arguments[_key2];
  }

  return (0, _lodashFp.flatten)(operations);
}

// Note that we expose the entire axios package to the user here.

exports.axios = _axios2.default;
