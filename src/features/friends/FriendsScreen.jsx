import { Screen } from '../../components/common/Screen';
import { AppHeader, HEADER_HEIGHT } from '../../components/common/AppHeader';
import { PhasePlaceholder } from '../../components/common/PhasePlaceholder';
import { useUserStore } from '../../store/useUserStore';
import { compactNumber, thousands } from '../../utils/format';
import { faction } from '../../theme/colors';

export function FriendsScreen() {
  const user = useUserStore();

  return (
    <>
      <AppHeader
        title="Friends"
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
          { color: faction.p2, size: 300, top: -60, right: -80 },
          { color: faction.p3, size: 240, top: 420, left: -70 },
        ]}
      >
        <PhasePlaceholder
          screen="Friends & Social Hub"
          stitchScreen="Stitch 11 — Friends & Social Hub"
          note="Search and add, party invites, active voice party with live waveforms, segmented tabs, friend cards and the #squad-radio chat drawer."
          components={[
            'SearchBar',
            'InviteAlert',
            'VoicePartyCard',
            'SegmentedTabs',
            'FriendCard',
            'ChatDrawer',
            'EmoteRow',
            'MessageComposer',
          ]}
          assets={[
            'avatar-k41ro',
            'avatar-aoi99',
            'avatar-v3xnight',
            'avatar-cyberchloe',
            'avatar-sh4dowr0ll',
            'avatar-chat-icon',
          ]}
        />
      </Screen>
    </>
  );
}

export default FriendsScreen;
