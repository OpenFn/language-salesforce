'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.arrayToString = exports.toArray = exports.beta = exports.index = exports.lastReferenceValue = exports.referencePath = exports.dataValue = exports.dataPath = exports.merge = exports.combine = exports.map = exports.sourceValue = exports.source = exports.field = exports.fields = exports.join = exports.each = exports.relationship = exports.lookup = exports.steps = exports.reference = exports.upsert = exports.create = exports.describe = exports.execute = undefined;

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

var _jsforce = require('jsforce');

var _jsforce2 = _interopRequireDefault(_jsforce);

var _lodashFp = require('lodash-fp');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

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
 * Outputs basic information about an sObject to `STDOUT`.
 * @constructor
 * @param {String} sObject - API name of the sObject.
 * @param {State} state - Runtime state.
 * @returns {Operation}
 */
var describe = (0, _lodashFp.curry)(function (sObject, state) {
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
 * Create a new object.
 * @constructor
 * @param {String} sObject - API name of the sObject.
 * @param {Object} attrs - Field attributes for the new object.
 * @param {State} state - Runtime state.
 * @returns {Operation}
 */
var create = (0, _lodashFp.curry)(function (sObject, attrs, state) {
  var connection = state.connection;
  var references = state.references;

  var finalAttrs = expandReferences(state, attrs);
  console.info('Creating ' + sObject, finalAttrs);

  return connection.create(sObject, finalAttrs).then(function (recordResult) {
    console.log('Result : ' + JSON.stringify(recordResult));
    return _extends({}, state, { references: [recordResult].concat(_toConsumableArray(state.references))
    });
  });
});

var upsert = (0, _lodashFp.curry)(function (sObject, externalId, attrs, state) {
  var connection = state.connection;
  var references = state.references;

  var finalAttrs = expandReferences(state, attrs);
  console.info('Upserting ' + sObject + ' with externalId', externalId, ":", finalAttrs);

  return connection.upsert(sObject, finalAttrs, externalId).then(function (recordResult) {
    console.log('Result : ' + JSON.stringify(recordResult));
    return _extends({}, state, { references: [recordResult].concat(_toConsumableArray(state.references))
    });
  });
});

var reference = (0, _lodashFp.curry)(function (position, _ref) {
  var references = _ref.references;

  return references[position].id;
});

function createConnection(state) {
  var loginUrl = state.configuration.loginUrl;

  if (!loginUrl) {
    throw new Error("loginUrl missing from configuration.");
  }

  return _extends({}, state, { connection: new _jsforce2.default.Connection({ loginUrl: loginUrl }) });
}

function login(state) {
  var _state$configuration = state.configuration;
  var username = _state$configuration.username;
  var password = _state$configuration.password;
  var securityToken = _state$configuration.securityToken;
  var connection = state.connection;

  console.info('Logging in as ' + username + '.');

  return connection.login(username, password + securityToken).then(injectState(state));
}

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
    return _languageCommon.execute.apply(undefined, [createConnection, login].concat(_toConsumableArray((0, _lodashFp.flatten)(operations))))(_extends({}, initialState, state));
  };
}

// Utils
function injectState(state) {
  return function () {
    return state;
  };
}

function steps() {
  for (var _len2 = arguments.length, operations = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
    operations[_key2] = arguments[_key2];
  }

  return (0, _lodashFp.flatten)(operations);
}

function expandReferences(state, attrs) {
  return (0, _lodashFp.mapValues)(function (value) {
    return typeof value == 'function' ? value(state) : value;
  })(attrs);
}

exports.execute = execute;
exports.describe = describe;
exports.create = create;
exports.upsert = upsert;
exports.reference = reference;
exports.steps = steps;
