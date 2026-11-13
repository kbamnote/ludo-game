/**
 * Board geometry tests.
 *
 * The Stitch gameplay screen contains no usable board — no grid, no track, no
 * home columns (risk R1). The geometry is therefore derived, and derived
 * geometry needs checking: an off-by-one in the 52-cell ring is invisible
 * until tokens start landing on the wrong square mid-match.
 *
 * These verify STRUCTURE only — where cells are. Game RULES (legal moves,
 * capture, turn order) live in @ludo/engine in the ludo-server repo and are
 * tested there in Phase 4.
 */
import {
  GRID,
  TRACK,
  TRACK_LENGTH,
  HOME_COLUMN_LENGTH,
  PLAYERS,
  SAFE_INDICES,
  ENTRY_INDICES,
  STAR_INDICES,
  tokenCell,
  cellCenter,
  houseRect,
} from '../../src/game/board/geometry';

const key = (c) => `${c.x},${c.y}`;

describe('track', () => {
  it('has exactly 52 cells', () => {
    expect(TRACK).toHaveLength(TRACK_LENGTH);
  });

  it('has no duplicate cells', () => {
    expect(new Set(TRACK.map(key)).size).toBe(TRACK_LENGTH);
  });

  it('stays inside the 15x15 grid', () => {
    for (const c of TRACK) {
      expect(c.x).toBeGreaterThanOrEqual(0);
      expect(c.x).toBeLessThan(GRID);
      expect(c.y).toBeGreaterThanOrEqual(0);
      expect(c.y).toBeLessThan(GRID);
    }
  });

  it('is a closed loop with no gaps', () => {
    for (let i = 0; i < TRACK_LENGTH; i += 1) {
      const a = TRACK[i];
      const b = TRACK[(i + 1) % TRACK_LENGTH];
      const distance = Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
      // 1 = orthogonal step, 2 = one of the four goal-corner turns below.
      expect({ step: i, distance }).toEqual({ step: i, distance: distance === 2 ? 2 : 1 });
      expect(distance).toBeLessThanOrEqual(2);
    }
  });

  /**
   * The ring turns diagonally at exactly four points, where the cell in
   * between belongs to the central goal block. This is how a physical Ludo
   * board works; pinned here so it is not "corrected" into a bug later.
   */
  it('turns the goal corner at exactly four points', () => {
    const turns = [];
    for (let i = 0; i < TRACK_LENGTH; i += 1) {
      const a = TRACK[i];
      const b = TRACK[(i + 1) % TRACK_LENGTH];
      if (Math.abs(a.x - b.x) + Math.abs(a.y - b.y) !== 1) {
        turns.push(`${a.x},${a.y} -> ${b.x},${b.y}`);
      }
    }
    expect(turns).toEqual(['6,9 -> 5,8', '5,6 -> 6,5', '8,5 -> 9,6', '9,8 -> 8,9']);
  });

  it('keeps the skipped corner cells out of the ring', () => {
    const onTrack = new Set(TRACK.map(key));
    for (const corner of ['6,8', '6,6', '8,6', '8,8']) {
      expect({ corner, onTrack: onTrack.has(corner) }).toEqual({ corner, onTrack: false });
    }
  });

  it('never crosses the centre 3x3 goal area', () => {
    const inCentre = TRACK.filter((c) => c.x >= 6 && c.x <= 8 && c.y >= 6 && c.y <= 8);
    expect(inCentre).toEqual([]);
  });
});

