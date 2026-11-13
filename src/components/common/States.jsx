/**
 * LoadingState / EmptyState / ErrorState — the three states every data surface
 * needs and that get skipped under deadline pressure.
 *
 * The brief calls for proper loading and empty states explicitly, so they are
 * primitives rather than something each screen improvises.
 */
import { View, ActivityIndicator } from 'react-native';
import { Text } from './Text';
import { Icon } from '../icons/Icon';
import { NeonButton } from '../buttons/NeonButton';
import { faction, role, surface, withAlpha } from '../../theme/colors';
import { radii, spacing } from '../../theme/spacing';

export function LoadingState({ label = 'Loading', color = faction.p1, style }) {
  return (
    <View
      accessibilityRole="progressbar"
      accessibilityLabel={label}
      style={[{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md }, style]}
    >
      <ActivityIndicator size="large" color={color} />
      <Text variant="label-md" color={role.onSurfaceVariant}>
        {label}
      </Text>
    </View>
  );
}

/**
 * Skeleton — a plain pulse-free placeholder block.
 *
 * Deliberately static: a shimmer on every row of a long list is a lot of
 * animation for very little information, and it costs frames on the devices we
 * care about. Revisit with real profiling in Phase 8 if it feels flat.
 */
export function Skeleton({ width = '100%', height = 16, radius = radii.lg, style }) {
  return (
    <View
      style={[
        {
          width,
          height,
          borderRadius: radius,
          backgroundColor: withAlpha(surface.containerHighest, 0.6),
        },
        style,
      ]}
    />
  );
}

export function EmptyState({ icon = 'search', title, message, actionLabel, onAction, style }) {
  return (
    <View
      style={[
        {
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          gap: spacing.sm,
          paddingHorizontal: spacing.xl,
        },
        style,
      ]}
    >
      <View
        style={{
          width: 64,
          height: 64,
          borderRadius: radii.full,
          backgroundColor: surface.containerHigh,
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: spacing.xs,
        }}
      >
        <Icon name={icon} size={28} color={role.onSurfaceVariant} />
      </View>
      {title ? (
        <Text variant="headline-sm" color={role.onSurface} align="center">
          {title}
        </Text>
      ) : null}
      {message ? (
        <Text variant="body-sm" color={role.onSurfaceVariant} align="center">
          {message}
        </Text>
      ) : null}
      {actionLabel ? (
        <NeonButton
          label={actionLabel}
          onPress={onAction}
          variant="glass"
          size="sm"
          style={{ marginTop: spacing.sm }}
        />
      ) : null}
    </View>
  );
}

export function ErrorState({
  title = 'Something went wrong',
  message,
  onRetry,
  retryLabel = 'Try again',
  style,
}) {
  return (
    <View
      style={[
        {
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          gap: spacing.sm,
          paddingHorizontal: spacing.xl,
        },
        style,
      ]}
    >
      <View
        style={{
          width: 64,
          height: 64,
          borderRadius: radii.full,
          backgroundColor: withAlpha(faction.p3, 0.15),
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: spacing.xs,
        }}
      >
        <Icon name="crisis_alert" size={28} color={faction.p3} />
      </View>
      <Text variant="headline-sm" color={role.onSurface} align="center">
        {title}
      </Text>
      {message ? (
        <Text variant="body-sm" color={role.onSurfaceVariant} align="center">
          {message}
        </Text>
      ) : null}
      {onRetry ? (
        <NeonButton
          label={retryLabel}
          onPress={onRetry}
          variant="glass"
          size="sm"
          icon="replay"
          style={{ marginTop: spacing.sm }}
        />
      ) : null}
    </View>
  );
}

export default { LoadingState, EmptyState, ErrorState, Skeleton };
