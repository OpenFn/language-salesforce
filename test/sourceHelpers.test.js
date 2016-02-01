import { expect } from 'chai';
import { field, fields } from '../src/sourceHelpers';
import testData from './testData';

describe("Source Helpers", () => {

  describe("fields", () => {
    it("combines serveral fields into objects", () => {
      let result = fields(
        field("a", 1),
        field("b", 2)
      )

      expect(result).to.eql({ a: 1, b: 2 })
      
    })
  })
  
})


