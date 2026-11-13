import { Screen } from '../../components/common/Screen';
import { AppHeader, HEADER_HEIGHT } from '../../components/common/AppHeader';
import { PhasePlaceholder } from '../../components/common/PhasePlaceholder';
import { useUserStore } from '../../store/useUserStore';
import { compactNumber, thousands } from '../../utils/format';
import { faction } from '../../theme/colors';

export function HomeScreen() {
  const user = useUserStore();

  return (
    <>
      <AppHeader
        title="Home"
        subtitle={`LVL ${user.level}`}
        coins={compactNumber(user.coins)}
        gems={thousands(user.gems)}
        avatarSource={user.avatar}
        avatarFaction={user.faction}
      />
      <Screen
        scroll
        tabBarClearance
        edges={{ top: false, bottom: false }}
        contentContainerStyle={{ paddingTop: HEADER_HEIGHT + 24 }}
        glows={[
          { color: faction.p1, size: 320, top: -40, left: -80 },
          { color: faction.p2, size: 280, top: 300, right: -90 },
        ]}
      >
        <PhasePlaceholder
          screen="Home Dashboard"
          stitchScreen="Stitch 5 — Home Dashboard"
          note="Live winner marquee, hero tournament card with countdown, 2x2 arena grid, online-crew rail and daily bounties."
          components={[
            'Marquee',
            'HeroEventCard',
            'CountdownTimer',
            'ArenaCard',
            'FriendRailCard',
            'BountyCard',
            'AvatarStack',
          ]}
          assets={[
            'home-hero-alley',
            'avatar-tourney-1/2/3',
            'avatar-nox99',
            'avatar-m1rak',
            'avatar-ghostd',
          ]}
        />
      </Screen>
    </>
  );
}

export default HomeScreen;
