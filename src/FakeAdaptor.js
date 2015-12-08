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

function execute( state = {}, operations) {

  const start = Promise.resolve(state)

  return operations.reduce((acc, operation) => {
    return acc.then(operation);
  }, start)
  .catch(function(err) {
    console.error(err.stack);
    console.info("Job failed.");
  })
  
}


export {
  create,
  execute,
  reference,
  steps
}

export { each, field, fields, join, source, sourceValue, map, combine } from './sourceHelpers';
