/* @flow */
import jsforce from 'jsforce';

type State = {
  references: Array<Object>;
  connection: Object;
};

type SObject = string;

type Credentials = {
  username: string;
  password: string;
  securityToken: string;
};

type ConnectionOptions = {
  accessToken: string;
};


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

function execute(credentials: Credentials, connectionOptions: ConnectionOptions) {

  const state: State = {
    connection: new jsforce.Connection(connectionOptions), 
    references: []
  }

  state.connection.login(
    credentials.username, 
    credentials.password + credentials.securityToken
  )
  .then(showUserInfo)
  .then(injectState(state))
  .catch(function(err) {
    console.error(err);
    console.log(err.stack);
  });
  
}

// Utils
function injectState(state: State): function {
  return function() {
    return state;
  };
}

export { execute, describe, create, upsert, injectState }
