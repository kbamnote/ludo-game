/**
 * Jest setup.
 *
 * Phase 1 only needs the harness proven. Real test coverage arrives with the
 * game engine in Phase 4 (in the ludo-server repo, where @ludo/engine lives)
 * and with screen tests in Phase 2.
 */
// React Native Testing Library 14 ships its matchers built in — the old
// `@testing-library/react-native/extend-expect` entry point no longer exists.

// Native modules that have no JS implementation under Jest.
jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(() => Promise.resolve()),
  selectionAsync: jest.fn(() => Promise.resolve()),
  notificationAsync: jest.fn(() => Promise.resolve()),
  ImpactFeedbackStyle: { Light: 'light', Medium: 'medium', Heavy: 'heavy' },
  NotificationFeedbackType: { Success: 'success', Warning: 'warning', Error: 'error' },
}));

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(() => Promise.resolve(null)),
  setItemAsync: jest.fn(() => Promise.resolve()),
  deleteItemAsync: jest.fn(() => Promise.resolve()),
  WHEN_UNLOCKED_THIS_DEVICE_ONLY: 'whenUnlockedThisDeviceOnly',
}));

jest.mock('expo-blur', () => {
  const { View } = require('react-native');
  return { BlurView: View };
});

// Silence the Reanimated strict-mode warnings that are noise in tests.
global.__DEV__ = true;

jest.mock('expo-image-picker', () => ({
  launchCameraAsync: jest.fn(async () => ({ canceled: true })),
  launchImageLibraryAsync: jest.fn(async () => ({ canceled: true })),
  requestCameraPermissionsAsync: jest.fn(async () => ({ granted: true })),
  requestMediaLibraryPermissionsAsync: jest.fn(async () => ({ granted: true })),
}));

jest.mock('expo-image-manipulator', () => ({
  manipulateAsync: jest.fn(async (uri) => ({ uri, width: 1024, height: 1024 })),
  SaveFormat: { JPEG: 'jpeg' },
}));

jest.mock('expo-clipboard', () => ({ setStringAsync: jest.fn(async () => true) }));

// AsyncStorage has no JS implementation under Jest; the official mock is
// shipped with the package.
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);
