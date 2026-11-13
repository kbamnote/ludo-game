/**
 * Streetwear Store & Battle Pass — Stitch screen 10.
 *
 * Season banner with the tier track, flash-deal countdown, category filters,
 * product cards, the currency vault and a purchase-confirmation modal.
 *
 * At 4,086px this is by far the tallest screen in the design, so the catalogue
 * is a FlatList rather than a ScrollView — the banner and filters ride along as
 * the list header so there is still only one scroll container.
 *
 * Phase 2 scope: filtering and the confirm modal are real; nothing is actually
 * purchased. Entitlements and receipt validation are server-side work in
 * Phase 7 — spending currency client-side here would bake in exactly the
 * client-trust the brief forbids.
 */
import { useMemo, useState } from 'react';
import { View, FlatList, Pressable, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Image } from 'expo-image';
import Animated, { FadeIn } from 'react-native-reanimated';

import { AppHeader, HEADER_HEIGHT } from '../../components/common/AppHeader';
import { Screen, TAB_BAR_CLEARANCE } from '../../components/common/Screen';
import { Text } from '../../components/common/Text';
import { StatPill } from '../../components/common/StatPill';
import { GlassSurface } from '../../components/common/GlassSurface';
import { ProgressBar } from '../../components/common/ProgressBar';
import { CountdownTimer } from '../../components/common/CountdownTimer';
import { NeonButton } from '../../components/buttons/NeonButton';
import { IconButton } from '../../components/buttons/IconButton';
import { Icon } from '../../components/icons/Icon';
import { LoadingState, ErrorState, EmptyState } from '../../components/common/States';

import { api, queryKeys } from '../../services/sampleData';
import { useUserStore } from '../../store/useUserStore';
import { useHaptics } from '../../hooks/useHaptics';
import { compactNumber, thousands } from '../../utils/format';
import { faction, role, surface, withAlpha } from '../../theme/colors';
import { radii, spacing } from '../../theme/spacing';

function ProductCard({ item, onBuy }) {
  const accent = faction[item.accent];

  return (
    <GlassSurface over="containerHigh" style={{ padding: spacing.md, gap: spacing.sm }}>
      <View
        style={{
          height: item.height,
          borderRadius: radii.lg,
          overflow: 'hidden',
          backgroundColor: surface.containerLowest,
        }}
      >
        <Image
          source={item.image}
          style={{ width: '100%', height: '100%' }}
          contentFit="cover"
          transition={220}
          accessibilityLabel={item.name}
        />

        {item.tag ? (
          <View style={{ position: 'absolute', top: spacing.sm, left: spacing.sm }}>
            <StatPill
              label={item.tag}
              icon={item.tagIcon}
              dot={!item.tagIcon}
              color={accent}
              background={withAlpha(surface.containerLowest, 0.9)}
              size="sm"
            />
          </View>
        ) : null}

        {item.rarity ? (
          <View style={{ position: 'absolute', top: spacing.sm, right: spacing.sm }}>
            <StatPill
              label={item.rarity}
              color={item.rarity === 'Legendary' ? role.tertiary : role.secondaryFixed}
              background={
                item.rarity === 'Legendary' ? role.onTertiaryContainer : surface.containerHighest
              }
              size="sm"
            />
          </View>
        ) : null}

        {item.playable ? (
          <View
            style={{
              position: 'absolute',
              inset: 0,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <IconButton
              icon="play_arrow"
              size={48}
              iconSize={26}
              color={faction.p1}
              background={withAlpha(surface.containerHigh, 0.9)}
              accessibilityLabel={`Preview ${item.name}`}
            />
          </View>
        ) : null}

        {item.caption ? (
          <View
            style={{
              position: 'absolute',
              bottom: spacing.sm,
              left: spacing.sm,
              paddingHorizontal: 10,
              paddingVertical: 4,
              borderRadius: radii.base,
              backgroundColor: withAlpha(surface.containerHighest, 0.9),
            }}
          >
            <Text variant="label-sm" color={role.onSurface}>
              {item.caption}
            </Text>
          </View>
        ) : null}

        {item.footLeft || item.footRight ? (
          <View
            style={{
              position: 'absolute',
              bottom: spacing.sm,
              left: spacing.sm,
              right: spacing.sm,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: item.footLeft ? 'space-between' : 'flex-end',
              padding: spacing.sm,
              borderRadius: radii.lg,
              backgroundColor: withAlpha(surface.containerLowest, 0.8),
            }}
          >
            {item.footLeft ? (
              <Text variant="body-sm" color={role.onSurfaceVariant}>
                {item.footLeft}
              </Text>
            ) : null}
            {item.footRight ? (
              <Text variant="label-sm" color={role.secondaryFixed}>
                {item.footRight}
              </Text>
            ) : null}
          </View>
        ) : null}
      </View>

      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: spacing.sm,
        }}
      >
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text variant="headline-sm" color={role.onSurface} numberOfLines={1}>
            {item.name}
          </Text>
          <Text variant="body-sm" color={role.onSurfaceVariant} numberOfLines={2}>
            {item.blurb}
          </Text>
        </View>
        <NeonButton
          label={thousands(item.price)}
          icon="diamond"
          variant={item.accent === 'p2' ? 'secondary' : 'primary'}
          onPress={() => onBuy(item)}
        />
      </View>
    </GlassSurface>
  );
}

