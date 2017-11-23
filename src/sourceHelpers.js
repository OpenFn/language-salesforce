import { curry, merge, reduce, zipObject } from 'lodash-fp';
import { sourceValue, field } from 'language-common';

/**
 * Adds a lookup or 'dome insert' to a record.
 * @public
 * @example
 *  lookup("relationship_name__r", "externalID on related object", "$.path")
 * @function
 * @param {string} relationshipName - `__r` relationship field on the record.
 * @param {string} externalId - Salesforce ExternalID field.
 * @param {string} path - JSONPath to data source.
 * @returns {object}
 */
export function lookup(relationshipName, externalId, path) {
  return field(relationshipName, (state) => {
    return { [externalId]: sourceValue(path)(state) }
  })
}


/**
 * Adds a lookup or 'dome insert' to a record.
 * @public
 * @example
 * Data Sourced Value:
 *  relationship("relationship_name__r", "externalID on related object", dataSource("path"))
 * Fixed Value:
 *  relationship("relationship_name__r", "externalID on related object", "hello world")
 * @function
 * @param {string} relationshipName - `__r` relationship field on the record.
 * @param {string} externalId - Salesforce ExternalID field.
 * @param {string} dataSource - resolvable source.
 * @returns {object}
 */
export function relationship(relationshipName, externalId, dataSource) {
  return field(relationshipName, (state) => {
    if (typeof dataSource == 'function') {
      return { [externalId]: dataSource(state) }
    }
    return { [externalId]: dataSource }
  })
}
