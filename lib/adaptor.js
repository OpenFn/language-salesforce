'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.map = exports.sourceValue = exports.source = exports.steps = exports.reference = exports.upsert = exports.create = exports.describe = exports.execute = undefined;

var _jsforce = require('jsforce');

var _jsforce2 = _interopRequireDefault(_jsforce);

var _sourceHelpers = require('./sourceHelpers');

var _lodashFp = require('lodash-fp');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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

  console.info('Creating ' + sObject, attrs);

  return connection.create(sObject, expandReferences(state, attrs)).then(function (recordResult) {
    references.push(recordResult);
    console.log('Result : ' + JSON.stringify(recordResult));

    return state;
  }).catch(function (err) {
    console.error(err.stack);
    return err;
  });
});

var upsert = (0, _lodashFp.curry)(function (sObject, externalId, attrs, state) {
  var connection = state.connection;
  var references = state.references;

  console.info('Upserting ' + sObject + ' with externalId', externalId, ":", attrs);

  return connection.upsert(sObject, externalId, expandReferences(state, attrs)).then(function (recordResult) {
    references.push(recordResult);
    console.log('Result : ' + JSON.stringify(recordResult));

    return state;
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

  operations.reduce(function (acc, operation) {
    return acc.then(operation);
  }, start).then(function (state) {
    console.log(state);
    console.info("Finished Successfully");
  }).catch(function (err) {
    console.error(err);
    console.log(err.stack);
    console.info("Job failed.");
    process.exit(1);
  });
}

// Wrappers
function steps() {
  for (var _len = arguments.length, operations = Array(_len), _key = 0; _key < _len; _key++) {
    operations[_key] = arguments[_key];
  }

  return operations;
}

// Utils
function injectState(state) {
  return function () {
    return state;
  };
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
exports.source = _sourceHelpers.source;
exports.sourceValue = _sourceHelpers.sourceValue;
exports.map = _sourceHelpers.map;
