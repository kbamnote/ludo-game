#!/usr/bin/env bash
# Re-download the full Material Symbols Outlined font + codepoints.
#
# These land in design-reference/fonts/ and are gitignored (the TTF is ~10.7 MB).
# Only the subset produced by `npm run build:icons` is committed.
#
#   bash scripts/fetch-icon-font.sh && npm run build:icons
#
# Source: github.com/google/material-design-icons (Apache-2.0)

set -eu

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUT="$HERE/design-reference/fonts"
BASE="https://raw.githubusercontent.com/google/material-design-icons/master/variablefont"
NAME="MaterialSymbolsOutlined%5BFILL%2CGRAD%2Copsz%2Cwght%5D"
UA="ludo-after-dark-build/1.0"

mkdir -p "$OUT"

echo "Fetching Material Symbols Outlined..."
curl -fsSL -A "$UA" --max-time 180 -o "$OUT/MaterialSymbolsOutlined-full.ttf"    "$BASE/$NAME.ttf"
curl -fsSL -A "$UA" --max-time 180 -o "$OUT/MaterialSymbolsOutlined.codepoints"  "$BASE/$NAME.codepoints"

printf '  ttf         %s KB\n' "$(( $(wc -c < "$OUT/MaterialSymbolsOutlined-full.ttf") / 1024 ))"
printf '  codepoints  %s entries\n' "$(wc -l < "$OUT/MaterialSymbolsOutlined.codepoints")"
echo "Now run: npm run build:icons"
