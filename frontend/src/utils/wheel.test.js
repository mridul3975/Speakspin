import test from 'node:test';
import assert from 'node:assert/strict';
import { getWheelSegment } from './wheel.js';

test('the top pointer selects the upper segment, rather than its opposite', () => {
  assert.equal(getWheelSegment(0, 10), 7);
  assert.equal(getWheelSegment(90, 10), 5);
  assert.equal(getWheelSegment(270, 10), 0);
});

test('each segment center can be brought under the pointer', () => {
  for (let index = 0; index < 10; index += 1) {
    const rotation = 270 - (index + 0.5) * 36;
    assert.equal(getWheelSegment(rotation, 10), index);
    assert.equal(getWheelSegment(rotation + 360 * 9, 10), index);
  }
});

test('rotation wraps in both directions and supports smaller topic sets', () => {
  assert.equal(getWheelSegment(-90, 10), 0);
  assert.equal(getWheelSegment(720, 4), 3);
  assert.equal(getWheelSegment(15, 1), 0);
});
