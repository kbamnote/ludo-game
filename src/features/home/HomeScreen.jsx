/**
 * Home Dashboard — Stitch screen 5.
 *
 * Sections, in design order: live winner marquee, hero tournament card with a
 * running countdown, 2x2 arena grid, online-crew rail, daily bounties.
 *
 * Data comes through TanStack Query against the sample API, so loading and
 * error states are real rather than decorative, and Phase 3/5 can swap the
 * fetcher without touching this file.
 */
import { View, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Image } from 'expo-image';

import { Screen } from '../../components/common/Screen';
import { AppHeader, HEADER_HEIGHT } from '../../components/common/AppHeader';
import { Text } from '../../components/common/Text';
import { StatPill } from '../../components/common/StatPill';
import { GlassSurface } from '../../components/common/GlassSurface';
import { SectionHeader, LiveDot } from '../../components/common/SectionHeader';
import { Avatar, AvatarStack } from '../../components/common/Avatar';
import { ProgressBar } from '../../components/common/ProgressBar';
import { CountdownTimer } from '../../components/common/CountdownTimer';
import { NeonButton } from '../../components/buttons/NeonButton';
import { Icon } from '../../components/icons/Icon';
import { Marquee } from '../../components/animations/Marquee';
import { BloomCard } from '../../components/cards/Cards';
import { LoadingState, ErrorState } from '../../components/common/States';

import { api, queryKeys } from '../../services/sampleData';
import { useUserStore } from '../../store/useUserStore';
import { useHaptics } from '../../hooks/useHaptics';
import { compactNumber, thousands } from '../../utils/format';
import { faction, role, surface, withAlpha } from '../../theme/colors';
import { radii, spacing } from '../../theme/spacing';

function TickerStrip({ items }) {
  return (
    <GlassSurface
      over="void"
      radius={radii.full}
      elevation="sm"
      highlight={false}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
        paddingHorizontal: spacing.md,
        paddingVertical: 6,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
        <Icon name="bolt" size={14} color={faction.p1} />
        <Text variant="label-sm" color={faction.p1}>
          LIVE ARENA
        </Text>
      </View>

      <Marquee style={{ flex: 1 }} speed={46}>
        {items.map((item) => (
          <View
            key={item.id}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingRight: spacing.lg }}
          >
            <Text variant="body-sm" color={role.onSurface}>
              {item.player}
            </Text>
            <Text variant="body-sm" color={role.onSurfaceVariant}>
              {item.text}
            </Text>
            <Text variant="body-sm" color={role.secondaryFixed}>
              {item.arena}
            </Text>
            <Text variant="body-sm" color={faction.p1}>
              {item.reward}
            </Text>
          </View>
        ))}
      </Marquee>

      <LiveDot size={8} />
    </GlassSurface>
  );
}

function HeroEventCard({ event, onPlay }) {
  return (
    <View
      style={{
        borderRadius: radii.xl,
        overflow: 'hidden',
        backgroundColor: surface.containerLow,
      }}
    >
      {/* Ambient art. The design composites this with mix-blend-screen; a low
          opacity over the near-black surface reads the same and is cheaper. */}
      <Image
        source={event.background}
        style={{ position: 'absolute', width: '100%', height: '100%', opacity: 0.4 }}
        contentFit="cover"
        transition={260}
        accessible={false}
      />
      <View
        style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: withAlpha(surface.containerLowest, 0.55),
        }}
      />

      <View style={{ padding: spacing.lg, gap: spacing.md }}>
        <View
          style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
        >
          <StatPill label={event.tag} icon="track_changes" color={faction.p1} size="sm" />
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 4,
              paddingHorizontal: spacing.sm,
              paddingVertical: 4,
              borderRadius: radii.full,
              backgroundColor: withAlpha(surface.containerLowest, 0.85),
            }}
          >
            <Icon name="timer" size={12} color={role.error} />
            <CountdownTimer seconds={event.endsInSeconds} format="hms" color={role.error} />
          </View>
        </View>

        <View>
          <Text variant="label-sm" color={role.onSurfaceVariant}>
            {event.kicker}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
            <Text variant="headline-lg" color={role.onSurface}>
              {event.title}
            </Text>
            <StatPill
              label={event.season}
              color={role.onPrimaryContainer}
              background={faction.p1}
              size="sm"
            />
          </View>
          <View
            style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginTop: 4 }}
          >
            <Text variant="body-sm" color={role.onSurfaceVariant}>
              Grand Pool:
            </Text>
            <Icon name="monetization_on" size={16} color={role.secondaryFixed} />
            <Text variant="headline-sm" color={role.secondary} numeric>
              {thousands(event.prizePool)} Coins
            </Text>
          </View>
        </View>

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: spacing.sm,
          }}
        >
          <AvatarStack
            items={event.participants}
            size={32}
            overflowCount={event.extraParticipants}
          />
          <NeonButton label="Play now" iconRight="play_arrow" onPress={onPlay} haptic="medium" />
        </View>
      </View>
    </View>
  );
}

