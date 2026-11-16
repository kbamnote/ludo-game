/**
 * Jest config.
 *
 * ── If Jest aborts before running a single test ─────────────────────────────
 * It was once impossible to run Jest here at all, and the cause was not this
 * file. jest-resolve 30 resolves modules through `unrs-resolver`, a native Rust
 * addon whose Windows binary needs VCRUNTIME140_1.dll from the Microsoft Visual
 * C++ 2015-2022 Redistributable (x64). With that DLL absent, loading the addon
 * throws, unrs-resolver reports "Cannot find native binding", and
 * findNodeModule() then returns null for EVERY path — including Jest's own
 * runner — so Jest dies during config validation with an error that looks like
 * a missing project file.
 *
 * Resolved by installing the redistributable:
 *   winget install --id Microsoft.VCRedist.2015+.x64
 *
 * Recorded because the symptom points nowhere near the cause.
 */
module.exports = {
  preset: 'jest-expo',
  // Chains the React Native and Reanimated 4 resolvers — see tests/resolver.js.
  resolver: '<rootDir>/tests/resolver.js',
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg|react-native-worklets|nativewind|react-native-css-interop|@shopify/react-native-skia))',
  ],
  collectCoverageFrom: ['src/**/*.{js,jsx}', '!src/**/index.js'],
  testPathIgnorePatterns: ['/node_modules/', '/.expo/', '/.expo-export/'],
};
