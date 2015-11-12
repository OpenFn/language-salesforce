import { expect } from 'chai';
import { create, source, sourceValue, steps, map } from './FakeAdaptor';
import testData from './testData';

describe("JSON References", () => {

  describe("One to one", () => {
    it("references a given path", () => {
      let value = sourceValue("$.store.bicycle.color", {data: testData});
      expect(value).to.eql("red");
    })
  })

  describe("Use cases", () => {

    const state = {data: testData};

    it("can produce a one to one", () => {
      let obj = create("myObject", {
        bicycle: sourceValue("$.store.bicycle.color", state)
      }, state)

      expect(obj).to.eql({ sObject: "myObject", fields: { bicycle: "red" } })
    });

    it("can produce a one to one from an array", () => {
      let obj = map('$.store.book[*]', 
        create('Book', {
          title: sourceValue("$.title")
        })
        , state)

      expect(obj).to.eql([
        {
          "fields": {
            "title": "Sayings of the Century"
          },
          "sObject": "Book"
        },
        {
          "fields": {
            "title": "Sword of Honour"
          },
          "sObject": "Book"
        },
        {
          "fields": {
            "title": "Moby Dick"
          },
          "sObject": "Book"
        },
        {
          "fields": {
            "title": "The Lord of the Rings"
          },
          "sObject": "Book"
        }
      ])
      
    });
  })
  
})


