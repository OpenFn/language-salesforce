import { expect } from 'chai';
import { describe as describeWrapper } from '../src/adaptor';

describe("Adaptor", () => {

  describe(".describe", () => {
    it("returns a function", () => {
      expect(describeWrapper("sObject")).to.be.a('function')
    })
  })

})
