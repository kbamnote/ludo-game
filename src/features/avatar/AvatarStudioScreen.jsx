/**
 * Avatar Customization Studio — Stitch screen 4.
 *
 * Hologram pedestal with a drag-to-rotate avatar stage, hue slider with preset
 * swatches, category pills, a 2-column cosmetics grid with rarity badges and
 * locks, and the sticky Mint ribbon.
 *
 * Phase 2 scope: everything is interactive — drag rotates, the hue slider
 * retints the stage glow, categories filter, items equip. The "AI Face Scan"
 * button is present and routes nowhere yet: photo capture, consent, cropping
 * and generation are Phase 3, and faking them here would make an unbuilt
 * feature look finished.
 *
 * Known gap: the cosmetics grid uses Material Symbols placeholders because no
 * item artwork exists in the Stitch output (docs/ASSET_INVENTORY.md §6.1).
 */
import { useMemo, useState } from 'react';
import { View, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Image } from 'expo-image';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { Screen } from '../../components/common/Screen';
import { AppHeader, HEADER_HEIGHT } from '../../components/common/AppHeader';
import { Text } from '../../components/common/Text';
import { StatPill } from '../../components/common/StatPill';
import { GlassSurface } from '../../components/common/GlassSurface';
import { NeonButton } from '../../components/buttons/NeonButton';
import { IconButton } from '../../components/buttons/IconButton';
import { Icon } from '../../components/icons/Icon';
import { LoadingState, ErrorState } from '../../components/common/States';

import { api, queryKeys } from '../../services/sampleData';
import { useUserStore } from '../../store/useUserStore';
import { useHaptics } from '../../hooks/useHaptics';
import { useResponsive } from '../../hooks/useResponsive';
import { compactNumber, thousands } from '../../utils/format';
import { faction, role, surface, withAlpha } from '../../theme/colors';
import { radii, spacing } from '../../theme/spacing';

const SWATCHES = [faction.p1, faction.p2, role.tertiary, faction.p3];

const RARITY_ACCENT = {
  LEGENDARY: faction.p3,
  RARE: faction.p2,
  UNCOMMON: role.onSurfaceVariant,
  EXOTIC: faction.p4,
};

function AvatarStage({ source, tint, size }) {
  const rotation = useSharedValue(0);

  const drag = Gesture.Pan()
    .onChange((e) => {
      rotation.value += e.changeX * 0.4;
    })
    .onEnd(() => {
      // Settle to the nearest half-turn so the bust never rests edge-on.
      rotation.value = withSpring(Math.round(rotation.value / 180) * 180, {
        damping: 18,
        stiffness: 90,
      });
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ perspective: 800 }, { rotateY: `${rotation.value}deg` }],
  }));

  return (
    <View
      style={{
        width: size,
        height: size,
        alignSelf: 'center',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Ambient pedestal glow */}
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          bottom: 8,
          width: size * 0.8,
          height: 64,
          borderRadius: size,
          backgroundColor: withAlpha(tint, 0.25),
        }}
      />

      {/* Pedestal plate */}
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          bottom: 8,
          width: size * 0.8,
          height: 56,
          borderRadius: size,
          backgroundColor: withAlpha(surface.containerHigh, 0.8),
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        }}
      >
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 2,
            backgroundColor: tint,
          }}
        />
        <Text variant="label-sm" color={withAlpha(tint, 0.5)}>
          AFTER DARK PROTOCOL // 43.19° N
        </Text>
      </View>

      <GestureDetector gesture={drag}>
        <Animated.View style={[{ width: size * 0.72, height: size * 0.72 }, animatedStyle]}>
          <Image
            source={source}
            style={{ width: '100%', height: '100%', borderRadius: radii.xxxl }}
            contentFit="contain"
            transition={220}
            accessibilityLabel="Your avatar"
          />
        </Animated.View>
      </GestureDetector>

      <View
        style={{
          position: 'absolute',
          bottom: 24,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 6,
          paddingHorizontal: 12,
          paddingVertical: 4,
          borderRadius: radii.full,
          backgroundColor: withAlpha(surface.containerLowest, 0.85),
        }}
      >
        <Icon name="sync" size={12} color={tint} />
        <Text variant="label-sm" color={role.onSurface}>
          DRAG 360°
        </Text>
      </View>
    </View>
  );
}

