/**
 * Guards the icon subset.
 *
 * <Icon> throws on an unknown glyph, which is the right behaviour — a blank
 * box is worse than a loud failure. But it only throws when that code path
 * actually renders, so a glyph used on one branch of one screen can ship
 * broken.
 *
 * This walks the source, collects every icon name referenced, and fails if any
 * of them is missing from the bundled subset. It found `auto_awesome` and
 * `description` missing during Phase 2 — both would have crashed at runtime.
 *
 * If this fails: add the name to scripts/icon-glyphs.js and run
 *   npm run build:icons
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { codepoints } from '../src/components/icons/codepoints';

const SRC = join(__dirname, '..', 'src');

/** JSX props that carry an icon name, and object literals like `icon: 'x'`. */
const JSX_PROP = /(?:\bname|\w*[iI]con)=["{]?"([a-z][a-z0-9_]*)"/g;
const OBJECT_KEY = /\b\w*[iI]con:\s*'([a-z][a-z0-9_]*)'/g;

/**
 * Names that look like icon props but are not. `name=` is shared with
 * react-hook-form Controllers and Expo Router Stack.Screen.
 */
const NOT_ICONS = new Set(['phone', 'index', 'match', '_dev', 'password', 'email']);

function walk(dir) {
  return readdirSync(dir).flatMap((entry) => {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      return entry === 'assets' ? [] : walk(full);
    }
    return /\.(js|jsx)$/.test(entry) ? [full] : [];
  });
}

function collectIconNames() {
  const found = new Map();
  for (const file of walk(SRC)) {
    const text = readFileSync(file, 'utf8');
    for (const re of [JSX_PROP, OBJECT_KEY]) {
      re.lastIndex = 0;
      let m;
      while ((m = re.exec(text)) !== null) {
        const name = m[1];
        if (NOT_ICONS.has(name)) continue;
        if (!found.has(name)) found.set(name, file.replace(SRC, 'src'));
      }
    }
  }
  return found;
}

describe('icon subset', () => {
  const referenced = collectIconNames();

  it('finds icon references to check', () => {
    expect(referenced.size).toBeGreaterThan(50);
  });

  it('bundles every glyph the source references', () => {
    const missing = [...referenced.entries()].filter(([name]) => codepoints[name] === undefined);

    expect(missing.map(([name, file]) => `${name}  (first seen in ${file})`)).toEqual([]);
  });

  it('maps every bundled glyph to a numeric codepoint', () => {
    const bad = Object.entries(codepoints).filter(([, cp]) => !Number.isInteger(cp) || cp <= 0);
    expect(bad).toEqual([]);
  });
});
