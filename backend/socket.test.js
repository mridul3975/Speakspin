import assert from 'node:assert/strict';
import { once } from 'node:events';
import http from 'node:http';
import { setTimeout as delay } from 'node:timers/promises';
import { after, test } from 'node:test';
import { io as connect } from '../frontend/node_modules/socket.io-client/build/esm/index.js';
import { initSocket } from './socket.js';

// These integration checks exercise the deterministic local judge, never a paid API.
const originalApiKey = process.env.GROQ_API_KEY;
process.env.GROQ_API_KEY = '';
after(() => {
  if (originalApiKey === undefined) delete process.env.GROQ_API_KEY;
  else process.env.GROQ_API_KEY = originalApiKey;
});

function nextEvent(socket, name, timeout = 2500) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      socket.off(name, listener);
      reject(new Error(`Timed out waiting for ${name}`));
    }, timeout);
    const listener = payload => {
      clearTimeout(timer);
      resolve(payload);
    };
    socket.once(name, listener);
  });
}

async function arena(t, count) {
  const server = http.createServer();
  const io = initSocket(server);
  assert.ok(io && typeof io.close === 'function', 'initSocket returns the server for clean shutdown');
  const listening = once(server, 'listening');
  server.listen(0, '127.0.0.1');
  await listening;
  const clients = Array.from({ length: count }, () => connect(`http://127.0.0.1:${server.address().port}`, {
    transports: ['websocket'], forceNew: true, reconnection: false, autoConnect: false,
  }));
  t.after(async () => {
    clients.forEach(client => client.close());
    await new Promise(resolve => io.close(resolve));
    if (server.listening) await new Promise(resolve => server.close(resolve));
  });
  await Promise.all(clients.map(async client => {
    const connected = nextEvent(client, 'connect');
    client.connect();
    await connected;
  }));
  return clients;
}

const player = (name, language = 'en-US', rating = 1000) => ({ playerName: name, avatar: '🦁', rating, language });
const speech = 'A useful habit begins with a small repeatable action. For example, speaking for one minute each morning can help us organize a clear point and support it with a reason. Consistency matters because practice gives us evidence of progress. We can listen, make one adjustment, and try again tomorrow.';
const submit = (socket, roomId, transcript) => socket.emit('submit_transcript', {
  roomId, transcript, actualDuration: transcript ? 25 : 1,
  wordCount: transcript ? transcript.split(/\s+/).length : 0,
});

test('real matching respects language, requires readiness, and settles each round exactly once', { timeout: 30000 }, async t => {
  const [first, otherLanguage, second] = await arena(t, 3);
  const unsolicited = [];
  first.on('match_found', data => unsolicited.push(data));
  otherLanguage.on('match_found', data => unsolicited.push(data));
  const firstQueued = nextEvent(first, 'queue_joined');
  const otherQueued = nextEvent(otherLanguage, 'queue_joined');
  first.emit('find_match', player('First', 'en-US', 1000));
  otherLanguage.emit('find_match', player('Different language', 'hi-IN', 1050));
  await Promise.all([firstQueued, otherQueued]);
  // A real opponent arriving before the five-second fallback still takes priority.
  await delay(4250);
  assert.equal(unsolicited.length, 0, 'no bot fallback or cross-language match before five seconds');

  const firstMatch = nextEvent(first, 'match_found');
  const secondMatch = nextEvent(second, 'match_found');
  second.emit('find_match', player('Second', 'en-US', 1050));
  const [match1, match2] = await Promise.all([firstMatch, secondMatch]);
  assert.equal(match1.roomId, match2.roomId);
  assert.equal(match1.opponent.name, 'Second');
  assert.equal(match2.opponent.name, 'First');
  assert.notEqual(match1.opponent.isBot, true);
  assert.equal(match1.yourPosition, 'player1');
  assert.equal(match2.yourPosition, 'player2');
  otherLanguage.emit('cancel_search');

  const starts = [];
  first.on('battle_starting', data => starts.push(data));
  await delay(100);
  assert.equal(starts.length, 0);
  const opponentReady = nextEvent(second, 'opponent_ready');
  first.emit('player_ready', { roomId: match1.roomId });
  await opponentReady;
  await delay(100);
  assert.equal(starts.length, 0, 'one ready player cannot start the round');

  const reveal1 = nextEvent(first, 'battle_starting');
  const reveal2 = nextEvent(second, 'battle_starting');
  const recording1 = nextEvent(first, 'start_recording', 8500);
  const recording2 = nextEvent(second, 'start_recording', 8500);
  second.emit('player_ready', { roomId: match1.roomId });
  const [topic1, topic2] = await Promise.all([reveal1, reveal2]);
  assert.equal(topic1.topic, topic2.topic);
  assert.equal(topic1.duration, 60);
  const [start1, start2] = await Promise.all([recording1, recording2]);
  assert.ok(Number.isFinite(start1.startAt));
  assert.equal(start1.startAt, start2.startAt, 'both clients receive the same recording deadline origin');

  const settled = [];
  first.on('battle_results', result => settled.push(result));
  const result1Promise = nextEvent(first, 'battle_results');
  const result2Promise = nextEvent(second, 'battle_results');
  submit(first, match1.roomId, speech);
  submit(second, match1.roomId, '');
  const [result1, result2] = await Promise.all([result1Promise, result2Promise]);
  assert.equal(result1.resultId, result2.resultId);
  assert.ok(typeof result1.resultId === 'string' && result1.resultId.length > 0);
  assert.equal(result1.player1.rating, 1000);
  assert.equal(result1.player2.rating, 1050);
  assert.equal(result1.winner, 'player1');
  for (const resultPlayer of [result1.player1, result1.player2]) {
    assert.equal(resultPlayer.newRating, resultPlayer.rating + resultPlayer.ratingChange);
  }
  submit(first, match1.roomId, speech);
  submit(second, match1.roomId, speech);
  await delay(150);
  assert.equal(settled.length, 1, 'late duplicate submissions cannot produce another result or rating delta');

  const rematch1 = nextEvent(first, 'match_found');
  const rematch2 = nextEvent(second, 'match_found');
  first.emit('request_rematch', { roomId: match1.roomId });
  second.emit('request_rematch', { roomId: match1.roomId });
  const [next1, next2] = await Promise.all([rematch1, rematch2]);
  assert.equal(next1.roomId, next2.roomId);
  assert.equal(next1.opponent.rating, result1.player2.newRating);
  const round2Start1 = nextEvent(first, 'start_recording', 8500);
  const round2Start2 = nextEvent(second, 'start_recording', 8500);
  first.emit('player_ready', { roomId: next1.roomId });
  second.emit('player_ready', { roomId: next1.roomId });
  await Promise.all([round2Start1, round2Start2]);
  const round2Result = nextEvent(first, 'battle_results');
  submit(first, next1.roomId, '');
  submit(second, next1.roomId, '');
  const result3 = await round2Result;
  assert.notEqual(result3.resultId, result1.resultId, 'rematches have unique result identity even when room IDs are reused');
  assert.equal(result3.player1.rating, result1.player1.newRating);
  assert.equal(result3.player2.rating, result1.player2.newRating);
  assert.equal(result3.winner, 'draw');
  assert.equal(result3.player1.ratingChange, 0);
  assert.equal(result3.player2.ratingChange, 0);
});

