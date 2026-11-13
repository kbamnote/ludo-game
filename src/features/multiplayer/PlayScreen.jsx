import { Screen } from '../../components/common/Screen';
import { AppHeader, HEADER_HEIGHT } from '../../components/common/AppHeader';
import { PhasePlaceholder } from '../../components/common/PhasePlaceholder';
import { useUserStore } from '../../store/useUserStore';
import { compactNumber, thousands } from '../../utils/format';
import { faction } from '../../theme/colors';

export function PlayScreen() {
  const user = useUserStore();

  return (
    <>
      <AppHeader
        title="Play"
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
          { color: faction.p1, size: 340, top: -70, left: -90 },
          { color: faction.p4, size: 260, top: 380, right: -80 },
        ]}
      >
        <PhasePlaceholder
          screen="Play — Lobby & Store"
          stitchScreen="Stitch 6 — Match Lobby · Stitch 10 — Store & Battle Pass"
          note="Entry point for matchmaking. Room code bar, stakes tiers, 4-player slot grid, voice dock and soundboard; the store and battle pass live behind this tab too."
          components={[
            'RoomCodeBar',
            'StakesSelector',
            'PlayerSlotCard',
            'VoiceDock',
            'SoundboardRow',
            'BattlePassBanner',
            'ProductCard',
          ]}
          assets={[
            'lobby-nova-viper',
            'lobby-ghost-roller',
            'store-neon-phantom-wings',
            'store-obsidian-liquid-dice',
            'store-shibuya-board',
            'store-bass-emote',
          ]}
        />
      </Screen>
    </>
  );
}

export default PlayScreen;
