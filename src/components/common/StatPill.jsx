/**
 * StatPill — the rounded label chip that appears ~45 times across the design.
 *
 *   "Tokyo S-04 • Live Lounge"   "MYTHIC BUILD"   "READY"   "LEGENDARY"
 *   "2.4k LIVE"   "HOST"   "PHASE 01 / 03"
 *
 * CurrencyChip is the coin/gem variant in the header.
 */
import { View } from 'react-native';
import { Text } from './Text';
import { Icon } from '../icons/Icon';
import { role, withAlpha } from '../../theme/colors';
import { radii, spacing } from '../../theme/spacing';
import { glassSolid } from '../../theme/effects';

export function StatPill({
  label,
  icon,
  color = role.onSurfaceVariant,
  background = glassSolid.overContainerHigh,
  /** Tints the background to a translucent wash of `color`. */
  tinted = false,
  dot = false,
  variant = 'label-sm',
  size = 'md',
  style,
  children,
}) {
  const pad = size === 'sm' ? { h: spacing.sm, v: 2 } : { h: spacing.md, v: spacing.xs };

  return (
    <View
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing.xs,
          paddingHorizontal: pad.h,
          paddingVertical: pad.v,
          borderRadius: radii.full,
          backgroundColor: tinted ? withAlpha(color, 0.15) : background,
          alignSelf: 'flex-start',
        },
        style,
      ]}
    >
      {dot ? (
        <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: color }} />
      ) : null}
      {icon ? <Icon name={icon} size={14} color={color} /> : null}
      {children ?? (
        <Text variant={variant} color={color}>
          {label}
        </Text>
      )}
    </View>
  );
}

/**
 * CurrencyChip — the coin and gem counters in the app header.
 * Always tabular so the number does not jitter when it changes.
 */
export function CurrencyChip({ kind = 'coins', amount, style }) {
  const config =
    kind === 'gems'
      ? { icon: 'diamond', color: role.secondaryFixed, iconColor: role.secondaryContainer }
      : { icon: 'monetization_on', color: role.onSurface, iconColor: role.secondaryFixed };

  return (
    <View
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing.xs,
          paddingHorizontal: spacing.sm,
          paddingVertical: spacing.xs,
          borderRadius: radii.full,
          backgroundColor: glassSolid.overContainerHigh,
        },
        style,
      ]}
    >
      <Icon name={config.icon} size={14} color={config.iconColor} />
      <Text variant="label-md" color={config.color} numeric>
        {amount}
      </Text>
    </View>
  );
}

export default StatPill;
