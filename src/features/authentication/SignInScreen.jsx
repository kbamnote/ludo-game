/**
 * Login & Signup — Stitch screen 3.
 *
 * One screen with a segmented Sign in / Register switch, exactly as designed —
 * both modes share the phone-OTP form, so a separate signup route would be two
 * copies of the same thing.
 *
 * Phase 2 scope: the form is fully interactive and validated with React Hook
 * Form, but nothing authenticates for real — there is no server until Phase 3.
 * "Play as Guest" is wired to the auth store so the rest of the app is
 * reachable, and the OTP drawer accepts any 6 digits.
 */
import { useRef, useState } from 'react';
import { View, Pressable, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { useForm, Controller } from 'react-hook-form';
import Animated, { FadeInDown, FadeOutUp } from 'react-native-reanimated';

import { Screen } from '../../components/common/Screen';
import { Text } from '../../components/common/Text';
import { StatPill } from '../../components/common/StatPill';
import { GlassSurface } from '../../components/common/GlassSurface';
import { SegmentedTabs } from '../../components/common/SegmentedTabs';
import { NeonButton } from '../../components/buttons/NeonButton';
import { Icon } from '../../components/icons/Icon';
import { AppleMark, GoogleMark, DiscordMark } from './BrandGlyphs';

import { useAuthStore } from '../../store/useAuthStore';
import { useHaptics } from '../../hooks/useHaptics';
import { faction, role, surface, withAlpha } from '../../theme/colors';
import { radii, spacing } from '../../theme/spacing';
import { images } from '../../assets/images';

const OTP_LENGTH = 6;

function SocialButton({
  mark,
  label,
  trailing,
  onPress,
  background = surface.containerHigh,
  color = role.onSurface,
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm + 2,
        borderRadius: radii.full,
        backgroundColor: background,
        transform: [{ scale: pressed ? 0.98 : 1 }],
      })}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
        {mark}
        <Text variant="label-lg" color={color}>
          {label}
        </Text>
      </View>
      {trailing ?? <Icon name="arrow_forward_ios" size={12} color={role.outline} />}
    </Pressable>
  );
}

function OtpInput({ value, onChange }) {
  const refs = useRef([]);

  const setDigit = (i, digit) => {
    const next = value.split('');
    next[i] = digit.replace(/\D/g, '').slice(-1) || '';
    const joined = next.join('').slice(0, OTP_LENGTH);
    onChange(joined);
    if (digit && i < OTP_LENGTH - 1) refs.current[i + 1]?.focus();
  };

  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: spacing.xs }}>
      {Array.from({ length: OTP_LENGTH }, (_, i) => (
        <TextInput
          key={i}
          ref={(el) => (refs.current[i] = el)}
          value={value[i] ?? ''}
          onChangeText={(d) => setDigit(i, d)}
          onKeyPress={({ nativeEvent }) => {
            if (nativeEvent.key === 'Backspace' && !value[i] && i > 0) refs.current[i - 1]?.focus();
          }}
          keyboardType="number-pad"
          maxLength={1}
          accessibilityLabel={`Verification digit ${i + 1}`}
          placeholder="•"
          placeholderTextColor={role.outline}
          style={{
            width: 44,
            height: 48,
            textAlign: 'center',
            borderRadius: radii.lg,
            backgroundColor: surface.containerLowest,
            color: value[i] ? faction.p1 : role.onSurface,
            fontFamily: 'Syne_600SemiBold',
            fontSize: 18,
          }}
        />
      ))}
    </View>
  );
}

