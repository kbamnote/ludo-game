/**
 * Tab layout — the Stitch `mobile_tab` shell.
 *
 * Uses a custom AppTabBar rather than the stock Expo Router tab bar: the design
 * needs a floating pill with a raised centre FAB, which is further from the
 * default than it is worth bending the default to reach.
 */
import { Tabs, useRouter, useSegments } from 'expo-router';
import { AppTabBar, TABS } from '../../src/components/common/AppTabBar';
import { useUserStore } from '../../src/store/useUserStore';
import { surface } from '../../src/theme/colors';

function TabBar() {
  const router = useRouter();
  const segments = useSegments();
  const unread = useUserStore((s) => s.unreadFriendRequests);

  // segments is e.g. ['(tabs)', 'friends'] — the second entry is the active
  // tab, or undefined on the index route.
  const activeKey = segments[1] ?? 'index';

  return (
    <AppTabBar
      activeKey={activeKey}
      badges={{ friends: unread }}
      onNavigate={(tab) => router.navigate(tab.route)}
    />
  );
}

export default function TabsLayout() {
  return (
    <>
      <Tabs
        tabBar={() => null}
        screenOptions={{
          headerShown: false,
          sceneStyle: { backgroundColor: surface.void },
          tabBarStyle: { display: 'none' },
        }}
      >
        {TABS.map((tab) => (
          <Tabs.Screen key={tab.key} name={tab.key} options={{ title: tab.label }} />
        ))}
      </Tabs>
      <TabBar />
    </>
  );
}
