/**
 * Regenerates the Android adaptive-icon foreground from the square app icon.
 *
 *   node scripts/make-adaptive-icon.mjs
 *
 * ── The bug this fixes, so it does not come back ────────────────────────────
 * `adaptive-icon.png` was a byte-for-byte copy of `icon.png`. Android masks an
 * adaptive icon to a circle or squircle and guarantees only the centre 66dp of
 * the 108dp canvas, so the "LUDO AFTER DARK" wordmark across the bottom third
 * of that artwork was cut off entirely and the dice was clipped at the edges.
 *
 * A foreground has two requirements, and the old file met neither:
 *   1. All content inside the safe-zone circle — 1024 * 66/108 = 626px here.
 *   2. No text. It is illegible at 48dp even when it survives the mask.
 *
 * ── Why these numbers ───────────────────────────────────────────────────────
 * Measured from the source rather than eyeballed. Scanning for pixels that are
 * not the flat background gives the dice at (280,206)-(743,645); scanning row
 * extents shows the wordmark starting at y=650, where the row suddenly reaches
 * x=846. Cropping at 645 takes the dice whole and the wordmark not at all.
 *
 * The 440x417 placement has a 606px diagonal, so every corner of the artwork
 * stays inside the 626px safe circle whatever shape a launcher applies.
 *
 * The canvas is filled with #191c21 — the artwork's own background, sampled
 * from the source corners — rather than left transparent, so the crop edge
 * cannot show as a square. app.json's `adaptiveIcon.backgroundColor` must
 * match; it previously said #0A0B10, which did not.
 *
 * Re-run this if the source icon changes, and re-measure if the composition
 * moves: these crop numbers describe one specific piece of artwork.
 */
import sharp from 'sharp';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = join(root, 'src/assets/images/icon.png');
const OUT = join(root, 'src/assets/images/adaptive-icon.png');

/** The dice, without the wordmark below it. */
const DICE = { left: 280, top: 206, width: 463, height: 439 };
/** Placement inside the safe zone. */
const W = 440;
const H = 417;
const CANVAS = 1024;
/** Sampled from the source corners. Keep app.json's backgroundColor equal to this. */
const BACKGROUND = { r: 0x19, g: 0x1c, b: 0x21, alpha: 1 };

const dice = await sharp(SRC).extract(DICE).resize(W, H).png().toBuffer();

await sharp({ create: { width: CANVAS, height: CANVAS, channels: 4, background: BACKGROUND } })
  .composite([
    { input: dice, left: Math.round((CANVAS - W) / 2), top: Math.round((CANVAS - H) / 2) },
  ])
  .png()
  .toFile(OUT);

const diagonal = Math.round(Math.hypot(W, H));
const safeZone = Math.round((CANVAS * 66) / 108);

console.log(`adaptive-icon.png written: ${CANVAS}x${CANVAS}`);
console.log(`content diagonal ${diagonal}px, safe zone ${safeZone}px — ${diagonal <= safeZone ? 'fits' : 'TOO LARGE'}`);
