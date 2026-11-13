/**
 * AppHeader — the fixed 64pt header on every `mobile_tab` Stitch screen.
 *
 *   [logo] Title          [48.2K coins] [1,250 gems] [avatar●]
 *          LVL 24
 *
 * One of the two real-BlurView surfaces per screen (the tab bar is the other),
 * because it genuinely overlaps scrolling content — see PROJECT_STATUS.md §7.1.
 */
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { Text } from './Text';
import { Avatar } from './Avatar';
import { CurrencyChip } from './StatPill';
import { IconButton } from '../buttons/IconButton';
import { GlassSurface } from './GlassSurface';
import { role } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { images } from '../../assets/images';

export const HEADER_HEIGHT = 64;

export function AppHeader({
  title,
  subtitle,
  coins,
  gems,
  avatarSource,
  avatarFaction = 'p1',
  onPressAvatar,
  onBack,
  showLogo = true,
  right,
}) {
  const insets = useSafeAreaInsets();

  return (
    <GlassSurface
      blurred
      debugLabel="AppHeader"
      radius={0}
      elevation="sm"
      highlight={false}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        paddingTop: insets.top,
        borderWidth: 0,
      }}
    >
      <View
        style={{
          height: HEADER_HEIGHT,
          paddingHorizontal: spacing.margin,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: spacing.sm,
        }}
      >
        <View
          style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs, flexShrink: 1 }}
        >
          {onBack ? (
            <IconButton
              icon="arrow_back_ios_new"
              onPress={onBack}
              size={44}
              background="transparent"
              accessibilityLabel="Go back"
            />
          ) : null}

          {showLogo ? (
            <Image
              source={images.brandLogo}
              style={{ width: 32, height: 32 }}
              contentFit="contain"
              accessibilityLabel="Ludo After Dark"
            />
          ) : null}

          <View style={{ flexShrink: 1 }}>
            <Text variant="headline-sm" color={role.primary} numberOfLines={1}>
              {title}
            </Text>
            {subtitle ? (
              <Text variant="label-sm" color={role.primaryFixedDim}>
                {subtitle}
              </Text>
            ) : null}
          </View>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
          {right}
          {coins != null ? <CurrencyChip kind="coins" amount={coins} /> : null}
          {gems != null ? <CurrencyChip kind="gems" amount={gems} /> : null}
          {avatarSource !== undefined ? (
            <Avatar
              source={avatarSource}
              size={32}
              faction={avatarFaction}
              online
              onPress={onPressAvatar}
            />
          ) : null}
        </View>
      </View>
    </GlassSurface>
  );
}

export default AppHeader;
