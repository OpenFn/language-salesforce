/* @flow */
import jsforce from 'jsforce';
import lodash from 'lodash-fp';

type State = {
  references: Array<Object>;
  connection: Object;
};

type SObject = string;

type Operation = Function;

type Credentials = {
  username: string;
  password: string;
  securityToken: string;
};

type ConnectionOptions = {
  accessToken: string;
};

type Configuration = {
  credentials: Credentials;
  connectionOptions: ConnectionOptions;
}

function describe(sObject: SObject): Function {
  return function(state: State) {
    let {connection, references} = state;

    return connection.sobject(sObject).describe()
      .then(function(meta): State {
        console.log('Label : ' + meta.label);
        console.log('Num of Fields : ' + meta.fields.length);

        return state;
      })
      .catch(function(err) {
        console.error(err);
        return err;
      })
  }
};

function create(sObject: SObject, attrs): Function {
  return function(state: State) {
    let {connection, references} = state;
    console.info(`Creating ${sObject}`, attrs);

    return connection.create(sObject, expandReferences(state, attrs))
      .then(function(recordResult): State {
        references.push(recordResult);
        console.log('Result : ' + JSON.stringify(recordResult));

        return state;
      })
      .catch(function(err) {
        console.error(err);
        return err;
      })
  }
};

function upsert(sObject: SObject, externalId: string, attrs): Function {
  return function(state: State) {
    let {connection, references} = state;
    console.info(`Upserting ${sObject} with externalId`, externalId, ":" , attrs);

    return connection.upsert(sObject, externalId, expandReferences(state, attrs))
      .then(function(recordResult): State {
        references.push(recordResult);
        console.log('Result : ' + JSON.stringify(recordResult));

        return state;
      })
      .catch(function(err) {
        console.error(err);
        return err;
      });
  }
};

function reference(position: number): Function {
  return function({references}) {
    return references[position].id
  };
}

function login({username, password, securityToken}: Credentials): Function {
  return function(state: State): Operation {
    let { connection } = state;
    console.info(`Logging in as ${username}.`);

    return connection.login( username, password + securityToken );

  };
}


function execute(
  {credentials, connectionOptions}: Configuration,
  operations: Array<Operation>
) {

  const state: State = {
    connection: new jsforce.Connection(connectionOptions), 
    references: []
  }

  const start = login(credentials)(state).then(injectState(state));

  operations.reduce((acc, operation) => {
    return acc.then(operation);
  }, start)
  .then(function(state) {
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
function steps(...operations): Array<Operation> {
  return(operations);
}

// Utils
function injectState(state: State): Function {
  return function() {
    return state;
  };
}

function expandReferences(state: State, attrs) {
  return lodash.mapValues(function(value) {
    return typeof value == 'function' ? value(state) : value;
  })(attrs); 
}

export { execute, describe, create, upsert, reference, steps }
