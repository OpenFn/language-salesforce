import { expect } from 'chai';
import { source, sourceValue, map } from '../src/sourceHelpers';
import testData from './testData';

describe("Source Helpers", () => {

  describe("sourceValue", () => {
    it("references a given path", () => {
      let value = sourceValue("$.store.bicycle.color", {data: testData});
      expect(value).to.eql("red");
    })
  })

  describe("source", () => {
    it("references a given path", () => {
      let value = source("$.store.bicycle.color", {data: testData});
      expect(value).to.eql([ "red" ]);
    })
  })

  describe("map", () => {

    const state = {data: testData};

    it("can produce a one to one from an array", () => {
      let obj = map('$.store.book[*]', 
        function(state) {
          return { title: sourceValue("$.title", state) } 
        }, state)

      expect(obj).to.eql([
        { "title": "Sayings of the Century" },
        { "title": "Sword of Honour" },
        { "title": "Moby Dick" },
        { "title": "The Lord of the Rings" }
      ])
      
    });
  })
  
})


