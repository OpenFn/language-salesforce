'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.map = exports.sourceValue = exports.source = undefined;

var _lodashFp = require('lodash-fp');

var _JSONPath = require('JSONPath');

var _JSONPath2 = _interopRequireDefault(_JSONPath);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Picks out a single value from source data.
 * If a JSONPath returns more than one value for the reference, the first
 * item will be returned.
 * @constructor
 * @param {String} path - JSONPath referencing a point in `state.data`.
 * @param {State} state - Runtime state.
 * @returns {String}
 */
var sourceValue = (0, _lodashFp.curry)(function (path, _ref) {
  var data = _ref.data;

  return _JSONPath2.default.eval(data, path)[0];
});

/**
 * Picks out a value from source data.
 * Will return whatever JSONPath returns, which will always be an array.
 * If you need a single value use `sourceValue` instead.
 * @constructor
 * @param {string} path - JSONPath referencing a point in `state.data`.
 * @param {State} state - Runtime state.
 * @returns {Array.<String|Object>}
 */
var source = (0, _lodashFp.curry)(function (path, _ref2) {
  var data = _ref2.data;

  return _JSONPath2.default.eval(data, path);
});

/**
 * Scopes an array of data based on a JSONPath.
 * Useful when the source data has `n` items you would like to map to
 * an operation.
 * @constructor
 * @param {string} path - JSONPath referencing a point in `state.data`.
 * @param {function} operation - The operation needed to be repeated.
 * @param {State} state - Runtime state.
 * @returns {<State>}
 */
var map = (0, _lodashFp.curry)(function (path, operation, state) {
  source(path, state).map(function (data) {
    return operation((0, _lodashFp.merge)({ data: data }, state));
  });
  return state;
});

exports.source = source;
exports.sourceValue = sourceValue;
exports.map = map;
