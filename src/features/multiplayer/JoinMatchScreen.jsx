/**
 * Join with code.
 *
 * The other half of an invite: the host shares four characters, this is where
 * they get typed. Without it a private room is unreachable and two testers can
 * only meet by both queueing for quick match within the same fifteen seconds.
 *
 * Validation here is only the shape of the code. Whether the room still exists
 * is the server's answer, and the match screen reports what it says — this
 * screen does not pre-flight the join, because two places deciding what a
 * valid code is would eventually disagree.
 */
import { useCallback, useState } from 'react';
import { View, TextInput, Pressable } from 'react-native';
import { useRouter } from 'expo-router';

import { Screen } from '../../components/common/Screen';
import { AppHeader, HEADER_HEIGHT } from '../../components/common/AppHeader';
import { Text } from '../../components/common/Text';
import { GlassSurface } from '../../components/common/GlassSurface';
import { NeonButton } from '../../components/buttons/NeonButton';
import { Icon } from '../../components/icons/Icon';

import { useUserStore } from '../../store/useUserStore';
import { useHaptics } from '../../hooks/useHaptics';
import { thousands } from '../../utils/format';
import { faction, role, surface, withAlpha } from '../../theme/colors';
import { radii, spacing } from '../../theme/spacing';
import { glow } from '../../theme/effects';

const CODE_LENGTH = 4;

/**
 * Codes are minted from an alphabet with no vowels and no lookalikes, so they
 * survive being read aloud. Accepting only those characters means a typo is
 * caught here rather than becoming a pointless round trip.
 */
const ALLOWED = /[^23456789ACDEFGHJKLMNPQRSTUVWXYZ]/g;

export function JoinMatchScreen() {
  const router = useRouter();
  const haptics = useHaptics();
  const user = useUserStore();

  const [code, setCode] = useState('');
  const complete = code.length === CODE_LENGTH;

  const onChange = useCallback((next) => {
    const cleaned = next.toUpperCase().replace(ALLOWED, '').slice(0, CODE_LENGTH);
    setCode(cleaned);
  }, []);

  const join = useCallback(() => {
    if (!complete) return;
    haptics.medium();
    router.push({ pathname: '/match/private', params: { mode: 'join', code } });
  }, [complete, code, haptics, router]);

  return (
    <>
      <AppHeader
        title="Join Match"
        gems={thousands(user.gems)}
        avatarSource={user.avatar}
        avatarFaction={user.faction}
        onBack={() => router.back()}
        showLogo={false}
      />

      <Screen
        edges={{ top: false, bottom: true }}
        contentContainerStyle={{
          paddingTop: HEADER_HEIGHT + spacing.lg,
          gap: spacing.md,
        }}
        glows={[{ color: faction.p1, size: 300, top: 120, left: -60, opacity: 0.1 }]}
      >
        <View style={{ alignItems: 'center', gap: spacing.xs }}>
          <Icon name="group_add" size={36} color={faction.p1} />
          <Text variant="headline-sm" color={role.onSurface} uppercase>
            Enter room code
          </Text>
          <Text
            variant="body-sm"
            color={role.onSurfaceVariant}
            style={{ textAlign: 'center', paddingHorizontal: spacing.lg }}
          >
            Four characters from whoever invited you.
          </Text>
        </View>

        {/*
          One hidden input behind four boxes: the boxes are what the player
          sees, the input is what the keyboard talks to. Four separate inputs
          would mean managing focus between them and would break paste.
        */}
        <Pressable accessibilityRole="button" accessibilityLabel="Room code" onPress={haptics.light}>
          <View style={{ flexDirection: 'row', gap: spacing.sm, justifyContent: 'center' }}>
            {Array.from({ length: CODE_LENGTH }).map((_, i) => {
              const char = code[i] ?? '';
              const active = i === code.length;
              return (
                <GlassSurface
                  key={i}
                  over="void"
                  radius={radii.xl}
                  style={[
                    {
                      width: 56,
                      height: 68,
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderWidth: 1,
                      borderColor: char || active ? faction.p1 : withAlpha(surface.containerHigh, 0.8),
                    },
                    char ? glow.primary : null,
                  ]}
                >
                  <Text variant="display-hero" color={char ? role.tertiary : role.outline} numeric>
                    {char || '·'}
                  </Text>
                </GlassSurface>
              );
            })}
          </View>

          <TextInput
            value={code}
            onChangeText={onChange}
            autoFocus
            autoCapitalize="characters"
            autoCorrect={false}
            maxLength={CODE_LENGTH}
            accessibilityLabel="Room code, four characters"
            onSubmitEditing={join}
            returnKeyType="go"
            /*
             * Transparent and laid over the boxes rather than display:none —
             * an input that is not rendered cannot hold focus, so the keyboard
             * would never appear.
             */
            style={{
              position: 'absolute',
              inset: 0,
              opacity: 0,
              color: 'transparent',
            }}
          />
        </Pressable>

        <NeonButton
          label="Join match"
          icon="arrow_forward"
          size="lg"
          fullWidth
          haptic="heavy"
          disabled={!complete}
          onPress={join}
        />

        <Text
          variant="body-sm"
          color={role.onSurfaceVariant}
          style={{ textAlign: 'center', paddingHorizontal: spacing.lg }}
        >
          No code? Start a private match from the lobby and share yours.
        </Text>
      </Screen>
    </>
  );
}

export default JoinMatchScreen;
