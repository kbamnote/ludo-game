/**
 * IconButton — circular icon-only control.
 *
 * Used for the header back arrow, voice dock mute/deafen, avatar-studio reset,
 * and the store modal close. Always meets the 48pt minimum touch target even
 * when drawn smaller, via hitSlop.
 */
import { Pressable } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Icon } from '../icons/Icon';
import { role, alpha } from '../../theme/colors';
import { radii, hitSlop } from '../../theme/spacing';
import { glassSolid } from '../../theme/effects';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function IconButton({
  icon,
  onPress,
  size = 40,
  iconSize,
  color = role.onSurface,
  background = glassSolid.overContainer,
  bordered = false,
  disabled = false,
  haptic = true,
  accessibilityLabel,
  style,
  ...rest
}) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const slop = size < hitSlop.minTouchSize ? (hitSlop.minTouchSize - size) / 2 : 0;

  return (
    <AnimatedPressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? icon}
      accessibilityState={{ disabled }}
      disabled={disabled}
      hitSlop={slop}
      onPress={onPress}
      onPressIn={() => {
        scale.value = withSpring(0.9, { damping: 18, stiffness: 340 });
        if (haptic && !disabled) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
        }
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { damping: 18, stiffness: 340 });
      }}
      style={[
        animatedStyle,
        {
          width: size,
          height: size,
          borderRadius: radii.full,
          backgroundColor: background,
          borderWidth: bordered ? 1 : 0,
          borderColor: alpha.rim,
          alignItems: 'center',
          justifyContent: 'center',
          opacity: disabled ? 0.4 : 1,
        },
        style,
      ]}
      {...rest}
    >
      <Icon name={icon} size={iconSize ?? Math.round(size * 0.5)} color={color} />
    </AnimatedPressable>
  );
}

export default IconButton;
