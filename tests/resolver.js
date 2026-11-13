/**
 * Composed Jest resolver.
 *
 * Two resolvers both need to run, and Jest only accepts one:
 *
 *   @react-native/jest-preset/jest/resolver   (via jest-expo)
 *       strips react-native's `exports` map so Jest can resolve and mock
 *       RN subpaths.
 *
 *   react-native-reanimated/jest/resolver
 *       redirects Reanimated 4 and react-native-worklets internals to their
 *       web implementations under Jest. Without it, importing anything from
 *       Reanimated throws
 *       "Cannot read properties of undefined (reading 'loadUnpackersWithCode')"
 *       because the worklets native module has no JS counterpart in Node.
 *
 * Both are middleware-shaped — they adjust `options` and call
 * `options.defaultResolver` — so they chain: Reanimated runs first and, where
 * it falls through, hands off to the React Native resolver, which finally hands
 * off to Jest's own.
 */
const reanimatedResolver = require('react-native-reanimated/jest/resolver');
const reactNativeResolver = require('@react-native/jest-preset/jest/resolver');

module.exports = (request, options) =>
  reanimatedResolver(request, {
    ...options,
    defaultResolver: (req, opts) =>
      reactNativeResolver(req, { ...opts, defaultResolver: options.defaultResolver }),
  });
