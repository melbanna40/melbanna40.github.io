import test from 'node:test';
import assert from 'node:assert/strict';
import { formatStat, countValue, nextPreviewState } from '../js/motion.js';

test('formatStat applies decimals and suffix', () => {
  assert.equal(formatStat(770, { suffix: 'K+' }), '770K+');
  assert.equal(formatStat(4.7, { decimals: 1, suffix: '★' }), '4.7★');
  assert.equal(formatStat(3.14159, { decimals: 1 }), '3.1');
});

test('countValue starts at 0, ends at target, clamps', () => {
  assert.equal(countValue(770, 0), 0);
  assert.equal(countValue(770, 1), 770);
  assert.equal(countValue(770, 2), 770);
  assert.equal(countValue(770, -1), 0);
  assert.ok(countValue(770, 0.5) > 385);
});

test('toggles preview on tap', () => {
  assert.equal(nextPreviewState(null, 'a'), 'a');
  assert.equal(nextPreviewState('a', 'a'), null);
  assert.equal(nextPreviewState('a', 'b'), 'b');
});
