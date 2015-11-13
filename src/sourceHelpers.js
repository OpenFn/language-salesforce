import { curry, merge } from 'lodash-fp';
import JSONPath from 'JSONPath';

/**
 * Picks out a single value from source data.
 * If a JSONPath returns more than one value for the reference, the first
 * item will be returned.
 * @constructor
 * @param {String} path - JSONPath referencing a point in `state.data`.
 * @param {State} state - Runtime state.
 * @returns {String}
 */
const sourceValue = curry(function(path, {data}) {
  return JSONPath.eval(data, path)[0];
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
const source = curry(function(path, {data}) {
  return JSONPath.eval(data, path);
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
const map = curry(function(path, operation, state) {
  source(path,state).map(function(data) {
    return operation(merge({data}, state));
  });
  return state;
});

export { source, sourceValue, map }
