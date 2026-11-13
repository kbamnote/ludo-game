/**
 * Friends & Social Hub — Stitch screen 11.
 *
 * Search + add, party-invite alert, active voice party with per-member
 * waveforms, segmented filter tabs, friend cards with contextual actions, and
 * the #squad-radio chat drawer.
 *
 * Phase 2 scope: search filters the real list, tabs switch, the composer
 * accepts and appends messages locally. Voice and real messaging are Phase 6 —
 * the controls are present and respond, but nothing leaves the device.
 */
import { useMemo, useState } from 'react';
import {
  View,
  ScrollView,
  Pressable,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';

import { Screen } from '../../components/common/Screen';
import { AppHeader, HEADER_HEIGHT } from '../../components/common/AppHeader';
import { Text } from '../../components/common/Text';
import { StatPill } from '../../components/common/StatPill';
import { GlassSurface } from '../../components/common/GlassSurface';
import { SegmentedTabs } from '../../components/common/SegmentedTabs';
import { Avatar } from '../../components/common/Avatar';
import { NeonButton } from '../../components/buttons/NeonButton';
import { IconButton } from '../../components/buttons/IconButton';
import { Icon } from '../../components/icons/Icon';
import { WaveformBars } from '../../components/animations/WaveformBars';
import { LoadingState, ErrorState, EmptyState } from '../../components/common/States';

import { api, queryKeys, quickEmotes } from '../../services/sampleData';
import { useUserStore } from '../../store/useUserStore';
import { useHaptics } from '../../hooks/useHaptics';
import { compactNumber, thousands } from '../../utils/format';
import { faction, role, surface, withAlpha } from '../../theme/colors';
import { radii, spacing } from '../../theme/spacing';

const ACTION_LABELS = {
  spectate: { label: 'Spectate', icon: 'visibility', variant: 'glass' },
  invite: { label: 'Invite', icon: 'group_add', variant: 'tint' },
  quickjoin: { label: 'Quick Join', icon: 'bolt', variant: 'secondary' },
  chat: { label: 'Chat', icon: 'chat_bubble', variant: 'glass' },
};

function FriendCard({ friend, onAction }) {
  const accent = faction[friend.faction];

  return (
    <GlassSurface style={{ padding: spacing.sm, borderRadius: radii.xxl }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
        <Avatar source={friend.avatar} size={44} faction={friend.faction} status={friend.state} />

        <View style={{ flex: 1, minWidth: 0 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Text variant="headline-sm" color={role.onSurface} numberOfLines={1}>
              {friend.name}
            </Text>
            {friend.badge ? (
              <StatPill label={friend.badge} color={role.secondaryFixed} size="sm" />
            ) : null}
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            {friend.statusIcon ? (
              <Icon name={friend.statusIcon} size={11} color={role.secondaryFixed} />
            ) : null}
            <Text
              variant="body-sm"
              color={friend.state === 'idle' ? role.outline : accent}
              numberOfLines={1}
              style={{ flexShrink: 1 }}
            >
              {friend.status}
            </Text>
          </View>
        </View>

        <View style={{ flexDirection: 'row', gap: 4 }}>
          {friend.actions.map((key) => {
            const a = ACTION_LABELS[key];
            return (
              <Pressable
                key={key}
                accessibilityRole="button"
                accessibilityLabel={`${a.label} ${friend.name}`}
                onPress={() => onAction(key, friend)}
                style={({ pressed }) => ({
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 4,
                  paddingHorizontal: 10,
                  paddingVertical: 6,
                  borderRadius: radii.full,
                  backgroundColor:
                    a.variant === 'secondary'
                      ? faction.p2
                      : a.variant === 'tint'
                        ? withAlpha(faction.p1, 0.15)
                        : surface.containerHigh,
                  opacity: pressed ? 0.8 : 1,
                })}
              >
                <Icon
                  name={a.icon}
                  size={13}
                  color={
                    a.variant === 'secondary'
                      ? role.onSecondaryContainer
                      : a.variant === 'tint'
                        ? faction.p1
                        : role.onSurface
                  }
                />
                <Text
                  variant="label-sm"
                  color={
                    a.variant === 'secondary'
                      ? role.onSecondaryContainer
                      : a.variant === 'tint'
                        ? faction.p1
                        : role.onSurface
                  }
                >
                  {a.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    </GlassSurface>
  );
}

function VoicePartyCard({ party, onJoin }) {
  return (
    <GlassSurface over="void" radius={radii.xxl} style={{ padding: spacing.md, gap: spacing.sm }}>
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
              width: 40,
              height: 40,
              borderRadius: radii.lg,
              backgroundColor: surface.containerHighest,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon name="headset_mic" size={20} color={faction.p1} />
          </View>
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text variant="headline-sm" color={role.onSurface} numberOfLines={1}>
              {party.name}
            </Text>
            <Text variant="body-sm" color={role.onSurfaceVariant} numberOfLines={1}>
              {party.members.length} / {party.capacity} In Party • {party.room}
            </Text>
          </View>
        </View>
        <NeonButton label="Join voice" icon="volume_up" size="sm" onPress={onJoin} />
      </View>

      <View style={{ flexDirection: 'row', gap: spacing.xs }}>
        {party.members.map((m) => (
          <View
            key={m.id}
            style={{
              flex: 1,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 6,
              padding: 6,
              borderRadius: radii.xl,
              backgroundColor: withAlpha(surface.containerHigh, m.speaking ? 0.8 : 0.4),
            }}
          >
            <Avatar
              source={m.avatar}
              size={28}
              faction={m.faction}
              ringWidth={2}
              status={m.speaking ? 'inVoice' : undefined}
            />
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text
                variant="label-sm"
                color={m.speaking ? role.onSurface : role.onSurfaceVariant}
                numberOfLines={1}
              >
                {m.name}
              </Text>
              {m.speaking ? (
                <WaveformBars color={faction[m.faction]} bars={3} height={10} width={2} />
              ) : (
                <Text variant="label-sm" color={role.outline}>
                  Listening
                </Text>
              )}
            </View>
          </View>
        ))}
        <View
          style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            padding: 6,
            borderRadius: radii.xl,
            backgroundColor: withAlpha(surface.containerHigh, 0.2),
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
            <Icon name="add" size={13} color={role.outline} />
            <Text variant="label-sm" color={role.outline}>
              1 SLOT
            </Text>
          </View>
        </View>
      </View>
    </GlassSurface>
  );
}

function ChatDrawer({ messages, onSend }) {
  const [draft, setDraft] = useState('');
  const haptics = useHaptics();

  const send = () => {
    const text = draft.trim();
    if (!text) return;
    haptics.light();
    onSend(text);
    setDraft('');
  };

  return (
    <GlassSurface over="void" radius={radii.xxxl} style={{ padding: spacing.md, gap: spacing.sm }}>
      <View style={{ alignItems: 'center' }}>
        <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: surface.variant }} />
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
          <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: faction.p1 }} />
          <View>
            <Text variant="headline-sm" color={role.onSurface}>
              #squad-radio
            </Text>
            <Text variant="label-sm" color={role.outline}>
              Direct Comms Channel
            </Text>
          </View>
        </View>
        <NeonButton
          label="Voice ping"
          icon="sensors"
          variant="glass"
          size="sm"
          onPress={() => haptics.medium()}
        />
      </View>

      <View style={{ gap: spacing.xs }}>
        {messages.map((m) => (
          <View
            key={m.id}
            style={{
              flexDirection: 'row',
              gap: spacing.xs,
              padding: spacing.sm,
              borderRadius: radii.xl,
              backgroundColor: withAlpha(surface.containerLow, 0.6),
            }}
          >
            <Avatar source={m.avatar} size={24} ringWidth={1.5} />
            <View style={{ flex: 1, minWidth: 0 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text variant="label-md" color={role.secondaryFixed}>
                  {m.author}
                </Text>
                <Text variant="label-sm" color={role.outline}>
                  {m.time}
                </Text>
              </View>
              <Text variant="body-sm" color={role.onSurfaceVariant}>
                {m.text}
              </Text>
            </View>
          </View>
        ))}
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: spacing.sm }}
      >
        {quickEmotes.map((e) => (
          <Pressable
            key={e.id}
            accessibilityRole="button"
            accessibilityLabel={e.label}
            onPress={() => onSend(`${e.glyph} ${e.label}`)}
            style={({ pressed }) => ({
              flexDirection: 'row',
              alignItems: 'center',
              gap: 4,
              paddingHorizontal: 10,
              paddingVertical: 4,
              borderRadius: radii.full,
              backgroundColor: surface.containerHigh,
              transform: [{ scale: pressed ? 0.92 : 1 }],
            })}
          >
            <Text variant="body-sm">{e.glyph}</Text>
            <Text variant="label-sm" color={role.onSurface}>
              {e.label}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
        <TextInput
          value={draft}
          onChangeText={setDraft}
          onSubmitEditing={send}
          returnKeyType="send"
          placeholder="Message #squad-radio..."
          placeholderTextColor={role.outline}
          accessibilityLabel="Message squad radio"
          style={{
            flex: 1,
            height: 40,
            paddingHorizontal: spacing.sm,
            borderRadius: radii.full,
            backgroundColor: surface.containerLow,
            color: role.onSurface,
            fontFamily: 'PlusJakartaSans_400Regular',
            fontSize: 12,
          }}
        />
        <IconButton
          icon="send"
          size={40}
          iconSize={18}
          background={faction.p1}
          color={role.onPrimaryContainer}
          onPress={send}
          accessibilityLabel="Send message"
        />
      </View>
    </GlassSurface>
  );
}

export function FriendsScreen() {
  const user = useUserStore();
  const haptics = useHaptics();
  const [tab, setTab] = useState('online');
  const [search, setSearch] = useState('');
  const [extraMessages, setExtraMessages] = useState([]);

  const { data, isPending, isError, refetch } = useQuery({
    queryKey: queryKeys.friends,
    queryFn: api.getFriends,
  });

  const filtered = useMemo(() => {
    if (!data) return [];
    const q = search.trim().toLowerCase();
    let rows = data.friends;
    if (tab === 'online') rows = rows.filter((f) => f.state !== 'offline');
    if (tab === 'requests') rows = [];
    if (tab === 'clan') rows = rows.filter((f) => f.badge === 'PRO');
    if (q) rows = rows.filter((f) => f.name.toLowerCase().includes(q));
    return rows;
  }, [data, tab, search]);

  const header = (
    <AppHeader
      title="Friends"
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
          <LoadingState label="Loading crew" />
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
          <ErrorState message="Could not load your crew." onRetry={refetch} />
        </Screen>
      </>
    );
  }

  const messages = [...data.chat, ...extraMessages];

  return (
    <>
      {header}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Screen
          scroll
          tabBarClearance
          edges={{ top: false, bottom: false }}
          contentContainerStyle={{ paddingTop: HEADER_HEIGHT + spacing.lg, gap: spacing.md }}
          glows={[
            { color: faction.p2, size: 300, top: -60, right: -80 },
            { color: faction.p3, size: 240, top: 420, left: -70 },
          ]}
        >
          {/* Search + add */}
          <View style={{ flexDirection: 'row', gap: spacing.xs }}>
            <View style={{ flex: 1, justifyContent: 'center' }}>
              <Icon
                name="search"
                size={16}
                color={role.onSurfaceVariant}
                style={{ position: 'absolute', left: 12, zIndex: 1 }}
              />
              <TextInput
                value={search}
                onChangeText={setSearch}
                placeholder="Search gamer tag, clan or ID #..."
                placeholderTextColor={role.outline}
                accessibilityLabel="Search friends"
                style={{
                  height: 44,
                  paddingLeft: 36,
                  paddingRight: spacing.sm,
                  borderRadius: radii.full,
                  backgroundColor: surface.containerLow,
                  color: role.onSurface,
                  fontFamily: 'PlusJakartaSans_400Regular',
                  fontSize: 12,
                }}
              />
            </View>
            <NeonButton
              label="Add"
              icon="person_add"
              variant="glass"
              size="md"
              onPress={() => haptics.light()}
            />
          </View>

          {/* Invites */}
          {data.invites.length > 0 ? (
            <GlassSurface
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
                    borderRadius: radii.full,
                    backgroundColor: surface.containerHighest,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Icon name="mail" size={16} color={role.onTertiaryContainer} />
                </View>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <Text variant="label-md" color={role.onSurface}>
                      Party Invites
                    </Text>
                    <StatPill
                      label={`${data.invites.length} Pending`}
                      color={role.tertiary}
                      background={role.onTertiaryContainer}
                      size="sm"
                    />
                  </View>
                  <Text variant="body-sm" color={role.onSurfaceVariant} numberOfLines={1}>
                    {data.invites.map((i) => i.from).join(', ')} sent invites
                  </Text>
                </View>
              </View>
              <NeonButton
                label="Review"
                variant="glass"
                size="sm"
                onPress={() => haptics.light()}
              />
            </GlassSurface>
          ) : null}

          {/* Voice party */}
          <View style={{ gap: spacing.xs }}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <View
                  style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: faction.p1 }}
                />
                <Text variant="label-sm" color={role.onSurfaceVariant}>
                  Active Voice Party
                </Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
                <Icon name="graphic_eq" size={11} color={role.secondaryFixed} />
                <Text variant="label-sm" color={role.secondaryFixed}>
                  LIVE FREQ
                </Text>
              </View>
            </View>
            <VoicePartyCard party={data.party} onJoin={() => haptics.medium()} />
          </View>

          {/* Filter tabs */}
          <SegmentedTabs
            items={[
              {
                key: 'online',
                label: 'Online',
                badge: data.friends.filter((f) => f.state !== 'offline').length,
              },
              { key: 'all', label: 'All', badge: 42 },
              { key: 'requests', label: 'Requests' },
              { key: 'clan', label: 'Clan' },
            ]}
            value={tab}
            onChange={setTab}
          />

          {/* Friend list */}
          {filtered.length === 0 ? (
            <View style={{ height: 180 }}>
              <EmptyState
                icon={tab === 'requests' ? 'mail' : 'person_add'}
                title={tab === 'requests' ? 'No pending requests' : 'Nobody here'}
                message={
                  search
                    ? `No crew matching “${search}”.`
                    : tab === 'requests'
                      ? 'Friend requests will show up here.'
                      : 'Add friends to start a private party.'
                }
                actionLabel={search ? 'Clear search' : undefined}
                onAction={() => setSearch('')}
              />
            </View>
          ) : (
            <View style={{ gap: spacing.xs }}>
              {filtered.map((f) => (
                <FriendCard key={f.id} friend={f} onAction={() => haptics.light()} />
              ))}
            </View>
          )}

          <ChatDrawer
            messages={messages}
            onSend={(text) =>
              setExtraMessages((prev) => [
                ...prev,
                {
                  id: `local-${prev.length}`,
                  author: user.handle,
                  time: new Date().toLocaleTimeString('en-GB', {
                    hour: '2-digit',
                    minute: '2-digit',
                  }),
                  text,
                  avatar: user.avatar,
                },
              ])
            }
          />
        </Screen>
      </KeyboardAvoidingView>
    </>
  );
}

export default FriendsScreen;
