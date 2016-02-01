'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.fields = fields;
exports.field = field;
exports.lookup = lookup;

var _lodashFp = require('lodash-fp');

var _languageCommon = require('language-common');

var _JSONPath = require('JSONPath');

var _JSONPath2 = _interopRequireDefault(_JSONPath);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function fields() {
  for (var _len = arguments.length, fields = Array(_len), _key = 0; _key < _len; _key++) {
    fields[_key] = arguments[_key];
  }

  return (0, _lodashFp.zipObject)(fields, undefined);
}

function field(key, value) {
  return [key, value];
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
function lookup(relationshipName, externalId, path) {
  return field(relationshipName, function (state) {
    return _defineProperty({}, externalId, (0, _languageCommon.sourceValue)(path)(state));
  });
}
