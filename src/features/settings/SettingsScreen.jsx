/**
 * Settings.
 *
 * ── No Stitch design exists for this screen ─────────────────────────────────
 * The brief requires Settings, but it was never generated (see
 * docs/ASSET_INVENTORY.md §6.1). Rather than invent a new visual language, this
 * is composed strictly from the existing token system and the components the
 * other twelve screens established: GlassSurface sections, StatPill chips,
 * label-sm section headers, faction accents. Nothing new was designed.
 *
 * The privacy section is not filler. Phase 3 requires explicit photo-upload
 * consent and the ability to delete uploaded photos and generated avatars, and
 * those controls need a home before the feature ships — not after.
 */
import { useState } from 'react';
import { View, Switch, Pressable, Modal, Linking, Alert } from 'react-native';
import { useRouter } from 'expo-router';

import { Screen } from '../../components/common/Screen';
import { AppHeader, HEADER_HEIGHT } from '../../components/common/AppHeader';
import { Text } from '../../components/common/Text';
import { StatPill } from '../../components/common/StatPill';
import { GlassSurface } from '../../components/common/GlassSurface';
import { Avatar } from '../../components/common/Avatar';
import { NeonButton } from '../../components/buttons/NeonButton';
import { Icon } from '../../components/icons/Icon';

import { useSettingsStore } from '../../store/useSettingsStore';
import { useUserStore } from '../../store/useUserStore';
import { useAuthStore } from '../../store/useAuthStore';
import { useConsentStore } from '../../store/useConsentStore';
import { avatarApi } from '../../services/avatarApi';
import { useHaptics } from '../../hooks/useHaptics';
import { compactNumber, thousands } from '../../utils/format';
import { faction, role, surface, withAlpha } from '../../theme/colors';
import { radii, spacing } from '../../theme/spacing';

function Section({ title, icon, accent = 'p1', children, footer }) {
  return (
    <View style={{ gap: spacing.xs }}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 6,
          paddingHorizontal: spacing.xs,
        }}
      >
        <Icon name={icon} size={14} color={faction[accent]} />
        <Text variant="label-sm" color={role.onSurfaceVariant}>
          {title}
        </Text>
      </View>
      <GlassSurface over="void" style={{ paddingHorizontal: spacing.md }}>
        {children}
      </GlassSurface>
      {footer ? (
        <Text variant="body-sm" color={role.outline} style={{ paddingHorizontal: spacing.xs }}>
          {footer}
        </Text>
      ) : null}
    </View>
  );
}

function Row({
  icon,
  iconColor,
  label,
  detail,
  right,
  onPress,
  last = false,
  destructive = false,
}) {
  const Container = onPress ? Pressable : View;

  return (
    <Container
      onPress={onPress}
      accessibilityRole={onPress ? 'button' : undefined}
      style={({ pressed } = {}) => ({
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        paddingVertical: spacing.md,
        borderBottomWidth: last ? 0 : 1,
        borderBottomColor: withAlpha(surface.bright, 0.5),
        opacity: pressed ? 0.7 : 1,
      })}
    >
      {icon ? (
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
          <Icon
            name={icon}
            size={16}
            color={destructive ? role.error : (iconColor ?? role.onSurfaceVariant)}
          />
        </View>
      ) : null}

      <View style={{ flex: 1, minWidth: 0 }}>
        <Text variant="body-lg" color={destructive ? role.error : role.onSurface} numberOfLines={1}>
          {label}
        </Text>
        {detail ? (
          <Text variant="body-sm" color={role.onSurfaceVariant} numberOfLines={2}>
            {detail}
          </Text>
        ) : null}
      </View>

      {right ?? (onPress ? <Icon name="chevron_right" size={18} color={role.outline} /> : null)}
    </Container>
  );
}

function Toggle({ value, onChange, label }) {
  return (
    <Switch
      value={value}
      onValueChange={onChange}
      accessibilityLabel={label}
      trackColor={{ false: surface.containerHighest, true: withAlpha(faction.p1, 0.5) }}
      thumbColor={value ? faction.p1 : role.outline}
      ios_backgroundColor={surface.containerHighest}
    />
  );
}

