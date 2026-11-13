/**
 * Dev gallery — every primitive on one screen.
 *
 * Reachable at /_dev. This is the Phase 1 exit criterion: if everything here
 * renders correctly at 360 / 390 / 430pt, the foundation is sound and Phase 2
 * can compose screens from it with confidence.
 *
 * Not shipped: excluded from the production bundle in Phase 8.
 */
import { useState } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';

import { Screen } from '../src/components/common/Screen';
import { Text } from '../src/components/common/Text';
import { GlassSurface } from '../src/components/common/GlassSurface';
import { SectionHeader } from '../src/components/common/SectionHeader';
import { StatPill, CurrencyChip } from '../src/components/common/StatPill';
import { Avatar, AvatarStack } from '../src/components/common/Avatar';
import { ProgressBar, NeonProgressBar } from '../src/components/common/ProgressBar';
import { SegmentedTabs } from '../src/components/common/SegmentedTabs';
import { CountdownTimer } from '../src/components/common/CountdownTimer';
import { LoadingState, EmptyState, ErrorState, Skeleton } from '../src/components/common/States';
import { NeonButton } from '../src/components/buttons/NeonButton';
import { IconButton } from '../src/components/buttons/IconButton';
import { WaveformBars } from '../src/components/animations/WaveformBars';
import { Icon, iconNames } from '../src/components/icons/Icon';

import { images } from '../src/assets/images';
import { faction, role, surface } from '../src/theme/colors';
import { spacing, radii } from '../src/theme/spacing';
import { textStyles } from '../src/theme/typography';
import { compactNumber } from '../src/utils/format';

function Group({ title, children }) {
  return (
    <View style={{ gap: spacing.sm, marginBottom: spacing.lg }}>
      <SectionHeader title={title} />
      <GlassSurface style={{ padding: spacing.md, gap: spacing.md }}>{children}</GlassSurface>
    </View>
  );
}

function Row({ children, wrap = true }) {
  return (
    <View
      style={{
        flexDirection: 'row',
        flexWrap: wrap ? 'wrap' : 'nowrap',
        alignItems: 'center',
        gap: spacing.sm,
      }}
    >
      {children}
    </View>
  );
}

