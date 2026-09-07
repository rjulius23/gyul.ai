import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createBrief,
  MAX_CONTEXT_LENGTH,
  isInterest,
} from '../src/lib/brief.ts';
import { interests, profile } from '../src/lib/content.ts';

for (const interest of interests) {
  test(`${interest.id}: draft round-trips through mailto safely`, () => {
    const draft = createBrief(interest.id, 'A useful next step.');
    const url = new URL(draft.href);
    assert.equal(url.protocol, 'mailto:');
    assert.equal(url.pathname, profile.email);
    assert.equal(url.searchParams.get('body'), draft.body);
    assert.equal(url.searchParams.get('subject'), draft.subject);
    assert.ok(draft.body.includes(interest.request));
  });
}
test('markup, ampersands and headers remain plain body content', () => {
  const context =
    '<script>alert(1)</script> &bcc=nobody@example.test\nSubject: not a header # ?';
  const draft = createBrief('systems', context);
  const url = new URL(draft.href);
  assert.equal(url.searchParams.size, 2);
  assert.equal(url.searchParams.get('bcc'), null);
  assert.ok(url.searchParams.get('body')?.includes(context));
});
test('blank context does not add an empty context section', () => {
  assert.ok(
    !createBrief('strategy', '   \n').body.includes('A little context:'),
  );
});
test('bounded context does not exceed the defined UTF-16 limit', () => {
  const draft = createBrief('strategy', 'x'.repeat(600));
  assert.ok(draft.body.includes('x'.repeat(MAX_CONTEXT_LENGTH)));
  assert.ok(!draft.body.includes('x'.repeat(MAX_CONTEXT_LENGTH + 1)));
});
for (const input of [
  'a'.repeat(499) + '😀',
  '\uD800',
  '\uDC00',
  'Hello 👩‍💻 — árvíztűrő',
]) {
  test(`Unicode safety: ${JSON.stringify(input.slice(-15))}`, () => {
    const draft = createBrief('strategy', input);
    assert.equal(draft.body.isWellFormed(), true);
    assert.equal(new URL(draft.href).searchParams.get('body'), draft.body);
  });
}
test('interest validation rejects arbitrary identifiers', () => {
  assert.equal(isInterest('strategy'), true);
  assert.equal(isInterest('__proto__'), false);
});
