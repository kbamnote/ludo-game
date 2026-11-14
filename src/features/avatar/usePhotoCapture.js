/**
 * Photo capture, permissions and cropping.
 *
 * Kept out of the screens so the consent gate, the permission dance and the
 * crop step are one tested unit rather than three things each screen
 * re-implements slightly differently.
 *
 * ── Order matters ───────────────────────────────────────────────────────────
 * Consent is checked BEFORE any permission is requested. Asking for the camera
 * first and explaining afterwards trains people to tap through prompts, and
 * the brief requires explicit consent for photo upload — which means consent
 * has to gate the capture, not follow it.
 */
import { useCallback, useState } from 'react';
import { Alert, Linking } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';

/** Matches the server's limits in API_CONTRACT §1. */
export const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;
const TARGET_EDGE = 1024;

/**
 * Downscales and re-encodes a crop.
 *
 * Phone cameras produce 4000px, 6 MB+ JPEGs. Sending one costs the user data,
 * takes seconds on a bad connection, and the generator only wants ~1024px
 * anyway. Doing this on-device also means less of the original photo ever
 * leaves the phone.
 */
async function normalise(uri) {
  const result = await ImageManipulator.manipulateAsync(
    uri,
    [{ resize: { width: TARGET_EDGE, height: TARGET_EDGE } }],
    { compress: 0.85, format: ImageManipulator.SaveFormat.JPEG }
  );
  return { uri: result.uri, width: result.width, height: result.height };
}

async function byteSizeOf(uri) {
  try {
    const response = await fetch(uri);
    const blob = await response.blob();
    return blob.size;
  } catch {
    // Unknown size is not fatal — the server enforces the real limit.
    return 0;
  }
}

function explainDenied(kind) {
  Alert.alert(
    kind === 'camera' ? 'Camera access is off' : 'Photo access is off',
    `Ludo After Dark needs ${kind === 'camera' ? 'the camera' : 'your photo library'} to build your avatar. You can turn it on in Settings.`,
    [
      { text: 'Not now', style: 'cancel' },
      { text: 'Open settings', onPress: () => Linking.openSettings().catch(() => {}) },
    ]
  );
}

export function usePhotoCapture({ hasConsent } = {}) {
  const [photo, setPhoto] = useState(null);
  const [busy, setBusy] = useState(false);

  const pick = useCallback(
    async (source) => {
      // The consent gate. Not a formality — without it this function would be
      // reachable from a button that never explained what happens to the photo.
      if (!hasConsent) {
        throw new Error('Consent is required before selecting a photo.');
      }

      setBusy(true);
      try {
        const permission =
          source === 'camera'
            ? await ImagePicker.requestCameraPermissionsAsync()
            : await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (!permission.granted) {
          explainDenied(source);
          return null;
        }

        const options = {
          mediaTypes: ['images'],
          allowsEditing: true,
          // Square crop, because every avatar frame in the app is circular.
          aspect: [1, 1],
          quality: 0.9,
          // Nothing is sent anywhere until the user confirms a style, so there
          // is no reason to carry EXIF — which includes GPS coordinates.
          exif: false,
        };

        const result =
          source === 'camera'
            ? await ImagePicker.launchCameraAsync(options)
            : await ImagePicker.launchImageLibraryAsync(options);

        if (result.canceled || !result.assets?.length) return null;

        const normalised = await normalise(result.assets[0].uri);
        const byteSize = await byteSizeOf(normalised.uri);

        if (byteSize > MAX_UPLOAD_BYTES) {
          Alert.alert('That photo is too large', 'Please pick a smaller one.');
          return null;
        }

        const next = { ...normalised, byteSize, contentType: 'image/jpeg' };
        setPhoto(next);
        return next;
      } finally {
        setBusy(false);
      }
    },
    [hasConsent]
  );

  /** Re-opens the cropper on the photo already chosen. */
  const recrop = useCallback(async () => {
    if (!photo) return null;
    return pick('library');
  }, [photo, pick]);

  const clear = useCallback(() => setPhoto(null), []);

  return { photo, busy, pick, recrop, clear };
}

export default usePhotoCapture;