export default function DevGallery() {
  const router = useRouter();
  const [tab, setTab] = useState('global');

  return (
    <Screen scroll contentContainerStyle={{ paddingVertical: spacing.lg }}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: spacing.lg,
        }}
      >
        <View>
          <Text variant="headline-lg" color={role.primary}>
            Primitives
          </Text>
          <Text variant="label-sm" color={role.onSurfaceVariant}>
            Phase 1 component gallery
          </Text>
        </View>
        <IconButton icon="close" onPress={() => router.back()} accessibilityLabel="Close gallery" />
      </View>

      <Group title="Typography">
        {Object.keys(textStyles).map((variant) => (
          <Text key={variant} variant={variant} color={role.onSurface}>
            {variant}
          </Text>
        ))}
        <Text variant="headline-sm" color={faction.p1} numeric>
          1,234,567 tabular
        </Text>
      </Group>

      <Group title="Faction palette">
        <Row>
          {['p1', 'p2', 'p3', 'p4'].map((f) => (
            <View key={f} style={{ alignItems: 'center', gap: 4 }}>
              <View
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: radii.xl,
                  backgroundColor: faction[f],
                }}
              />
              <Text variant="label-sm" color={role.onSurfaceVariant}>
                {f}
              </Text>
            </View>
          ))}
        </Row>
      </Group>

      <Group title="Surface tiers">
        <Row>
          {Object.entries(surface).map(([name, value]) => (
            <View key={name} style={{ alignItems: 'center', gap: 4, width: 72 }}>
              <View
                style={{
                  width: 56,
                  height: 40,
                  borderRadius: radii.lg,
                  backgroundColor: value,
                  borderWidth: 1,
                  borderColor: role.outlineVariant,
                }}
              />
              <Text variant="label-sm" color={role.onSurfaceVariant} align="center">
                {name}
              </Text>
            </View>
          ))}
        </Row>
      </Group>

      <Group title="Buttons">
        <Row>
          <NeonButton label="Roll dice" variant="primary" />
          <NeonButton label="Spectate" variant="glass" />
        </Row>
        <Row>
          <NeonButton label="Ready" variant="secondary" size="sm" />
          <NeonButton label="Strike" variant="danger" size="sm" icon="skull" />
          <NeonButton label="Ghost" variant="ghost" size="sm" />
        </Row>
        <Row>
          <NeonButton label="Loading" loading />
          <NeonButton label="Disabled" disabled />
        </Row>
        <NeonButton label="Enter the night" size="lg" fullWidth iconRight="arrow_forward" />
        <Row>
          <IconButton icon="mic" />
          <IconButton icon="headphones" />
          <IconButton icon="mood" color={faction.p2} />
          <IconButton icon="settings" bordered />
        </Row>
      </Group>

      <Group title="Pills & chips">
        <Row>
          <StatPill label="Tokyo S-04 • Live" dot color={faction.p1} />
          <StatPill label="Mythic build" color={faction.p3} tinted />
          <StatPill label="Host" icon="military_tech" color={role.tertiaryFixed} />
          <StatPill label="2.4k live" color={faction.p2} tinted />
        </Row>
        <Row>
          <CurrencyChip kind="coins" amount={compactNumber(48200)} />
          <CurrencyChip kind="gems" amount="1,250" />
        </Row>
      </Group>

      <Group title="Avatars">
        <Row>
          <Avatar source={images.avatarMeK4i} size={64} faction="p1" online glow />
          <Avatar source={images.gameP2Nova} size={56} faction="p2" status="playing" />
          <Avatar source={images.gameP3Ghost} size={48} faction="p3" />
          <Avatar source={images.gameP4Akira} size={40} faction="p4" status="idle" />
          <Avatar size={40} fallback="K" />
        </Row>
        <AvatarStack
          items={[
            { key: 1, source: images.avatarTourney1 },
            { key: 2, source: images.avatarTourney2 },
            { key: 3, source: images.avatarTourney3 },
          ]}
          overflowCount={418}
        />
      </Group>

      <Group title="Progress & timers">
        <ProgressBar progress={0.69} color={faction.p1} />
        <NeonProgressBar progress={0.78} />
        <ProgressBar progress={0.34} color={faction.p3} height={6} />
        <Row>
          <CountdownTimer seconds={13318} format="hms" color={role.error} />
          <CountdownTimer seconds={22364} format="clock" color={faction.p2} />
          <CountdownTimer seconds={963000} format="compact" color={role.onSurfaceVariant} />
        </Row>
      </Group>

      <Group title="Segmented tabs">
        <SegmentedTabs
          items={[
            { key: 'global', label: 'Global' },
            { key: 'friends', label: 'Friends', badge: 8 },
            { key: 'weekly', label: 'Weekly Cup' },
          ]}
          value={tab}
          onChange={setTab}
        />
      </Group>

      <Group title="Waveforms">
        <Row>
          <WaveformBars color={faction.p1} bars={4} height={20} />
          <WaveformBars color={faction.p2} bars={5} height={20} />
          <WaveformBars color={faction.p3} bars={3} height={20} active={false} />
        </Row>
      </Group>

      <Group title="Glass tiers">
        <GlassSurface over="void" style={{ padding: spacing.md }}>
          <Text variant="label-md" color={role.onSurface}>
            Simulated (default) — free
          </Text>
        </GlassSurface>
        <GlassSurface blurred debugLabel="gallery-demo" style={{ padding: spacing.md }}>
          <Text variant="label-md" color={role.onSurface}>
            Real BlurView — budgeted
          </Text>
        </GlassSurface>
      </Group>

      <Group title="States">
        <View style={{ height: 120 }}>
          <LoadingState label="Matchmaking" />
        </View>
        <View style={{ gap: spacing.xs }}>
          <Skeleton width="70%" />
          <Skeleton width="45%" />
          <Skeleton height={48} />
        </View>
        <View style={{ height: 200 }}>
          <EmptyState
            icon="person_add"
            title="No crew yet"
            message="Add friends to start a private party."
            actionLabel="Find crew"
          />
        </View>
        <View style={{ height: 200 }}>
          <ErrorState message="Could not reach the arena." onRetry={() => {}} />
        </View>
      </Group>

      <Group title={`Icons (${iconNames.length})`}>
        <Row>
          {iconNames.map((name) => (
            <View key={name} style={{ width: 44, alignItems: 'center' }}>
              <Icon name={name} size={22} color={role.onSurfaceVariant} />
            </View>
          ))}
        </Row>
      </Group>

      <View style={{ height: spacing.xl }} />
    </Screen>
  );
}