function BattlePassBanner({ pass }) {
  return (
    <GlassSurface over="containerHigh" style={{ padding: spacing.md, gap: spacing.sm }}>
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
            gap: spacing.xs,
            flex: 1,
            minWidth: 0,
          }}
        >
          <StatPill
            label="Active Season"
            color={role.onPrimary}
            background={faction.p1}
            size="sm"
          />
          <CountdownTimer
            seconds={pass.endsInSeconds}
            format="compact"
            color={role.onSurfaceVariant}
            variant="label-md"
          />
        </View>
        <StatPill
          label={`TIER ${pass.tier}/${pass.maxTier}`}
          icon="stars"
          color={role.secondaryFixed}
          size="sm"
        />
      </View>

      <View>
        <Text variant="headline-md" color={role.primary}>
          {pass.name}
        </Text>
        <Text variant="body-sm" color={role.onSurfaceVariant}>
          {pass.blurb}
        </Text>
      </View>

      <View style={{ gap: 6 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text variant="label-sm" color={role.onSurface}>
            LEVEL {pass.tier} REWARDS
          </Text>
          <Text variant="label-sm" color={role.primaryFixedDim} numeric>
            {thousands(pass.xp)} / {thousands(pass.xpTarget)} XP
          </Text>
        </View>
        <ProgressBar
          progress={pass.xp / pass.xpTarget}
          gradient={[faction.p1, faction.p2, '#60ff98']}
          height={12}
        />
      </View>

      <View style={{ flexDirection: 'row', gap: spacing.xs }}>
        <View
          style={{
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: spacing.sm,
            borderRadius: radii.lg,
            backgroundColor: surface.containerLowest,
          }}
        >
          <View
            style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1, minWidth: 0 }}
          >
            <Icon name="lock_open" size={16} color={role.onSurfaceVariant} />
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text variant="label-sm" color={role.onSurface}>
                {pass.freeReward.label}
              </Text>
              <Text variant="body-sm" color={role.onSurfaceVariant} numberOfLines={1}>
                {pass.freeReward.detail}
              </Text>
            </View>
          </View>
          <StatPill label="Claim" color={role.onSurface} size="sm" />
        </View>

        <View
          style={{
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: spacing.sm,
            borderRadius: radii.lg,
            backgroundColor: faction.p1,
          }}
        >
          <View
            style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1, minWidth: 0 }}
          >
            <Icon name="workspace_premium" size={16} color={role.onPrimary} />
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text variant="label-sm" color={role.onPrimary}>
                {pass.premiumReward.label}
              </Text>
              <Text variant="body-sm" color={role.onPrimary} numberOfLines={1}>
                {pass.premiumReward.detail}
              </Text>
            </View>
          </View>
          <StatPill label="Claim" color={faction.p1} background={role.onPrimary} size="sm" />
        </View>
      </View>
    </GlassSurface>
  );
}

