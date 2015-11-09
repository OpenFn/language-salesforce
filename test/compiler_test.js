import assert from 'assert';
import { compile } from '../src/compiler';

describe("Compiler", () => {
  describe(".compile", () => {

    it('returns a string', () => {
      const output = compile('field("key","value")');
      assert.equal("({ 'key': 'value' });", output);
    })

  })
})
