import { Stack } from 'expo-router';
import { surface } from '../../../src/theme/colors';

export default function PlayLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        contentStyle: { backgroundColor: surface.void },
      }}
    />
  );
}