function CosmeticCard({ item, onPress }) {
  const locked = item.state === 'locked';
  const equipped = item.state === 'equipped';
  const accent = item.accent ? faction[item.accent] : role.onSurface;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${item.name}, ${item.state}`}
      accessibilityState={{ disabled: locked, selected: equipped }}
      onPress={() => !locked && onPress(item)}
      style={({ pressed }) => ({
        width: '48%',
        flexGrow: 1,
        padding: spacing.sm,
        gap: spacing.sm,
        borderRadius: radii.xl,
        backgroundColor: equipped ? surface.containerHigh : surface.containerLow,
        opacity: locked ? 0.75 : 1,
        transform: [{ scale: pressed ? 0.98 : 1 }],
      })}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <StatPill
          label={item.rarity}
          color={RARITY_ACCENT[item.rarity] ?? role.onSurfaceVariant}
          tinted={item.rarity !== 'UNCOMMON'}
          size="sm"
        />
        <Icon
          name={equipped ? 'check_circle' : locked ? 'lock' : 'radio_button_unchecked'}
          size={16}
          color={equipped ? faction.p1 : locked ? role.outline : role.onSurfaceVariant}
        />
      </View>

      <View
        style={{
          aspectRatio: 4 / 3,
          borderRadius: radii.lg,
          backgroundColor: withAlpha(surface.containerLowest, 0.8),
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        }}
      >
        <Icon name={item.icon} size={36} color={accent} />
        {item.code ? (
          <Text
            variant="label-sm"
            color={withAlpha(accent, 0.6)}
            style={{ position: 'absolute', bottom: 4, right: 6 }}
          >
            {item.code}
          </Text>
        ) : null}
        {locked ? (
          <View
            style={{
              position: 'absolute',
              inset: 0,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: withAlpha(surface.containerLowest, 0.6),
            }}
          >
            <Text variant="label-sm" color={role.primary}>
              {item.lockLabel}
            </Text>
          </View>
        ) : null}
      </View>

      <View>
        <Text
          variant="headline-sm"
          color={locked ? role.onSurfaceVariant : role.onSurface}
          numberOfLines={1}
        >
          {item.name}
        </Text>
        <View
          style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
        >
          <Text
            variant="label-sm"
            color={role.onSurfaceVariant}
            numberOfLines={1}
            style={{ flexShrink: 1 }}
          >
            {item.subtitle}
          </Text>
          <Text
            variant="label-sm"
            color={equipped ? role.primaryFixedDim : locked ? role.outline : role.onSurfaceVariant}
          >
            {item.state.toUpperCase()}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

export function AvatarStudioScreen() {
  const router = useRouter();
  const haptics = useHaptics();
  const user = useUserStore();
  const { width } = useResponsive();

  const [category, setCategory] = useState('outfits');
  const [tint, setTint] = useState(faction.p1);
  const [equippedId, setEquippedId] = useState('cyber-hoodie');
  const [minting, setMinting] = useState(false);

  const { data, isPending, isError, refetch } = useQuery({
    queryKey: queryKeys.avatarStudio,
    queryFn: api.getAvatarStudio,
  });

  const items = useMemo(() => {
    if (!data) return [];
    return data.cosmetics
      .filter((c) => c.category === category)
      .map((c) => ({
        ...c,
        state: c.id === equippedId ? 'equipped' : c.state === 'equipped' ? 'owned' : c.state,
      }));
  }, [data, category, equippedId]);

  const header = (
    <AppHeader
      title="Avatar"
      subtitle={`SLOT 01/04`}
      coins={compactNumber(user.coins)}
      gems={thousands(user.gems)}
      avatarSource={user.avatar}
      avatarFaction={user.faction}
      onBack={() => router.back()}
      showLogo={false}
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
          <LoadingState label="Loading atelier" />
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
          <ErrorState message="Could not load the atelier." onRetry={refetch} />
        </Screen>
      </>
    );
  }

  const mint = () => {
    setMinting(true);
    haptics.success();
    setTimeout(() => setMinting(false), 1200);
  };

  const stageSize = Math.min(width - spacing.margin * 2, 360);

  return (
    <>
      {header}
      <Screen
        scroll
        tabBarClearance
        edges={{ top: false, bottom: false }}
        contentContainerStyle={{ paddingTop: HEADER_HEIGHT + spacing.lg, gap: spacing.lg }}
        glows={[{ color: tint, size: 300, top: 60, left: -60, opacity: 0.12 }]}
      >
        {/* Top bar */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: spacing.sm,
          }}
        >
          <StatPill label="CYBER ATELIER" icon="auto_awesome" color={role.primary} />
          <NeonButton
            label="AI Face Scan"
            icon="photo_camera"
            variant="glass"
            size="sm"
            onPress={() => haptics.warning()}
          />
        </View>

        {/* Stage */}
        <View>
          <AvatarStage source={user.avatar} tint={tint} size={stageSize} />
          <View style={{ position: 'absolute', top: 8, right: 8 }}>
            <StatPill label="MYTHIC BUILD" dot color={faction.p3} size="sm" />
          </View>
          <View style={{ position: 'absolute', top: 8, left: 8 }}>
            <IconButton
              icon="restart_alt"
              size={32}
              iconSize={14}
              onPress={() => setTint(faction.p1)}
              accessibilityLabel="Reset"
            />
          </View>
        </View>

        {/* Hue bar */}
        <GlassSurface over="void" style={{ padding: spacing.sm, gap: spacing.xs }}>
          <View
            style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Icon name="palette" size={14} color={faction.p1} />
              <Text variant="label-md" color={role.onSurface}>
                Neon Luminescence Hue
              </Text>
            </View>
            <Text variant="label-sm" color={tint}>
              {tint.toUpperCase()}
            </Text>
          </View>

          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingTop: 4,
            }}
          >
            {SWATCHES.map((c) => (
              <Pressable
                key={c}
                accessibilityRole="button"
                accessibilityLabel={`Set hue ${c}`}
                accessibilityState={{ selected: tint === c }}
                onPress={() => {
                  haptics.select();
                  setTint(c);
                }}
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 14,
                  backgroundColor: c,
                  borderWidth: tint === c ? 3 : 0,
                  borderColor: withAlpha(c, 0.4),
                }}
              />
            ))}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Shuffle hue"
              onPress={() => setTint(SWATCHES[Math.floor(Math.random() * SWATCHES.length)])}
              style={{
                width: 28,
                height: 28,
                borderRadius: 14,
                backgroundColor: surface.containerHighest,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Icon name="shuffle" size={14} color={role.onSurfaceVariant} />
            </Pressable>
          </View>
        </GlassSurface>

        {/* Categories */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: spacing.xs, paddingRight: spacing.margin }}
          style={{ marginHorizontal: -spacing.margin, paddingHorizontal: spacing.margin }}
        >
          {data.categories.map((c) => {
            const active = c.key === category;
            return (
              <Pressable
                key={c.key}
                accessibilityRole="tab"
                accessibilityState={{ selected: active }}
                onPress={() => {
                  haptics.select();
                  setCategory(c.key);
                }}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 6,
                  paddingHorizontal: spacing.md,
                  paddingVertical: spacing.sm,
                  borderRadius: radii.full,
                  backgroundColor: active ? faction.p1 : withAlpha(surface.containerHigh, 0.8),
                }}
              >
                <Icon
                  name={c.icon}
                  size={16}
                  color={active ? role.onPrimary : role.onSurfaceVariant}
                />
                <Text variant="label-md" color={active ? role.onPrimary : role.onSurfaceVariant}>
                  {c.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* Cosmetics grid */}
        {items.length === 0 ? (
          <GlassSurface style={{ padding: spacing.lg, alignItems: 'center', gap: spacing.xs }}>
            <Icon name="blur_on" size={28} color={role.onSurfaceVariant} />
            <Text variant="headline-sm" color={role.onSurface}>
              Nothing in this drawer yet
            </Text>
            <Text variant="body-sm" color={role.onSurfaceVariant} align="center">
              New drip drops weekly. Check the store for this season&rsquo;s set.
            </Text>
            <NeonButton
              label="Open store"
              variant="glass"
              size="sm"
              onPress={() => router.navigate('/play')}
            />
          </GlassSurface>
        ) : (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
            {items.map((item) => (
              <CosmeticCard
                key={item.id}
                item={item}
                onPress={(it) => {
                  haptics.light();
                  setEquippedId(it.id);
                }}
              />
            ))}
          </View>
        )}

        {/* Mint ribbon */}
        <GlassSurface
          over="void"
          radius={radii.xxl}
          elevation="lg"
          style={{
            padding: spacing.sm,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: spacing.sm,
          }}
        >
          <View style={{ paddingLeft: spacing.sm }}>
            <Text variant="label-sm" color={role.onSurfaceVariant}>
              CREATION FEE
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text variant="headline-sm" color={role.primary}>
                FREE
              </Text>
              <Text
                variant="body-sm"
                color={role.primaryFixedDim}
                style={{ textDecorationLine: 'line-through' }}
              >
                120 GEMS
              </Text>
            </View>
          </View>
          <NeonButton
            label={minting ? 'Avatar minted!' : 'Mint avatar'}
            icon={minting ? 'check' : 'token'}
            loading={false}
            onPress={mint}
            haptic="heavy"
            style={{ flex: 1 }}
          />
        </GlassSurface>

        {__DEV__ ? (
          <View
            style={{
              padding: spacing.sm,
              borderRadius: radii.lg,
              borderWidth: 1,
              borderColor: withAlpha(faction.p3, 0.4),
              backgroundColor: withAlpha(faction.p3, 0.1),
            }}
          >
            <Text variant="label-sm" color={faction.p3}>
              PLACEHOLDER COSMETIC ART
            </Text>
            <Text variant="body-sm" color={role.onSurfaceVariant}>
              No item artwork exists in the Stitch output; these are Material Symbols glyphs. Photo
              capture, consent and AI generation are Phase 3. Dev-only notice.
            </Text>
          </View>
        ) : null}
      </Screen>
    </>
  );
}

export default AvatarStudioScreen;