export function StoreScreen() {
  const router = useRouter();
  const haptics = useHaptics();
  const user = useUserStore();

  const [category, setCategory] = useState('all');
  const [pending, setPending] = useState(null);
  const [confirmed, setConfirmed] = useState(false);

  const { data, isPending, isError, refetch } = useQuery({
    queryKey: queryKeys.store,
    queryFn: api.getStore,
  });

  const items = useMemo(() => {
    if (!data) return [];
    return category === 'all' ? data.items : data.items.filter((i) => i.category === category);
  }, [data, category]);

  const header = (
    <AppHeader
      title="Store"
      subtitle={`LVL ${user.level}`}
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
          <LoadingState label="Opening store" />
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
          <ErrorState message="Could not open the store." onRetry={refetch} />
        </Screen>
      </>
    );
  }

  const listHeader = (
    <View style={{ gap: spacing.lg, paddingBottom: spacing.lg }}>
      <BattlePassBanner pass={data.pass} />

      {/* Flash deals */}
      <GlassSurface
        style={{
          padding: spacing.sm,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
          <Icon name="timer" size={20} color={faction.p2} />
          <View>
            <Text variant="label-sm" color={role.onSurfaceVariant}>
              Midnight Flash Deals
            </Text>
            <CountdownTimer
              seconds={22364}
              format="clock"
              color={role.secondaryFixed}
              variant="headline-sm"
            />
          </View>
        </View>
        <StatPill label="Up to -40%" icon="local_fire_department" color={role.primary} size="sm" />
      </GlassSurface>

      {/* Category filters */}
      <FlatList
        horizontal
        data={data.categories}
        keyExtractor={(c) => c.key}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: spacing.xs, paddingRight: spacing.margin }}
        style={{ marginHorizontal: -spacing.margin, paddingHorizontal: spacing.margin }}
        renderItem={({ item: c }) => {
          const active = c.key === category;
          return (
            <Pressable
              accessibilityRole="tab"
              accessibilityState={{ selected: active }}
              onPress={() => {
                haptics.select();
                setCategory(c.key);
              }}
              style={{
                paddingHorizontal: spacing.md,
                paddingVertical: spacing.sm,
                borderRadius: radii.full,
                backgroundColor: active ? faction.p1 : surface.containerHigh,
              }}
            >
              <Text variant="label-md" color={active ? role.onPrimary : role.onSurfaceVariant}>
                {c.label}
              </Text>
            </Pressable>
          );
        }}
      />
    </View>
  );

  const listFooter = (
    <GlassSurface style={{ padding: spacing.md, gap: spacing.sm, marginTop: spacing.lg }}>
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
            gap: spacing.xs,
            flex: 1,
            minWidth: 0,
          }}
        >
          <Icon name="account_balance_wallet" size={24} color={role.secondaryFixed} />
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text variant="headline-sm" color={role.onSurface}>
              Currency Vault
            </Text>
            <Text variant="body-sm" color={role.onSurfaceVariant} numberOfLines={1}>
              Instant refill with bonus tokens
            </Text>
          </View>
        </View>
        <StatPill label="+20% Extra" color={faction.p1} tinted size="sm" />
      </View>

      <View style={{ flexDirection: 'row', gap: spacing.sm }}>
        {data.packs.map((p) => (
          <View
            key={p.id}
            style={{
              flex: 1,
              padding: spacing.sm,
              borderRadius: radii.lg,
              backgroundColor: surface.containerLow,
              gap: spacing.sm,
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
              }}
            >
              <View
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: radii.full,
                  backgroundColor: withAlpha(
                    p.kind === 'gems' ? faction.p2 : role.secondaryFixed,
                    0.12
                  ),
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Icon
                  name={p.kind === 'gems' ? 'diamond' : 'monetization_on'}
                  size={18}
                  color={p.kind === 'gems' ? faction.p2 : role.secondaryFixed}
                />
              </View>
              <Text variant="label-sm" color={p.kind === 'gems' ? faction.p1 : role.secondaryFixed}>
                {p.bonus}
              </Text>
            </View>

            <View>
              <Text variant="headline-sm" color={role.onSurface} numeric>
                {p.amount}
              </Text>
              <Text variant="body-sm" color={role.onSurfaceVariant}>
                {p.label}
              </Text>
            </View>

            <NeonButton
              label={p.price}
              variant={p.kind === 'gems' ? 'glass' : 'primary'}
              size="sm"
              fullWidth
              onPress={() =>
                setPending({ name: `${p.amount} (${p.price})`, price: p.price, realMoney: true })
              }
            />
          </View>
        ))}
      </View>
    </GlassSurface>
  );

  return (
    <>
      {header}
      <Screen
        edges={{ top: false, bottom: false }}
        padded={false}
        glows={[{ color: faction.p1, size: 320, top: 40, left: -80 }]}
      >
        <FlatList
          data={items}
          keyExtractor={(i) => i.id}
          ListHeaderComponent={listHeader}
          ListFooterComponent={listFooter}
          ListEmptyComponent={
            <View style={{ height: 220 }}>
              <EmptyState
                icon="style"
                title="Nothing here yet"
                message="New drops land every week."
              />
            </View>
          }
          renderItem={({ item }) => <ProductCard item={item} onBuy={setPending} />}
          ItemSeparatorComponent={() => <View style={{ height: spacing.md }} />}
          contentContainerStyle={{
            paddingTop: HEADER_HEIGHT + spacing.lg,
            paddingBottom: TAB_BAR_CLEARANCE + spacing.xl,
            paddingHorizontal: spacing.margin,
          }}
          showsVerticalScrollIndicator={false}
          // The design is 4,086px tall; windowing keeps memory flat on
          // mid-range devices rather than mounting every card at once.
          initialNumToRender={3}
          windowSize={5}
          removeClippedSubviews
        />
      </Screen>

      {/* Purchase confirmation */}
      <Modal
        visible={!!pending}
        transparent
        animationType="fade"
        onRequestClose={() => setPending(null)}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Dismiss"
          onPress={() => setPending(null)}
          style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            padding: spacing.margin,
            backgroundColor: withAlpha(surface.containerLowest, 0.8),
          }}
        >
          {pending ? (
            <Animated.View entering={FadeIn.duration(180)} style={{ width: '100%', maxWidth: 384 }}>
              <GlassSurface over="containerHigh" style={{ padding: spacing.md, gap: spacing.sm }}>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <Text variant="label-sm" color={role.primaryFixedDim}>
                    Confirm Purchase
                  </Text>
                  <IconButton
                    icon="close"
                    size={32}
                    iconSize={16}
                    onPress={() => setPending(null)}
                    accessibilityLabel="Close"
                  />
                </View>

                <View style={{ alignItems: 'center', gap: 4, paddingVertical: spacing.sm }}>
                  <View
                    style={{
                      width: 56,
                      height: 56,
                      borderRadius: radii.full,
                      backgroundColor: withAlpha(faction.p1, 0.2),
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Icon name="shopping_cart_checkout" size={28} color={faction.p1} />
                  </View>
                  <Text variant="headline-sm" color={role.onSurface} align="center">
                    {pending.name}
                  </Text>
                  {!pending.realMoney ? (
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                      <Icon name="diamond" size={18} color={faction.p2} />
                      <Text variant="headline-sm" color={faction.p2} numeric>
                        {thousands(pending.price)}
                      </Text>
                      <Text variant="body-sm" color={role.onSurfaceVariant}>
                        Gems
                      </Text>
                    </View>
                  ) : null}
                </View>

                {/* Honest about scope rather than faking a transaction. */}
                <View
                  style={{
                    flexDirection: 'row',
                    gap: 6,
                    padding: spacing.sm,
                    borderRadius: radii.lg,
                    backgroundColor: withAlpha(role.secondaryFixed, 0.1),
                  }}
                >
                  <Icon name="info" size={14} color={role.secondaryFixed} />
                  <Text variant="body-sm" color={role.onSurfaceVariant} style={{ flex: 1 }}>
                    Purchases are validated server-side in Phase 7. Nothing is charged or granted
                    yet.
                  </Text>
                </View>

                <View style={{ flexDirection: 'row', gap: spacing.sm }}>
                  <NeonButton
                    label="Cancel"
                    variant="glass"
                    style={{ flex: 1 }}
                    onPress={() => setPending(null)}
                  />
                  <NeonButton
                    label={confirmed ? 'Unlocked!' : 'Unlock now'}
                    style={{ flex: 1 }}
                    onPress={() => {
                      haptics.success();
                      setConfirmed(true);
                      setTimeout(() => {
                        setConfirmed(false);
                        setPending(null);
                      }, 800);
                    }}
                  />
                </View>
              </GlassSurface>
            </Animated.View>
          ) : null}
        </Pressable>
      </Modal>
    </>
  );
}

export default StoreScreen;
