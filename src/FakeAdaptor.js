import { curry, mapValues, flatten } from 'lodash-fp';
import { source, sourceValue, map } from './sourceHelpers';

function steps(...operations) {
  return flatten(operations);
}

function expandReferences(attrs, state) {
  return mapValues(function(value) {
    return typeof value == 'function' ? value(state) : value;
  })(attrs); 
}

const create = curry(function(sObject, fields, state) {
  let { references } = state;
  references.push( { sObject, fields: expandReferences(fields, state) } );
  return state;
});

function reference(pos) {
  return pos;
}
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
  });
  
}


export { execute, create, reference, steps, source, sourceValue, map }
