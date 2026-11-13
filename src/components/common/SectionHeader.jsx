/**
 * SectionHeader — Syne title with an optional right-hand action.
 *
 *   "SELECT ARENA"            "4 MODES ONLINE"
 *   "ONLINE CREW"  ●          "VIEW ALL (14)"
 *   "DAILY BOUNTIES"  [RESET 8H]   "CLAIM ALL"
 */
import { View, Pressable } from 'react-native';
import { Text } from './Text';
import { Icon } from '../icons/Icon';
import { role, faction } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

export function SectionHeader({
  title,
  variant = 'headline-sm',
  /** Small pill or dot rendered immediately after the title. */
  adornment,
  actionLabel,
  onAction,
  actionIcon,
  actionColor = role.secondaryFixed,
  style,
}) {
  return (
    <View
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: spacing.sm,
        },
        style,
      ]}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flexShrink: 1 }}>
        <Text variant={variant} color={role.onSurface} numberOfLines={1}>
          {title}
        </Text>
        {adornment}
      </View>

      {actionLabel ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={actionLabel}
          onPress={onAction}
          hitSlop={12}
          style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}
        >
          <Text variant="label-sm" color={actionColor}>
            {actionLabel}
          </Text>
          {actionIcon ? <Icon name={actionIcon} size={12} color={actionColor} /> : null}
        </Pressable>
      ) : null}
    </View>
  );
}

/** The pulsing lime dot used beside several section titles. */
export function LiveDot({ color = faction.p1, size = 8 }) {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: color,
      }}
    />
  );
}

export default SectionHeader;
