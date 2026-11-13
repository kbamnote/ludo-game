/**
 * Jest config.
 *
 * This is the plain, correct configuration. It does not currently RUN on this
 * machine, for an environmental reason that is nothing to do with this file:
 *
 *   VCRUNTIME140_1.dll is missing from Windows\System32.
 *
 * Chain of failure:
 *   1. jest-resolve 30.x resolves modules through `unrs-resolver`, a native
 *      Rust addon.
 *   2. Its Windows binary (@unrs/resolver-binding-win32-x64-msvc) is installed
 *      and intact, but needs VCRUNTIME140_1.dll from the Microsoft Visual C++
 *      2015-2022 Redistributable (x64).
 *   3. That DLL is absent, so `require()` of the .node binary throws
 *      "The specified module could not be found".
 *   4. unrs-resolver then reports "Cannot find native binding".
 *   5. jest-resolve's findNodeModule() returns null for EVERY path — including
 *      Jest's own jest-circus runner — so Jest aborts during config validation
 *      before running a single test.
 *
 * Verified: fs.statSync() confirms the files Jest claims are "not found" exist.
 * Reproduces with zero config on a trivial test, under both Node 26 and Node
 * 22, inside and outside a path containing a space.
 *
 * Fix: install the Microsoft Visual C++ 2015-2022 Redistributable (x64), e.g.
 *   winget install --id Microsoft.VCRedist.2015+.x64
 * then re-run `npm test`. No code change is needed.
 *
 * Tracked in PROJECT_STATUS.md as a known environment blocker.
 */
module.exports = {
  preset: 'jest-expo',
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg|react-native-worklets|nativewind|react-native-css-interop|@shopify/react-native-skia))',
  ],
  collectCoverageFrom: ['src/**/*.{js,jsx}', '!src/**/index.js'],
  testPathIgnorePatterns: ['/node_modules/', '/.expo/', '/.expo-export/'],
};
