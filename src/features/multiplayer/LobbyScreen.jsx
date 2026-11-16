/**
 * Multiplayer Match Lobby — Stitch screen 6.
 *
 * Room code with copy, stakes tiers, a 2x2 seat grid covering all four states
 * (host / ready-with-voice / invited-waiting / empty), the voice dock and the
 * soundboard.
 *
 * Phase 2 scope: seats, tiers and voice toggles are all interactive local
 * state. There is no real room — Colyseus arrives in Phase 5 — so "Start match"
 * routes straight to the gameplay screen with sample data.
 */
import { useState } from 'react';
import { View, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';

import { Screen } from '../../components/common/Screen';
import { AppHeader, HEADER_HEIGHT } from '../../components/common/AppHeader';
import { Text } from '../../components/common/Text';
import { StatPill } from '../../components/common/StatPill';
import { GlassSurface } from '../../components/common/GlassSurface';
import { Avatar } from '../../components/common/Avatar';
import { NeonButton } from '../../components/buttons/NeonButton';
import { IconButton } from '../../components/buttons/IconButton';
import { Icon } from '../../components/icons/Icon';
import { WaveformBars } from '../../components/animations/WaveformBars';
import { LoadingState, ErrorState } from '../../components/common/States';

import { api, queryKeys } from '../../services/sampleData';
import { useUserStore } from '../../store/useUserStore';
import { useHaptics } from '../../hooks/useHaptics';
import { compactNumber, thousands, roomCode } from '../../utils/format';
import { faction, role, surface, withAlpha } from '../../theme/colors';
import { radii, spacing } from '../../theme/spacing';

function SeatCard({ seat, onInvite }) {
  const accent = seat.faction ? faction[seat.faction] : role.outline;

  if (seat.state === 'empty') {
    return (
      <GlassSurface
        over="void"
        style={{ width: '48%', flexGrow: 1, padding: spacing.sm, gap: spacing.sm }}
      >
        <View
          style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
        >
          <Text variant="label-sm" color={role.onSurfaceVariant}>
            SLOT {seat.slot}
          </Text>
          <StatPill label="EMPTY" color={role.onSurfaceVariant} size="sm" />
        </View>

        <View style={{ alignItems: 'center', gap: 6, paddingVertical: spacing.sm }}>
          <IconButton
            icon="add"
            size={64}
            iconSize={30}
            color={faction.p1}
            onPress={onInvite}
            accessibilityLabel="Invite to slot"
          />
          <Text variant="label-md" color={role.onSurface}>
            Open Seat
          </Text>
          <Text variant="label-sm" color={role.onSurfaceVariant} align="center">
            Invite friend or CPU
          </Text>
        </View>

        <View style={{ flexDirection: 'row', gap: 4 }}>
          {['+ BOT', 'SHARE'].map((l, i) => (
            <Pressable
              key={l}
              accessibilityRole="button"
              accessibilityLabel={l}
              onPress={onInvite}
              style={{
                flex: 1,
                paddingVertical: 4,
                borderRadius: radii.lg,
                alignItems: 'center',
                backgroundColor: surface.containerHighest,
              }}
            >
              <Text variant="label-sm" color={i === 0 ? role.onSurface : role.secondaryFixed}>
                {l}
              </Text>
            </Pressable>
          ))}
        </View>
      </GlassSurface>
    );
  }

  const waiting = seat.state === 'invited';

  return (
    <GlassSurface
      over={waiting ? 'void' : 'containerHigh'}
      style={{
        width: '48%',
        flexGrow: 1,
        padding: spacing.sm,
        gap: spacing.sm,
        opacity: waiting ? 0.85 : 1,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        {seat.state === 'host' ? (
          <StatPill label="HOST" icon="military_tech" color={role.tertiaryFixed} size="sm" />
        ) : waiting ? (
          <Text variant="label-sm" color={role.onSurfaceVariant}>
            SLOT {seat.slot}
          </Text>
        ) : (
          <StatPill label="VOICE" dot color={role.secondaryFixed} tinted size="sm" />
        )}

        {seat.ready ? (
          <StatPill label="READY" color={faction.p1} tinted size="sm" />
        ) : waiting ? (
          <StatPill label="INVITED" dot color={role.error} size="sm" />
        ) : null}
      </View>

      <View style={{ alignItems: 'center', gap: 4, paddingVertical: spacing.xs }}>
        <View>
          <Avatar
            source={seat.avatar}
            size={64}
            faction={seat.faction}
            ringWidth={2}
            glow={!waiting}
          />
          {seat.mic ? (
            <View
              style={{
                position: 'absolute',
                bottom: -4,
                right: -4,
                padding: 2,
                borderRadius: radii.full,
                backgroundColor: surface.containerLowest,
              }}
            >
              <Icon name="mic" size={14} color={faction.p1} />
            </View>
          ) : null}
          {waiting ? (
            <View
              style={{
                position: 'absolute',
                bottom: -4,
                right: -4,
                padding: 2,
                borderRadius: radii.full,
                backgroundColor: surface.containerLowest,
              }}
            >
              <Icon name="schedule" size={14} color={role.onSurfaceVariant} />
            </View>
          ) : null}
        </View>

        {seat.speaking ? <WaveformBars color={accent} bars={4} height={12} width={2} /> : null}

        <Text
          variant="headline-sm"
          color={
            waiting ? role.onSurfaceVariant : seat.state === 'host' ? role.primary : role.onSurface
          }
          numberOfLines={1}
        >
          {seat.name}
        </Text>
        <Text variant="label-sm" color={waiting ? role.onSurfaceVariant : accent} numberOfLines={1}>
          {seat.meta}
        </Text>
      </View>

      {seat.factionLabel ? (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 4,
            paddingVertical: 4,
            borderRadius: radii.lg,
            backgroundColor: surface.containerLowest,
          }}
        >
          <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: accent }} />
          <Text variant="label-sm" color={role.onSurfaceVariant}>
            {seat.factionLabel}
          </Text>
        </View>
      ) : (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: spacing.sm,
            paddingVertical: 4,
            borderRadius: radii.lg,
            backgroundColor: withAlpha(surface.containerLowest, 0.8),
          }}
        >
          <Text variant="label-sm" color={role.onSurfaceVariant} numeric>
            PING: {seat.ping}ms
          </Text>
          <Pressable accessibilityRole="button" onPress={onInvite} hitSlop={8}>
            <Text variant="label-sm" color={faction.p2}>
              NUDGE
            </Text>
          </Pressable>
        </View>
      )}
    </GlassSurface>
  );
}

