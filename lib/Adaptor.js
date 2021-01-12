"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.execute = execute;
exports.steps = steps;
exports.recursivelyExpandReferences = recursivelyExpandReferences;
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
exports.reference = exports.update = exports.upsertIf = exports.upsert = exports.createIf = exports.create = exports.bulk = exports.query = exports.retrieve = exports.describeGlobal = exports.describe = void 0;

var _languageCommon = require("language-common");

var _jsforce = _interopRequireDefault(require("jsforce"));

var _lodashFp = require("lodash-fp");

var _sourceHelpers = require("./sourceHelpers");

var _axios = _interopRequireDefault(require("axios"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(n); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && Symbol.iterator in Object(iter)) return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

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
var describe = (0, _lodashFp.curry)(function (sObject, state) {
  var connection = state.connection;
  return connection.sobject(sObject).describe().then(function (result) {
    console.log('Label : ' + result.label);
    console.log('Num of Fields : ' + result.fields.length);
    return _objectSpread({}, state, {
      references: [result].concat(_toConsumableArray(state.references))
    });
  })["catch"](function (err) {
    console.error(err);
    return err;
  });
});
/**
 * Outputs basic information about available Salesforce objects.
 * @public
 * @example
 *  describe();
 * @function
 * @param {State} state - Runtime state.
 * @returns {State}
 */

exports.describe = describe;
var describeGlobal = (0, _lodashFp.curry)(function (sObject, state) {
  var connection = state.connection;
  return connection.describeGlobal().then(function (result) {
    console.log('Num of SObjects : ' + result.sobjects.length);
    console.log(JSON.stringify(result.sobjects, null, 2));
    return _objectSpread({}, state, {
      references: [result].concat(_toConsumableArray(state.references))
    });
  })["catch"](function (err) {
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
 * @param {String} id - The id of the record.
 * @param {String} callback - A callback to execute once the record is retrieved.
 * @param {State} state - Runtime state.
 * @returns {State}
 */

exports.describeGlobal = describeGlobal;
var retrieve = (0, _lodashFp.curry)(function (sObject, id, callback, state) {
  var connection = state.connection;
  var finalId = recursivelyExpandReferences(id)(state);
  return connection.sobject(sObject).retrieve(finalId).then(function (result) {
    return _objectSpread({}, state, {
      references: [result].concat(_toConsumableArray(state.references))
    });
  }).then(function (state) {
    if (callback) {
      return callback(state);
    }

    return state;
  })["catch"](function (err) {
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

exports.retrieve = retrieve;
var query = (0, _lodashFp.curry)(function (qs, state) {
  var connection = state.connection,
      references = state.references;
  console.log("Executing query: ".concat(qs));
  return connection.query(qs, function (err, result) {
    if (err) {
      return console.error(err);
    }

    console.log(result);
    return _objectSpread({}, state, {
      references: [result].concat(_toConsumableArray(state.references))
    });
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

exports.query = query;
var bulk = (0, _lodashFp.curry)(function (sObject, operation, options, fun, state) {
  var connection = state.connection,
      references = state.references;
  var failOnError = options.failOnError,
      allowNoOp = options.allowNoOp;
  var finalAttrs = fun(state);

  if (allowNoOp && finalAttrs.length === 0) {
    console.info("No items in ".concat(sObject, " array. Skipping bulk ").concat(operation, " operation."));
    return state;
  }

  console.info("Creating bulk ".concat(operation, " job for ").concat(sObject), finalAttrs);
  var job = connection.bulk.createJob(sObject, operation, options);
  console.info('Creating batch for job.');
  var batch = job.createBatch();
  console.info('Executing batch.');
  batch.execute(finalAttrs);
  return batch.on('queue', function (batchInfo) {
    console.info(batchInfo);
    var batchId = batchInfo.id;
    var batch = job.batch(batchId);
    batch.on('error', function (err) {
      job.close();
      console.error('Request error:');
      throw err;
    });
    batch.poll(3 * 1000, 120 * 1000);
  }).then(function (res) {
    job.close();
    var errors = res.filter(function (item) {
      return item.success === false;
    });

    if (failOnError && errors.length > 0) {
      console.error('Errors detected:');
      throw res;
    } else {
      console.log('Result : ' + JSON.stringify(res, null, 2));
      return _objectSpread({}, state, {
        references: [res].concat(_toConsumableArray(state.references))
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

exports.bulk = bulk;
var create = (0, _lodashFp.curry)(function (sObject, attrs, state) {
  var connection = state.connection,
      references = state.references;
  var finalAttrs = expandReferences(state, attrs);
  console.info("Creating ".concat(sObject), finalAttrs);
  return connection.create(sObject, finalAttrs).then(function (recordResult) {
    console.log('Result : ' + JSON.stringify(recordResult));
    return _objectSpread({}, state, {
      references: [recordResult].concat(_toConsumableArray(state.references))
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

exports.create = create;
var createIf = (0, _lodashFp.curry)(function (logical, sObject, attrs, state) {
  var connection = state.connection,
      references = state.references;
  var finalAttrs = expandReferences(state, attrs);

  if (logical) {
    console.info("Creating ".concat(sObject), finalAttrs);
  } else {
    console.info("Not creating ".concat(sObject, " because logical is false."));
  }

  if (logical) {
    return connection.create(sObject, finalAttrs).then(function (recordResult) {
      console.log('Result : ' + JSON.stringify(recordResult));
      return _objectSpread({}, state, {
        references: [recordResult].concat(_toConsumableArray(state.references))
      });
    });
  } else {
    return _objectSpread({}, state);
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

exports.createIf = createIf;
var upsert = (0, _lodashFp.curry)(function (sObject, externalId, attrs, state) {
  var connection = state.connection,
      references = state.references;
  var finalAttrs = expandReferences(state, attrs);
  console.info("Upserting ".concat(sObject, " with externalId"), externalId, ':', finalAttrs);
  return connection.upsert(sObject, finalAttrs, externalId).then(function (recordResult) {
    console.log('Result : ' + JSON.stringify(recordResult));
    return _objectSpread({}, state, {
      references: [recordResult].concat(_toConsumableArray(state.references))
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

exports.upsert = upsert;
var upsertIf = (0, _lodashFp.curry)(function (logical, sObject, externalId, attrs, state) {
  var connection = state.connection,
      references = state.references;
  var finalAttrs = expandReferences(state, attrs);

  if (logical) {
    console.info("Upserting ".concat(sObject, " with externalId"), externalId, ':', finalAttrs);
  } else {
    console.info("Not upserting ".concat(sObject, " because logical is false."));
  }

  if (logical) {
    return connection.upsert(sObject, finalAttrs, externalId).then(function (recordResult) {
      console.log('Result : ' + JSON.stringify(recordResult));
      return _objectSpread({}, state, {
        references: [recordResult].concat(_toConsumableArray(state.references))
      });
    });
  } else {
    return _objectSpread({}, state);
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

exports.upsertIf = upsertIf;
var update = (0, _lodashFp.curry)(function (sObject, attrs, state) {
  var connection = state.connection,
      references = state.references;
  var finalAttrs = expandReferences(state, attrs);
  console.info("Updating ".concat(sObject), finalAttrs);
  return connection.update(sObject, finalAttrs).then(function (recordResult) {
    console.log('Result : ' + JSON.stringify(recordResult));
    return _objectSpread({}, state, {
      references: [recordResult].concat(_toConsumableArray(state.references))
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

exports.update = update;
var reference = (0, _lodashFp.curry)(function (position, state) {
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

exports.reference = reference;

function createConnection(state) {
  var loginUrl = state.configuration.loginUrl;

  if (!loginUrl) {
    throw new Error('loginUrl missing from configuration.');
  }

  return _objectSpread({}, state, {
    connection: new _jsforce["default"].Connection({
      loginUrl: loginUrl
    })
  });
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
  console.info("Logging in as ".concat(username, "."));
  return connection.login(username, password + securityToken) // NOTE: Uncomment this to debug connection issues.
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
 * @param {Operation} operations - Operations
 * @returns {State}
 */


function execute() {
  for (var _len = arguments.length, operations = new Array(_len), _key = 0; _key < _len; _key++) {
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
    return _languageCommon.execute.apply(void 0, [createConnection, login].concat(_toConsumableArray((0, _lodashFp.flatten)(operations)), [cleanupState]))(_objectSpread({}, initialState, {}, state));
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
  for (var _len2 = arguments.length, operations = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
    operations[_key2] = arguments[_key2];
  }

  return (0, _lodashFp.flatten)(operations);
}
/**
 * Recursively expand object|number|string|boolean|array, each time resolving function calls and returning the resolved values
 * @param {any} thing - Thing to expand
 * @returns {object|number|string|boolean|array} expandedResult
 */


function recursivelyExpandReferences(thing) {
  return function (state) {
    if (_typeof(thing) !== 'object') return typeof thing == 'function' ? thing(state) : thing;
    var result = (0, _lodashFp.mapValues)(function (value) {
      if (Array.isArray(value)) {
        return value.map(function (item) {
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
  return (0, _lodashFp.mapValues)(function (value) {
    return typeof value == 'function' ? value(state) : value;
  })(attrs);
}

exports.axios = _axios["default"];
