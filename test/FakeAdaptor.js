import { curry, merge, mapValues } from 'lodash-fp';
import JSONPath from 'JSONPath';

function steps(...operations) {
  return operations;
}

function expandReferences(state, attrs) {
  return mapValues(function(value) {
    return typeof value == 'function' ? value(state) : value;
  })(attrs); 
}

const create = curry(function(sObject, fields, state) {
  return { sObject, fields: expandReferences(state, fields) };
});

function reference(pos) {
  return pos;
}

const sourceValue = curry(function(path, {data}) {
  return JSONPath.eval(data, path)[0];
})

const source = curry(function(path, {data}) {
  return JSONPath.eval(data, path);
})

const map = curry(function(path, operation, state) {
  return source(path,state).map(function(data) {
    return operation(merge({ data }, state));
  })
})

export { create, reference, steps, source, sourceValue, map }
