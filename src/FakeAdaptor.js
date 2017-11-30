/** @module FakeAdaptor */
import { execute as commonExecute } from 'language-common';
import { curry, mapValues, flatten } from 'lodash-fp';

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
export function steps(...operations) {
  return flatten(operations);
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
 * @param {Object} attrs - Field attributes for the new object.
 * @param {State} state - Runtime state.
 * @returns {State}
 */
export function expandReferences(attrs, state) {
  return mapValues(function(value) {
    return typeof value == 'function' ? value(state) : value;
  })(attrs);
}

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
 * @param {Object} fields - Field attributes for the new object.
 * @returns {Operation}
 */
export function create(sObject, fields) {

  return (state) => {

    state.logger.debug(`Creating ${sObject}`)
    state.logger.debug(JSON.stringify(state.data, null, 2))
    state.logger.debug("===================")

    let id = state.references.length + 1
    let result = {sObject, fields: expandReferences(fields, state), id}

    return {
      ...state,
      references: [result, ...state.references]
    }

  }
}

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
 * @param {Object} fields - Field attributes for the new object.
 * @returns {Operation}
 */
export function update(sObject, fields) {

  return (state) => {

    state.logger.debug(`Updating ${sObject}`)
    state.logger.debug(JSON.stringify(state.data, null, 2))
    state.logger.debug("===================")

    let id = state.references.length + 1
    let result = {sObject, fields: expandReferences(fields, state), id}

    return {
      ...state,
      references: [result, ...state.references]
    }

  }
}

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
 * @param {Object} fields - Field attributes for the new object.
 * @returns {Operation}
 */
export function upsert(sObject, externalId, fields) {

  return (state) => {

    state.logger.debug(`Upserting ${sObject} with externalId:`, externalId)
    state.logger.debug(JSON.stringify(state.data, null, 2))
    state.logger.debug("===================")

    let id = state.references.length + 1
    let result = {sObject, fields: expandReferences(fields, state), id}

    return {
      ...state,
      references: [result, ...state.references]
    }

  }
}

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
export const reference = curry(function(position, state) {
  const { references } = state;
  return references[position].id;
})

/**
 * Executes an operation.
 * @function
 * @param {Operation} operations - Operations
 * @returns {State}
 */
function execute(...operations) {

  const initialState = {
    logger: {
      info: console.info.bind(console),
      debug: console.log.bind(console)
    },
    references: [],
    data: null
  }

  return state => {
    // Note: we no longer need `steps` anymore since `commonExecute`
    return commonExecute(
      ...flatten(operations),
      function(state) {
        delete state.connection;
        return state;
      }
    )({ ...initialState, ...state })
    .then(function(state) {
      state.logger.info(
        JSON.stringify(state.references, null, 2)
      )
      console.info("Finished Successfully");
      return state
    })
    .catch(function(err) {
      console.error(err.stack);
      console.info("Job failed.");
    })
  };

}

export { lookup, relationship } from './sourceHelpers';

export {
  each, join, fields, field, source, sourceValue, map, combine,
  merge, dataPath, dataValue, referencePath, lastReferenceValue,
  index, beta, toArray, arrayToString, alterState
} from 'language-common';
