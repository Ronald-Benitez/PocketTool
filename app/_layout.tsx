import { SQLiteProvider } from 'expo-sqlite';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import * as SystemUI from 'expo-system-ui';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { LogBox } from 'react-native';
import 'react-native-reanimated';
import { Ionicons, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';

import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Drawer } from 'expo-router/drawer';
import CustomDrawer from '@/src/components/navigation/custom-drawer';
import { ExperienceOnboardingGate } from '@/src/components/features/ExperienceOnboardingGate';
import { WhatsNewGate } from '@/src/components/whats-new/WhatsNewGate';
import migrateDb from '@/src/db/migration';
import {
  FeatureProvider,
  useFeatureRouteGuard,
  useFeatures,
  type FeatureId,
} from '@/src/features';
import { useAutoGroup } from '@/src/hooks/useAutoGroup';
import { ChartPreferencesProvider } from '@/src/ui/charts';
import { LanguageProvider, useLanguage } from '@/src/lang/LanguageContext';
import { ToastProvider } from '@/src/ui/feedback/ToastProvider';
import { ThemeProvider, useTheme } from '@/src/ui/theme/ThemeProvider';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

// These warnings come from navigation/drawer dependencies using Reanimated's
// web-only dependency argument internally; they do not affect native behavior.
LogBox.ignoreLogs([
  'Dependencies should only be used on the web',
  'A navigation action carried state without the internal __internal__routerActionState marker',
]);

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <SQLiteProvider databaseName='db.db' onInit={migrateDb}>
          <LanguageProvider>
            <ToastProvider>
              <AppShell />
              <WhatsNewGate />
            </ToastProvider>
          </LanguageProvider>
        </SQLiteProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}

const AppShell = () => {
  const { colors, resolvedMode, isReady } = useTheme();
  useAutoGroup();

  useEffect(() => {
    if (!isReady) return;
    SystemUI.setBackgroundColorAsync(colors.background).catch(() => {
      // Algunos dispositivos/plataformas no permiten cambiar el fondo del sistema.
    });
  }, [colors.background, isReady]);

  return (
    <>
      <StatusBar style={resolvedMode === 'dark' ? 'light' : 'dark'} />
      <ChartPreferencesProvider>
        <FeatureProvider>
          <FeatureShell />
        </FeatureProvider>
      </ChartPreferencesProvider>
    </>
  );
};

const FeatureShell = () => {
  useFeatureRouteGuard();

  return (
    <>
      <AppDrawer />
      <ExperienceOnboardingGate />
    </>
  );
};

const AppDrawer = () => {
  const { t } = useLanguage();
  const { colors } = useTheme();
  const enabled = useFeatures((state) => state.enabled);
  const drawerItemStyle = (feature: FeatureId) =>
    enabled[feature] ? undefined : { display: 'none' as const };

  return (
    <Drawer
      drawerContent={(props) => <CustomDrawer {...props} />}
      screenOptions={{
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.text,
        drawerStyle: { backgroundColor: colors.surface },
        drawerActiveTintColor: colors.primary,
        drawerInactiveTintColor: colors.textMuted,
        sceneStyle: { backgroundColor: colors.background },
      }}
    >
      <Drawer.Screen
        name="index"
        options={{
          title: t('headers.home'),
          drawerIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color as string | undefined} />
          ),
        }}
      />
      <Drawer.Screen
        name="(financials)"
        options={{
          title: t('headers.financials'),
          headerShown: false,
          drawerIcon: ({ color, size }) => (
            <Ionicons name="wallet-outline" size={size} color={color as string | undefined} />
          ),
        }}
      />
      <Drawer.Screen
        name="(fixeds)"
        options={{
          title: t('headers.commitments'),
          headerShown: false,
          drawerItemStyle: drawerItemStyle('fixeds'),
          drawerIcon: ({ color, size }) => (
            <Ionicons name="repeat" size={size} color={color as string | undefined} />
          ),
        }}
      />
      <Drawer.Screen
        name="(people)"
        options={{
          title: t('headers.people'),
          headerShown: false,
          drawerItemStyle: drawerItemStyle('people'),
          drawerIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="account-group-outline"
              size={size}
              color={color as string | undefined}
            />
          ),
        }}
      />
      <Drawer.Screen
        name="(summaries)"
        options={{
          title: t('headers.financialsIndex'),
          headerShown: false,
          drawerItemStyle: drawerItemStyle('summaries'),
          drawerIcon: ({ color, size }) => (
            <Ionicons name="stats-chart-outline" size={size} color={color as string | undefined} />
          ),
        }}
      />
      <Drawer.Screen
        name="(credits)/index"
        options={{
          title: t('headers.credits'),
          headerShown: true,
          drawerItemStyle: drawerItemStyle('credits'),
          drawerIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="bank-off-outline"
              size={size}
              color={color as string | undefined}
            />
          ),
        }}
      />
      <Drawer.Screen
        name="(savings)/index"
        options={{
          title: t('headers.savings'),
          headerShown: true,
          drawerItemStyle: drawerItemStyle('savings'),
          drawerIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="piggy-bank-outline"
              size={size}
              color={color as string | undefined}
            />
          ),
        }}
      />
      <Drawer.Screen
        name="(budget)"
        options={{
          title: t('headers.budget'),
          headerShown: false,
          drawerItemStyle: drawerItemStyle('budget'),
          drawerIcon: ({ color, size }) => (
            <Ionicons name="pie-chart-outline" size={size} color={color as string | undefined} />
          ),
        }}
      />
      <Drawer.Screen
        name="(vehicle)"
        options={{
          title: t('headers.vehicle'),
          headerShown: false,
          drawerItemStyle: drawerItemStyle('vehicle'),
          drawerIcon: ({ color, size }) => (
            <Ionicons name="car-outline" size={size} color={color as string | undefined} />
          ),
        }}
      />
      <Drawer.Screen
        name="(closing)"
        options={{
          title: t('headers.closing'),
          headerShown: false,
          drawerItemStyle: drawerItemStyle('closing'),
          drawerIcon: ({ color, size }) => (
            <MaterialIcons
              name="calculate"
              size={size}
              color={color as string | undefined}
            />
          ),
        }}
      />
      <Drawer.Screen
        name="(help)/index"
        options={{
          title: t('headers.help'),
          headerShown: true,
          drawerIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="help-circle-outline"
              size={size}
              color={color as string | undefined}
            />
          ),
        }}
      />
      <Drawer.Screen
        name="(settings)/index"
        options={{
          title: t('headers.settings'),
          headerShown: true,
          drawerIcon: ({ color, size }) => (
            <Ionicons name="settings-outline" size={size} color={color as string | undefined} />
          ),
        }}
      />
      <Drawer.Screen
        name="gallery"
        options={{
          drawerItemStyle: { display: 'none' },
          title: 'UI gallery',
          headerShown: true,
        }}
      />
    </Drawer>
  );
};
