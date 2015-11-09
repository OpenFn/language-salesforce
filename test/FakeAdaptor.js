const sObjectStub = {
  upsert: function(fields, extId) {
    console.log(fields, extId);
  }
}

const connection = {
  sobject: function(object) {
    return sObjectStub;
  }
}

export default class FakeAdaptor {
  static execute(operations) {
    operations.map(function(operation) {
      return operation(connection);
    })
  }
}
