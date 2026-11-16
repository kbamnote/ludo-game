/**
 * Stand-in for the `ws` package on React Native.
 *
 * ── Why this file exists ────────────────────────────────────────────────────
 * @colyseus/sdk's WebSocket transport opens with:
 *
 *     import NodeWebSocket from 'ws';
 *     const WebSocket = globalThis.WebSocket || NodeWebSocket;
 *
 * React Native always has `globalThis.WebSocket`, so `NodeWebSocket` is never
 * used at runtime — it is a fallback for Node. But the import is static, so
 * Metro still has to resolve `ws`, and `ws` requires Node's `stream`, `zlib`,
 * `net`, `tls` and `crypto`. None of those exist in the React Native runtime,
 * and the bundle fails before the app ever starts.
 *
 * Metro is pointed here instead (see metro.config.js). Exporting the platform's
 * own WebSocket rather than an empty object or a throwing stub means that if
 * any other dependency ever imports `ws` expecting a constructor, it gets a
 * working one instead of a crash — and the SDK's `||` keeps short-circuiting
 * before it reads this at all.
 *
 * This shim is NOT used by the server, which has the real `ws` and needs it.
 */
const PlatformWebSocket = globalThis.WebSocket;

module.exports = PlatformWebSocket;
module.exports.default = PlatformWebSocket;
module.exports.WebSocket = PlatformWebSocket;

/**
 * `ws` also exports a server. Nothing in a mobile app can listen for incoming
 * connections, so this is a clear error rather than a silent undefined that
 * would surface as "WebSocketServer is not a constructor" somewhere else.
 */
module.exports.WebSocketServer = function WebSocketServer() {
  throw new Error('ws.WebSocketServer is not available on React Native.');
};
module.exports.Server = module.exports.WebSocketServer;
module.exports.createWebSocketStream = function createWebSocketStream() {
  throw new Error('ws.createWebSocketStream is not available on React Native.');
};
module.exports.Receiver = undefined;
module.exports.Sender = undefined;
