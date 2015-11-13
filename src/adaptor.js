import jsforce from 'jsforce';
import { source, sourceValue, map } from './sourceHelpers';
import { curry, mapValues } from 'lodash-fp';

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
  console.info(`Creating ${sObject}`, attrs);

  return connection.create(sObject, expandReferences(state, attrs))
  .then(function(recordResult) {
    references.push(recordResult);
    console.log('Result : ' + JSON.stringify(recordResult));

    return state;
  })
  .catch(function(err) {
    console.error(err.stack);
    return err;
  })
  
});

const upsert = curry(function(sObject, externalId, attrs, state) {
  let {connection, references} = state;
  console.info(`Upserting ${sObject} with externalId`, externalId, ":" , attrs);

  return connection.upsert(sObject, externalId, expandReferences(state, attrs))
  .then(function(recordResult) {
    references.push(recordResult);
    console.log('Result : ' + JSON.stringify(recordResult));

    return state;
  })
  .catch(function(err) {
    console.error(err);
    return err;
  });

})

const reference = curry(function(position, {references}) {
  return references[position].id;
})

function login({username, password, securityToken}) {
  return function(state) {
    let { connection } = state;
    console.info(`Logging in as ${username}.`);

    return connection.login( username, password + securityToken );

  };
}


function execute(
  {credentials, connectionOptions},
  data = {},
  operations
) {

  const state = {
    connection: new jsforce.Connection(connectionOptions), 
    references: [],
    data
  }

  const start = login(credentials)(state).then(injectState(state));

  operations.reduce((acc, operation) => {
    return acc.then(operation);
  }, start)
  .then(function(state) {
    console.log(state);
    console.info("Finished Successfully");
  })
  .catch(function(err) {
    console.error(err);
    console.log(err.stack);
    console.info("Job failed.");
    process.exit(1);
  });
  
}

// Wrappers
function steps(...operations) {
  return(operations);
}

// Utils
function injectState(state) {
  return function() {
    return state;
  };
}

function expandReferences(state, attrs) {
  return mapValues(function(value) {
    return typeof value == 'function' ? value(state) : value;
  })(attrs); 
}

export {
  execute, describe, create, upsert,
  reference, steps, source, sourceValue, map
}
