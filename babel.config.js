module.exports = function (api) {
  api.cache(true);
  return {
    presets: [['babel-preset-expo', { jsxImportSource: 'nativewind' }], 'nativewind/babel'],
    plugins: [
      // react-native-worklets/plugin must stay LAST.
      // Reanimated 4 moved the worklets transform into its own package.
      'react-native-worklets/plugin',
    ],
  };
};
