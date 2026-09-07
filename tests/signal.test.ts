import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createSignalGeometry,
  projectSignal,
  ringPath,
} from '../src/lib/signal.ts';

test('static and enhanced artwork share deterministic finite geometry', () => {
  const geometry = createSignalGeometry();
  assert.equal(geometry.length, 144);
  assert.deepEqual(geometry, createSignalGeometry());
  for (const angle of [-1, 0, 0.65, 1]) {
    const rings = projectSignal(geometry, angle);
    for (const ring of rings) {
      assert.ok(Number.isFinite(ring.depth));
      assert.ok(ringPath(ring).endsWith('Z'));
      for (const point of ring.points)
        assert.ok(
          Number.isFinite(point.x) &&
            Number.isFinite(point.y) &&
            Number.isFinite(point.z),
        );
    }
  }
});
