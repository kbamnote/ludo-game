/**
 * LudoBoard — Skia rendering of the derived board geometry.
 *
 * Draws WHAT geometry.js describes, in the visual language the Stitch gameplay
 * screen establishes: charcoal cells with hairline seams, houses lit from
 * within by faction colour, safe cells glowing, a four-way centre goal.
 *
 * Skia rather than Views because a 15x15 board is 225 cells plus home columns,
 * houses and tokens. As a View tree that is ~250 nodes re-laying out on every
 * token move; as a single canvas it is one draw.
 *
 * Presentation only. No rules, no turn logic, no move validation — those come
 * from @ludo/engine in Phase 4. This component takes token positions as props
 * and draws them.
 */
import { useMemo } from 'react';
import {
  Canvas,
  Group,
  RoundedRect,
  Circle,
  Path,
  Skia,
  LinearGradient,
  vec,
} from '@shopify/react-native-skia';

import {
  GRID,
  TRACK,
  PLAYERS,
  ENTRY_INDICES,
  STAR_INDICES,
  cellRect,
  cellCenter,
  houseRect,
  houseSlotCenter,
  tokenCell,
  centerPolygon,
} from './geometry';
import { faction, surface, withAlpha } from '../../theme/colors';

/** Hex -> Skia colour with alpha. */
const c = (hex, alpha = 1) => Skia.Color(alpha === 1 ? hex : withAlpha(hex, alpha));

function starPath(cx, cy, outer, inner, points = 5) {
  // Skia.Path.Make() returns undefined until the backend is live (Expo Go, or
  // web before CanvasKit loads). Calling .moveTo() on that threw and took the
  // whole match screen down, so the caller gets null and draws nothing.
  const p = Skia?.Path?.Make?.();
  if (!p) return null;
  for (let i = 0; i < points * 2; i += 1) {
    const r = i % 2 === 0 ? outer : inner;
    const a = (Math.PI / points) * i - Math.PI / 2;
    const x = cx + Math.cos(a) * r;
    const y = cy + Math.sin(a) * r;
    if (i === 0) p.moveTo(x, y);
    else p.lineTo(x, y);
  }
  p.close();
  return p;
}

function polyPath(points) {
  const p = Skia?.Path?.Make?.();
  if (!p) return null;
  points.forEach((pt, i) => (i === 0 ? p.moveTo(pt.x, pt.y) : p.lineTo(pt.x, pt.y)));
  p.close();
  return p;
}

