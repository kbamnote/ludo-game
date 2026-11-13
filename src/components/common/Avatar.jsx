/**
 * Avatar — player portrait with an optional faction ring and status dot.
 *
 * ── The opaque-art workaround (risk R6) ─────────────────────────────────────
 * Every character image from Stitch is an opaque square with its background
 * baked in — there is no alpha channel anywhere in the asset set. Dropping one
 * onto a dark surface leaves a visible plate.
 *
 * So we crop to a circle and ring it in the player's faction colour. The ring
 * is not decoration: it hides the crop boundary, so what would read as a
 * mistake reads as a deliberate design element. It also doubles as the
 * faction indicator the board needs anyway.
 *
 * A circular crop needs no Skia — borderRadius does it, and expo-image gives us
 * disk caching and a transition for free.
 *
 *   <Avatar source={images.avatarMeK4i} size={64} faction="p1" online />
 */
import { View } from 'react-native';
import { Image } from 'expo-image';
import { Text } from './Text';
import { faction as factionColors, surface, role, withAlpha } from '../../theme/colors';
import { radii } from '../../theme/spacing';
import { factionGlow } from '../../theme/effects';

const STATUS_COLORS = {
  online: factionColors.p1,
  inVoice: factionColors.p1,
  playing: factionColors.p2,
  idle: role.outline,
  offline: role.outlineVariant,
};

export function Avatar({
  source,
  size = 48,
  /** 'p1' | 'p2' | 'p3' | 'p4' — draws the faction ring. */
  faction,
  /** Ring thickness. Scales with size by default. */
  ringWidth,
  status,
  online = false,
  /** Shown when there is no source — initials over a tinted fill. */
  fallback,
  glow = false,
  style,
}) {
  const ring = ringWidth ?? Math.max(2, Math.round(size * 0.04));
  const ringColor = faction ? factionColors[faction] : role.outlineVariant;
  const effectiveStatus = status ?? (online ? 'online' : null);
  const dotSize = Math.max(8, Math.round(size * 0.22));

  return (
    <View style={[{ width: size, height: size }, style]}>
      <View
        style={[
          {
            width: size,
            height: size,
            borderRadius: radii.full,
            borderWidth: ring,
            borderColor: ringColor,
            backgroundColor: surface.containerHighest,
            overflow: 'hidden',
            alignItems: 'center',
            justifyContent: 'center',
          },
          glow && faction ? factionGlow[faction] : null,
        ]}
      >
        {source ? (
          <Image
            source={source}
            style={{ width: '100%', height: '100%' }}
            contentFit="cover"
            transition={160}
            cachePolicy="memory-disk"
            accessible={false}
          />
        ) : (
          <Text
            variant={size >= 48 ? 'headline-sm' : 'label-md'}
            color={faction ? ringColor : role.onSurfaceVariant}
          >
            {fallback ?? '?'}
          </Text>
        )}
      </View>

      {effectiveStatus ? (
        <View
          style={{
            position: 'absolute',
            right: 0,
            bottom: 0,
            width: dotSize,
            height: dotSize,
            borderRadius: radii.full,
            backgroundColor: STATUS_COLORS[effectiveStatus] ?? role.outline,
            borderWidth: Math.max(1.5, dotSize * 0.18),
            borderColor: surface.containerLowest,
          }}
        />
      ) : null}
    </View>
  );
}

/** Overlapping row of avatars — the "+418 participants" cluster on Home. */
export function AvatarStack({ items = [], size = 32, max = 3, overflowCount, style }) {
  const shown = items.slice(0, max);
  const extra = overflowCount ?? Math.max(0, items.length - max);

  return (
    <View style={[{ flexDirection: 'row', alignItems: 'center' }, style]}>
      {shown.map((item, i) => (
        <View key={item.key ?? i} style={{ marginLeft: i === 0 ? 0 : -size * 0.28 }}>
          <Avatar source={item.source} size={size} fallback={item.fallback} ringWidth={2} />
        </View>
      ))}
      {extra > 0 ? (
        <View
          style={{
            marginLeft: -size * 0.28,
            width: size,
            height: size,
            borderRadius: radii.full,
            backgroundColor: withAlpha(surface.containerHighest, 1),
            borderWidth: 2,
            borderColor: surface.containerLowest,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text variant="label-sm" color={role.onSurface} numeric>
            +{extra}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

export default Avatar;
