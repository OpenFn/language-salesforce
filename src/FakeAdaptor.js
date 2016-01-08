import { curry, mapValues, flatten } from 'lodash-fp';

function steps(...operations) {
  return flatten(operations);
}

function expandReferences(attrs, state) {
  return mapValues(function(value) {
    return typeof value == 'function' ? value(state) : value;
  })(attrs); 
}

function create(sObject, fields) {

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

function upsert(sObject, externalId, fields) {

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


const reference = curry(function(position, {references}) {
  return references[position].id;
})

// Utils
function injectState(state) {
  return function() {
    return state;
  };
}

function execute( initialState = {}, operations ) {
  
  const state = {
    logger: {
      info: console.info.bind(console),
      debug: console.log.bind(console)
    },
    references: [], ...initialState
  }

  const start = Promise.resolve(state)

  return operations.reduce((acc, operation) => {
    return acc.then(operation);
  }, start)
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
  
}


export {
  create,
  execute,
  reference,
  steps,
  upsert
}

export {
  each, field, fields, join, lookup, source, sourceValue, map, combine
} from './sourceHelpers';
