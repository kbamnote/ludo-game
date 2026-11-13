/**
 * SegmentedTabs — pill container with a sliding active segment.
 *
 * Used five times in the design:
 *   Login        ENTER SYNDICATE / NEW RUNNER
 *   Leaderboard  GLOBAL / FRIENDS / WEEKLY CUP
 *   Friends      Online / All / Requests / Clan
 *   Profile      Overview / Battle Log / Trophies / Clan
 *   Store        Featured / Outfits / Dice / Boards / Emotes
 *
 * The active pill slides rather than cutting, which is what makes it read as
 * one control instead of four buttons. Measured layout drives the slide, so it
 * stays correct when labels differ in width.
 */
import { useState } from 'react';
import { View, Pressable } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Text } from './Text';
import { faction, role, surface } from '../../theme/colors';
import { radii, spacing } from '../../theme/spacing';
import { glow } from '../../theme/effects';

export function SegmentedTabs({
  /** [{ key, label, badge? }] */
  items = [],
  value,
  onChange,
  activeColor = faction.p1,
  activeLabelColor = role.onPrimaryContainer,
  style,
}) {
  const [width, setWidth] = useState(0);
  const index = Math.max(
    0,
    items.findIndex((i) => i.key === value)
  );
  const offset = useSharedValue(0);

  const segmentWidth = items.length ? width / items.length : 0;

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: offset.value }],
    width: segmentWidth,
  }));

  const handleLayout = (e) => {
    const w = e.nativeEvent.layout.width;
    setWidth(w);
    const seg = items.length ? w / items.length : 0;
    offset.value = seg * index;
  };

  const select = (item, i) => {
    offset.value = withSpring(segmentWidth * i, { damping: 20, stiffness: 240 });
    Haptics.selectionAsync().catch(() => {});
    onChange?.(item.key);
  };

  return (
    <View
      onLayout={handleLayout}
      style={[
        {
          flexDirection: 'row',
          padding: 4,
          borderRadius: radii.full,
          backgroundColor: surface.containerLowest,
        },
        style,
      ]}
    >
      {segmentWidth > 0 ? (
        <Animated.View
          pointerEvents="none"
          style={[
            {
              position: 'absolute',
              top: 4,
              bottom: 4,
              left: 4,
              borderRadius: radii.full,
              backgroundColor: activeColor,
            },
            glow.primary,
            indicatorStyle,
          ]}
        />
      ) : null}

      {items.map((item, i) => {
        const active = item.key === value;
        return (
          <Pressable
            key={item.key}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            accessibilityLabel={item.label}
            onPress={() => select(item, i)}
            style={{
              flex: 1,
              paddingVertical: spacing.xs + 2,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: spacing.xs,
            }}
          >
            <Text
              variant="label-md"
              color={active ? activeLabelColor : role.onSurfaceVariant}
              numberOfLines={1}
            >
              {item.label}
            </Text>
            {item.badge != null ? (
              <View
                style={{
                  paddingHorizontal: 6,
                  borderRadius: radii.full,
                  backgroundColor: active ? surface.containerLowest : surface.container,
                }}
              >
                <Text
                  variant="label-sm"
                  color={active ? activeColor : role.onSurfaceVariant}
                  numeric
                >
                  {item.badge}
                </Text>
              </View>
            ) : null}
          </Pressable>
        );
      })}
    </View>
  );
}

export default SegmentedTabs;
