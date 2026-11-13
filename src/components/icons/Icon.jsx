/**
 * Icon — the single entry point for every glyph in the app.
 *
 * The Stitch design uses Material Symbols Outlined (98 distinct glyphs). Several
 * of them — `skull`, `crown`, `swords`, `apparel`, `magic_button`,
 * `stadia_controller`, `hotel_class` — exist in neither Lucide nor the older
 * Material Icons set bundled with @expo/vector-icons, so we bundle the real
 * Material Symbols font, subset to just what we use (220 KB, not 10.7 MB).
 *
 * This is a documented deviation from the brief's "Lucide React Native" line,
 * taken because Stitch is the higher-priority source of truth.
 * See PROJECT_STATUS.md §7.2. `lucide-react-native` remains installed for
 * anything Material Symbols lacks.
 *
 *   <Icon name="casino" size={24} color={faction.p1} />
 *   <Icon name="military_tech" filled />
 *
 * Adding a glyph: append it to scripts/icon-glyphs.js, run `npm run build:icons`.
 * An unknown name throws in development rather than rendering blank.
 */
import { Text } from 'react-native';
import { fontFamily } from '../../theme/typography';
import { role } from '../../theme/colors';
import { codepoints } from './codepoints';

export function Icon({
  name,
  size = 24,
  color = role.onSurface,
  style,
  accessibilityLabel,
  ...rest
}) {
  const codepoint = codepoints[name];

  if (codepoint === undefined) {
    if (__DEV__) {
      throw new Error(
        `<Icon name="${name}"> is not in the bundled subset.\n` +
          `Add "${name}" to scripts/icon-glyphs.js and run: npm run build:icons`
      );
    }
    return null;
  }

  return (
    <Text
      accessible={!!accessibilityLabel}
      accessibilityRole={accessibilityLabel ? 'image' : 'none'}
      accessibilityLabel={accessibilityLabel}
      allowFontScaling={false}
      style={[
        {
          fontFamily: fontFamily.icons,
          fontSize: size,
          lineHeight: size,
          color,
          // Material Symbols glyphs are drawn on a square em box; without this
          // they inherit the parent's text alignment and drift off-centre.
          textAlign: 'center',
          width: size,
          height: size,
        },
        style,
      ]}
      {...rest}
    >
      {String.fromCodePoint(codepoint)}
    </Text>
  );
}

/** True if a glyph is available without throwing — useful for dynamic names. */
export function hasIcon(name) {
  return codepoints[name] !== undefined;
}

/** Every bundled glyph name, for the dev gallery. */
export const iconNames = Object.keys(codepoints);

export default Icon;
