'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.combine = exports.map = exports.sourceValue = exports.source = exports.lookup = exports.join = exports.each = exports.fields = exports.field = exports.upsert = exports.steps = exports.reference = exports.execute = exports.create = undefined;

var _sourceHelpers = require('./sourceHelpers');

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
Object.defineProperty(exports, 'lookup', {
  enumerable: true,
  get: function get() {
    return _languageCommon.lookup;
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

var _lodashFp = require('lodash-fp');

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

function steps() {
  for (var _len = arguments.length, operations = Array(_len), _key = 0; _key < _len; _key++) {
    operations[_key] = arguments[_key];
  }

  return (0, _lodashFp.flatten)(operations);
}

function expandReferences(attrs, state) {
  return (0, _lodashFp.mapValues)(function (value) {
    return typeof value == 'function' ? value(state) : value;
  })(attrs);
}

function create(sObject, fields) {

  return function (state) {

    state.logger.debug('Creating ' + sObject);
    state.logger.debug(JSON.stringify(state.data, null, 2));
    state.logger.debug("===================");

    var id = state.references.length + 1;
    var result = { sObject: sObject, fields: expandReferences(fields, state), id: id };

    return _extends({}, state, {
      references: [result].concat(_toConsumableArray(state.references))
    });
  };
}

function upsert(sObject, externalId, fields) {

  return function (state) {

    state.logger.debug('Upserting ' + sObject + ' with externalId:', externalId);
    state.logger.debug(JSON.stringify(state.data, null, 2));
    state.logger.debug("===================");

    var id = state.references.length + 1;
    var result = { sObject: sObject, fields: expandReferences(fields, state), id: id };

    return _extends({}, state, {
      references: [result].concat(_toConsumableArray(state.references))
    });
  };
}

var reference = (0, _lodashFp.curry)(function (position, _ref) {
  var references = _ref.references;

  return references[position].id;
});

// Utils
function injectState(state) {
  return function () {
    return state;
  };
}

function execute() {
  var initialState = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
  var operations = arguments[1];

  var state = _extends({
    logger: {
      info: console.info.bind(console),
      debug: console.log.bind(console)
    },
    references: [] }, initialState);

  var start = Promise.resolve(state);

  return operations.reduce(function (acc, operation) {
    return acc.then(operation);
  }, start).then(function (state) {
    state.logger.info(JSON.stringify(state.references, null, 2));
    console.info("Finished Successfully");
    return state;
  }).catch(function (err) {
    console.error(err.stack);
    console.info("Job failed.");
  });
}

exports.create = create;
exports.execute = execute;
exports.reference = reference;
exports.steps = steps;
exports.upsert = upsert;
