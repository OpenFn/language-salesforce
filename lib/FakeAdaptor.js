"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.bulk = bulk;
exports.create = create;
exports.createIf = createIf;
exports.execute = execute;
exports.steps = steps;
exports.update = update;
exports.upsert = upsert;
exports.upsertIf = upsertIf;
exports.query = query;
Object.defineProperty(exports, "each", {
  enumerable: true,
  get: function get() {
    return _languageCommon.each;
  }
});
Object.defineProperty(exports, "join", {
  enumerable: true,
  get: function get() {
    return _languageCommon.join;
  }
});
Object.defineProperty(exports, "fields", {
  enumerable: true,
  get: function get() {
    return _languageCommon.fields;
  }
});
Object.defineProperty(exports, "field", {
  enumerable: true,
  get: function get() {
    return _languageCommon.field;
  }
});
Object.defineProperty(exports, "source", {
  enumerable: true,
  get: function get() {
    return _languageCommon.source;
  }
});
Object.defineProperty(exports, "sourceValue", {
  enumerable: true,
  get: function get() {
    return _languageCommon.sourceValue;
  }
});
Object.defineProperty(exports, "map", {
  enumerable: true,
  get: function get() {
    return _languageCommon.map;
  }
});
Object.defineProperty(exports, "combine", {
  enumerable: true,
  get: function get() {
    return _languageCommon.combine;
  }
});
Object.defineProperty(exports, "merge", {
  enumerable: true,
  get: function get() {
    return _languageCommon.merge;
  }
});
Object.defineProperty(exports, "dataPath", {
  enumerable: true,
  get: function get() {
    return _languageCommon.dataPath;
  }
});
Object.defineProperty(exports, "dataValue", {
  enumerable: true,
  get: function get() {
    return _languageCommon.dataValue;
  }
});
Object.defineProperty(exports, "referencePath", {
  enumerable: true,
  get: function get() {
    return _languageCommon.referencePath;
  }
});
Object.defineProperty(exports, "lastReferenceValue", {
  enumerable: true,
  get: function get() {
    return _languageCommon.lastReferenceValue;
  }
});
Object.defineProperty(exports, "index", {
  enumerable: true,
  get: function get() {
    return _languageCommon.index;
  }
});
Object.defineProperty(exports, "beta", {
  enumerable: true,
  get: function get() {
    return _languageCommon.beta;
  }
});
Object.defineProperty(exports, "toArray", {
  enumerable: true,
  get: function get() {
    return _languageCommon.toArray;
  }
});
Object.defineProperty(exports, "arrayToString", {
  enumerable: true,
  get: function get() {
    return _languageCommon.arrayToString;
  }
});
Object.defineProperty(exports, "alterState", {
  enumerable: true,
  get: function get() {
    return _languageCommon.alterState;
  }
});
Object.defineProperty(exports, "humanProper", {
  enumerable: true,
  get: function get() {
    return _languageCommon.humanProper;
  }
});
Object.defineProperty(exports, "lookup", {
  enumerable: true,
  get: function get() {
    return _sourceHelpers.lookup;
  }
});
Object.defineProperty(exports, "relationship", {
  enumerable: true,
  get: function get() {
    return _sourceHelpers.relationship;
  }
});
exports.reference = void 0;

var _languageCommon = require("language-common");

var _lodashFp = require("lodash-fp");

var _sourceHelpers = require("./sourceHelpers");

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(n); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && Symbol.iterator in Object(iter)) return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

/** @module FakeAdaptor */
function steps() {
  for (var _len = arguments.length, operations = new Array(_len), _key = 0; _key < _len; _key++) {
    operations[_key] = arguments[_key];
  }

  return (0, _lodashFp.flatten)(operations);
} // TODO: use the one from language-common


function expandReferences(attrs, state) {
  return (0, _lodashFp.mapValues)(function (value) {
    return typeof value == 'function' ? value(state) : value;
  })(attrs);
}

function create(sObject, fields) {
  return function (state) {
    state.logger.debug("Creating ".concat(sObject));
    state.logger.debug(JSON.stringify(state.data, null, 2));
    state.logger.debug("===================");
    var id = state.references.length + 1;
    var result = {
      sObject: sObject,
      fields: expandReferences(fields, state),
      id: id
    };
    return _objectSpread({}, state, {
      references: [result].concat(_toConsumableArray(state.references))
    });
  };
}

