'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.combine = exports.map = exports.sourceValue = exports.source = exports.join = exports.fields = exports.field = exports.each = exports.steps = exports.reference = exports.upsert = exports.create = exports.describe = exports.execute = undefined;

var _sourceHelpers = require('./sourceHelpers');

Object.defineProperty(exports, 'each', {
  enumerable: true,
  get: function get() {
    return _sourceHelpers.each;
  }
});
Object.defineProperty(exports, 'field', {
  enumerable: true,
  get: function get() {
    return _sourceHelpers.field;
  }
});
Object.defineProperty(exports, 'fields', {
  enumerable: true,
  get: function get() {
    return _sourceHelpers.fields;
  }
});
Object.defineProperty(exports, 'join', {
  enumerable: true,
  get: function get() {
    return _sourceHelpers.join;
  }
});
Object.defineProperty(exports, 'source', {
  enumerable: true,
  get: function get() {
    return _sourceHelpers.source;
  }
});
Object.defineProperty(exports, 'sourceValue', {
  enumerable: true,
  get: function get() {
    return _sourceHelpers.sourceValue;
  }
});
Object.defineProperty(exports, 'map', {
  enumerable: true,
  get: function get() {
    return _sourceHelpers.map;
  }
});
Object.defineProperty(exports, 'combine', {
  enumerable: true,
  get: function get() {
    return _sourceHelpers.combine;
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
  }).catch(function (err) {
    console.error(err.stack);
    return err;
  });
});

var upsert = (0, _lodashFp.curry)(function (sObject, externalId, attrs, state) {
  var connection = state.connection;
  var references = state.references;

  var finalAttrs = expandReferences(state, attrs);
  console.info('Upserting ' + sObject + ' with externalId', externalId, ":", finalAttrs);

  return connection.upsert(sObject, externalId, finalAttrs).then(function (recordResult) {
    console.log('Result : ' + JSON.stringify(recordResult));
    return _extends({}, state, { references: [recordResult].concat(_toConsumableArray(state.references))
    });
  }).catch(function (err) {
    console.error(err);
    return err;
  });
});

var reference = (0, _lodashFp.curry)(function (position, _ref) {
  var references = _ref.references;

  return references[position].id;
});

function login(_ref2) {
  var username = _ref2.username;
  var password = _ref2.password;
  var securityToken = _ref2.securityToken;

  return function (state) {
    var connection = state.connection;

    console.info('Logging in as ' + username + '.');

    return connection.login(username, password + securityToken);
  };
}

function execute(_ref3) {
  var credentials = _ref3.credentials;
  var connectionOptions = _ref3.connectionOptions;
  var data = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
  var operations = arguments[2];

  var state = {
    connection: new _jsforce2.default.Connection(connectionOptions),
    references: [],
    data: data
  };

  var start = login(credentials)(state).then(injectState(state));

  return operations.reduce(function (acc, operation) {
    return acc.then(operation);
  }, start).then(function (state) {
    console.log(state);
    console.info("Finished Successfully");
    return state;
  }).catch(function (err) {
    console.error(err);
    console.log(err.stack);
    console.info("Job failed.");
    process.exit(1);
  });
}

// Utils
function injectState(state) {
  return function () {
    return state;
  };
}

function steps() {
  for (var _len = arguments.length, operations = Array(_len), _key = 0; _key < _len; _key++) {
    operations[_key] = arguments[_key];
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