export function LobbyScreen() {
  const router = useRouter();
  const haptics = useHaptics();
  const user = useUserStore();

  const [tier, setTier] = useState('hot');
  const [muted, setMuted] = useState(false);
  const [deafened, setDeafened] = useState(false);

  const { data, isPending, isError, refetch } = useQuery({
    queryKey: queryKeys.lobby,
    queryFn: api.getLobby,
  });

  const header = (
    <AppHeader
      title="Play"
      subtitle={`LVL ${user.level}`}
      coins={compactNumber(user.coins)}
      gems={thousands(user.gems)}
      avatarSource={user.avatar}
      avatarFaction={user.faction}
      right={
        <IconButton
          icon="shopping_cart_checkout"
          size={32}
          iconSize={16}
          background="transparent"
          onPress={() => router.navigate('/play/store')}
          accessibilityLabel="Open store"
        />
      }
    />
  );

  if (isPending) {
    return (
      <>
        {header}
        <Screen
          edges={{ top: false, bottom: false }}
          contentContainerStyle={{ paddingTop: HEADER_HEIGHT }}
        >
          <LoadingState label="Opening lounge" />
        </Screen>
      </>
    );
  }

  if (isError) {
    return (
      <>
        {header}
        <Screen
          edges={{ top: false, bottom: false }}
          contentContainerStyle={{ paddingTop: HEADER_HEIGHT }}
        >
          <ErrorState message="Could not open the lounge." onRetry={refetch} />
        </Screen>
      </>
    );
  }

  const filled = data.seats.filter((s) => s.state !== 'empty').length;

  return (
    <>
      {header}
      <Screen
        scroll
        tabBarClearance
        edges={{ top: false, bottom: false }}
        contentContainerStyle={{ paddingTop: HEADER_HEIGHT + spacing.lg, gap: spacing.md }}
        glows={[
          { color: faction.p1, size: 340, top: -70, left: -90 },
          { color: faction.p4, size: 260, top: 420, right: -80 },
        ]}
      >
        {/* Room code */}
        <GlassSurface
          over="containerHigh"
          style={{
            padding: spacing.sm,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: spacing.sm,
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: spacing.xs,
              flex: 1,
              minWidth: 0,
            }}
          >
            <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: faction.p1 }} />
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text variant="label-sm" color={role.onSurfaceVariant}>
                ROOM CODE
              </Text>
              <Text variant="headline-sm" color={role.primary} numeric>
                {roomCode(data.roomCode)}
              </Text>
            </View>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
            {/*
              Was "Copy", which copied the sample code above it — a code that
              matches no real room, so anyone sent it could never join. It now
              opens a real private room; the live code is shown, copyable and
              shareable, in the waiting room.
            */}
            <NeonButton
              label="Invite"
              icon="share"
              variant="glass"
              size="sm"
              onPress={() =>
                router.navigate({
                  pathname: '/match/private',
                  params: {
                    mode: 'create',
                    entryFee: data.tiers.find((t) => t.key === tier)?.amount ?? 0,
                  },
                })
              }
            />
            <IconButton
              icon="settings"
              size={32}
              iconSize={16}
              background={surface.containerLowest}
              accessibilityLabel="Room settings"
            />
          </View>
        </GlassSurface>

        {/* Stakes */}
        <GlassSurface style={{ padding: spacing.md, gap: spacing.sm }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              gap: spacing.sm,
            }}
          >
            <View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Icon name="casino" size={14} color={role.secondaryFixed} />
                <Text variant="label-sm" color={role.secondaryFixed}>
                  High Roller Stakes
                </Text>
              </View>
              <Text variant="headline-sm" color={role.onSurface} numeric>
                {thousands(data.entryFee)} Entry Fee
              </Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text variant="label-sm" color={role.primaryFixedDim}>
                Winner Takes
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Icon name="monetization_on" size={16} color={faction.p1} />
                <Text variant="headline-sm" color={faction.p1} numeric>
                  {thousands(data.winnerTakes)}
                </Text>
              </View>
            </View>
          </View>

          <View style={{ flexDirection: 'row', gap: spacing.xs }}>
            {data.tiers.map((t) => {
              const active = t.key === tier;
              return (
                <Pressable
                  key={t.key}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: active }}
                  accessibilityLabel={`${t.label} tier, ${t.amount}`}
                  onPress={() => {
                    haptics.select();
                    setTier(t.key);
                  }}
                  style={{
                    flex: 1,
                    paddingVertical: 6,
                    borderRadius: radii.lg,
                    alignItems: 'center',
                    backgroundColor: active
                      ? withAlpha(faction.p1, 0.2)
                      : withAlpha(surface.containerLowest, 0.6),
                  }}
                >
                  <Text variant="label-sm" color={active ? faction.p1 : role.onSurfaceVariant}>
                    {t.label}
                  </Text>
                  <Text variant="label-md" color={active ? role.primary : role.onSurface} numeric>
                    {thousands(t.amount)}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </GlassSurface>

        {/* Seats */}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
          {data.seats.map((seat) => (
            <SeatCard key={seat.slot} seat={seat} onInvite={() => haptics.light()} />
          ))}
        </View>

        {/* Voice dock */}
        <GlassSurface
          over="void"
          style={{
            padding: spacing.sm,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: spacing.sm,
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: spacing.xs,
              flex: 1,
              minWidth: 0,
            }}
          >
            <View
              style={{
                width: 32,
                height: 32,
                borderRadius: radii.lg,
                backgroundColor: surface.containerHigh,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Icon name="headset_mic" size={18} color={faction.p1} />
            </View>
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text variant="label-md" color={role.onSurface} numberOfLines={1}>
                Neon Audio Channel
              </Text>
              <Text variant="label-sm" color={faction.p1}>
                Connected (2 Speaking)
              </Text>
            </View>
          </View>

          <View style={{ flexDirection: 'row', gap: spacing.xs }}>
            <IconButton
              icon={muted ? 'mic_off' : 'mic'}
              size={36}
              iconSize={18}
              color={muted ? role.error : role.onSurface}
              background={muted ? withAlpha(role.error, 0.2) : surface.containerHigh}
              onPress={() => setMuted((m) => !m)}
              accessibilityLabel={muted ? 'Unmute microphone' : 'Mute microphone'}
            />
            <IconButton
              icon={deafened ? 'headset_off' : 'headphones'}
              size={36}
              iconSize={18}
              color={deafened ? role.error : role.onSurface}
              background={deafened ? withAlpha(role.error, 0.2) : surface.containerHigh}
              onPress={() => setDeafened((d) => !d)}
              accessibilityLabel={deafened ? 'Undeafen' : 'Deafen'}
            />
            <IconButton
              icon="mood"
              size={36}
              iconSize={18}
              color={role.secondaryFixed}
              accessibilityLabel="Emotes"
            />
          </View>
        </GlassSurface>

        {/* Soundboard */}
        <View style={{ gap: spacing.xs }}>
          <Text variant="label-sm" color={role.onSurfaceVariant}>
            Soundboard
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: spacing.xs, paddingRight: spacing.margin }}
            style={{ marginHorizontal: -spacing.margin, paddingHorizontal: spacing.margin }}
          >
            {data.soundboard.map((s) => (
              <Pressable
                key={s.id}
                accessibilityRole="button"
                accessibilityLabel={s.label}
                onPress={() => haptics.light()}
                style={({ pressed }) => ({
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 6,
                  paddingHorizontal: 10,
                  paddingVertical: 6,
                  borderRadius: radii.full,
                  backgroundColor: surface.container,
                  transform: [{ scale: pressed ? 0.94 : 1 }],
                })}
              >
                <Text variant="body-sm">{s.glyph}</Text>
                <Text variant="label-sm" color={role.onSurface}>
                  {s.label}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* Start */}
        <View style={{ gap: spacing.xs }}>
          <NeonButton
            label={`Start match (${filled}/4)`}
            icon="play_arrow"
            size="lg"
            fullWidth
            haptic="heavy"
            /*
             * Goes to a live, server-run match. The footer of this screen says
             * "public room, auto-fill active", which is exactly quick match:
             * Colyseus fills an open room before creating one, and the server
             * puts bots in any seat still empty at the start.
             *
             * The stake the player picked above is the entry fee, and
             * matchmaking filters on it — so a CASUAL player is never put in a
             * VIP room.
             */
            onPress={() =>
              router.navigate({
                pathname: '/match/live',
                params: {
                  mode: 'quick',
                  entryFee: data.tiers.find((t) => t.key === tier)?.amount ?? 0,
                },
              })
            }
          />
          {/*
            The other half of an invite. Quick match above pairs players by
            stake and only if they queue within the same window, so without a
            way to type a code you cannot arrange a game with a specific
            person at all.
          */}
          <NeonButton
            label="Join with code"
            icon="group_add"
            variant="glass"
            fullWidth
            onPress={() => router.navigate('/play/join')}
          />

          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingHorizontal: spacing.xs,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Icon name="lock_open" size={11} color={role.primaryFixedDim} />
              <Text variant="label-sm" color={role.onSurfaceVariant}>
                Public room, auto-fill active
              </Text>
            </View>
            <Pressable accessibilityRole="button" onPress={() => router.back()} hitSlop={8}>
              <Text variant="label-sm" color={role.error}>
                Leave Lounge
              </Text>
            </Pressable>
          </View>
        </View>
      </Screen>
    </>
  );
}

export default LobbyScreen;
