'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.arrayToString = exports.toArray = exports.beta = exports.index = exports.lastReferenceValue = exports.referencePath = exports.dataValue = exports.dataPath = exports.merge = exports.combine = exports.map = exports.sourceValue = exports.source = exports.field = exports.fields = exports.join = exports.each = exports.relationship = exports.lookup = exports.upsert = exports.update = exports.steps = exports.reference = exports.execute = exports.create = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

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

var _lodashFp = require('lodash-fp');

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

/** @module FakeAdaptor */

function steps() {
  for (var _len = arguments.length, operations = Array(_len), _key = 0; _key < _len; _key++) {
    operations[_key] = arguments[_key];
  }

  return (0, _lodashFp.flatten)(operations);
}

// TODO: use the one from language-common
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

function update(sObject, fields) {

  return function (state) {

    state.logger.debug('Updating ' + sObject);
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

function execute() {
  for (var _len2 = arguments.length, operations = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
    operations[_key2] = arguments[_key2];
  }

  var initialState = {
    logger: {
      info: console.info.bind(console),
      debug: console.log.bind(console)
    },
    references: [],
    data: null
  };

  return function (state) {
    // Note: we no longer need `steps` anymore since `commonExecute`
    return _languageCommon.execute.apply(undefined, _toConsumableArray((0, _lodashFp.flatten)(operations)).concat([function (state) {
      delete state.connection;
      return state;
    }]))(_extends({}, initialState, state)).then(function (state) {
      state.logger.info(JSON.stringify(state.references, null, 2));
      console.info("Finished Successfully");
      return state;
    }).catch(function (err) {
      console.error(err.stack);
      console.info("Job failed.");
    });
  };
}

exports.create = create;
exports.execute = execute;
exports.reference = reference;
exports.steps = steps;
exports.update = update;
exports.upsert = upsert;
