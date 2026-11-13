/**
 * Subsets Material Symbols Outlined down to only the glyphs this app uses and
 * generates the codepoint map the <Icon> component reads.
 *
 *   npm run build:icons
 *
 * Inputs
 *   design-reference/fonts/MaterialSymbolsOutlined-full.ttf   (gitignored, re-downloadable)
 *   design-reference/fonts/MaterialSymbolsOutlined.codepoints
 *   scripts/icon-glyphs.js
 *
 * Outputs
 *   src/assets/fonts/MaterialSymbolsOutlined.ttf   (committed, small)
 *   src/components/icons/codepoints.js             (committed, generated)
 *
 * The full font carries 4,304 glyphs at ~10.7 MB. Shipping that into an APK to
 * use ~95 of them is indefensible, so this reduces it to what we actually
 * reference. Unknown glyph names fail the build rather than shipping as tofu.
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const subsetFont = (await import('subset-font')).default;

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const FULL_TTF = join(ROOT, 'design-reference/fonts/MaterialSymbolsOutlined-full.ttf');
const CODEPOINTS = join(ROOT, 'design-reference/fonts/MaterialSymbolsOutlined.codepoints');
const OUT_TTF = join(ROOT, 'src/assets/fonts/MaterialSymbolsOutlined.ttf');
const OUT_MAP = join(ROOT, 'src/components/icons/codepoints.js');

const glyphNames = require('./icon-glyphs.js');

function fail(msg) {
  console.error(`\n  build-icon-font: ${msg}\n`);
  process.exit(1);
}

if (!existsSync(FULL_TTF)) {
  fail(
    `missing ${FULL_TTF}\n` + `  Re-download it with:\n` + `    bash scripts/fetch-icon-font.sh`
  );
}
if (!existsSync(CODEPOINTS)) fail(`missing ${CODEPOINTS}`);

// name -> hex codepoint, e.g. "casino 'e30b'"
const table = new Map();
for (const line of readFileSync(CODEPOINTS, 'utf8').split('\n')) {
  const [name, hex] = line.trim().split(/\s+/);
  if (name && hex) table.set(name, parseInt(hex, 16));
}

const unknown = glyphNames.filter((n) => !table.has(n));
if (unknown.length) {
  fail(
    `${unknown.length} glyph name(s) are not in Material Symbols Outlined:\n` +
      unknown.map((n) => `    - ${n}`).join('\n') +
      `\n  Fix the names in scripts/icon-glyphs.js.`
  );
}

const unique = [...new Set(glyphNames)].sort();
const map = Object.fromEntries(unique.map((n) => [n, table.get(n)]));
const text = unique.map((n) => String.fromCodePoint(map[n])).join('');

const before = readFileSync(FULL_TTF);
const after = await subsetFont(before, text, { targetFormat: 'truetype' });

mkdirSync(dirname(OUT_TTF), { recursive: true });
mkdirSync(dirname(OUT_MAP), { recursive: true });
writeFileSync(OUT_TTF, after);

writeFileSync(
  OUT_MAP,
  `/**
 * GENERATED FILE - do not edit by hand.
 * Run \`npm run build:icons\` after changing scripts/icon-glyphs.js.
 *
 * Material Symbols Outlined codepoints for the ${unique.length} glyphs used by
 * the Google Stitch design.
 */
export const codepoints = ${JSON.stringify(map, null, 2)};

export default codepoints;
`
);

const kb = (n) => `${(n / 1024).toFixed(0)} KB`;
console.log(`  build-icon-font: ${unique.length} glyphs`);
console.log(
  `    ${kb(before.length)} -> ${kb(after.length)}  (${(100 - (after.length / before.length) * 100).toFixed(1)}% smaller)`
);
console.log(`    ${OUT_TTF.replace(ROOT + '\\', '').replace(/\\/g, '/')}`);
console.log(`    ${OUT_MAP.replace(ROOT + '\\', '').replace(/\\/g, '/')}`);