function bulk(sObject, operation, options, fun) {
  return function (state) {
    var opts = JSON.stringify(options, null, 2);
    state.logger.debug("Performing bulk ".concat(operation, " for ").concat(sObject, " \nwith options: ").concat(opts));
    state.logger.debug("======================================================");
    var result = {
      sObject: sObject,
      operation: operation,
      options: options,
      records: fun(state)
    };
    return _objectSpread({}, state, {
      references: [result].concat(_toConsumableArray(state.references))
    });
  };
}

function createIf(logical, sObject, fields) {
  return function (state) {
    if (logical) {
      state.logger.debug("Creating ".concat(sObject));
      state.logger.debug(JSON.stringify(state.data, null, 2));
      state.logger.debug("===================");
      var id = state.references.length + 1;
      var result = {
        sObject: sObject,
        fields: expandReferences(fields, state),
        id: id
      };
      return _objectSpread({}, state, {
        references: [result].concat(_toConsumableArray(state.references))
      });
    } else {
      console.info("Not upserting ".concat(sObject, " because logical is false."));
      return state;
    }
  };
}

function update(sObject, fields) {
  return function (state) {
    state.logger.debug("Updating ".concat(sObject));
    state.logger.debug(JSON.stringify(state.data, null, 2));
    state.logger.debug("===================");
    var id = state.references.length + 1;
    var result = {
      sObject: sObject,
      fields: expandReferences(fields, state),
      id: id
    };
    return _objectSpread({}, state, {
      references: [result].concat(_toConsumableArray(state.references))
    });
  };
}

function upsert(sObject, externalId, fields) {
  return function (state) {
    state.logger.debug("Upserting ".concat(sObject, " with externalId:"), externalId);
    state.logger.debug(JSON.stringify(state.data, null, 2));
    state.logger.debug("===================");
    var id = state.references.length + 1;
    var result = {
      sObject: sObject,
      fields: expandReferences(fields, state),
      id: id
    };
    return _objectSpread({}, state, {
      references: [result].concat(_toConsumableArray(state.references))
    });
  };
}

function upsertIf(logical, sObject, externalId, fields) {
  return function (state) {
    if (logical) {
      state.logger.debug("Upserting ".concat(sObject, " with externalId:"), externalId);
      state.logger.debug(JSON.stringify(state.data, null, 2));
      state.logger.debug("===================");
      var id = state.references.length + 1;
      var result = {
        sObject: sObject,
        fields: expandReferences(fields, state),
        id: id
      };
      return _objectSpread({}, state, {
        references: [result].concat(_toConsumableArray(state.references))
      });
    } else {
      console.info("Not upserting ".concat(sObject, " because logical is false."));
      return state;
    }
  };
}

function query(qs, state) {
  return function (state) {
    var response = {
      records: [{
        Id: 987
      }, {
        Id: 988
      }, {
        Id: 989
      }]
    };
    state.logger.debug("Executing query ".concat(qs, "."));
    state.logger.debug("===================");
    state.logger.debug("Returning arbitrary result: ".concat(JSON.stringify(response, null, 2)));
    var id = state.references.length + 1;
    var result = response;
    return _objectSpread({}, state, {
      references: [result].concat(_toConsumableArray(state.references))
    });
  };
}

var reference = (0, _lodashFp.curry)(function (position, _ref) {
  var references = _ref.references;
  return references[position].id;
});
exports.reference = reference;

function execute() {
  for (var _len2 = arguments.length, operations = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
    operations[_key2] = arguments[_key2];
  }

  var initialState = {
    logger: {
      info: console.info.bind(console),
      debug: console.log.bind(console)
    },
    references: [],
    data: null
  };
  return function (state) {
    // Note: we no longer need `steps` anymore since `commonExecute`
    return _languageCommon.execute.apply(void 0, _toConsumableArray((0, _lodashFp.flatten)(operations)).concat([function (state) {
      delete state.connection;
      return state;
    }]))(_objectSpread({}, initialState, {}, state)).then(function (state) {
      state.logger.info(JSON.stringify(state.references, null, 2));
      console.info("Finished Successfully");
      return state;
    })["catch"](function (err) {
      console.error(err.stack);
      console.info("Job failed.");
    });
  };
}
