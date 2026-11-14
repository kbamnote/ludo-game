/**
 * Is the Skia backend actually usable right now?
 *
 * `@shopify/react-native-skia` imports fine in all three of our run targets,
 * but the drawing backend is only live in some of them:
 *
 *   dev build / release APK  yes — the native module is linked
 *   Expo Go                  no  — Skia is not among Expo Go's bundled modules
 *   web                      only after LoadSkiaWeb() resolves the CanvasKit WASM
 *
 * Importing succeeds in every case, so an import check proves nothing. What
 * breaks is the IMPERATIVE API: `Skia.Path.Make()` returns undefined before
 * the backend exists, and the next `.moveTo()` throws — which is exactly the
 * crash this check now prevents.
 *
 * The board is the core screen of the app. Making it depend on a module that
 * is absent in two of three targets would mean the game is untestable without
 * a full native build, so `BoardFallback` renders the same geometry with
 * plain Views whenever this returns false.
 */
import { Skia } from '@shopify/react-native-skia';

export function isSkiaReady() {
  try {
    return typeof Skia?.Path?.Make === 'function' && !!Skia.Path.Make();
  } catch {
    return false;
  }
}

export default isSkiaReady;
