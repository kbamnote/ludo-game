/**
 * AmbientGlow — the blurred coloured radial blobs sitting behind most screens.
 *
 * The Stitch screens place two or three per screen as
 * `w-80 h-80 rounded-full bg-primary-container/15 blur-3xl`.
 *
 * ── Why this is an SVG radial gradient ──────────────────────────────────────
 * The first implementation was a plain View with a background colour and a
 * border radius. It rendered as a HARD-EDGED DISC — clearly visible rings of
 * flat colour behind the splash screen, which looks like a bug rather than
 * atmosphere. A solid circle is not a blur, however low its opacity.
 *
 * A real blur (expo-blur) is far too expensive for decoration that appears two
 * or three times per screen. An SVG radial gradient fading to full
 * transparency gives genuine falloff for one cheap draw and no blur pass.
 */
import { useId } from 'react';
import { View } from 'react-native';
import Svg, { Defs, RadialGradient, Stop, Rect } from 'react-native-svg';
import { withAlpha } from '../../theme/colors';

export function AmbientGlow({
  color,
  size = 280,
  /** Peak opacity at the centre; fades to 0 at the edge. */
  opacity = 0.15,
  top,
  bottom,
  left,
  right,
  style,
}) {
  // Gradient ids must be unique per instance or SVG reuses the first one's
  // stops for every glow on the screen. useId is the right tool: a module-level
  // counter would be mutated during render, which is impure and yields
  // different ids on a concurrent or StrictMode re-render.
  const id = `glow${useId().replace(/:/g, '')}`;

  return (
    <View
      pointerEvents="none"
      style={[{ position: 'absolute', width: size, height: size, top, bottom, left, right }, style]}
    >
      <Svg width={size} height={size}>
        <Defs>
          <RadialGradient id={id} cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor={color} stopOpacity={opacity} />
            <Stop offset="55%" stopColor={color} stopOpacity={opacity * 0.45} />
            <Stop offset="100%" stopColor={color} stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Rect x={0} y={0} width={size} height={size} fill={`url(#${id})`} />
      </Svg>
    </View>
  );
}

/**
 * Flat translucent fill, for the small corner blooms inside cards where a
 * gradient would be overkill and the shape is clipped by the card anyway.
 */
export function GlowPatch({ color, size = 64, opacity = 0.12, style }) {
  return (
    <View
      pointerEvents="none"
      style={[
        {
          position: 'absolute',
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: withAlpha(color, opacity),
        },
        style,
      ]}
    />
  );
}

export default AmbientGlow;