export function LudoBoard({
  size,
  /** [{ seat, slot, progress }] — progress < 0 means still in its house. */
  tokens = [],
  /** Token ids that are legal to move, drawn with a pulse ring. */
  highlighted = [],
  /** Cells to mark as under threat. */
  threatIndex = null,
}) {
  const unit = size / GRID;
  const center = useMemo(() => centerPolygon(size), [size]);

  const highlightSet = useMemo(() => new Set(highlighted), [highlighted]);

  return (
    <Canvas style={{ width: size, height: size }}>
      {/* Board plate */}
      <RoundedRect
        x={0}
        y={0}
        width={size}
        height={size}
        r={unit * 1.2}
        color={c(surface.containerLowest)}
      />

      {/* Faint grid dots, echoing the design's radial-gradient texture */}
      <Group opacity={0.14}>
        {Array.from({ length: GRID + 1 }, (_, i) => (
          <Circle key={`dot-${i}`} cx={i * unit} cy={i * unit} r={1} color={c(faction.p1)} />
        ))}
      </Group>

      {/* Houses */}
      {PLAYERS.map((p) => {
        const r = houseRect(p, size);
        const color = faction[p.faction];
        return (
          <Group key={`house-${p.seat}`}>
            <RoundedRect
              x={r.x + unit * 0.15}
              y={r.y + unit * 0.15}
              width={r.width - unit * 0.3}
              height={r.height - unit * 0.3}
              r={unit * 0.8}
              color={c(color, 0.12)}
            />
            <RoundedRect
              x={r.x + unit * 0.15}
              y={r.y + unit * 0.15}
              width={r.width - unit * 0.3}
              height={r.height - unit * 0.3}
              r={unit * 0.8}
              style="stroke"
              strokeWidth={1.5}
              color={c(color, 0.5)}
            />
            {/* Inner pocket */}
            <RoundedRect
              x={r.x + unit * 1}
              y={r.y + unit * 1}
              width={r.width - unit * 2}
              height={r.height - unit * 2}
              r={unit * 0.6}
              color={c(surface.containerLowest, 0.85)}
            />
            {/* Four resting slots */}
            {[0, 1, 2, 3].map((slot) => {
              const s = houseSlotCenter(p, slot, size);
              return (
                <Circle
                  key={`slot-${p.seat}-${slot}`}
                  cx={s.cx}
                  cy={s.cy}
                  r={unit * 0.42}
                  style="stroke"
                  strokeWidth={1.5}
                  color={c(color, 0.35)}
                />
              );
            })}
          </Group>
        );
      })}

      {/* Shared ring */}
      {TRACK.map((cell, index) => {
        const r = cellRect(cell, size);
        const isEntry = ENTRY_INDICES.includes(index);
        const isStar = STAR_INDICES.includes(index);
        const owner = isEntry ? PLAYERS.find((p) => p.entryIndex === index) : null;
        const tint = owner ? faction[owner.faction] : null;

        return (
          <Group key={`track-${index}`}>
            <RoundedRect
              x={r.x + 1}
              y={r.y + 1}
              width={r.width - 2}
              height={r.height - 2}
              r={unit * 0.18}
              color={tint ? c(tint, 0.3) : c(surface.containerLow)}
            />
            <RoundedRect
              x={r.x + 1}
              y={r.y + 1}
              width={r.width - 2}
              height={r.height - 2}
              r={unit * 0.18}
              style="stroke"
              strokeWidth={1}
              color={tint ? c(tint, 0.6) : c(surface.containerHigh)}
            />
            {isStar ? (
              <Path
                path={starPath(r.x + r.width / 2, r.y + r.height / 2, unit * 0.3, unit * 0.13)}
                color={c(faction.p1, 0.55)}
              />
            ) : null}
            {threatIndex === index ? (
              <Circle
                cx={r.x + r.width / 2}
                cy={r.y + r.height / 2}
                r={unit * 0.46}
                style="stroke"
                strokeWidth={2}
                color={c(faction.p3, 0.9)}
              />
            ) : null}
          </Group>
        );
      })}

      {/* Home columns */}
      {PLAYERS.map((p) =>
        p.homeColumn.map((cell, step) => {
          const r = cellRect(cell, size);
          const color = faction[p.faction];
          return (
            <Group key={`home-${p.seat}-${step}`}>
              <RoundedRect
                x={r.x + 1}
                y={r.y + 1}
                width={r.width - 2}
                height={r.height - 2}
                r={unit * 0.18}
                color={c(color, 0.18 + step * 0.1)}
              />
              <RoundedRect
                x={r.x + 1}
                y={r.y + 1}
                width={r.width - 2}
                height={r.height - 2}
                r={unit * 0.18}
                style="stroke"
                strokeWidth={1}
                color={c(color, 0.45)}
              />
            </Group>
          );
        })
      )}

      {/* Centre goal — four triangles meeting at the middle */}
      <Group>
        <Path path={polyPath(center.top)} color={c(faction.p3, 0.5)} />
        <Path path={polyPath(center.right)} color={c(faction.p4, 0.5)} />
        <Path path={polyPath(center.bottom)} color={c(faction.p1, 0.5)} />
        <Path path={polyPath(center.left)} color={c(faction.p2, 0.5)} />
        <Circle cx={size / 2} cy={size / 2} r={unit * 0.85} color={c(surface.containerLowest)}>
          <LinearGradient
            start={vec(size / 2 - unit, size / 2 - unit)}
            end={vec(size / 2 + unit, size / 2 + unit)}
            colors={[c(faction.p1, 0.35), c(faction.p2, 0.35)]}
          />
        </Circle>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={unit * 0.85}
          style="stroke"
          strokeWidth={1.5}
          color={c(faction.p1, 0.5)}
        />
      </Group>

      {/* Tokens */}
      {tokens.map((t) => {
        const player = PLAYERS[t.seat];
        const pos = tokenCell(player, t.progress, t.slot);
        const color = faction[player.faction];
        const id = `${t.seat}-${t.slot}`;
        const active = highlightSet.has(id);

        let cx;
        let cy;
        if (pos.kind === 'house') {
          const s = houseSlotCenter(player, t.slot, size);
          cx = s.cx;
          cy = s.cy;
        } else if (pos.kind === 'finished') {
          const c2 = cellCenter({ x: 7, y: 7 }, size);
          cx = c2.cx;
          cy = c2.cy;
        } else {
          const c2 = cellCenter(pos.cell, size);
          cx = c2.cx;
          cy = c2.cy;
        }

        return (
          <Group key={`token-${id}`}>
            {active ? <Circle cx={cx} cy={cy} r={unit * 0.58} color={c(color, 0.3)} /> : null}
            {/* Drop shadow */}
            <Circle cx={cx} cy={cy + unit * 0.06} r={unit * 0.34} color={c('#000000', 0.5)} />
            {/* Outer neon ring */}
            <Circle cx={cx} cy={cy} r={unit * 0.34} color={c(color)} />
            {/* Metallic core, per the design system's pawn description */}
            <Circle cx={cx} cy={cy} r={unit * 0.2} color={c(surface.containerLowest)} />
            <Circle cx={cx} cy={cy} r={unit * 0.1} color={c(color, 0.9)} />
          </Group>
        );
      })}
    </Canvas>
  );
}

export default LudoBoard;
