import { Stack } from 'expo-router';
import { surface } from '../../src/theme/colors';

export default function MatchLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_bottom',
        contentStyle: { backgroundColor: surface.void },
      }}
    />
  );
}
