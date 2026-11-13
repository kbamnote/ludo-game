/**
 * AppTabBar — the floating pill nav from the Stitch `mobile_tab` shell.
 *
 *   Home · Friends(3) · [PLAY FAB] · Rank · Profile
 *
 * The centre Play slot is a raised lime FAB (-20pt, 52pt) rather than a normal
 * tab, exactly as the design has it. Active items get the lime tint plus a
 * drop-shadow halo.
 *
 * This replaces the stock Expo Router tab bar — the design is far enough from
 * a standard tab bar that styling the default would be more work than drawing
 * it, and we need the raised FAB regardless.
 */
import { View, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Text } from './Text';
import { Icon } from '../icons/Icon';
import { GlassSurface } from './GlassSurface';
import { faction, role, surface } from '../../theme/colors';
import { radii, spacing } from '../../theme/spacing';
import { glow } from '../../theme/effects';

export const TAB_BAR_HEIGHT = 64;

/** Route order matches the Stitch nav exactly. */
export const TABS = [
  { key: 'index', label: 'Home', icon: 'home', route: '/' },
  { key: 'friends', label: 'Friends', icon: 'forum', route: '/friends' },
  { key: 'play', label: 'Play', icon: 'casino', route: '/play', fab: true },
  { key: 'leaderboard', label: 'Rank', icon: 'emoji_events', route: '/leaderboard' },
  { key: 'profile', label: 'Profile', icon: 'person', route: '/profile' },
];

function TabItem({ tab, active, badge, onPress }) {
  const color = active ? faction.p1 : role.onSurfaceVariant;

  if (tab.fab) {
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={tab.label}
        accessibilityState={{ selected: active }}
        onPress={onPress}
        style={[
          {
            minWidth: 52,
            minHeight: 52,
            marginTop: -20,
            borderRadius: radii.full,
            backgroundColor: faction.p1,
            alignItems: 'center',
            justifyContent: 'center',
          },
          glow.primaryStrong,
        ]}
      >
        <Icon name={tab.icon} size={30} color={role.onPrimaryContainer} />
      </Pressable>
    );
  }

  return (
    <Pressable
      accessibilityRole="tab"
      accessibilityLabel={tab.label}
      accessibilityState={{ selected: active }}
      onPress={onPress}
      style={{
        minWidth: 48,
        minHeight: 48,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <View>
        <Icon name={tab.icon} size={24} color={color} />
        {badge ? (
          <View
            style={{
              position: 'absolute',
              top: -4,
              right: -8,
              paddingHorizontal: 5,
              borderRadius: radii.full,
              backgroundColor: role.onTertiaryContainer,
            }}
          >
            <Text variant="label-sm" color={role.tertiary} numeric>
              {badge}
            </Text>
          </View>
        ) : null}
      </View>
      <Text variant="label-sm" color={color} style={{ marginTop: 2 }} uppercase={false}>
        {tab.label}
      </Text>
    </Pressable>
  );
}

export function AppTabBar({ activeKey, badges = {}, onNavigate }) {
  const insets = useSafeAreaInsets();

  return (
    <View
      pointerEvents="box-none"
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        paddingBottom: insets.bottom + spacing.sm,
        paddingHorizontal: spacing.margin,
        zIndex: 50,
      }}
    >
      <GlassSurface
        blurred
        debugLabel="AppTabBar"
        radius={radii.full}
        elevation="lg"
        style={{
          height: TAB_BAR_HEIGHT,
          maxWidth: 448,
          width: '100%',
          alignSelf: 'center',
          backgroundColor: surface.containerLowest,
        }}
      >
        <View
          style={{
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: spacing.xs,
          }}
        >
          {TABS.map((tab) => (
            <TabItem
              key={tab.key}
              tab={tab}
              active={activeKey === tab.key}
              badge={badges[tab.key]}
              onPress={() => {
                Haptics.selectionAsync().catch(() => {});
                onNavigate?.(tab);
              }}
            />
          ))}
        </View>
      </GlassSurface>
    </View>
  );
}

export default AppTabBar;
