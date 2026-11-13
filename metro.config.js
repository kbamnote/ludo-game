const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

// Allow importing .ttf icon fonts and the design WebP assets.
config.resolver.assetExts = Array.from(
  new Set([...config.resolver.assetExts, 'ttf', 'otf', 'webp'])
);

module.exports = withNativeWind(config, { input: './global.css' });
