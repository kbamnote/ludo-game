/**
 * BoardFallback — the same board, drawn with plain Views.
 *
 * Used wherever the Skia backend is unavailable: Expo Go, and web before
 * CanvasKit loads. It renders the identical geometry from the engine, so a
 * game played here is the same game — only the paint differs.
 *
 * ~90 Views rather than one canvas, so Skia is still the right default on a
 * real build. But a board that renders everywhere beats a prettier board that
 * crashes in two of three run targets.
 */
import { View } from 'react-native';
import { Text } from '../../components/common/Text';
import {
  TRACK,
  TRACK_LENGTH,
  PLAYERS,
  ENTRY_INDICES,
  STAR_INDICES,
  HOME,
  IN_HOUSE,
} from '../engine/board.js';
import { cellRect, houseRect, houseSlotCenter, cellCenter } from './geometry';
import { faction, surface, withAlpha } from '../../theme/colors';

export function BoardFallback({ size, tokens = [], highlighted = [] }) {
  const unit = size / 15;
  const highlightSet = new Set(highlighted);

  return (
    <View
      style={{
        width: size,
        height: size,
        backgroundColor: surface.containerLowest,
        borderRadius: unit * 1.2,
        overflow: 'hidden',
      }}
    >
      {/* Houses */}
      {PLAYERS.map((p) => {
        const r = houseRect(p, size);
        const color = faction[p.faction];
        return (
          <View
            key={`house-${p.seat}`}
            style={{
              position: 'absolute',
              left: r.x + unit * 0.15,
              top: r.y + unit * 0.15,
              width: r.width - unit * 0.3,
              height: r.height - unit * 0.3,
              borderRadius: unit * 0.8,
              borderWidth: 1.5,
              borderColor: withAlpha(color, 0.5),
              backgroundColor: withAlpha(color, 0.12),
            }}
          />
        );
      })}

      {/* Ring */}
      {TRACK.map((cell, index) => {
        const r = cellRect(cell, size);
        const owner = ENTRY_INDICES.includes(index)
          ? PLAYERS.find((p) => p.entryIndex === index)
          : null;
        const tint = owner ? faction[owner.faction] : null;
        const isStar = STAR_INDICES.includes(index);

        return (
          <View
            key={`t-${index}`}
            style={{
              position: 'absolute',
              left: r.x + 1,
              top: r.y + 1,
              width: r.width - 2,
              height: r.height - 2,
              borderRadius: unit * 0.18,
              backgroundColor: tint ? withAlpha(tint, 0.3) : surface.containerLow,
              borderWidth: 1,
              borderColor: tint ? withAlpha(tint, 0.6) : surface.containerHigh,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {isStar ? (
              <Text variant="label-sm" color={withAlpha(faction.p1, 0.7)}>
                ★
              </Text>
            ) : null}
          </View>
        );
      })}

      {/* Home columns */}
      {PLAYERS.map((p) =>
        p.homeColumn.map((cell, step) => {
          const r = cellRect(cell, size);
          const color = faction[p.faction];
          return (
            <View
              key={`h-${p.seat}-${step}`}
              style={{
                position: 'absolute',
                left: r.x + 1,
                top: r.y + 1,
                width: r.width - 2,
                height: r.height - 2,
                borderRadius: unit * 0.18,
                backgroundColor: withAlpha(color, 0.18 + step * 0.1),
                borderWidth: 1,
                borderColor: withAlpha(color, 0.45),
              }}
            />
          );
        })
      )}

      {/* Centre goal */}
      <View
        style={{
          position: 'absolute',
          left: 6 * unit,
          top: 6 * unit,
          width: 3 * unit,
          height: 3 * unit,
          borderRadius: unit * 0.4,
          backgroundColor: surface.containerHigh,
          borderWidth: 1,
          borderColor: withAlpha(faction.p1, 0.5),
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text variant="label-sm" color={faction.p1}>
          GOAL
        </Text>
      </View>

      {/* Tokens */}
      {tokens.map((token) => {
        const player = PLAYERS[token.seat];
        const color = faction[player.faction];
        const progress = Math.round(token.progress);

        let centre;
        if (progress <= IN_HOUSE) {
          centre = houseSlotCenter(player, token.slot, size);
        } else if (progress >= HOME) {
          centre = cellCenter({ x: 7, y: 7 }, size);
        } else if (progress < TRACK_LENGTH) {
          centre = cellCenter(TRACK[(player.entryIndex + progress) % TRACK_LENGTH], size);
        } else {
          centre = cellCenter(player.homeColumn[progress - TRACK_LENGTH], size);
        }

        const active = highlightSet.has(token.id);
        const d = unit * 0.68;

        return (
          <View
            key={token.id}
            pointerEvents="none"
            style={{
              position: 'absolute',
              left: centre.cx - d / 2,
              top: centre.cy - d / 2,
              width: d,
              height: d,
              borderRadius: d / 2,
              backgroundColor: color,
              borderWidth: active ? 3 : 1.5,
              borderColor: active ? '#FFFFFF' : surface.containerLowest,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <View
              style={{
                width: d * 0.4,
                height: d * 0.4,
                borderRadius: d * 0.2,
                backgroundColor: surface.containerLowest,
              }}
            />
          </View>
        );
      })}
    </View>
  );
}

export default BoardFallback;
