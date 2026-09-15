import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { sampleEnvelope } from './waveform-dsp';

describe('waveform dsp', () => {
  it('keeps the smooth envelope the same shape while the window slides', () => {
    const data = new Float32Array(48_000);
    for (let i = 0; i < data.length; i++) data[i] = Math.sin(i * 0.013) * Math.sin(i * 0.0007);
    const seg = 480 / 7;
    const at = (from: number) => new Map(sampleEnvelope(data, from, from + 12_000, seg).map((p) => [p.pos, p.amp]));
    const before = at(10_000);
    const after = at(10_000 + 37.3);
    let shared = 0;
    for (const [pos, amp] of after) {
      if (!before.has(pos)) continue;
      assert.equal(amp, before.get(pos));
      shared++;
    }
    assert.ok(shared > 100);
  });

  it('reaches both ends of the sample', () => {
    const data = new Float32Array(1000).fill(0.5);
    const env = sampleEnvelope(data, 0, 1000, 64);
    assert.equal(env[0].pos, 0);
    assert.equal(env[env.length - 1].pos, 1000);
    assert.ok(env.every((p) => p.amp === 0.5));
  });
});
