/**
 * Text — typed typography. Every string in the app renders through this.
 *
 *   <Text variant="headline-lg">LUDO AFTER DARK</Text>
 *   <Text variant="label-sm" color={faction.p1}>YOUR TURN</Text>
 *   <Text variant="headline-sm" numeric>240,000</Text>
 *
 * Why not raw <Text> + classNames: the design system's case rule (label-sm and
 * label-md are always uppercase with boosted tracking) and its tabular-figures
 * rule for counters are easy to forget on a 14-screen app. Encoding them here
 * means they cannot be forgotten.
 */
import { Text as RNText } from 'react-native';
import { textStyles, tabularNums } from '../../theme/typography';
import { role } from '../../theme/colors';

export function Text({
  variant = 'body-md',
  color = role.onSurface,
  numeric = false,
  uppercase,
  align,
  style,
  children,
  ...rest
}) {
  const token = textStyles[variant];

  if (__DEV__ && !token) {
    throw new Error(
      `<Text variant="${variant}"> is not a design-system style.\n` +
        `Valid: ${Object.keys(textStyles).join(', ')}`
    );
  }

  const { uppercase: tokenUppercase, ...typeStyle } = token;
  const shouldUpper = uppercase ?? tokenUppercase ?? false;

  return (
    <RNText
      style={[
        typeStyle,
        { color },
        shouldUpper && { textTransform: 'uppercase' },
        numeric && tabularNums,
        align && { textAlign: align },
        style,
      ]}
      {...rest}
    >
      {children}
    </RNText>
  );
}

export default Text;
