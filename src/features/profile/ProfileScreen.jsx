import { Screen } from '../../components/common/Screen';
import { AppHeader, HEADER_HEIGHT } from '../../components/common/AppHeader';
import { PhasePlaceholder } from '../../components/common/PhasePlaceholder';
import { useUserStore } from '../../store/useUserStore';
import { compactNumber, thousands } from '../../utils/format';
import { faction } from '../../theme/colors';

export function ProfileScreen() {
  const user = useUserStore();

  return (
    <>
      <AppHeader
        title="Profile"
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
          { color: faction.p1, size: 300, top: -50, left: -70 },
          { color: faction.p3, size: 240, top: 420, right: -80 },
        ]}
      >
        <PhasePlaceholder
          screen="Profile & Achievements"
          stitchScreen="Stitch 8 — Profile & Achievements · Stitch 4 — Avatar Studio"
          note="Identity card, rank/ELO ribbon, segment tabs, 2x2 analytics bento with a radial win-rate, badges rail and equipped loadout. The Avatar Studio opens from here."
          components={[
            'IdentityCard',
            'RadialStat',
            'StatCard',
            'BadgeChip',
            'LoadoutItem',
            'AvatarStage',
            'HueSlider',
            'CosmeticCard',
          ]}
          assets={['avatar-me-k4i']}
        />
      </Screen>
    </>
  );
}

export default ProfileScreen;