function ArenaCard({ arena, onPress }) {
  const accent = faction[arena.accent];

  return (
    <BloomCard accent={arena.accent} onPress={onPress} style={{ flex: 1, gap: spacing.sm }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View
          style={{
            width: 40,
            height: 40,
            borderRadius: radii.lg,
            backgroundColor: surface.containerHigh,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon name={arena.icon} size={20} color={accent} />
        </View>
        <StatPill label={arena.badge} color={accent} tinted size="sm" />
      </View>

      <View>
        <Text variant="headline-sm" color={role.onSurface}>
          {arena.title}
        </Text>
        <Text variant="body-sm" color={role.onSurfaceVariant} numberOfLines={1}>
          {arena.subtitle}
        </Text>
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <Icon name={arena.entryIcon ?? 'monetization_on'} size={12} color={role.secondaryFixed} />
          <Text variant="label-sm" color={role.secondaryFixed} numeric>
            {arena.entryLabel ?? `${thousands(arena.entry)} entry`}
          </Text>
        </View>
        <Icon name="arrow_forward" size={14} color={role.onSurfaceVariant} />
      </View>
    </BloomCard>
  );
}

function CrewCard({ member, onPress }) {
  return (
    <GlassSurface style={{ width: 112, padding: spacing.sm, gap: 6, alignItems: 'center' }}>
      <Avatar source={member.avatar} size={48} faction={member.faction} status={member.state} />
      <View style={{ alignItems: 'center', width: '100%' }}>
        <Text variant="label-md" color={role.onSurface} numberOfLines={1}>
          {member.name}
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
          {member.state === 'inVoice' ? (
            <Icon name="graphic_eq" size={10} color={faction.p1} />
          ) : null}
          <Text
            variant="label-sm"
            color={member.state === 'inVoice' ? role.primaryFixedDim : role.onSurfaceVariant}
            numberOfLines={1}
          >
            {member.status}
          </Text>
        </View>
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${member.action} ${member.name}`}
        onPress={onPress}
        style={{
          width: '100%',
          paddingVertical: 4,
          borderRadius: radii.base,
          alignItems: 'center',
          backgroundColor: withAlpha(faction[member.faction], 0.2),
        }}
      >
        <Text variant="label-sm" color={faction[member.faction]}>
          {member.action}
        </Text>
      </Pressable>
    </GlassSurface>
  );
}

function BountyCard({ bounty, onClaim }) {
  const accent = faction[bounty.accent];

  return (
    <GlassSurface style={{ padding: spacing.md, gap: spacing.sm }}>
      <View
        style={{
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
            gap: spacing.sm,
            flex: 1,
            minWidth: 0,
          }}
        >
          <View
            style={{
              width: 36,
              height: 36,
              borderRadius: radii.lg,
              backgroundColor: surface.containerHigh,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon name={bounty.icon} size={18} color={accent} />
          </View>
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text variant="body-lg" color={role.onSurface} numberOfLines={1}>
              {bounty.title}
            </Text>
            <Text variant="body-sm" color={role.onSurfaceVariant} numberOfLines={1}>
              {bounty.subtitle}
            </Text>
          </View>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <Icon
            name={bounty.reward.kind === 'gems' ? 'diamond' : 'monetization_on'}
            size={14}
            color={bounty.reward.kind === 'gems' ? faction.p2 : role.secondaryFixed}
          />
          <Text variant="label-md" color={role.secondaryFixed} numeric>
            +{thousands(bounty.reward.amount)}
          </Text>
        </View>
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
        <ProgressBar progress={bounty.progress} color={accent} style={{ flex: 1 }} height={8} />
        {bounty.claimable ? (
          <NeonButton label="Claim" size="sm" onPress={() => onClaim(bounty)} />
        ) : (
          <Text variant="label-md" color={role.onSurfaceVariant} numeric>
            {bounty.current} / {bounty.target}
          </Text>
        )}
      </View>
    </GlassSurface>
  );
}

export function HomeScreen() {
  const router = useRouter();
  const haptics = useHaptics();
  const user = useUserStore();
  const addCoins = useUserStore((s) => s.addCoins);

  const { data, isPending, isError, refetch } = useQuery({
    queryKey: queryKeys.home,
    queryFn: api.getHome,
  });

  const header = (
    <AppHeader
      title="Home"
      subtitle={`LVL ${user.level}`}
      coins={compactNumber(user.coins)}
      gems={thousands(user.gems)}
      avatarSource={user.avatar}
      avatarFaction={user.faction}
      onPressAvatar={() => router.navigate('/profile')}
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
          <LoadingState label="Loading arena" />
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
          <ErrorState message="Could not reach the arena." onRetry={refetch} />
        </Screen>
      </>
    );
  }

  const claim = (bounty) => {
    haptics.success();
    addCoins(bounty.reward.kind === 'coins' ? bounty.reward.amount : 0);
  };

  return (
    <>
      {header}
      <Screen
        scroll
        tabBarClearance
        edges={{ top: false, bottom: false }}
        contentContainerStyle={{ paddingTop: HEADER_HEIGHT + spacing.lg, gap: spacing.lg }}
        glows={[
          { color: faction.p1, size: 320, top: -40, left: -80 },
          { color: faction.p2, size: 280, top: 420, right: -90 },
        ]}
      >
        <TickerStrip items={data.ticker} />

        <HeroEventCard event={data.event} onPlay={() => router.navigate('/play')} />

        {/* Arena grid */}
        <View style={{ gap: spacing.xs }}>
          <SectionHeader
            title="SELECT ARENA"
            actionLabel="4 MODES ONLINE"
            actionColor={role.primaryFixedDim}
          />
          <View style={{ flexDirection: 'row', gap: spacing.sm }}>
            <ArenaCard arena={data.arenas[0]} onPress={() => router.navigate('/play')} />
            <ArenaCard arena={data.arenas[1]} onPress={() => router.navigate('/play')} />
          </View>
          <View style={{ flexDirection: 'row', gap: spacing.sm }}>
            <ArenaCard arena={data.arenas[2]} onPress={() => router.navigate('/play')} />
            <ArenaCard arena={data.arenas[3]} onPress={() => router.navigate('/play')} />
          </View>
        </View>

        {/* Online crew */}
        <View style={{ gap: spacing.xs }}>
          <SectionHeader
            title="ONLINE CREW"
            adornment={<LiveDot />}
            actionLabel={`VIEW ALL (${data.crew.length + 11})`}
            onAction={() => router.navigate('/friends')}
          />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: spacing.sm, paddingRight: spacing.margin }}
            style={{ marginHorizontal: -spacing.margin, paddingHorizontal: spacing.margin }}
          >
            {data.crew.map((m) => (
              <CrewCard key={m.id} member={m} onPress={() => router.navigate('/friends')} />
            ))}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Find crew"
              onPress={() => router.navigate('/friends')}
              style={{
                width: 112,
                padding: spacing.sm,
                borderRadius: radii.xl,
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                backgroundColor: withAlpha(surface.container, 0.6),
              }}
            >
              <View
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: radii.full,
                  backgroundColor: surface.containerHigh,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Icon name="person_add" size={24} color={faction.p1} />
              </View>
              <Text variant="label-md" color={role.onSurface}>
                Find Crew
              </Text>
              <Text variant="label-sm" color={faction.p1}>
                + CONNECT
              </Text>
            </Pressable>
          </ScrollView>
        </View>

        {/* Daily bounties */}
        <View style={{ gap: spacing.xs }}>
          <SectionHeader
            title="DAILY BOUNTIES"
            adornment={<StatPill label="RESET 8H" color={role.primaryFixedDim} size="sm" />}
            actionLabel="CLAIM ALL"
            onAction={() => haptics.success()}
          />
          <View style={{ gap: spacing.xs }}>
            {data.bounties.map((b) => (
              <BountyCard key={b.id} bounty={b} onClaim={claim} />
            ))}
          </View>
        </View>
      </Screen>
    </>
  );
}

export default HomeScreen;
