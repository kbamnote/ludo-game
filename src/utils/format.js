/**
 * Formatting helpers.
 *
 * The design shows compacted counters everywhere — "48.2K", "2.4k LIVE",
 * "150,000 Coins", "+418" — so this is centralised rather than reimplemented
 * per screen with slightly different rounding each time.
 */

/** 48200 -> "48.2K"   1250 -> "1,250"   2418920 -> "2.4M" */
export function compactNumber(value, { lowercase = false } = {}) {
  const n = Number(value) || 0;
  const abs = Math.abs(n);

  if (abs < 10_000) return n.toLocaleString('en-US');

  const units = [
    { limit: 1_000_000_000, suffix: 'B' },
    { limit: 1_000_000, suffix: 'M' },
    { limit: 1_000, suffix: 'K' },
  ];

  for (const { limit, suffix } of units) {
    if (abs >= limit) {
      const scaled = n / limit;
      // One decimal, but drop a trailing ".0" — "48.2K" but "1M", not "1.0M".
      const text = scaled.toFixed(1).replace(/\.0$/, '');
      return text + (lowercase ? suffix.toLowerCase() : suffix);
    }
  }

  return n.toLocaleString('en-US');
}

/** 150000 -> "150,000" */
export function thousands(value) {
  return (Number(value) || 0).toLocaleString('en-US');
}

/** 0.684 -> "68.4%" */
export function percent(value, decimals = 1) {
  return `${((Number(value) || 0) * 100).toFixed(decimals)}%`;
}

/** "#7709" room codes — always four digits, always prefixed. */
export function roomCode(code) {
  return `#${String(code).toUpperCase().replace(/^#/, '')}`;
}

/** 281 of 412 -> "68.2% WR" */
export function winRate(wins, total) {
  if (!total) return '0% WR';
  return `${((wins / total) * 100).toFixed(1)}% WR`;
}

export default { compactNumber, thousands, percent, roomCode, winRate };
