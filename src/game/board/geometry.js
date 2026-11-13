/**
 * Ludo board geometry.
 *
 * ── Why this file exists (risk R1) ──────────────────────────────────────────
 * The Stitch "3D Gameplay Board" screen is a mood board, not a board: four
 * corner houses, a central NEXUS hub and about a dozen loose path tiles placed
 * for looks. It has no 15x15 grid, no 52-cell track, no home columns and no
 * safe-cell positions.
 *
 * So the geometry is DERIVED here rather than traced, and the Stitch screen is
 * used only for its visual language — glow, house treatment, HUD, controls.
 *
 * This module is pure maths: grid coordinates only, no colours, no rendering,
 * no React. It describes WHERE things are, never how they look.
 *
 * ── Important scope note ────────────────────────────────────────────────────
 * This is NOT the game engine. There are no rules here — no move legality, no
 * capture, no turn order. Those live in @ludo/engine in the ludo-server repo
 * (PROJECT_STATUS §7.4) and arrive in Phase 4. This file exists now only so
 * Phase 2 can draw a board that is structurally correct instead of decorative.
 *
 * ── Coordinate system ───────────────────────────────────────────────────────
 * A standard 15x15 grid. Column x runs 0..14 left to right, row y runs 0..14
 * top to bottom. Each cell is addressed { x, y }.
 *
 *   - Four 6x6 house blocks in the corners
 *   - A 52-cell shared ring
 *   - Four 5-cell home columns running into the centre
 *   - 8 safe cells (4 entry squares + 4 star squares)
 *
 * ── On the four diagonal steps in the ring ──────────────────────────────────
 * The ring is orthogonally adjacent everywhere EXCEPT four inner corners:
 * (6,9)->(5,8), (5,6)->(6,5), (8,5)->(9,6) and (9,8)->(8,9). This is correct,
 * not an error. At each of those turns the cell in between — (6,8), (6,6),
 * (8,6), (8,8) — belongs to the central goal block, so the path steps around
 * the corner of the goal. Every physical Ludo board does the same.
 * tests/game/geometry.test.js pins this down so it cannot be "fixed" later.
 */

export const GRID = 15;
export const HOUSE = 6;
export const TRACK_LENGTH = 52;
export const HOME_COLUMN_LENGTH = 5;
export const TOKENS_PER_PLAYER = 4;

/**
 * The 52-cell shared ring, clockwise from the lime player's entry square.
 *
 * Derived as four identical 13-cell arms rotated 90 degrees about the centre,
 * which is what makes the board symmetric. Written out explicitly because the
 * sequence matters for movement and an off-by-one here would be invisible
 * until tokens started landing in the wrong place.
 */
export const TRACK = [
  // Arm 1 — up the left column, across the top-left notch
  { x: 6, y: 13 },
  { x: 6, y: 12 },
  { x: 6, y: 11 },
  { x: 6, y: 10 },
  { x: 6, y: 9 },
  { x: 5, y: 8 },
  { x: 4, y: 8 },
  { x: 3, y: 8 },
  { x: 2, y: 8 },
  { x: 1, y: 8 },
  { x: 0, y: 8 },
  { x: 0, y: 7 },
  { x: 0, y: 6 },
  // Arm 2 — across the top
  { x: 1, y: 6 },
  { x: 2, y: 6 },
  { x: 3, y: 6 },
  { x: 4, y: 6 },
  { x: 5, y: 6 },
  { x: 6, y: 5 },
  { x: 6, y: 4 },
  { x: 6, y: 3 },
  { x: 6, y: 2 },
  { x: 6, y: 1 },
  { x: 6, y: 0 },
  { x: 7, y: 0 },
  { x: 8, y: 0 },
  // Arm 3 — down the right column
  { x: 8, y: 1 },
  { x: 8, y: 2 },
  { x: 8, y: 3 },
  { x: 8, y: 4 },
  { x: 8, y: 5 },
  { x: 9, y: 6 },
  { x: 10, y: 6 },
  { x: 11, y: 6 },
  { x: 12, y: 6 },
  { x: 13, y: 6 },
  { x: 14, y: 6 },
  { x: 14, y: 7 },
  { x: 14, y: 8 },
  // Arm 4 — across the bottom
  { x: 13, y: 8 },
  { x: 12, y: 8 },
  { x: 11, y: 8 },
  { x: 10, y: 8 },
  { x: 9, y: 8 },
  { x: 8, y: 9 },
  { x: 8, y: 10 },
  { x: 8, y: 11 },
  { x: 8, y: 12 },
  { x: 8, y: 13 },
  { x: 8, y: 14 },
  { x: 7, y: 14 },
  { x: 6, y: 14 },
];

/**
 * The four players.
 *
 * `entryIndex` is where a token joins the ring when it leaves its house, and
 * `homeEntryIndex` is the last ring cell before it turns into its home column.
 * They sit 51 apart, so a token travels the full ring exactly once.
 */
