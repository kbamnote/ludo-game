/**
 * Root layout — providers, fonts, splash gate, navigation theme.
 *
 * The splash screen is held until fonts are ready. Without that, the first
 * frame renders in the system font and visibly reflows into Syne, which on a
 * brand-led screen looks broken.
 */
import '../global.css';

import { useCallback, useEffect, useState } from 'react';
import { View } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { QueryClientProvider } from '@tanstack/react-query';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import { Syne_600SemiBold, Syne_700Bold, Syne_800ExtraBold } from '@expo-google-fonts/syne';
import {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold,
} from '@expo-google-fonts/plus-jakarta-sans';

import { ErrorBoundary } from '../src/components/common/ErrorBoundary';
import { queryClient, wireAppStateFocus, wireOnlineManager } from '../src/services/queryClient';
import { useAuthStore } from '../src/store/useAuthStore';
import { surface } from '../src/theme/colors';

SplashScreen.preventAutoHideAsync().catch(() => {
  // Already hidden, or called twice during fast refresh — not fatal.
});

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Syne_600SemiBold,
    Syne_700Bold,
    Syne_800ExtraBold,
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
    MaterialSymbolsOutlined: require('../src/assets/fonts/MaterialSymbolsOutlined.ttf'),
  });

  const [sessionChecked, setSessionChecked] = useState(false);
  const loadSession = useAuthStore((s) => s.loadSession);

  useEffect(() => {
    loadSession().finally(() => setSessionChecked(true));
  }, [loadSession]);

  useEffect(() => {
    const unfocus = wireAppStateFocus();
    const unonline = wireOnlineManager();
    return () => {
      unfocus();
      unonline();
    };
  }, []);

  // A font failure must not leave the user staring at a splash screen forever.
  // Report it and carry on in the fallback font.
  useEffect(() => {
    if (fontError) console.error('[fonts] failed to load:', fontError);
  }, [fontError]);

  const ready = (fontsLoaded || fontError) && sessionChecked;

  const onLayout = useCallback(() => {
    if (ready) SplashScreen.hideAsync().catch(() => {});
  }, [ready]);

  if (!ready) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: surface.void }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <ErrorBoundary>
            <View style={{ flex: 1, backgroundColor: surface.void }} onLayout={onLayout}>
              <StatusBar style="light" />
              <Stack
                screenOptions={{
                  headerShown: false,
                  animation: 'fade',
                  contentStyle: { backgroundColor: surface.void },
                }}
              >
                <Stack.Screen name="index" />
                <Stack.Screen name="(onboarding)" />
                <Stack.Screen name="(auth)" />
                <Stack.Screen name="(tabs)" />
                <Stack.Screen name="match" options={{ animation: 'slide_from_bottom' }} />
                <Stack.Screen name="_dev" options={{ animation: 'slide_from_bottom' }} />
              </Stack>
            </View>
          </ErrorBoundary>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
