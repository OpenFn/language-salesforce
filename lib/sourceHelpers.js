'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.lookup = lookup;
exports.relationship = relationship;

var _lodashFp = require('lodash-fp');

var _languageCommon = require('language-common');

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

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
function lookup(relationshipName, externalId, path) {
  return (0, _languageCommon.field)(relationshipName, function (state) {
    return _defineProperty({}, externalId, (0, _languageCommon.sourceValue)(path)(state));
  });
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
function relationship(relationshipName, externalId, dataSource) {
  return (0, _languageCommon.field)(relationshipName, function (state) {
    if (typeof dataSource == 'function') {
      return _defineProperty({}, externalId, dataSource(state));
    }
    return _defineProperty({}, externalId, dataSource);
  });
}
