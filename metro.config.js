const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

// Allow importing .ttf icon fonts and the design WebP assets.
config.resolver.assetExts = Array.from(
  new Set([...config.resolver.assetExts, 'ttf', 'otf', 'webp'])
);

/**
 * Redirect `ws` to a shim.
 *
 * @colyseus/sdk statically imports the `ws` package as a Node fallback, then
 * picks `globalThis.WebSocket` over it at runtime. React Native always has a
 * global WebSocket, so the fallback is dead code — but Metro still resolves the
 * import, and `ws` pulls in Node's `stream`, `zlib`, `net`, `tls` and `crypto`,
 * which the React Native runtime does not have. The bundle fails outright.
 *
 * Aliasing is the right fix rather than polyfilling those five modules: the
 * code behind them is never executed, and shipping a Node stream and zlib into
 * a mobile bundle to satisfy an unused branch would be pure bloat.
 *
 * Applied after withNativeWind so its own resolveRequest, if it sets one, is
 * preserved and still handles everything else.
 */
const WS_SHIM = path.resolve(__dirname, 'src/shims/ws.js');

function withWsShim(metroConfig) {
  const upstream = metroConfig.resolver.resolveRequest;

  metroConfig.resolver.resolveRequest = (context, moduleName, platform) => {
    if (moduleName === 'ws' || moduleName.startsWith('ws/')) {
      return { type: 'sourceFile', filePath: WS_SHIM };
    }
    return (upstream ?? context.resolveRequest)(context, moduleName, platform);
  };

  return metroConfig;
}

module.exports = withWsShim(withNativeWind(config, { input: './global.css' }));
