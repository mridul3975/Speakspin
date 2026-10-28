import assert from 'node:assert/strict';
import { afterEach, test } from 'node:test';
import { prepareBattleMicrophone, releaseBattleMicrophone, takeBattleMicrophone } from './battleMicrophone.js';

const originalNavigator = Object.getOwnPropertyDescriptor(globalThis, 'navigator');
const microphone = () => {
  const track = { readyState: 'live', stops: 0, stop() { this.stops += 1; this.readyState = 'ended'; } };
  return { track, getTracks: () => [track], getAudioTracks: () => [track] };
};
const provide = getUserMedia => Object.defineProperty(globalThis, 'navigator', { configurable: true, value: { mediaDevices: { getUserMedia } } });
afterEach(() => {
  releaseBattleMicrophone();
  if (originalNavigator) Object.defineProperty(globalThis, 'navigator', originalNavigator);
  else delete globalThis.navigator;
});

test('a successful check is reused by the recording screen exactly once', async () => {
  const stream = microphone(); let calls = 0;
  provide(async () => { calls += 1; return stream; });
  assert.equal(await prepareBattleMicrophone(), stream);
  assert.equal(await prepareBattleMicrophone(), stream);
  assert.equal(calls, 1);
  assert.equal(takeBattleMicrophone(), stream);
  assert.equal(takeBattleMicrophone(), null);
});

test('leaving during a permission request closes the late stream', async () => {
  const stream = microphone(); let resolve;
  provide(() => new Promise(done => { resolve = done; }));
  const pending = prepareBattleMicrophone();
  releaseBattleMicrophone();
  resolve(stream);
  await assert.rejects(pending, { name: 'AbortError' });
  assert.equal(stream.track.stops, 1);
  assert.equal(takeBattleMicrophone(), null);
});

test('an old cancelled request cannot discard the next match microphone', async () => {
  const oldStream = microphone(); const newStream = microphone(); let resolveOld; let resolveNew; let requests = 0;
  provide(() => new Promise(resolve => { if (requests++ === 0) resolveOld = resolve; else resolveNew = resolve; }));
  const oldRequest = prepareBattleMicrophone();
  releaseBattleMicrophone();
  const nextRequest = prepareBattleMicrophone();
  resolveOld(oldStream);
  await assert.rejects(oldRequest, { name: 'AbortError' });
  resolveNew(newStream);
  assert.equal(await nextRequest, newStream);
  assert.equal(takeBattleMicrophone(), newStream);
  assert.equal(oldStream.track.stops, 1);
  assert.equal(newStream.track.stops, 0);
});
