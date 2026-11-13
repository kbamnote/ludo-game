/**
 * Global Leaderboard — Stitch screen 9.
 *
 * Global / Friends / Weekly Cup tabs, league banner with a promotion-cutoff
 * marker, a three-tier podium with rank 1 raised and crowned, ranks 4-10 with a
 * cutoff divider, and a sticky "YOU" bar pinned to the bottom.
 *
 * The podium order is deliberately 2-1-3 so rank 1 sits centre and highest,
 * matching the design — the data is still sorted by rank.
 */
import { useMemo, useState } from 'react';
import { View } from 'react-native';
import { useQuery } from '@tanstack/react-query';

import { Screen, TAB_BAR_CLEARANCE } from '../../components/common/Screen';
import { AppHeader, HEADER_HEIGHT } from '../../components/common/AppHeader';
import { Text } from '../../components/common/Text';
import { StatPill } from '../../components/common/StatPill';
import { GlassSurface } from '../../components/common/GlassSurface';
import { SegmentedTabs } from '../../components/common/SegmentedTabs';
import { Avatar } from '../../components/common/Avatar';
import { CountdownTimer } from '../../components/common/CountdownTimer';
import { Icon } from '../../components/icons/Icon';
import { LoadingState, ErrorState } from '../../components/common/States';

import { api, queryKeys } from '../../services/sampleData';
import { useUserStore } from '../../store/useUserStore';
import { compactNumber, thousands, percent } from '../../utils/format';
import { faction, role, surface, withAlpha } from '../../theme/colors';
import { radii, spacing } from '../../theme/spacing';
import { glow } from '../../theme/effects';

const PODIUM = {
  1: { height: 128, avatar: 80, accent: 'p1', label: 'CHAMPION', lift: -32 },
  2: { height: 96, avatar: 64, accent: 'p2', label: 'SILVER', lift: 0 },
  3: { height: 80, avatar: 64, accent: 'p3', label: 'BRONZE', lift: 0 },
};

function PodiumColumn({ row }) {
  const cfg = PODIUM[row.rank];
  const accent = faction[cfg.accent];
  const isFirst = row.rank === 1;

  return (
    <View style={{ flex: 1, alignItems: 'center', marginTop: cfg.lift }}>
      <View style={{ alignItems: 'center', marginBottom: spacing.xs }}>
        {isFirst ? (
          <Icon name="crown" size={24} color={faction.p1} style={{ marginBottom: -6 }} />
        ) : (
          <View
            style={{
              width: 28,
              height: 28,
              borderRadius: 14,
              backgroundColor: surface.containerHighest,
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: -8,
              zIndex: 2,
            }}
          >
            <Icon
              name={row.rank === 2 ? 'workspace_premium' : 'military_tech'}
              size={16}
              color={accent}
            />
          </View>
        )}

        <View style={isFirst ? glow.primaryStrong : null}>
          <Avatar source={row.avatar} size={cfg.avatar} faction={cfg.accent} ringWidth={3} />
        </View>

        <View
          style={{
            marginTop: -10,
            paddingHorizontal: 8,
            borderRadius: radii.full,
            backgroundColor: isFirst ? faction.p1 : surface.containerLowest,
          }}
        >
          <Text variant="headline-sm" color={isFirst ? role.onPrimaryContainer : accent} numeric>
            {isFirst ? '#1' : row.rank}
          </Text>
        </View>

        <Text
          variant="headline-sm"
          color={isFirst ? role.primary : role.onSurface}
          align="center"
          numberOfLines={1}
          style={{ marginTop: 6, width: 88 }}
        >
          {row.name}
        </Text>

        {isFirst ? (
          <StatPill
            label={`${thousands(row.rp)} RP`}
            icon="local_fire_department"
            color={faction.p1}
            size="sm"
          />
        ) : (
          <Text variant="label-sm" color={accent} numeric>
            {thousands(row.rp)} RP
          </Text>
        )}
      </View>

      <View
        style={{
          width: '100%',
          height: cfg.height,
          borderTopLeftRadius: radii.xl,
          borderTopRightRadius: radii.xl,
          backgroundColor: isFirst ? surface.containerHigh : surface.container,
          alignItems: 'center',
          paddingTop: spacing.sm,
        }}
      >
        <Text variant="headline-lg" color={isFirst ? faction.p1 : withAlpha(accent, 0.4)} numeric>
          {row.rank}
        </Text>
        <Text variant="label-sm" color={isFirst ? role.primaryFixed : role.onSurfaceVariant}>
          {cfg.label}
        </Text>
      </View>
    </View>
  );
}

