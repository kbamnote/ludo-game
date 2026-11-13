import { Screen } from '../../components/common/Screen';
import { AppHeader, HEADER_HEIGHT } from '../../components/common/AppHeader';
import { PhasePlaceholder } from '../../components/common/PhasePlaceholder';
import { useUserStore } from '../../store/useUserStore';
import { compactNumber, thousands } from '../../utils/format';
import { faction } from '../../theme/colors';

export function LeaderboardScreen() {
  const user = useUserStore();

  return (
    <>
      <AppHeader
        title="Leaderboard"
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
          { color: faction.p4, size: 320, top: -60, right: -80 },
          { color: faction.p2, size: 240, top: 400, left: -70 },
        ]}
      >
        <PhasePlaceholder
          screen="Global Leaderboard"
          stitchScreen="Stitch 9 — Global Leaderboard"
          note="Global / Friends / Weekly Cup tabs, league banner with promotion cutoff, a three-tier podium, ranks 4-10 and a sticky YOU bar."
          components={['SegmentedTabs', 'LeagueBanner', 'Podium', 'RankRow', 'StickyUserRank']}
          assets={['lb-rank1-v01drun … lb-rank10-hexblaster (10 portraits)']}
        />
      </Screen>
    </>
  );
}

export default LeaderboardScreen;