test('an unmatched player receives a bot automatically after five seconds', { timeout: 9000 }, async t => {
  const [client] = await arena(t, 1);
  const matches = [];
  client.on('match_found', match => matches.push(match));
  const queued = nextEvent(client, 'queue_joined');
  const found = nextEvent(client, 'match_found', 7500);
  const startedAt = performance.now();
  client.emit('find_match', player('Practice player'));
  await queued;
  await delay(4500);
  assert.equal(matches.length, 0, 'the fallback does not run before the five-second wait');
  const match = await found;
  assert.ok(performance.now() - startedAt >= 4900);
  assert.equal(matches.length, 1);
  assert.equal(match.opponent.isBot, true);
  assert.equal(match.opponent.name, 'Average Andy');
  const reveal = nextEvent(client, 'battle_starting');
  client.emit('player_ready', { roomId: match.roomId });
  assert.ok((await reveal).topic, 'the bot is ready without another client connection');
});

test('cancelled and disconnected searches cannot create a delayed bot match', { timeout: 8000 }, async t => {
  const [cancelled, disconnected] = await arena(t, 2);
  const matches = [];
  cancelled.on('match_found', match => matches.push(match));
  disconnected.on('match_found', match => matches.push(match));
  const queued1 = nextEvent(cancelled, 'queue_joined');
  const queued2 = nextEvent(disconnected, 'queue_joined');
  cancelled.emit('find_match', player('Cancelled', 'en-US'));
  disconnected.emit('find_match', player('Disconnected', 'hi-IN'));
  await Promise.all([queued1, queued2]);
  await delay(150);
  cancelled.emit('cancel_search');
  disconnected.close();
  await delay(5100);
  assert.equal(matches.length, 0);
});

test('retrying starts a fresh five-second wait and replaces the old search', { timeout: 11000 }, async t => {
  const [client] = await arena(t, 1);
  const matches = [];
  client.on('match_found', match => matches.push(match));
  const firstQueued = nextEvent(client, 'queue_joined');
  client.emit('find_match', player('Old search', 'en-US', 700));
  await firstQueued;
  await delay(3000);
  const retried = nextEvent(client, 'queue_joined');
  const found = nextEvent(client, 'match_found', 7500);
  const retriedAt = performance.now();
  client.emit('find_match', player('New search', 'hi-IN', 1400));
  await retried;
  await delay(2300);
  assert.equal(matches.length, 0, 'the original timeout cannot match the replacement search');
  const match = await found;
  assert.ok(performance.now() - retriedAt >= 4900);
  assert.equal(matches.length, 1);
  assert.equal(match.opponent.name, 'VoiceAI', 'the fallback uses the latest player rating');
  const reveal = nextEvent(client, 'battle_starting');
  client.emit('player_ready', { roomId: match.roomId });
  assert.ok((await reveal).topic);
});
