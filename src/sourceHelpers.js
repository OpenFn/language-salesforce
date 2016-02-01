import { curry, merge, reduce, zipObject } from 'lodash-fp';
import { sourceValue } from 'language-common';
import JSONPath from 'JSONPath';

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

