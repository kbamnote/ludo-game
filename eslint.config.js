const expoConfig = require('eslint-config-expo/flat');
const prettier = require('eslint-config-prettier');

module.exports = [
  ...expoConfig,
  prettier,
  {
    ignores: [
      'node_modules/**',
      '.expo/**',
      '.expo-export/**',
      'dist/**',
      'android/**',
      'ios/**',
      'coverage/**',
      'design-reference/**',
      'src/components/icons/codepoints.js', // generated
      'src/assets/images/index.js', // generated
    ],
  },
  {
    // eslint-config-expo enables the TypeScript import resolver by default.
    // This is a JavaScript/JSX project, and that resolver throws here because
    // `typescript` is not installed. Use the plain Node resolver instead rather
    // than adding a TypeScript dependency purely to satisfy the linter.
    settings: {
      'import/resolver': {
        node: { extensions: ['.js', '.jsx', '.json', '.android.js', '.ios.js', '.native.js'] },
      },
    },
    rules: {
      // The brief is explicit: never silently ignore errors.
      'no-empty': ['error', { allowEmptyCatch: false }],
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      'no-console': ['warn', { allow: ['warn', 'error'] }],

      // React Compiler's immutability rule flags `sharedValue.value = x`, which
      // is precisely how Reanimated shared values are meant to be written —
      // they are mutable refs living on the UI thread, not React state. The
      // rule cannot tell them apart, so it is a false positive on every
      // animated component we have. Disabled deliberately, not swept aside.
      'react-hooks/immutability': 'off',
    },
  },
  {
    // expo-splash-screen re-exports extensionlessly (`export * from
    // './SplashScreen'`), which only a bundler resolves. Metro handles it —
    // the Android bundle builds and the splash gate works — but the ESLint
    // import resolver and plain Node ESM both fail to see through it, so every
    // use of the namespace is reported as missing. False positive.
    files: ['app/_layout.jsx'],
    rules: { 'import/namespace': 'off' },
  },
  {
    // Jest globals, for the test suite and its setup file.
    files: ['tests/**/*.js', '**/*.test.js', '**/*.test.jsx'],
    languageOptions: {
      globals: {
        describe: 'readonly',
        it: 'readonly',
        test: 'readonly',
        expect: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
        jest: 'readonly',
        // Tests run under Node, so CommonJS globals are available.
        __dirname: 'readonly',
        require: 'readonly',
        process: 'readonly',
      },
    },
  },
  {
    // Build scripts run in Node, not React Native.
    files: ['scripts/**/*.{js,mjs}', '*.config.js'],
    languageOptions: {
      globals: {
        module: 'writable',
        require: 'readonly',
        process: 'readonly',
        __dirname: 'readonly',
      },
    },
    rules: { 'no-console': 'off' },
  },
];
