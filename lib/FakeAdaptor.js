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
Object.defineProperty(exports, "alterState", {
  enumerable: true,
  get: function () {
    return _languageCommon.alterState;
  }
});
Object.defineProperty(exports, "arrayToString", {
  enumerable: true,
  get: function () {
    return _languageCommon.arrayToString;
  }
});
Object.defineProperty(exports, "beta", {
  enumerable: true,
  get: function () {
    return _languageCommon.beta;
  }
});
Object.defineProperty(exports, "combine", {
  enumerable: true,
  get: function () {
    return _languageCommon.combine;
  }
});
Object.defineProperty(exports, "dataPath", {
  enumerable: true,
  get: function () {
    return _languageCommon.dataPath;
  }
});
Object.defineProperty(exports, "dataValue", {
  enumerable: true,
  get: function () {
    return _languageCommon.dataValue;
  }
});
Object.defineProperty(exports, "each", {
  enumerable: true,
  get: function () {
    return _languageCommon.each;
  }
});
Object.defineProperty(exports, "field", {
  enumerable: true,
  get: function () {
    return _languageCommon.field;
  }
});
Object.defineProperty(exports, "fields", {
  enumerable: true,
  get: function () {
    return _languageCommon.fields;
  }
});
Object.defineProperty(exports, "http", {
  enumerable: true,
  get: function () {
    return _languageCommon.http;
  }
});
Object.defineProperty(exports, "humanProper", {
  enumerable: true,
  get: function () {
    return _languageCommon.humanProper;
  }
});
Object.defineProperty(exports, "index", {
  enumerable: true,
  get: function () {
    return _languageCommon.index;
  }
});
Object.defineProperty(exports, "join", {
  enumerable: true,
  get: function () {
    return _languageCommon.join;
  }
});
Object.defineProperty(exports, "lastReferenceValue", {
  enumerable: true,
  get: function () {
    return _languageCommon.lastReferenceValue;
  }
});
Object.defineProperty(exports, "map", {
  enumerable: true,
  get: function () {
    return _languageCommon.map;
  }
});
Object.defineProperty(exports, "merge", {
  enumerable: true,
  get: function () {
    return _languageCommon.merge;
  }
});
Object.defineProperty(exports, "referencePath", {
  enumerable: true,
  get: function () {
    return _languageCommon.referencePath;
  }
});
Object.defineProperty(exports, "source", {
  enumerable: true,
  get: function () {
    return _languageCommon.source;
  }
});
Object.defineProperty(exports, "sourceValue", {
  enumerable: true,
  get: function () {
    return _languageCommon.sourceValue;
  }
});
Object.defineProperty(exports, "toArray", {
  enumerable: true,
  get: function () {
    return _languageCommon.toArray;
  }
});
exports.reference = void 0;

var _languageCommon = require("@openfn/language-common");

var _lodashFp = require("lodash-fp");

/** @module FakeAdaptor */
function steps(...operations) {
  return (0, _lodashFp.flatten)(operations);
}

function relationship(relationshipName, externalId, dataSource) {
  return field(relationshipName, state => {
    if (typeof dataSource == 'function') {
      return {
        [externalId]: dataSource(state)
      };
    }

    return {
      [externalId]: dataSource
    };
  });
} // TODO: use the one from language-common


function expandReferences(attrs, state) {
  return (0, _lodashFp.mapValues)(function (value) {
    return typeof value == 'function' ? value(state) : value;
  })(attrs);
}

function create(sObject, fields) {
  return state => {
    state.logger.debug(`Creating ${sObject}`);
    state.logger.debug(JSON.stringify(state.data, null, 2));
    state.logger.debug('===================');
    let id = state.references.length + 1;
    let result = {
      sObject,
      fields: expandReferences(fields, state),
      id
    };
    return { ...state,
      references: [result, ...state.references]
    };
  };
}

function bulk(sObject, operation, options, fun) {
  return state => {
    const opts = JSON.stringify(options, null, 2);
    state.logger.debug(`Performing bulk ${operation} for ${sObject} \nwith options: ${opts}`);
    state.logger.debug('======================================================');
    let result = {
      sObject,
      operation,
      options,
      records: fun(state)
    };
    return { ...state,
      references: [result, ...state.references]
    };
  };
}

function createIf(logical, sObject, fields) {
  return state => {
    if (logical) {
      state.logger.debug(`Creating ${sObject}`);
      state.logger.debug(JSON.stringify(state.data, null, 2));
      state.logger.debug('===================');
      let id = state.references.length + 1;
      let result = {
        sObject,
        fields: expandReferences(fields, state),
        id
      };
      return { ...state,
        references: [result, ...state.references]
      };
    } else {
      console.info(`Not upserting ${sObject} because logical is false.`);
      return state;
    }
  };
}

function update(sObject, fields) {
  return state => {
    state.logger.debug(`Updating ${sObject}`);
    state.logger.debug(JSON.stringify(state.data, null, 2));
    state.logger.debug('===================');
    let id = state.references.length + 1;
    let result = {
      sObject,
      fields: expandReferences(fields, state),
      id
    };
    return { ...state,
      references: [result, ...state.references]
    };
  };
}

function upsert(sObject, externalId, fields) {
  return state => {
    state.logger.debug(`Upserting ${sObject} with externalId:`, externalId);
    state.logger.debug(JSON.stringify(state.data, null, 2));
    state.logger.debug('===================');
    let id = state.references.length + 1;
    let result = {
      sObject,
      fields: expandReferences(fields, state),
      id
    };
    return { ...state,
      references: [result, ...state.references]
    };
  };
}

function upsertIf(logical, sObject, externalId, fields) {
  return state => {
    if (logical) {
      state.logger.debug(`Upserting ${sObject} with externalId:`, externalId);
      state.logger.debug(JSON.stringify(state.data, null, 2));
      state.logger.debug('===================');
      let id = state.references.length + 1;
      let result = {
        sObject,
        fields: expandReferences(fields, state),
        id
      };
      return { ...state,
        references: [result, ...state.references]
      };
    } else {
      console.info(`Not upserting ${sObject} because logical is false.`);
      return state;
    }
  };
}

function query(qs, state) {
  return state => {
    const response = {
      records: [{
        Id: 987
      }, {
        Id: 988
      }, {
        Id: 989
      }]
    };
    state.logger.debug(`Executing query ${qs}.`);
    state.logger.debug('===================');
    state.logger.debug(`Returning arbitrary result: ${JSON.stringify(response, null, 2)}`);
    let id = state.references.length + 1;
    let result = response;
    return { ...state,
      references: [result, ...state.references]
    };
  };
}

const reference = (0, _lodashFp.curry)(function (position, {
  references
}) {
  return references[position].id;
});
exports.reference = reference;

function execute(...operations) {
  const initialState = {
    logger: {
      info: console.info.bind(console),
      debug: console.log.bind(console)
    },
    references: [],
    data: null
  };
  return state => {
    // Note: we no longer need `steps` anymore since `commonExecute`
    return (0, _languageCommon.execute)(...(0, _lodashFp.flatten)(operations), function (state) {
      delete state.connection;
      return state;
    })({ ...initialState,
      ...state
    }).then(function (state) {
      state.logger.info(JSON.stringify(state.references, null, 2));
      console.info('Finished Successfully');
      return state;
    }).catch(function (err) {
      console.error(err.stack);
      console.info('Job failed.');
    });
  };
}