function RankRow({ row, highlight }) {
  return (
    <GlassSurface
      over={highlight ? 'containerHigh' : 'void'}
      style={{
        padding: spacing.sm + 4,
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
      }}
    >
      <Text
        variant="headline-sm"
        color={role.onSurfaceVariant}
        numeric
        style={{ width: 24, textAlign: 'center' }}
      >
        {row.rank}
      </Text>

      <Avatar
        source={row.avatar}
        size={40}
        faction={row.faction}
        ringWidth={2}
        status={row.verified ? 'online' : undefined}
      />

      <View style={{ flex: 1, minWidth: 0 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Text variant="body-lg" color={role.onSurface} numberOfLines={1}>
            {row.name}
          </Text>
          {row.badge ? <StatPill label={row.badge} color={role.primaryFixedDim} size="sm" /> : null}
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          {row.streak >= 3 ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
              <Icon name="local_fire_department" size={11} color={faction.p1} />
              <Text variant="label-sm" color={faction.p1}>
                {row.streak} Streak
              </Text>
            </View>
          ) : (
            <Text variant="label-sm" color={role.onSurfaceVariant}>
              {row.streak} Streak
            </Text>
          )}
          <Text variant="label-sm" color={role.onSurfaceVariant}>
            •
          </Text>
          <Text variant="label-sm" color={role.onSurfaceVariant} numeric>
            {percent(row.winRate, 0)} WR
          </Text>
        </View>
      </View>

      <View style={{ alignItems: 'flex-end' }}>
        <Text variant="headline-sm" color={role.primary} numeric>
          {thousands(row.rp)}
        </Text>
        <Text variant="label-sm" color={role.onSurfaceVariant}>
          RP
        </Text>
      </View>
    </GlassSurface>
  );
}

export function LeaderboardScreen() {
  const user = useUserStore();
  const [tab, setTab] = useState('global');

  const { data, isPending, isError, refetch } = useQuery({
    queryKey: queryKeys.leaderboard,
    queryFn: api.getLeaderboard,
  });

  const rows = useMemo(() => {
    if (!data) return [];
    if (tab === 'friends') return data.rows.filter((r) => [2, 4, 7].includes(r.rank));
    if (tab === 'weekly') return [...data.rows].slice(0, 6);
    return data.rows;
  }, [data, tab]);

  const header = (
    <AppHeader
      title="Leaderboard"
      subtitle={`LVL ${user.level}`}
      coins={compactNumber(user.coins)}
      gems={thousands(user.gems)}
      avatarSource={user.avatar}
      avatarFaction={user.faction}
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
          <LoadingState label="Loading rankings" />
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
          <ErrorState message="Could not load the leaderboard." onRetry={refetch} />
        </Screen>
      </>
    );
  }

  const podium = rows.filter((r) => r.rank <= 3);
  const rest = rows.filter((r) => r.rank > 3);
  const { league } = data;

  return (
    <>
      {header}
      <Screen
        scroll
        edges={{ top: false, bottom: false }}
        contentContainerStyle={{
          paddingTop: HEADER_HEIGHT + spacing.lg,
          paddingBottom: TAB_BAR_CLEARANCE + 96,
          gap: spacing.md,
        }}
        glows={[
          { color: faction.p4, size: 320, top: -60, right: -80 },
          { color: faction.p2, size: 240, top: 420, left: -70 },
        ]}
      >
        <SegmentedTabs
          items={[
            { key: 'global', label: 'GLOBAL' },
            { key: 'friends', label: 'FRIENDS' },
            { key: 'weekly', label: 'WEEKLY CUP' },
          ]}
          value={tab}
          onChange={setTab}
        />

        {/* League banner */}
        <GlassSurface over="void" style={{ padding: spacing.md, gap: spacing.xs }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: spacing.sm,
            }}
          >
            <View
              style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1, minWidth: 0 }}
            >
              <Icon name="military_tech" size={18} color={faction.p2} />
              <Text variant="headline-sm" color={role.secondary} numberOfLines={1}>
                {league.name}
              </Text>
              <StatPill label={league.tier} color={role.secondaryFixed} size="sm" />
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Icon name="timer" size={11} color={role.primaryFixedDim} />
              <CountdownTimer
                seconds={league.endsInSeconds}
                format="short"
                color={role.onSurface}
                variant="label-sm"
              />
            </View>
          </View>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 }}>
            <Text variant="label-sm" color={role.onSurfaceVariant}>
              PROMOTION ZONE
            </Text>
            <Text variant="label-sm" color={faction.p1}>
              {league.promotionText}
            </Text>
          </View>

          {/* Progress with the cutoff marker */}
          <View
            style={{
              height: 8,
              borderRadius: radii.full,
              backgroundColor: surface.containerLowest,
              overflow: 'hidden',
            }}
          >
            <View
              style={{
                width: `${league.progress * 100}%`,
                height: '100%',
                borderRadius: radii.full,
                backgroundColor: faction.p1,
              }}
            />
            <View
              style={{
                position: 'absolute',
                left: `${league.cutoffMarker * 100}%`,
                top: 0,
                bottom: 0,
                width: 2,
                backgroundColor: surface.bright,
              }}
            />
          </View>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text variant="label-sm" color={role.onSurfaceVariant} numeric>
              Cutoff: {thousands(league.cutoff)} RP
            </Text>
            <Text variant="label-sm" color={role.primaryFixedDim} numeric>
              You: +{thousands(league.safeBy)} safe
            </Text>
          </View>
        </GlassSurface>

        {/* Podium — rendered 2 / 1 / 3 so the champion sits centre and highest */}
        {podium.length === 3 ? (
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'flex-end',
              gap: spacing.xs,
              paddingTop: spacing.xl,
            }}
          >
            <PodiumColumn row={podium[1]} />
            <PodiumColumn row={podium[0]} />
            <PodiumColumn row={podium[2]} />
          </View>
        ) : null}

        {/* Contenders */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: 4,
          }}
        >
          <Text variant="label-md" color={role.onSurfaceVariant}>
            Top Contenders
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
            <Icon name="bolt" size={11} color={role.primaryFixedDim} />
            <Text variant="label-sm" color={role.primaryFixedDim}>
              LIVE UPDATES
            </Text>
          </View>
        </View>

        <View style={{ gap: spacing.xs }}>
          {rest.map((row, i) => (
            <View key={row.rank}>
              <RankRow row={row} highlight={row.rank <= 5} />
              {/* Promotion cutoff divider, after rank 5 */}
              {row.rank === 5 && rest[i + 1] ? (
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: spacing.sm,
                    marginVertical: spacing.sm,
                  }}
                >
                  <View style={{ flex: 1, height: 2, backgroundColor: surface.containerHighest }} />
                  <Text variant="label-sm" color={role.primaryFixedDim}>
                    Master Promotion Cutoff
                  </Text>
                  <View style={{ flex: 1, height: 2, backgroundColor: surface.containerHighest }} />
                </View>
              ) : null}
            </View>
          ))}
        </View>
      </Screen>

      {/* Sticky YOU bar */}
      <View
        pointerEvents="box-none"
        style={{
          position: 'absolute',
          left: spacing.margin,
          right: spacing.margin,
          bottom: TAB_BAR_CLEARANCE + spacing.xs,
          zIndex: 40,
        }}
      >
        <GlassSurface
          over="containerHigh"
          radius={radii.xxl}
          elevation="lg"
          style={{ padding: 14, flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}
        >
          <View
            style={{
              width: 40,
              height: 40,
              borderRadius: radii.lg,
              backgroundColor: surface.containerLowest,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text variant="headline-sm" color={faction.p1} numeric>
              #{user.globalRank}
            </Text>
          </View>

          <Avatar source={user.avatar} size={40} faction={user.faction} ringWidth={2} online />

          <View style={{ flex: 1, minWidth: 0 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text variant="body-lg" color={role.primary}>
                YOU
              </Text>
              <StatPill label={`LVL ${user.level}`} color={role.primaryFixedDim} tinted size="sm" />
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
              <Icon name="arrow_upward" size={11} color={role.primaryFixed} />
              <Text variant="label-sm" color={role.primaryFixed}>
                +120 RP from last match
              </Text>
            </View>
          </View>

          <View style={{ alignItems: 'flex-end' }}>
            <Text variant="headline-sm" color={faction.p1} numeric>
              {thousands(user.rankPoints)}
            </Text>
            <Text variant="label-sm" color={role.onSurfaceVariant}>
              CURRENT RP
            </Text>
          </View>
        </GlassSurface>
      </View>
    </>
  );
}

export default LeaderboardScreen;