export const PLAYERS = [
  {
    seat: 0,
    faction: 'p1',
    name: 'Lime',
    corner: 'bottomLeft',
    entryIndex: 0,
    homeEntryIndex: 51,
    housePosition: { x: 0, y: 9 },
    homeColumn: [
      { x: 7, y: 13 },
      { x: 7, y: 12 },
      { x: 7, y: 11 },
      { x: 7, y: 10 },
      { x: 7, y: 9 },
    ],
  },
  {
    seat: 1,
    faction: 'p2',
    name: 'Cyan',
    corner: 'topLeft',
    entryIndex: 13,
    homeEntryIndex: 12,
    housePosition: { x: 0, y: 0 },
    homeColumn: [
      { x: 1, y: 7 },
      { x: 2, y: 7 },
      { x: 3, y: 7 },
      { x: 4, y: 7 },
      { x: 5, y: 7 },
    ],
  },
  {
    seat: 2,
    faction: 'p3',
    name: 'Pink',
    corner: 'topRight',
    entryIndex: 26,
    homeEntryIndex: 25,
    housePosition: { x: 9, y: 0 },
    homeColumn: [
      { x: 7, y: 1 },
      { x: 7, y: 2 },
      { x: 7, y: 3 },
      { x: 7, y: 4 },
      { x: 7, y: 5 },
    ],
  },
  {
    seat: 3,
    faction: 'p4',
    name: 'Violet',
    corner: 'bottomRight',
    entryIndex: 39,
    homeEntryIndex: 38,
    housePosition: { x: 9, y: 9 },
    homeColumn: [
      { x: 13, y: 7 },
      { x: 12, y: 7 },
      { x: 11, y: 7 },
      { x: 10, y: 7 },
      { x: 9, y: 7 },
    ],
  },
];

/** The four entry squares plus the four star squares. */
export const SAFE_INDICES = [0, 8, 13, 21, 26, 34, 39, 47];

/** Entry squares specifically — drawn in the owner's colour. */
export const ENTRY_INDICES = PLAYERS.map((p) => p.entryIndex);

/** Star squares — drawn neutral with a star marker. */
export const STAR_INDICES = SAFE_INDICES.filter((i) => !ENTRY_INDICES.includes(i));

/** The four token slots inside a house block, relative to its origin. */
export const HOUSE_SLOTS = [
  { dx: 1.2, dy: 1.2 },
  { dx: 3.4, dy: 1.2 },
  { dx: 1.2, dy: 3.4 },
  { dx: 3.4, dy: 3.4 },
];

/** Grid cell -> pixel rect, for a board drawn at `size` pixels square. */
export function cellRect(cell, size) {
  const unit = size / GRID;
  return { x: cell.x * unit, y: cell.y * unit, width: unit, height: unit, unit };
}

/** Grid cell -> pixel centre. */
export function cellCenter(cell, size) {
  const unit = size / GRID;
  return { cx: (cell.x + 0.5) * unit, cy: (cell.y + 0.5) * unit, unit };
}

/** House block rect for a player, in pixels. */
export function houseRect(player, size) {
  const unit = size / GRID;
  return {
    x: player.housePosition.x * unit,
    y: player.housePosition.y * unit,
    width: HOUSE * unit,
    height: HOUSE * unit,
    unit,
  };
}

/** Pixel centre of a token resting in its house. */
export function houseSlotCenter(player, slot, size) {
  const unit = size / GRID;
  const s = HOUSE_SLOTS[slot];
  return {
    cx: (player.housePosition.x + s.dx + 0.7) * unit,
    cy: (player.housePosition.y + s.dy + 0.7) * unit,
    unit,
  };
}

/**
 * Where a token sits, given how far it has travelled.
 *
 *   progress < 0            still in its house
 *   0..51                   on the shared ring
 *   52..56                  in its home column
 *   57                      home
 *
 * Pure position lookup — it does not decide whether a move is legal. That is
 * @ludo/engine's job.
 */
export function tokenCell(player, progress, slot = 0) {
  if (progress < 0) return { kind: 'house', player, slot };
  if (progress < TRACK_LENGTH) {
    const index = (player.entryIndex + progress) % TRACK_LENGTH;
    return { kind: 'track', cell: TRACK[index], index };
  }
  const homeStep = progress - TRACK_LENGTH;
  if (homeStep < HOME_COLUMN_LENGTH) {
    return { kind: 'home', cell: player.homeColumn[homeStep], step: homeStep };
  }
  return { kind: 'finished' };
}

/** The centre goal triangle, as a pixel polygon. */
export function centerPolygon(size) {
  const unit = size / GRID;
  const a = 6 * unit;
  const b = 9 * unit;
  const mid = 7.5 * unit;
  return {
    top: [
      { x: a, y: a },
      { x: b, y: a },
      { x: mid, y: mid },
    ],
    right: [
      { x: b, y: a },
      { x: b, y: b },
      { x: mid, y: mid },
    ],
    bottom: [
      { x: b, y: b },
      { x: a, y: b },
      { x: mid, y: mid },
    ],
    left: [
      { x: a, y: b },
      { x: a, y: a },
      { x: mid, y: mid },
    ],
    bounds: { x: a, y: a, width: b - a, height: b - a },
  };
}

export default {
  GRID,
  HOUSE,
  TRACK,
  TRACK_LENGTH,
  HOME_COLUMN_LENGTH,
  TOKENS_PER_PLAYER,
  PLAYERS,
  SAFE_INDICES,
  ENTRY_INDICES,
  STAR_INDICES,
  cellRect,
  cellCenter,
  houseRect,
  houseSlotCenter,
  tokenCell,
  centerPolygon,
};
