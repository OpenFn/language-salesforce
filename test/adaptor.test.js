import { expect } from 'chai';
import sinon from 'sinon';
import { describe as adaptorDescribe, reference, create, upsert } from '../src/adaptor';

describe("Adaptor", () => {

  describe("reference", () => {
    it("returns the Id of a previous operation", () => {
      let state = { references: [{id: '12345'}] };
      let Id = reference(0, state);
      expect(Id).to.eql('12345');
    })
  })

  describe("describe", () => {
  })

  describe("create", () => {

    it("makes a new sObject", () => {

      const fakeConnection = {
        create: function() {
          return Promise.resolve({Id: 10})  
        }
      };
      let state = { connection: fakeConnection, references: [] };

      let sObject = "myObject";
      let fields = { field: "value" };

      let spy = sinon.spy(fakeConnection, "create");

      create(sObject, fields, state);
      expect(spy.args[0]).to.eql([ sObject, fields ]);
      expect(spy.called).to.eql(true);
    })
  })

  describe("upsert", () => {

    it("is expected to call `upsert` on the connection", () => {

      const connection = {
        upsert: function() {
          return Promise.resolve({Id: 10})  
        }
      };
      let state = { connection, references: [] };

      let sObject = "myObject";
      let externalId = "MyExternalId";
      let fields = { field: "value" };

      let spy = sinon.spy(connection, "upsert");

      upsert(sObject, externalId, fields, state);
      expect(spy.args[0]).to.eql([ sObject, externalId, fields ]);
      expect(spy.called).to.eql(true);
    })
  })

})
