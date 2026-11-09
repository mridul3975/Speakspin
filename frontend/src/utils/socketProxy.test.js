import assert from 'node:assert/strict';
import http from 'node:http';
import { once } from 'node:events';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';
import { createServer } from 'vite';
import { io as connect } from 'socket.io-client';
import { initSocket } from '../../../backend/socket.js';
import viteConfig from '../../vite.config.js';

function nextEvent(socket, name, timeout = 8000) {
  return new Promise((resolve, reject) => {
    const listener = payload => { clearTimeout(timer); resolve(payload); };
    const timer = setTimeout(() => { socket.off(name, listener); reject(new Error(`Timed out waiting for ${name}`)); }, timeout);
    socket.once(name, listener);
  });
}

test('multiplayer pairs after five seconds through the frontend proxy on an arbitrary port', { timeout: 25000 }, async t => {
  const socketProxy = viteConfig.server.proxy['/socket.io'];
  assert.ok(socketProxy, 'the development server must forward Socket.IO traffic');
  assert.equal(socketProxy.ws, true, 'WebSocket upgrades must reach the backend');

  const backend = http.createServer();
  const arena = initSocket(backend);
  t.after(async () => { await new Promise(resolve => arena.close(resolve)); });
  backend.listen(0, '127.0.0.1');
  await once(backend, 'listening');

  const frontend = await createServer({
    ...viteConfig,
    configFile: false,
    root: fileURLToPath(new URL('../../', import.meta.url)),
    logLevel: 'silent',
    server: {
      ...viteConfig.server, host: '127.0.0.1', port: 0, strictPort: false,
      proxy: { ...viteConfig.server.proxy, '/socket.io': { ...socketProxy, target: `http://127.0.0.1:${backend.address().port}` } },
    },
  });
  t.after(() => frontend.close());
  await frontend.listen();
  const origin = `http://127.0.0.1:${frontend.httpServer.address().port}`;
  const client = connect(origin, { transports: ['websocket'], autoConnect: false, reconnection: false, forceNew: true });
  t.after(() => client.close());

  const connected = nextEvent(client, 'connect');
  client.connect();
  await connected;
  const queued = nextEvent(client, 'queue_joined');
  const found = nextEvent(client, 'match_found');
  const startedAt = performance.now();
  client.emit('find_match', { playerName: 'Proxy check', avatar: 'voice', rating: 1000, language: '__proxy_test__' });
  await queued;
  const match = await found;
  assert.ok(performance.now() - startedAt >= 4900, 'pairing must respect the five-second human search');
  assert.equal(match.opponent.isBot, true);
  assert.ok(match.roomId);
  client.emit('leave_room', { roomId: match.roomId });
  client.close();
});
