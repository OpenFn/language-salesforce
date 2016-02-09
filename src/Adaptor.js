import { execute as commonExecute } from 'language-common';
import jsforce from 'jsforce';
import { curry, mapValues, flatten } from 'lodash-fp';

/**
 * @typedef {Object} State
 * @property {object} data JSON Data.
 * @property {Array<Reference>} references History of all previous operations.
 */

/**
 * @typedef {Function} Operation
 * @param {State} state
 */

/**
 * Outputs basic information about an sObject to `STDOUT`.
 * @constructor
 * @param {String} sObject - API name of the sObject.
 * @param {State} state - Runtime state.
 * @returns {Operation}
 */
const describe = curry(function(sObject, state) {
  let {connection} = state;

  return connection.sobject(sObject).describe()
  .then(function(meta) {
    console.log('Label : ' + meta.label);
    console.log('Num of Fields : ' + meta.fields.length);

    return state;
  })
  .catch(function(err) {
    console.error(err);
    return err;
  })
  
});

/**
 * Create a new object.
 * @constructor
 * @param {String} sObject - API name of the sObject.
 * @param {Object} attrs - Field attributes for the new object.
 * @param {State} state - Runtime state.
 * @returns {Operation}
 */
const create = curry(function(sObject, attrs, state) {
  let {connection, references} = state;
  const finalAttrs = expandReferences(state, attrs)
  console.info(`Creating ${sObject}`, finalAttrs);

  return connection.create(sObject, finalAttrs)
  .then(function(recordResult) {
    console.log('Result : ' + JSON.stringify(recordResult));
    return {
      ...state, references: [recordResult, ...state.references]
    }
  })
  
});

const upsert = curry(function(sObject, externalId, attrs, state) {
  let {connection, references} = state;
  const finalAttrs = expandReferences(state, attrs)
  console.info(
    `Upserting ${sObject} with externalId`, externalId, ":" , finalAttrs
  );

  return connection.upsert(sObject, finalAttrs, externalId)
  .then(function(recordResult) {
    console.log('Result : ' + JSON.stringify(recordResult));
    return {
      ...state, references: [recordResult, ...state.references]
    }
  })

})

const reference = curry(function(position, {references}) {
  return references[position].id;
})


function createConnection(state) {
  const { loginUrl } = state.configuration;

  if (!loginUrl) {
    throw new Error("loginUrl missing from configuration.")
  }

  return { ...state, connection: new jsforce.Connection({ loginUrl }) }
}

function login(state) {

  const {username, password, securityToken} = state.configuration
  let { connection } = state;
  console.info(`Logging in as ${username}.`);

  return connection.login( username, password + securityToken )
    .then(injectState(state))

}

function execute(...operations) {

  const initialState = {
    logger: {
      info: console.info.bind(console),
      debug: console.log.bind(console)
    },
    references: [],
    data: null,
    configuration: {}
  }

  return state => {
    // Note: we no longer need `steps` anymore since `commonExecute`
    // takes each operation as an argument.
    return commonExecute(
      createConnection,
      login,
      ...flatten(operations)
    )({ ...initialState, ...state }) 

  };

}


// Utils
function injectState(state) {
  return function() {
    return state;
  };
}

function steps(...operations) {
  return flatten(operations);
}

function expandReferences(state, attrs) {
  return mapValues(function(value) {
    return typeof value == 'function' ? value(state) : value;
  })(attrs); 
}

export {
  execute, describe, create, upsert,
  reference, steps
}

export { lookup } from './sourceHelpers';

export {
  each, join, fields, field, source, sourceValue, map, combine,
  merge, dataPath, dataValue, referencePath, lastReferenceValue,
  index
} from 'language-common';
