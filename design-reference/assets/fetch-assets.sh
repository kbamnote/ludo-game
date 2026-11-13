#!/usr/bin/env bash
# Fetch all Google Stitch design graphics referenced by the Ludo After Dark screens.
# Re-runnable: skips files that already exist. Run from anywhere.
#
#   bash design-reference/assets/fetch-assets.sh
#
# Writes PNG (1024px, lossless) into design-reference/assets/raw/ as the archival master,
# and WebP (1024px) into design-reference/assets/ as the app-ready copy.

set -u

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MANIFEST="$HERE/manifest.tsv"
RAW_DIR="$HERE/raw"
WEBP_DIR="$HERE"
BASE="https://lh3.googleusercontent.com/aida-public"
UA="ludo-after-dark-asset-fetch/1.0"

mkdir -p "$RAW_DIR"

ok=0; skip=0; fail=0

while IFS=$'\t' read -r name category screens id; do
  # Skip comments, blank lines, and malformed rows
  case "$name" in ''|'#'*|$'\xef\xbb\xbf#'*) continue ;; esac
  [ -z "${id:-}" ] && continue

  png="$RAW_DIR/$name.png"
  webp="$WEBP_DIR/$name.webp"

  if [ -s "$png" ] && [ -s "$webp" ]; then
    skip=$((skip+1)); continue
  fi

  printf '%-28s ' "$name"
  got=1

  if [ ! -s "$png" ]; then
    code=$(curl -sSL -A "$UA" --max-time 60 -o "$png" -w '%{http_code}' "$BASE/$id=w1024-rp" || echo 000)
    [ "$code" = "200" ] || { got=0; rm -f "$png"; }
  fi

  if [ ! -s "$webp" ]; then
    code=$(curl -sSL -A "$UA" --max-time 60 -o "$webp" -w '%{http_code}' "$BASE/$id=w1024-rw" || echo 000)
    [ "$code" = "200" ] || { got=0; rm -f "$webp"; }
  fi

  if [ "$got" = "1" ]; then
    printf 'ok  png=%sKB webp=%sKB\n' \
      "$(( $(wc -c < "$png") / 1024 ))" "$(( $(wc -c < "$webp") / 1024 ))"
    ok=$((ok+1))
  else
    printf 'FAILED\n'
    fail=$((fail+1))
  fi
done < "$MANIFEST"

echo "----"
echo "downloaded=$ok  already-present=$skip  failed=$fail"
[ "$fail" -eq 0 ] || exit 1
