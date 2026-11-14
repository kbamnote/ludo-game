/**
 * Copies @ludo/engine from the server repo into src/game/engine.
 *
 * A stopgap until the package is published (Phase 5). The engine must exist
 * in exactly one authored place — the server owns it, because the server is
 * authoritative — so this copies rather than letting the two drift.
 *
 *   npm run sync:engine
 */
import { readdirSync, copyFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = resolve(ROOT, '..', 'ludo-server', 'packages', 'engine', 'src');
const DEST = join(ROOT, 'src', 'game', 'engine');

if (!existsSync(SRC)) {
  console.error(`  sync-engine: cannot find ${SRC}`);
  console.error('  Is the ludo-server repo checked out beside ludo-mobile?');
  process.exit(1);
}

mkdirSync(DEST, { recursive: true });
const files = readdirSync(SRC).filter((f) => f.endsWith('.js'));
for (const f of files) copyFileSync(join(SRC, f), join(DEST, f));
console.log(`  sync-engine: copied ${files.length} files from ludo-server`);
