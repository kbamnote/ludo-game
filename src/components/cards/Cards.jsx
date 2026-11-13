/**
 * Card primitives shared across the Stitch screens.
 *
 * Extracted because each appears on three or more screens; anything used once
 * stays in its own feature folder.
 */
import { View, Pressable } from 'react-native';
import { Text } from '../common/Text';
import { Icon } from '../icons/Icon';
import { GlassSurface } from '../common/GlassSurface';
import { faction as factionColors, role, surface, withAlpha } from '../../theme/colors';
import { radii, spacing } from '../../theme/spacing';
import { elevation } from '../../theme/effects';

/**
 * Pressable surface with a corner glow bloom — the Stitch "chassis" card used
 * by the Home arena grid, store packs and the profile CTA.
 */
export function BloomCard({
  onPress,
  accent = 'p1',
  children,
  padded = true,
  radius = radii.xl,
  background = surface.container,
  style,
  ...rest
}) {
  const Container = onPress ? Pressable : View;
  const accentColor = factionColors[accent] ?? accent;

  return (
    <Container
      onPress={onPress}
      accessibilityRole={onPress ? 'button' : undefined}
      style={({ pressed } = {}) => [
        {
          borderRadius: radius,
          backgroundColor: background,
          overflow: 'hidden',
          padding: padded ? spacing.md : 0,
          transform: [{ scale: pressed ? 0.98 : 1 }],
        },
        elevation.md,
        style,
      ]}
      {...rest}
    >
      {/* Corner bloom — the design's `-right-3 -top-3 blur-xl` accent */}
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          top: -12,
          right: -12,
          width: 64,
          height: 64,
          borderRadius: 32,
          backgroundColor: withAlpha(accentColor, 0.12),
        }}
      />
      {children}
    </Container>
  );
}

/** Row with an icon tile, title/subtitle and optional trailing content. */
export function ListRow({
  icon,
  iconColor = role.onSurfaceVariant,
  iconBackground = surface.containerHigh,
  title,
  titleVariant = 'body-lg',
  subtitle,
  right,
  onPress,
  leading,
  style,
}) {
  const Container = onPress ? Pressable : View;

  return (
    <Container
      onPress={onPress}
      accessibilityRole={onPress ? 'button' : undefined}
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing.sm,
        },
        style,
      ]}
    >
      {leading ??
        (icon ? (
          <View
            style={{
              width: 36,
              height: 36,
              borderRadius: radii.lg,
              backgroundColor: iconBackground,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon name={icon} size={18} color={iconColor} />
          </View>
        ) : null)}

      <View style={{ flex: 1, minWidth: 0 }}>
        <Text variant={titleVariant} color={role.onSurface} numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? (
          <Text variant="body-sm" color={role.onSurfaceVariant} numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>

      {right}
    </Container>
  );
}

/** Stat tile for the profile analytics bento. */
export function StatCard({
  label,
  icon,
  iconColor,
  value,
  valueColor = role.onSurface,
  caption,
  captionColor,
  children,
  style,
}) {
  return (
    <GlassSurface over="void" style={[{ padding: spacing.md, gap: spacing.xs, flex: 1 }, style]}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Text variant="label-sm" color={role.onSurfaceVariant}>
          {label}
        </Text>
        {icon ? <Icon name={icon} size={14} color={iconColor ?? role.onSurfaceVariant} /> : null}
      </View>

      {children ?? (
        <Text variant="headline-lg" color={valueColor} numeric>
          {value}
        </Text>
      )}

      {caption ? (
        <Text variant="label-sm" color={captionColor ?? role.onSurfaceVariant}>
          {caption}
        </Text>
      ) : null}
    </GlassSurface>
  );
}

export default { BloomCard, ListRow, StatCard };
