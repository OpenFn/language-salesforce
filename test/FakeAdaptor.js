import { curry, mapValues } from 'lodash-fp';
import { source, sourceValue, map } from '../src/sourceHelpers';

function steps(...operations) {
  return operations;
}

function expandReferences(attrs, state) {
  return mapValues(function(value) {
    return typeof value == 'function' ? value(state) : value;
  })(attrs); 
}

const create = curry(function(sObject, fields, state) {
  return { sObject, fields: expandReferences(fields, state) };
});

function reference(pos) {
  return pos;
}

export { create, reference, steps, source, sourceValue, map }
