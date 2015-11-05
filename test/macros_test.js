import ls from 'lispyscript';
import assert from 'assert';

function compileExpression(exp) {
  const compiled = ls._compile(exp);
  return eval(compiled)
}

describe('macros', () => {

  it('can compile', () => {
    const output = compileExpression("(do (field key 'value'))");
    assert.equal('value', output['key']);
  });

});