describe('players', () => {
  it('has four, one per faction', () => {
    expect(PLAYERS).toHaveLength(4);
    expect(PLAYERS.map((p) => p.faction)).toEqual(['p1', 'p2', 'p3', 'p4']);
  });

  it('spaces the entry squares evenly around the ring', () => {
    const entries = PLAYERS.map((p) => p.entryIndex);
    expect(entries).toEqual([0, 13, 26, 39]);
  });

  it('puts home entry exactly 51 steps after entry, so a token laps once', () => {
    for (const p of PLAYERS) {
      const lap = (p.homeEntryIndex - p.entryIndex + TRACK_LENGTH) % TRACK_LENGTH;
      expect({ faction: p.faction, lap }).toEqual({ faction: p.faction, lap: 51 });
    }
  });

  it('gives each player a 5-cell home column', () => {
    for (const p of PLAYERS) {
      expect(p.homeColumn).toHaveLength(HOME_COLUMN_LENGTH);
    }
  });

  it('keeps home columns off the shared ring', () => {
    const track = new Set(TRACK.map(key));
    for (const p of PLAYERS) {
      for (const c of p.homeColumn) {
        expect({ faction: p.faction, cell: key(c), onTrack: track.has(key(c)) }).toEqual({
          faction: p.faction,
          cell: key(c),
          onTrack: false,
        });
      }
    }
  });

  it('gives every home column a distinct set of cells', () => {
    const all = PLAYERS.flatMap((p) => p.homeColumn.map(key));
    expect(new Set(all).size).toBe(all.length);
  });

  it('ends every home column adjacent to the centre', () => {
    for (const p of PLAYERS) {
      const last = p.homeColumn[HOME_COLUMN_LENGTH - 1];
      const distance = Math.abs(last.x - 7) + Math.abs(last.y - 7);
      expect({ faction: p.faction, distance }).toEqual({ faction: p.faction, distance: 2 });
    }
  });

  it('keeps the four houses inside the grid and apart', () => {
    const size = 300;
    for (const p of PLAYERS) {
      const r = houseRect(p, size);
      expect(r.x).toBeGreaterThanOrEqual(0);
      expect(r.y).toBeGreaterThanOrEqual(0);
      expect(r.x + r.width).toBeLessThanOrEqual(size + 0.001);
      expect(r.y + r.height).toBeLessThanOrEqual(size + 0.001);
    }
  });
});

describe('safe cells', () => {
  it('has 8, evenly spaced', () => {
    expect(SAFE_INDICES).toHaveLength(8);
    expect(SAFE_INDICES).toEqual([0, 8, 13, 21, 26, 34, 39, 47]);
  });

  it('splits into 4 entry squares and 4 stars', () => {
    expect(ENTRY_INDICES).toHaveLength(4);
    expect(STAR_INDICES).toHaveLength(4);
    expect(ENTRY_INDICES.some((i) => STAR_INDICES.includes(i))).toBe(false);
  });
});

describe('tokenCell', () => {
  const lime = PLAYERS[0];

  it('reports a token as in its house before it starts', () => {
    expect(tokenCell(lime, -1, 2)).toEqual({ kind: 'house', player: lime, slot: 2 });
  });

  it('places a freshly started token on its own entry square', () => {
    const pos = tokenCell(lime, 0);
    expect(pos.kind).toBe('track');
    expect(pos.index).toBe(lime.entryIndex);
  });

  it('wraps around the ring rather than running off the end', () => {
    const cyan = PLAYERS[1];
    const pos = tokenCell(cyan, 51);
    expect(pos.kind).toBe('track');
    expect(pos.index).toBe((cyan.entryIndex + 51) % TRACK_LENGTH);
  });

  it('moves into the home column after a full lap', () => {
    const pos = tokenCell(lime, TRACK_LENGTH);
    expect(pos.kind).toBe('home');
    expect(pos.step).toBe(0);
    expect(pos.cell).toEqual(lime.homeColumn[0]);
  });

  it('finishes after the home column', () => {
    expect(tokenCell(lime, TRACK_LENGTH + HOME_COLUMN_LENGTH).kind).toBe('finished');
  });

  it('gives every player the same number of steps to finish', () => {
    for (const p of PLAYERS) {
      const last = tokenCell(p, TRACK_LENGTH + HOME_COLUMN_LENGTH - 1);
      expect({ faction: p.faction, kind: last.kind }).toEqual({ faction: p.faction, kind: 'home' });
      expect(tokenCell(p, TRACK_LENGTH + HOME_COLUMN_LENGTH).kind).toBe('finished');
    }
  });
});

describe('pixel mapping', () => {
  it('centres cells within a board of any size', () => {
    const size = 375;
    const unit = size / GRID;
    const { cx, cy } = cellCenter({ x: 0, y: 0 }, size);
    expect(cx).toBeCloseTo(unit / 2);
    expect(cy).toBeCloseTo(unit / 2);
  });

  it('keeps every track cell inside the board', () => {
    const size = 380;
    for (const c of TRACK) {
      const { cx, cy } = cellCenter(c, size);
      expect(cx).toBeGreaterThan(0);
      expect(cx).toBeLessThan(size);
      expect(cy).toBeGreaterThan(0);
      expect(cy).toBeLessThan(size);
    }
  });
});
