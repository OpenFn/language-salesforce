import { expect } from 'chai';
import { execute, create, source, sourceValue, steps, map } from './FakeAdaptor';
import testData from './testData';

describe("JSON References", () => {

  describe("One to one", () => {
    it("references a given path", () => {
      let value = sourceValue("$.store.bicycle.color", {data: testData});
      expect(value).to.eql("red");
    })
  })

  describe("Use cases", () => {

    it("can produce a one to one", () => {
      const state = {data: testData, references: []};

      create("myObject", {
        bicycle: sourceValue("$.store.bicycle.color", state)
      }, state)

      expect(state.references).to.eql([ { sObject: "myObject", fields: { bicycle: "red" } } ])
    });

    it("can create an object", function(done) {
      const state = {data: testData, references: []};

      execute(state, steps(
        create('Bicycle', {
          color: sourceValue("$.store.bicycle.color")
        })
      ))
      .then(function({references}) {
        expect(references).to.eql([
          {
            "fields": {
              "color": "red"
            },
            "sObject": "Bicycle"
          }
        ]);
      }).catch(function(err) {
        return err;
      }).then(done)

    });

    it("can create many objects", function(done) {
      const state = {data: testData, references: []};

      execute(state, steps(
        map("$.store.book[*]",
            create("Book", {
              title: sourceValue("$.title")
            })
           )
      ))
      .then(function({references}) {
        expect(references).to.eql(
          [ { sObject: 'Book', fields: { title: 'Sayings of the Century' } },
            { sObject: 'Book', fields: { title: 'Sword of Honour' } },
            { sObject: 'Book', fields: { title: 'Moby Dick' } },
            { sObject: 'Book', fields: { title: 'The Lord of the Rings' } } ]
        );
      }).catch(function(err) {
        return err;
      }).then(done)

    });
  })
  
})