export function SettingsScreen() {
  const router = useRouter();
  const haptics = useHaptics();
  const user = useUserStore();
  const settings = useSettingsStore();
  const signOut = useAuthStore((s) => s.signOut);
  const withdrawConsent = useConsentStore((s) => s.withdraw);
  const [working, setWorking] = useState(false);

  const [confirm, setConfirm] = useState(null);

  const toggle = (key) => {
    haptics.select();
    settings.toggle(key);
  };

  const runConfirm = async () => {
    const action = confirm;
    setConfirm(null);

    /**
     * Deletion is real: it calls the server, which removes the database row
     * AND the stored object. Consent is withdrawn alongside it — an agreement
     * should not outlive the data it was given for.
     */
    if (action?.kind === 'deleteAvatarData') {
      setWorking(true);
      try {
        await avatarApi.removeAll();
        withdrawConsent();
        haptics.success();
        Alert.alert(
          'Deleted',
          'Your avatars and any uploaded photos have been removed from our servers.'
        );
      } catch (e) {
        haptics.error();
        Alert.alert('Could not delete', e.message);
      } finally {
        setWorking(false);
      }
      return;
    }

    if (action?.kind === 'signOut') {
      await signOut();
      router.replace('/(auth)/sign-in');
    }
  };

  return (
    <>
      <AppHeader
        title="Settings"
        coins={compactNumber(user.coins)}
        gems={thousands(user.gems)}
        avatarSource={user.avatar}
        avatarFaction={user.faction}
        onBack={() => router.back()}
        showLogo={false}
      />

      <Screen
        scroll
        tabBarClearance
        edges={{ top: false, bottom: false }}
        contentContainerStyle={{ paddingTop: HEADER_HEIGHT + spacing.lg, gap: spacing.lg }}
        glows={[{ color: faction.p1, size: 280, top: -40, right: -70, opacity: 0.1 }]}
      >
        {/* Account card */}
        <GlassSurface
          over="void"
          style={{
            padding: spacing.md,
            flexDirection: 'row',
            alignItems: 'center',
            gap: spacing.md,
          }}
        >
          <Avatar source={user.avatar} size={56} faction={user.faction} online />
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text variant="headline-sm" color={role.primary} numberOfLines={1}>
              {user.displayName}
            </Text>
            <View
              style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginTop: 2 }}
            >
              <StatPill label={`LVL ${user.level}`} color={role.primaryFixedDim} tinted size="sm" />
              <StatPill label={`[${user.clan}]`} color={role.secondaryFixed} size="sm" />
            </View>
          </View>
          <NeonButton
            label="Edit"
            variant="glass"
            size="sm"
            onPress={() => router.navigate('/profile/avatar')}
          />
        </GlassSurface>

        <Section title="AUDIO" icon="music_note" accent="p2">
          <Row
            icon="volume_up"
            label="Sound effects"
            detail="Dice, captures, UI feedback"
            right={
              <Toggle
                value={settings.soundEnabled}
                onChange={() => toggle('soundEnabled')}
                label="Sound effects"
              />
            }
          />
          <Row
            icon="music_note"
            label="Music"
            detail="Lo-fi lounge ambience"
            right={
              <Toggle
                value={settings.musicEnabled}
                onChange={() => toggle('musicEnabled')}
                label="Music"
              />
            }
            last
          />
        </Section>

        <Section
          title="FEEL & MOTION"
          icon="animation"
          accent="p1"
          footer="Reduced motion stops looping animations — tickers, waveforms, confetti — while keeping transitions."
        >
          <Row
            icon="vibration"
            label="Haptics"
            detail="Vibration on rolls and taps"
            right={
              <Toggle
                value={settings.hapticsEnabled}
                onChange={() => toggle('hapticsEnabled')}
                label="Haptics"
              />
            }
          />
          <Row
            icon="animation"
            label="Animations"
            right={
              <Toggle
                value={settings.animationsEnabled}
                onChange={() => toggle('animationsEnabled')}
                label="Animations"
              />
            }
          />
          <Row
            icon="speed"
            label="Reduced motion"
            right={
              <Toggle
                value={settings.reducedMotion}
                onChange={() => toggle('reducedMotion')}
                label="Reduced motion"
              />
            }
            last
          />
        </Section>

        <Section title="SOCIAL" icon="forum" accent="p2">
          <Row
            icon="headset_mic"
            label="Auto-join voice"
            detail="Connect to squad voice when a match starts"
            right={
              <Toggle
                value={settings.voiceAutoJoin}
                onChange={() => toggle('voiceAutoJoin')}
                label="Auto-join voice"
              />
            }
          />
          <Row
            icon="notifications"
            label="Notifications"
            detail="Invites, turns and friend requests"
            right={
              <Toggle
                value={settings.pushEnabled}
                onChange={() => toggle('pushEnabled')}
                label="Notifications"
              />
            }
          />
          <Row
            icon="block"
            label="Blocked players"
            detail="Manage who can reach you"
            onPress={() => haptics.light()}
            last
          />
        </Section>

        <Section
          title="PRIVACY & YOUR DATA"
          icon="policy"
          accent="p3"
          footer="Photos you upload are private by default and are never shown to other players without your say-so."
        >
          <Row
            icon="photo_camera"
            label="Create a new avatar"
            detail="Use a photo to generate a 3D cartoon avatar"
            onPress={() => router.navigate('/profile/create-avatar')}
          />
          <Row
            icon="delete"
            label={working ? 'Deleting…' : 'Delete my photo data'}
            detail="Removes every avatar and any uploaded photo from our servers"
            destructive
            onPress={() =>
              !working &&
              setConfirm({
                kind: 'deleteAvatarData',
                title: 'Delete your photo data?',
                body: 'Every avatar you have generated, and any photo still held for processing, will be permanently removed from our servers. This cannot be undone.',
                confirmLabel: 'Delete',
              })
            }
          />
          <Row
            icon="visibility_off"
            label="Profile visibility"
            right={<StatPill label="FRIENDS ONLY" color={role.secondaryFixed} size="sm" />}
            onPress={() => haptics.light()}
          />
          <Row
            icon="policy"
            label="Privacy policy"
            onPress={() => Linking.openURL('https://example.com/privacy').catch(() => {})}
            last
          />
        </Section>

        <Section title="ABOUT" icon="info" accent="p4">
          <Row
            icon="info"
            label="Version"
            right={
              <Text variant="label-md" color={role.onSurfaceVariant}>
                0.1.0 (Phase 2)
              </Text>
            }
          />
          <Row icon="description" label="Terms of combat" onPress={() => haptics.light()} />
          <Row icon="bug_report" label="Report a problem" onPress={() => haptics.light()} last />
        </Section>

        <Section title="ACCOUNT" icon="logout" accent="p3">
          <Row
            icon="logout"
            label="Sign out"
            destructive
            onPress={() =>
              setConfirm({
                kind: 'signOut',
                title: 'Sign out?',
                body: 'You will need to sign in again to get back into your account.',
                confirmLabel: 'Sign out',
              })
            }
            last
          />
        </Section>

        {__DEV__ ? (
          <View
            style={{
              padding: spacing.sm,
              borderRadius: radii.lg,
              borderWidth: 1,
              borderColor: withAlpha(faction.p2, 0.35),
              backgroundColor: withAlpha(faction.p2, 0.08),
            }}
          >
            <Text variant="label-sm" color={faction.p2}>
              NO STITCH DESIGN FOR THIS SCREEN
            </Text>
            <Text variant="body-sm" color={role.onSurfaceVariant}>
              Composed from the existing token system and components. Dev-only notice.
            </Text>
          </View>
        ) : null}
      </Screen>

      {/* Confirmation */}
      <Modal
        visible={!!confirm}
        transparent
        animationType="fade"
        onRequestClose={() => setConfirm(null)}
      >
        <View
          style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            padding: spacing.margin,
            backgroundColor: withAlpha(surface.containerLowest, 0.85),
          }}
        >
          <GlassSurface
            over="containerHigh"
            style={{ width: '100%', maxWidth: 360, padding: spacing.md, gap: spacing.sm }}
          >
            <Text variant="headline-sm" color={role.onSurface}>
              {confirm?.title}
            </Text>
            <Text variant="body-sm" color={role.onSurfaceVariant}>
              {confirm?.body}
            </Text>
            <View style={{ flexDirection: 'row', gap: spacing.sm, paddingTop: spacing.xs }}>
              <NeonButton
                label="Cancel"
                variant="glass"
                style={{ flex: 1 }}
                onPress={() => setConfirm(null)}
              />
              <NeonButton
                label={confirm?.confirmLabel ?? 'Confirm'}
                variant="danger"
                style={{ flex: 1 }}
                onPress={runConfirm}
              />
            </View>
          </GlassSurface>
        </View>
      </Modal>
    </>
  );
}

export default SettingsScreen;
