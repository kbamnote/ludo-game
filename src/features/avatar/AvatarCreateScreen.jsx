/**
 * Avatar creation — the product's core promise: YOUR FACE. YOUR AVATAR.
 *
 * One screen, five states, because the flow is linear and splitting it across
 * routes would make Back mean something different at every step:
 *
 *   consent -> capture -> style -> generating -> preview
 *
 * ── Consent is a gate, not a checkbox ───────────────────────────────────────
 * The camera cannot be reached until consent is given, and the copy says
 * plainly what happens to the photo — including that it is deleted once the
 * avatar is made. That last point is a real guarantee enforced server-side
 * (ludo-server AvatarsService.runJob), not a reassuring sentence.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { View, Pressable, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { useQuery } from '@tanstack/react-query';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

import { Screen } from '../../components/common/Screen';
import { AppHeader, HEADER_HEIGHT } from '../../components/common/AppHeader';
import { Text } from '../../components/common/Text';
import { StatPill } from '../../components/common/StatPill';
import { GlassSurface } from '../../components/common/GlassSurface';
import { ProgressBar } from '../../components/common/ProgressBar';
import { NeonButton } from '../../components/buttons/NeonButton';
import { Icon } from '../../components/icons/Icon';
import { LoadingState, ErrorState } from '../../components/common/States';

import { avatarApi } from '../../services/avatarApi';
import { usePhotoCapture } from './usePhotoCapture';
import { useConsentStore, POLICY_VERSION } from '../../store/useConsentStore';
import { useUserStore } from '../../store/useUserStore';
import { useHaptics } from '../../hooks/useHaptics';
import { useResponsive } from '../../hooks/useResponsive';
import { compactNumber, thousands } from '../../utils/format';
import { faction, role, surface, withAlpha } from '../../theme/colors';
import { radii, spacing } from '../../theme/spacing';
import { glow } from '../../theme/effects';

const PROMISES = [
  {
    icon: 'lock',
    title: 'Private by default',
    body: 'Your avatar is only visible to you until you choose otherwise. It is never public automatically.',
  },
  {
    icon: 'delete',
    title: 'Your photo is deleted',
    body: 'The photo is used to generate the avatar and then destroyed on our servers. We do not keep it.',
  },
  {
    icon: 'policy',
    title: 'Yours to remove',
    body: 'You can delete any avatar, and all your photo data, at any time from Settings.',
  },
];

function ConsentStep({ onAccept, onCancel }) {
  return (
    <Animated.View entering={FadeIn.duration(260)} style={{ gap: spacing.md }}>
      <View style={{ alignItems: 'center', gap: spacing.xs, paddingTop: spacing.sm }}>
        <View
          style={[
            {
              width: 72,
              height: 72,
              borderRadius: radii.full,
              backgroundColor: withAlpha(faction.p1, 0.15),
              alignItems: 'center',
              justifyContent: 'center',
            },
            glow.primary,
          ]}
        >
          <Icon name="photo_camera" size={32} color={faction.p1} />
        </View>
        <Text variant="headline-lg" color={role.primary} align="center" uppercase>
          Become the token
        </Text>
        <Text variant="body-md" color={role.onSurfaceVariant} align="center">
          Use a photo of yourself to generate a 3D cartoon avatar. Here is exactly what happens to
          it.
        </Text>
      </View>

      <View style={{ gap: spacing.xs }}>
        {PROMISES.map((p) => (
          <GlassSurface
            key={p.title}
            style={{ padding: spacing.md, flexDirection: 'row', gap: spacing.sm }}
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
              <Icon name={p.icon} size={18} color={faction.p1} />
            </View>
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text variant="body-lg" color={role.onSurface}>
                {p.title}
              </Text>
              <Text variant="body-sm" color={role.onSurfaceVariant}>
                {p.body}
              </Text>
            </View>
          </GlassSurface>
        ))}
      </View>

      <Text variant="body-sm" color={role.outline} align="center">
        Only upload a photo of yourself. Policy version {POLICY_VERSION}.
      </Text>

      <View style={{ gap: spacing.sm }}>
        <NeonButton
          label="I agree — choose a photo"
          size="lg"
          fullWidth
          icon="check_circle"
          haptic="medium"
          onPress={onAccept}
        />
        <NeonButton label="Not now" variant="ghost" fullWidth onPress={onCancel} />
      </View>
    </Animated.View>
  );
}

function CaptureStep({ photo, busy, onPick, onNext, onRetake }) {
  const { width } = useResponsive();
  const size = Math.min(width - spacing.margin * 2, 320);

  return (
    <Animated.View entering={FadeIn.duration(220)} style={{ gap: spacing.md }}>
      <View style={{ alignItems: 'center', gap: spacing.xs }}>
        <StatPill label="STEP 1 / 2 · YOUR PHOTO" color={faction.p1} tinted />
        <Text variant="headline-md" color={role.onSurface} align="center">
          Pick a clear photo of your face
        </Text>
        <Text variant="body-sm" color={role.onSurfaceVariant} align="center">
          Good light, facing the camera, nothing covering your face.
        </Text>
      </View>

      <View
        style={{
          width: size,
          height: size,
          alignSelf: 'center',
          borderRadius: radii.xxxl,
          overflow: 'hidden',
          borderWidth: 2,
          borderStyle: photo ? 'solid' : 'dashed',
          borderColor: photo ? faction.p1 : role.outlineVariant,
          backgroundColor: surface.containerLowest,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {photo ? (
          <Image
            source={{ uri: photo.uri }}
            style={{ width: '100%', height: '100%' }}
            contentFit="cover"
            accessibilityLabel="Your selected photo"
          />
        ) : (
          <View style={{ alignItems: 'center', gap: spacing.xs, padding: spacing.lg }}>
            <Icon name="face" size={44} color={role.outline} />
            <Text variant="body-sm" color={role.outline} align="center">
              Nothing selected yet
            </Text>
          </View>
        )}
      </View>

      <View style={{ flexDirection: 'row', gap: spacing.sm }}>
        <NeonButton
          label="Camera"
          icon="photo_camera"
          variant={photo ? 'glass' : 'primary'}
          style={{ flex: 1 }}
          disabled={busy}
          onPress={() => onPick('camera')}
        />
        <NeonButton
          label="Library"
          icon="style"
          variant="glass"
          style={{ flex: 1 }}
          disabled={busy}
          onPress={() => onPick('library')}
        />
      </View>

      {photo ? (
        <View style={{ gap: spacing.sm }}>
          <NeonButton
            label="Use this photo"
            size="lg"
            fullWidth
            iconRight="arrow_forward"
            onPress={onNext}
          />
          <NeonButton
            label="Crop again"
            variant="ghost"
            fullWidth
            icon="restart_alt"
            onPress={onRetake}
          />
        </View>
      ) : null}
    </Animated.View>
  );
}

function StyleStep({ styles, selected, onSelect, onBack, onGenerate }) {
  return (
    <Animated.View entering={FadeIn.duration(220)} style={{ gap: spacing.md }}>
      <View style={{ alignItems: 'center', gap: spacing.xs }}>
        <StatPill label="STEP 2 / 2 · YOUR STYLE" color={faction.p2} tinted />
        <Text variant="headline-md" color={role.onSurface} align="center">
          Pick a look
        </Text>
      </View>

      <View style={{ gap: spacing.xs }}>
        {styles.map((s) => {
          const active = s.id === selected;
          return (
            <Pressable
              key={s.id}
              accessibilityRole="radio"
              accessibilityState={{ selected: active }}
              accessibilityLabel={s.name}
              onPress={() => onSelect(s.id)}
              style={({ pressed }) => ({
                flexDirection: 'row',
                alignItems: 'center',
                gap: spacing.sm,
                padding: spacing.md,
                borderRadius: radii.xl,
                borderWidth: 1,
                borderColor: active ? faction.p1 : 'transparent',
                backgroundColor: active ? withAlpha(faction.p1, 0.1) : surface.container,
                transform: [{ scale: pressed ? 0.99 : 1 }],
              })}
            >
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
                <Icon
                  name="auto_awesome"
                  size={20}
                  color={active ? faction.p1 : role.onSurfaceVariant}
                />
              </View>
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text variant="body-lg" color={active ? role.primary : role.onSurface}>
                  {s.name}
                </Text>
                <Text variant="body-sm" color={role.onSurfaceVariant}>
                  {s.blurb}
                </Text>
              </View>
              <Icon
                name={active ? 'check_circle' : 'radio_button_unchecked'}
                size={20}
                color={active ? faction.p1 : role.outline}
              />
            </Pressable>
          );
        })}
      </View>

      <View style={{ gap: spacing.sm }}>
        <NeonButton
          label="Generate my avatar"
          size="lg"
          fullWidth
          icon="token"
          haptic="heavy"
          disabled={!selected}
          onPress={onGenerate}
        />
        <NeonButton label="Back" variant="ghost" fullWidth onPress={onBack} />
      </View>
    </Animated.View>
  );
}

function GeneratingStep({ progress, onCancel }) {
  return (
    <Animated.View
      entering={FadeIn.duration(220)}
      exiting={FadeOut.duration(140)}
      style={{ gap: spacing.lg, paddingTop: spacing.xl, alignItems: 'center' }}
    >
      <View
        style={[
          {
            width: 96,
            height: 96,
            borderRadius: radii.full,
            backgroundColor: withAlpha(faction.p1, 0.12),
            alignItems: 'center',
            justifyContent: 'center',
          },
          glow.primaryStrong,
        ]}
      >
        <Icon name="auto_awesome" size={40} color={faction.p1} />
      </View>

      <View style={{ alignItems: 'center', gap: spacing.xs }}>
        <Text variant="headline-md" color={role.primary} align="center">
          Minting your avatar
        </Text>
        <Text variant="body-sm" color={role.onSurfaceVariant} align="center">
          This usually takes under a minute. Your photo is deleted as soon as this finishes.
        </Text>
      </View>

      <ProgressBar progress={progress} style={{ width: '100%' }} height={10} />

      <NeonButton label="Cancel" variant="ghost" onPress={onCancel} />
    </Animated.View>
  );
}

function PreviewStep({ avatar, onUse, onRetry, onDiscard }) {
  const { width } = useResponsive();
  const size = Math.min(width - spacing.margin * 2, 320);

  return (
    <Animated.View entering={FadeIn.duration(260)} style={{ gap: spacing.md }}>
      <View style={{ alignItems: 'center', gap: spacing.xs }}>
        <StatPill label="READY" dot color={faction.p1} />
        <Text variant="headline-md" color={role.onSurface} align="center">
          Meet your token
        </Text>
      </View>

      <View
        style={[
          {
            width: size,
            height: size,
            alignSelf: 'center',
            borderRadius: radii.full,
            overflow: 'hidden',
            borderWidth: 4,
            borderColor: faction.p1,
            backgroundColor: surface.containerLowest,
          },
          glow.primaryStrong,
        ]}
      >
        <Image
          source={{ uri: avatar.url }}
          style={{ width: '100%', height: '100%' }}
          contentFit="cover"
          transition={240}
          accessibilityLabel="Your generated avatar"
        />
      </View>

      <GlassSurface
        style={{ padding: spacing.sm, flexDirection: 'row', gap: 6, alignItems: 'center' }}
      >
        <Icon name="lock" size={14} color={faction.p1} />
        <Text variant="body-sm" color={role.onSurfaceVariant} style={{ flex: 1 }}>
          Private to you. Your source photo has been deleted.
        </Text>
      </GlassSurface>

      <View style={{ gap: spacing.sm }}>
        <NeonButton
          label="Use this avatar"
          size="lg"
          fullWidth
          icon="check"
          haptic="heavy"
          onPress={onUse}
        />
        <NeonButton
          label="Try another style"
          variant="glass"
          fullWidth
          icon="replay"
          onPress={onRetry}
        />
        <NeonButton label="Discard" variant="ghost" fullWidth icon="delete" onPress={onDiscard} />
      </View>
    </Animated.View>
  );
}

export function AvatarCreateScreen() {
  const router = useRouter();
  const haptics = useHaptics();
  const user = useUserStore();
  const setProfile = useUserStore((s) => s.setProfile);

  const hasConsent = useConsentStore((s) => s.acceptedVersion === POLICY_VERSION);
  const accept = useConsentStore((s) => s.accept);

  const [step, setStep] = useState(hasConsent ? 'capture' : 'consent');
  const [styleId, setStyleId] = useState(null);
  const [progress, setProgress] = useState(0);
  const [avatar, setAvatar] = useState(null);
  const [error, setError] = useState(null);
  const abortRef = useRef(null);

  const { photo, busy, pick, clear } = usePhotoCapture({ hasConsent });

  const stylesQuery = useQuery({
    queryKey: ['avatar-styles'],
    queryFn: avatarApi.getStyles,
    retry: 1,
  });

  useEffect(() => () => abortRef.current?.abort(), []);

  const handlePick = useCallback(
    async (source) => {
      try {
        setError(null);
        await pick(source);
      } catch (e) {
        setError(e.message);
      }
    },
    [pick]
  );

  const generate = useCallback(async () => {
    if (!photo || !styleId) return;

    const controller = new AbortController();
    abortRef.current = controller;

    setStep('generating');
    setProgress(0.05);
    setError(null);

    try {
      const uploadId = await avatarApi.uploadPhoto({
        uri: photo.uri,
        contentType: photo.contentType,
        byteSize: photo.byteSize,
        signal: controller.signal,
      });
      setProgress(0.25);

      const { jobId } = await avatarApi.startJob({
        uploadId,
        styleId,
        policyVersion: POLICY_VERSION,
        signal: controller.signal,
      });

      const job = await avatarApi.waitForJob(jobId, {
        signal: controller.signal,
        onProgress: (j) => setProgress(0.25 + (j.progress ?? 0) * 0.75),
      });

      haptics.success();
      setAvatar(job.results[0]);
      setStep('preview');
    } catch (e) {
      if (e.code === 'cancelled') {
        setStep('style');
        return;
      }
      haptics.error();
      setError(e.message);
      setStep('style');
    } finally {
      abortRef.current = null;
    }
  }, [photo, styleId, haptics]);

  const use = useCallback(async () => {
    try {
      await avatarApi.equip(avatar.avatarId);
      setProfile({ avatar: { uri: avatar.url } });
      haptics.success();
      router.back();
    } catch (e) {
      Alert.alert('Could not save', e.message);
    }
  }, [avatar, setProfile, haptics, router]);

  const discard = useCallback(async () => {
    try {
      await avatarApi.remove(avatar.avatarId);
    } catch {
      // Best effort — the user asked for it gone, and Settings offers a
      // full wipe if this one call failed.
    }
    clear();
    setAvatar(null);
    setStep('capture');
  }, [avatar, clear]);

  const header = (
    <AppHeader
      title="Create avatar"
      coins={compactNumber(user.coins)}
      gems={thousands(user.gems)}
      avatarSource={user.avatar}
      avatarFaction={user.faction}
      onBack={() => router.back()}
      showLogo={false}
    />
  );

  return (
    <>
      {header}
      <Screen
        scroll
        tabBarClearance
        edges={{ top: false, bottom: false }}
        contentContainerStyle={{ paddingTop: HEADER_HEIGHT + spacing.lg, gap: spacing.md }}
        glows={[{ color: faction.p1, size: 300, top: 40, left: -70, opacity: 0.12 }]}
      >
        {error ? (
          <GlassSurface
            style={{
              padding: spacing.sm,
              flexDirection: 'row',
              gap: 6,
              borderWidth: 1,
              borderColor: withAlpha(faction.p3, 0.4),
            }}
          >
            <Icon name="warning" size={14} color={faction.p3} />
            <Text variant="body-sm" color={role.onSurfaceVariant} style={{ flex: 1 }}>
              {error}
            </Text>
          </GlassSurface>
        ) : null}

        {step === 'consent' ? (
          <ConsentStep
            onAccept={() => {
              haptics.medium();
              accept();
              setStep('capture');
            }}
            onCancel={() => router.back()}
          />
        ) : null}

        {step === 'capture' ? (
          <CaptureStep
            photo={photo}
            busy={busy}
            onPick={handlePick}
            onRetake={() => handlePick('library')}
            onNext={() => setStep('style')}
          />
        ) : null}

        {step === 'style' ? (
          stylesQuery.isPending ? (
            <View style={{ height: 240 }}>
              <LoadingState label="Loading styles" />
            </View>
          ) : stylesQuery.isError ? (
            <View style={{ height: 260 }}>
              <ErrorState
                title="Could not load styles"
                message={stylesQuery.error?.message}
                onRetry={stylesQuery.refetch}
              />
            </View>
          ) : (
            <StyleStep
              styles={stylesQuery.data.styles}
              selected={styleId}
              onSelect={setStyleId}
              onBack={() => setStep('capture')}
              onGenerate={generate}
            />
          )
        ) : null}

        {step === 'generating' ? (
          <GeneratingStep
            progress={progress}
            onCancel={() => {
              abortRef.current?.abort();
              setStep('style');
            }}
          />
        ) : null}

        {step === 'preview' && avatar ? (
          <PreviewStep
            avatar={avatar}
            onUse={use}
            onRetry={() => setStep('style')}
            onDiscard={discard}
          />
        ) : null}
      </Screen>
    </>
  );
}

export default AvatarCreateScreen;
