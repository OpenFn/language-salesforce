import { curry, merge, reduce, zipObject } from 'lodash-fp';
import JSONPath from 'JSONPath';

/**
 * Picks out a single value from source data.
 * If a JSONPath returns more than one value for the reference, the first
 * item will be returned.
 * @constructor
 * @param {String} path - JSONPath referencing a point in `state`.
 * @param {State} state - Runtime state.
 * @returns {String}
 */
export const sourceValue = curry(function(path, state) {
  return JSONPath.eval(state, path)[0];
});

/**
 * Picks out a value from source data.
 * Will return whatever JSONPath returns, which will always be an array.
 * If you need a single value use `sourceValue` instead.
 * @constructor
 * @param {string} path - JSONPath referencing a point in `state`.
 * @param {State} state - Runtime state.
 * @returns {Array.<String|Object>}
 */
export function source(path) {
  return (state) => {
    return JSONPath.eval(state, path)
  }
}

/**
 * Scopes an array of data based on a JSONPath.
 * Useful when the source data has `n` items you would like to map to
 * an operation.
 * The operation will receive a slice of the data based of each item
 * of the JSONPath provided.
 * @example <caption>Simple Map</caption>
 * map("$.[*]",
 *   create("SObject",
 *     field("FirstName", sourceValue("$.firstName"))
 *   )
 * )
 * @constructor
 * @param {string} path - JSONPath referencing a point in `state.data`.
 * @param {function} operation - The operation needed to be repeated.
 * @param {State} state - Runtime state.
 * @returns {<State>}
 */
export const map = curry(function(path, operation, state) {

  switch (typeof path) {
    case 'string':
      source(path)(state).map(function(data) {
        return operation({data, references: state.references});
      });      
      return state

    case 'object':
      path.map(function(data) {
        return operation({data, references: state.references});
      });      
      return state

  }
});

/**
 * Simple switcher allowing other expressions to use either a JSONPath or
 * object literals as a data source.
 * @constructor
 * @param {string|object|function} data 
 * - JSONPath referencing a point in `state`
 * - Object Literal of the data itself.
 * - Function to be called with state.
 * @param {object} state - The current state.
 * @returns {array}
 */
function asData(data, state) {
  switch (typeof data) {
    case 'string':
      return source(data)(state)
    case 'object':
      return data
    case 'function':
      return data(state)
  }        
}

/**
 * Scopes an array of data based on a JSONPath.
 * Useful when the source data has `n` items you would like to map to
 * an operation.
 * The operation will receive a slice of the data based of each item
 * of the JSONPath provided.
 *
 * It also ensures the results of an operation make their way back into
 * the state's references.
 *
 * @example <caption>Simple Example</caption>
 * each("$.[*]",
 *   create("SObject",
 *     field("FirstName", sourceValue("$.firstName"))
 *   )
 * )
 * @constructor
 * @param {string} path - JSONPath referencing a point in `state`.
 * @param {function} operation - The operation needed to be repeated.
 * @returns {<Operation>}
 */
export function each(path, operation) {
  if (!path) {
    throw new TypeError("path argument for each expression is invalid.")
  }

  return (state) => {
    return asData(path,state).reduce(function(state, data) {
      if (state.then) {
        return state.then((state) => {
          return operation({ ...state, data })
        })
      } else {
        return operation({ ...state, data })
      }
    }, state)

  }
}

/**
 * Combines two operations into one
 * @constructor
 * @param {...operations} operations - Any unfufilled operation.
 * @returns {<Operation>}
 */
export function combine(...operations) {
  return (state) => {
    return operations.reduce((state,operation) => {
      if (state.then) {
        return state.then((state) => {
          return { ...state, ...operation(state) }
        })
      } else {
        return { ...state, ...operation(state) }
      }
    }, state)
  }
}

export function join(targetPath, sourcePath, targetKey) {
  return (state) => {
    return source(targetPath)(state).map((i) => {
      return { [targetKey]: sourceValue(sourcePath, state), ...i }
    })
  }
}

export function fields(...fields) {
  return zipObject(fields,undefined)
}

export function field(key, value) {
  return [key, value]
}

/**
 * Adds a lookup or 'dome insert' to a record.
 * @example <caption>Example</caption>
 * lookup("relationship_name__r", "externalID on related object", "$.path")
 * @constructor
 * @param {string} relationshipName - `__r` relationship field on the record.
 * @param {string} externalID - Salesforce ExternalID field.
 * @param {string} path - JSONPath to data source.
 * @returns {<Field>}
 */
export function lookup(relationshipName, externalId, path) {
  return field(relationshipName, (state) => {
    return { [externalId]: sourceValue(path)(state) }
  })
}
