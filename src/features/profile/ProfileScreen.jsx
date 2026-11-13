/**
 * Profile & Achievements — Stitch screen 8.
 *
 * Identity card, rank/ELO/crew ribbon, segment tabs, a 2x2 analytics bento
 * with an SVG radial win-rate, the badges rail and the equipped loadout.
 *
 * The radial is drawn with react-native-svg rather than Skia: it is a static
 * stroked arc, and Skia would mean a canvas per card for no gain.
 */
import { useState } from 'react';
import { View, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import Svg, { Circle } from 'react-native-svg';

import { Screen } from '../../components/common/Screen';
import { AppHeader, HEADER_HEIGHT } from '../../components/common/AppHeader';
import { Text } from '../../components/common/Text';
import { StatPill } from '../../components/common/StatPill';
import { GlassSurface } from '../../components/common/GlassSurface';
import { SegmentedTabs } from '../../components/common/SegmentedTabs';
import { SectionHeader } from '../../components/common/SectionHeader';
import { Avatar } from '../../components/common/Avatar';
import { NeonButton } from '../../components/buttons/NeonButton';
import { IconButton } from '../../components/buttons/IconButton';
import { Icon } from '../../components/icons/Icon';
import { StatCard } from '../../components/cards/Cards';
import { LoadingState, ErrorState } from '../../components/common/States';

import { api, queryKeys } from '../../services/sampleData';
import { useUserStore } from '../../store/useUserStore';
import { compactNumber, thousands, percent } from '../../utils/format';
import { faction, role, surface, withAlpha } from '../../theme/colors';
import { radii, spacing } from '../../theme/spacing';

/** Circular progress arc. */
function RadialStat({ value, size = 56, stroke = 5, color = faction.p1, label }) {
  const r = (size - stroke) / 2;
  const circumference = 2 * Math.PI * r;

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg
        width={size}
        height={size}
        style={{ position: 'absolute', transform: [{ rotate: '-90deg' }] }}
      >
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={surface.containerHighest}
          strokeWidth={stroke}
          fill="none"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${circumference * value} ${circumference}`}
          fill="none"
        />
      </Svg>
      <Text variant="label-sm" color={role.primary} numeric>
        {label}
      </Text>
    </View>
  );
}

export function ProfileScreen() {
  const router = useRouter();
  const user = useUserStore();
  const [tab, setTab] = useState('overview');

  const { data, isPending, isError, refetch } = useQuery({
    queryKey: queryKeys.profile,
    queryFn: api.getProfile,
  });

  const header = (
    <AppHeader
      title="Profile"
      subtitle={`LVL ${user.level}`}
      coins={compactNumber(user.coins)}
      gems={thousands(user.gems)}
      avatarSource={user.avatar}
      avatarFaction={user.faction}
      right={
        <IconButton
          icon="settings"
          size={32}
          iconSize={16}
          background="transparent"
          onPress={() => router.navigate('/profile/settings')}
          accessibilityLabel="Settings"
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
          <LoadingState label="Loading profile" />
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
          <ErrorState message="Could not load your profile." onRetry={refetch} />
        </Screen>
      </>
    );
  }

  const { player, badges, badgeProgress, loadout } = data;
  const s = player.stats;

  return (
    <>
      {header}
      <Screen
        scroll
        tabBarClearance
        edges={{ top: false, bottom: false }}
        contentContainerStyle={{ paddingTop: HEADER_HEIGHT + spacing.lg, gap: spacing.lg }}
        glows={[
          { color: faction.p1, size: 300, top: -50, left: -70 },
          { color: faction.p3, size: 240, top: 480, right: -80 },
        ]}
      >
        {/* Identity */}
        <GlassSurface over="void" style={{ padding: spacing.md, gap: spacing.md }}>
          <View style={{ flexDirection: 'row', gap: spacing.md }}>
            <View>
              <View
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: radii.xl,
                  overflow: 'hidden',
                  backgroundColor: surface.containerHighest,
                  borderWidth: 2,
                  borderColor: faction[player.faction],
                }}
              >
                <Avatar source={player.avatar} size={76} ringWidth={0} />
              </View>
              <View
                style={{
                  position: 'absolute',
                  bottom: -4,
                  right: -4,
                  paddingHorizontal: 6,
                  borderRadius: radii.full,
                  backgroundColor: faction.p1,
                }}
              >
                <Text variant="label-sm" color={role.onPrimaryContainer}>
                  LIVE
                </Text>
              </View>
            </View>

            <View style={{ flex: 1, minWidth: 0, gap: 4 }}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: spacing.xs,
                }}
              >
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 6,
                    flex: 1,
                    minWidth: 0,
                  }}
                >
                  <Text variant="headline-sm" color={role.primary} numberOfLines={1}>
                    {player.displayName}
                  </Text>
                  <Icon name="verified" size={14} color={role.secondaryFixed} />
                </View>
                <IconButton
                  icon="edit"
                  size={32}
                  iconSize={14}
                  onPress={() => router.navigate('/profile/avatar')}
                  accessibilityLabel="Edit avatar"
                />
              </View>

              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs }}>
                <StatPill
                  label={`[${player.clan}]`}
                  icon="shield"
                  color={role.secondaryFixed}
                  size="sm"
                />
                <StatPill
                  label={player.vipTier}
                  icon="hotel_class"
                  color={role.tertiaryFixed}
                  tinted
                  size="sm"
                />
              </View>

              <Text variant="body-sm" color={role.onSurfaceVariant} numberOfLines={1}>
                &ldquo;{player.tagline}&rdquo;
              </Text>
            </View>
          </View>

          {/* Status ribbon */}
          <View
            style={{
              flexDirection: 'row',
              padding: spacing.sm,
              borderRadius: radii.lg,
              backgroundColor: withAlpha(surface.containerLowest, 0.6),
            }}
          >
            {[
              { label: 'GLOBAL RANK', value: `#${player.globalRank}`, color: role.primaryFixedDim },
              { label: 'LUDO ELO', value: thousands(player.elo), color: role.secondaryFixed },
              { label: 'NIGHT CREW', value: 'TOP 1%', color: role.tertiaryFixedDim },
            ].map((item) => (
              <View key={item.label} style={{ flex: 1, alignItems: 'center' }}>
                <Text variant="label-sm" color={role.onSurfaceVariant}>
                  {item.label}
                </Text>
                <Text variant="headline-sm" color={item.color} numeric>
                  {item.value}
                </Text>
              </View>
            ))}
          </View>
        </GlassSurface>

        <SegmentedTabs
          items={[
            { key: 'overview', label: 'Overview' },
            { key: 'log', label: 'Battle Log' },
            { key: 'trophies', label: 'Trophies' },
            { key: 'clan', label: 'Clan' },
          ]}
          value={tab}
          onChange={setTab}
        />

        {/* Analytics bento */}
        <View style={{ gap: spacing.sm }}>
          <SectionHeader
            title="Match Analytics"
            adornment={<Icon name="query_stats" size={16} color={faction.p1} />}
            actionLabel="Season 4 • After Dark"
            actionColor={role.onSurfaceVariant}
          />

          <View style={{ flexDirection: 'row', gap: spacing.sm }}>
            <StatCard
              label="Win Rate"
              icon="trending_up"
              iconColor={role.primaryFixedDim}
              caption={`+${percent(s.weekDelta)} this week`}
            >
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: spacing.sm,
                  marginVertical: 4,
                }}
              >
                <RadialStat value={s.winRate} label={percent(s.winRate, 0)} />
                <View>
                  <Text variant="headline-md" color={role.primary} numeric>
                    {percent(s.winRate)}
                  </Text>
                  <Text variant="body-sm" color={role.primaryFixedDim}>
                    High Rolling
                  </Text>
                </View>
              </View>
            </StatCard>

            <StatCard
              label="Total Matches"
              icon="stadia_controller"
              iconColor={faction.p2}
              value={thousands(s.totalMatches)}
              valueColor={role.secondaryFixed}
              caption={`${s.victories} Victories`}
            >
              <View style={{ marginVertical: 4 }}>
                <Text variant="headline-lg" color={role.secondaryFixed} numeric>
                  {s.totalMatches}
                </Text>
                <Text variant="body-sm" color={role.onSurfaceVariant}>
                  {s.victories} Victories
                </Text>
                <View
                  style={{
                    height: 6,
                    borderRadius: 3,
                    backgroundColor: surface.containerHighest,
                    marginTop: 6,
                    overflow: 'hidden',
                  }}
                >
                  <View
                    style={{
                      width: `${s.winRate * 100}%`,
                      height: '100%',
                      backgroundColor: faction.p2,
                    }}
                  />
                </View>
              </View>
            </StatCard>
          </View>

          <View style={{ flexDirection: 'row', gap: spacing.sm }}>
            <StatCard
              label="Knockouts"
              icon="skull"
              iconColor={role.error}
              value={thousands(s.knockouts)}
              caption={`Avg ${s.knockoutsPerMatch} / match`}
            />
            <StatCard
              label="Flawless"
              icon="bolt"
              iconColor={role.primaryFixedDim}
              value={s.flawless}
              valueColor={role.primaryFixed}
              caption={`Rank #${s.flawlessRank} Leaderboard`}
            />
          </View>
        </View>

        {/* Badges */}
        <View style={{ gap: spacing.sm }}>
          <SectionHeader
            title="Badges & Feats"
            adornment={<Icon name="military_tech" size={16} color={role.secondaryFixed} />}
            actionLabel={`${badgeProgress.unlocked}/${badgeProgress.total} UNLOCKED`}
            actionColor={role.secondaryFixedDim}
          />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: spacing.sm, paddingRight: spacing.margin }}
            style={{ marginHorizontal: -spacing.margin, paddingHorizontal: spacing.margin }}
          >
            {badges.map((b) => (
              <GlassSurface
                key={b.id}
                style={{ width: 112, padding: 12, alignItems: 'center', gap: 4 }}
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
                  <Icon name={b.icon} size={24} color={faction[b.accent]} />
                </View>
                <Text variant="label-md" color={role.onSurface} align="center" numberOfLines={1}>
                  {b.name}
                </Text>
                <Text variant="label-sm" color={role.onSurfaceVariant} align="center">
                  {b.detail}
                </Text>
              </GlassSurface>
            ))}
          </ScrollView>
        </View>

        {/* Loadout */}
        <View style={{ gap: spacing.sm }}>
          <SectionHeader
            title="Equipped Loadout"
            adornment={<Icon name="style" size={16} color={faction.p1} />}
            actionLabel="INVENTORY"
            actionIcon="arrow_forward"
            actionColor={faction.p1}
            onAction={() => router.navigate('/profile/avatar')}
          />
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
            {loadout.map((item) => (
              <GlassSurface
                key={item.id}
                style={{
                  width: '48%',
                  flexGrow: 1,
                  padding: spacing.sm,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: spacing.sm,
                }}
              >
                <View
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: radii.lg,
                    backgroundColor: surface.containerHigh,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Icon name={item.icon} size={20} color={faction[item.accent]} />
                </View>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text variant="label-md" color={role.onSurface} numberOfLines={1}>
                    {item.name}
                  </Text>
                  <Text variant="label-sm" color={faction[item.accent]} numberOfLines={1}>
                    {item.rarity}
                  </Text>
                </View>
              </GlassSurface>
            ))}
          </View>
        </View>

        {/* CTA */}
        <GlassSurface
          over="containerHigh"
          style={{
            padding: spacing.md,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: spacing.sm,
          }}
        >
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text variant="label-sm" color={role.primaryFixedDim}>
              READY FOR BATTLE
            </Text>
            <Text variant="headline-sm" color={role.primary} numberOfLines={1}>
              Start Midnight 1v1
            </Text>
          </View>
          <NeonButton
            label="Challenge"
            iconRight="swords"
            onPress={() => router.navigate('/play')}
            haptic="medium"
          />
        </GlassSurface>

        <Pressable
          accessibilityRole="button"
          onPress={() => router.navigate('/_dev')}
          style={{ alignItems: 'center', paddingVertical: spacing.sm }}
        >
          <Text variant="label-sm" color={role.outline}>
            DEV · COMPONENT GALLERY
          </Text>
        </Pressable>
      </Screen>
    </>
  );
}

export default ProfileScreen;
