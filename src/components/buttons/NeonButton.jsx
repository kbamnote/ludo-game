/**
 * NeonButton — the design system's "Cyber Action Button".
 *
 * Primary:   solid electric lime, black label, pill, high-intensity glow.
 *            "ROLL DICE", "ENTER THE NIGHT", "PLAY NOW", "MINT AVATAR"
 * Secondary: smoked glass, 1px white rim at 12%, coloured press transition.
 *            "SPECTATE", "EMOTE"
 * Ghost:     text only, for tertiary actions.
 *
 * Press feedback is Reanimated (not Animated) so the scale runs on the UI
 * thread and survives a busy JS thread mid-match. Haptics fire on press-in,
 * which is where they feel immediate rather than lagging the visual.
 */
import { Pressable, View, ActivityIndicator } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Text } from '../common/Text';
import { Icon } from '../icons/Icon';
import { faction, role, alpha, withAlpha } from '../../theme/colors';
import { radii, spacing, hitSlop } from '../../theme/spacing';
import { glow, glassSolid } from '../../theme/effects';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const VARIANTS = {
  primary: {
    background: faction.p1,
    label: role.onPrimary,
    border: 'transparent',
    halo: glow.primary,
  },
  secondary: {
    background: faction.p2,
    label: role.onSecondaryContainer,
    border: 'transparent',
    halo: glow.secondary,
  },
  danger: {
    background: faction.p3,
    label: '#FFFFFF',
    border: 'transparent',
    halo: glow.danger,
  },
  glass: {
    background: glassSolid.overContainer,
    label: role.onSurface,
    border: alpha.rim,
    halo: {},
  },
  ghost: {
    background: 'transparent',
    label: role.onSurfaceVariant,
    border: 'transparent',
    halo: {},
  },
};

const SIZES = {
  sm: { height: 36, paddingHorizontal: spacing.md, variant: 'label-md', icon: 16 },
  md: { height: 48, paddingHorizontal: spacing.lg, variant: 'label-lg', icon: 18 },
  lg: { height: 56, paddingHorizontal: spacing.xl, variant: 'label-lg', icon: 20 },
};

export function NeonButton({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  icon,
  iconRight,
  loading = false,
  disabled = false,
  haptic = 'light',
  fullWidth = false,
  style,
  children,
  ...rest
}) {
  const v = VARIANTS[variant] ?? VARIANTS.primary;
  const s = SIZES[size] ?? SIZES.md;
  const scale = useSharedValue(1);
  const isDisabled = disabled || loading;

  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const handlePressIn = () => {
    scale.value = withSpring(0.96, { damping: 18, stiffness: 320 });
    if (haptic && !isDisabled) {
      const style =
        haptic === 'medium'
          ? Haptics.ImpactFeedbackStyle.Medium
          : haptic === 'heavy'
            ? Haptics.ImpactFeedbackStyle.Heavy
            : Haptics.ImpactFeedbackStyle.Light;
      Haptics.impactAsync(style).catch(() => {
        // Haptics are unavailable on some devices and in the emulator.
        // A missing buzz must never break a button press.
      });
    }
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 18, stiffness: 320 });
  };

  return (
    <AnimatedPressable
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      accessibilityLabel={label}
      disabled={isDisabled}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      hitSlop={s.height < hitSlop.minTouchSize ? (hitSlop.minTouchSize - s.height) / 2 : 0}
      style={[
        animatedStyle,
        {
          height: s.height,
          paddingHorizontal: s.paddingHorizontal,
          borderRadius: radii.full,
          backgroundColor: isDisabled ? withAlpha(v.background, 0.35) : v.background,
          borderWidth: v.border === 'transparent' ? 0 : 1,
          borderColor: v.border,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: spacing.sm,
          alignSelf: fullWidth ? 'stretch' : 'flex-start',
          opacity: isDisabled ? 0.6 : 1,
        },
        !isDisabled && v.halo,
        style,
      ]}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator size="small" color={v.label} />
      ) : (
        <>
          {icon ? <Icon name={icon} size={s.icon} color={v.label} /> : null}
          {children ?? (
            <Text variant={s.variant} color={v.label} uppercase>
              {label}
            </Text>
          )}
          {iconRight ? <Icon name={iconRight} size={s.icon} color={v.label} /> : null}
        </>
      )}
    </AnimatedPressable>
  );
}

/**
 * The design system's "right action reticle" — the filled circle holding an
 * arrow at the trailing edge of a primary CTA.
 */
export function ButtonReticle({
  icon = 'arrow_forward',
  color = role.onPrimary,
  background = faction.p1,
}) {
  return (
    <View
      style={{
        width: 32,
        height: 32,
        borderRadius: radii.full,
        backgroundColor: color,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Icon name={icon} size={16} color={background} />
    </View>
  );
}

export default NeonButton;
