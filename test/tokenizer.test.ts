import assert from 'node:assert/strict';
import test from 'node:test';
import { tokenize } from '../src/tokenizer.js';

test('tokenizes quoted strings and operators', () => {
  const result = tokenize("echo 'hello world' && npm test");
  assert.deepEqual(result.tokens.map((token) => token.value), ['echo', 'hello world', '&&', 'npm', 'test']);
  assert.equal(result.tokens[1]?.kind, 'string');
  assert.equal(result.errors.length, 0);
});

test('reports unterminated quotes', () => {
  const result = tokenize("echo 'oops");
  assert.equal(result.errors[0]?.code, 'unterminated-quote');
});

test('only starts comments where a shell token can begin', () => {
  const embedded = tokenize('echo foo#bar');
  assert.deepEqual(embedded.tokens.map((token) => [token.kind, token.value]), [
    ['word', 'echo'],
    ['word', 'foo#bar'],
  ]);

  const comment = tokenize('echo foo # ordinary comment');
  assert.deepEqual(comment.tokens.map((token) => [token.kind, token.value]), [
    ['word', 'echo'],
    ['word', 'foo'],
    ['comment', '# ordinary comment'],
  ]);
});
