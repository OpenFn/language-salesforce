import jsforce from 'jsforce';

export default class Adaptor {
  constructor(credentials) {
    this.credentials = credentials;
    this.connection = new jsforce.Connection({
      loginUrl: "https://test.salesforce.com"
    });
  }

  login() {
    let { username, password } = this.credentials;
    return this.connection.login(username, password)
     
  }

  execute(operations) {
    return operations.map((operation) => {
      operation()
    })
  }
}