export function SignInScreen() {
  const router = useRouter();
  const haptics = useHaptics();
  const signInAsGuest = useAuthStore((s) => s.signInAsGuest);

  const [mode, setMode] = useState('login');
  const [otpOpen, setOtpOpen] = useState(false);
  const [otp, setOtp] = useState('704');

  const { control, handleSubmit, formState } = useForm({
    defaultValues: { phone: '' },
    mode: 'onChange',
  });

  const enterApp = () => {
    signInAsGuest();
    router.replace('/(tabs)');
  };

  const sendCode = () => {
    haptics.medium();
    setOtpOpen(true);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Screen scroll contentContainerStyle={{ paddingBottom: spacing.xl, gap: spacing.sm }}>
        {/* Live room feed */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingTop: spacing.sm,
          }}
        >
          <StatPill label="Neo-Shibuya High Rollers" dot color={faction.p1} />
          <StatPill label="14,290 ONLINE" icon="bolt" color={role.secondaryFixed} />
        </View>

        {/* Hero banner */}
        <View
          style={{
            height: 144,
            borderRadius: radii.xl,
            overflow: 'hidden',
            backgroundColor: surface.containerLowest,
          }}
        >
          <Image
            source={images.authBannerClub}
            style={{ width: '100%', height: '100%' }}
            contentFit="cover"
            transition={220}
            accessibilityLabel="Tokyo nocturnal club"
          />
          <View
            style={{
              position: 'absolute',
              inset: 0,
              backgroundColor: withAlpha(surface.base, 0.45),
            }}
          />
          <View
            style={{
              position: 'absolute',
              top: spacing.sm,
              left: spacing.sm,
              flexDirection: 'row',
              gap: spacing.xs,
            }}
          >
            <StatPill label="KYOTO VIP" color={faction.p1} size="sm" />
            <StatPill label="STAKES: 50K" color={faction.p2} size="sm" />
          </View>
          <View
            style={{
              position: 'absolute',
              bottom: spacing.sm,
              left: spacing.md,
              right: spacing.md,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Icon name="terminal" size={12} color={faction.p1} />
              <Text variant="label-sm" color={faction.p1}>
                AFTER HOURS ACCESS
              </Text>
            </View>
            <Text variant="headline-lg" color={role.primary} uppercase>
              Join the Syndicate
            </Text>
          </View>
        </View>

        {/* Auth chassis */}
        <GlassSurface over="void" style={{ padding: spacing.md, gap: spacing.md }}>
          <SegmentedTabs
            items={[
              { key: 'login', label: 'ENTER SYNDICATE' },
              { key: 'register', label: 'NEW RUNNER' },
            ]}
            value={mode}
            onChange={setMode}
          />

          <View style={{ gap: spacing.xs }}>
            <SocialButton
              mark={<AppleMark />}
              label="Continue with Apple"
              onPress={enterApp}
              color={role.tertiary}
            />
            <SocialButton mark={<GoogleMark />} label="Continue with Google" onPress={enterApp} />
            <SocialButton
              mark={<DiscordMark />}
              label="Continue with Discord"
              onPress={enterApp}
              background={surface.containerHighest}
              color={role.secondary}
              trailing={
                <StatPill label="VOICE SYNC" color={role.secondaryFixed} tinted size="sm" />
              }
            />
          </View>

          {/* Divider */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
            <View style={{ flex: 1, height: 1, backgroundColor: surface.bright }} />
            <Text variant="label-sm" color={role.outline}>
              OR RUN WIRE PROTOCOL
            </Text>
            <View style={{ flex: 1, height: 1, backgroundColor: surface.bright }} />
          </View>

          {/* Phone */}
          <View style={{ gap: spacing.sm }}>
            <View style={{ flexDirection: 'row', gap: spacing.xs }}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Select country code"
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 4,
                  paddingHorizontal: spacing.md,
                  borderRadius: radii.xl,
                  backgroundColor: surface.containerHigh,
                }}
              >
                <View
                  style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: faction.p1 }}
                />
                <Text variant="label-md" color={role.onSurface}>
                  +1
                </Text>
                <Icon name="expand_more" size={14} color={role.outline} />
              </Pressable>

              <Controller
                control={control}
                name="phone"
                rules={{
                  required: 'Enter your number',
                  minLength: { value: 7, message: 'That number looks too short' },
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    keyboardType="phone-pad"
                    placeholder="(555) 019-2834"
                    placeholderTextColor={role.outline}
                    accessibilityLabel="Phone number"
                    style={{
                      flex: 1,
                      paddingHorizontal: spacing.md,
                      paddingVertical: 12,
                      borderRadius: radii.xl,
                      backgroundColor: surface.containerHigh,
                      color: role.onSurface,
                      fontFamily: 'PlusJakartaSans_400Regular',
                      fontSize: 14,
                    }}
                  />
                )}
              />
            </View>

            {formState.errors.phone ? (
              <Text variant="body-sm" color={role.error}>
                {formState.errors.phone.message}
              </Text>
            ) : null}

            <NeonButton
              label={mode === 'login' ? 'Get verification code' : 'Claim 10,000 runner bonus'}
              icon="verified_user"
              fullWidth
              onPress={handleSubmit(sendCode)}
            />
          </View>

          {/* OTP drawer */}
          {otpOpen ? (
            <Animated.View
              entering={FadeInDown.duration(220)}
              exiting={FadeOutUp.duration(160)}
              style={{
                gap: spacing.sm,
                paddingTop: spacing.md,
                borderTopWidth: 1,
                borderTopColor: surface.bright,
              }}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text variant="label-sm" color={faction.p1}>
                  6-DIGIT CHIP OVERRIDE
                </Text>
                <Pressable accessibilityRole="button" hitSlop={8}>
                  <Text variant="label-sm" color={role.outline}>
                    RESEND (42s)
                  </Text>
                </Pressable>
              </View>

              <OtpInput value={otp} onChange={setOtp} />

              <NeonButton
                label="Confirm access"
                variant="secondary"
                fullWidth
                disabled={otp.length < OTP_LENGTH}
                onPress={enterApp}
              />
            </Animated.View>
          ) : null}
        </GlassSurface>

        {/* Guest mode */}
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
                  width: 40,
                  height: 40,
                  borderRadius: radii.full,
                  backgroundColor: surface.container,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Icon name="theater_comedy" size={20} color={role.secondaryFixed} />
              </View>
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text variant="headline-sm" color={role.onSurface}>
                  Play as Guest
                </Text>
                <Text variant="body-sm" color={role.onSurfaceVariant} numberOfLines={1}>
                  Free 5,000 Neon Chips • Voice Chat Enabled
                </Text>
              </View>
            </View>
            <NeonButton label="Ignite" variant="glass" size="sm" onPress={enterApp} />
          </View>

          <View style={{ flexDirection: 'row', gap: spacing.xs }}>
            {[
              { icon: 'casino', label: '3D Physics', accent: faction.p1 },
              { icon: 'mic', label: 'Open Mic', accent: faction.p2 },
              { icon: 'shield', label: 'No Mercy', accent: role.tertiaryFixedDim },
            ].map((p) => (
              <View
                key={p.label}
                style={{
                  flex: 1,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 6,
                  padding: spacing.sm,
                  borderRadius: radii.lg,
                  backgroundColor: surface.containerLowest,
                }}
              >
                <Icon name={p.icon} size={14} color={p.accent} />
                <Text variant="label-sm" color={role.onSurface} numberOfLines={1}>
                  {p.label}
                </Text>
              </View>
            ))}
          </View>
        </GlassSurface>

        {/* Compliance */}
        <View style={{ alignItems: 'center', gap: 4, paddingHorizontal: spacing.sm }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Icon name="lock" size={12} color={role.outline} />
            <Text variant="label-sm" color={role.outline}>
              256-Bit Encrypted Syndicate Node
            </Text>
          </View>
          <Text variant="body-sm" color={role.outline} align="center">
            By logging in, you accept the Terms of Combat and Night Market Privacy Code. Age 18+
            wager tier strictly simulated.
          </Text>
        </View>
      </Screen>
    </KeyboardAvoidingView>
  );
}

export default SignInScreen;
