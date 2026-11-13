/**
 * AmbientGlow — the blurred coloured radial blobs sitting behind most screens.
 *
 * The Stitch screens place two or three of these per screen
 * (`w-80 h-80 rounded-full bg-primary-container/15 blur-3xl`). A real blur is
 * pointless here: a soft translucent circle at 15% opacity over near-black is
 * visually indistinguishable and costs nothing.
 *
 *   <AmbientGlow color={faction.p1} size={320} top={-40} left={-60} />
 */
import { View } from 'react-native';
import { withAlpha } from '../../theme/colors';

export function AmbientGlow({
  color,
  size = 280,
  opacity = 0.15,
  top,
  bottom,
  left,
  right,
  style,
}) {
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
          top,
          bottom,
          left,
          right,
        },
        style,
      ]}
    />
  );
}

export default AmbientGlow;
