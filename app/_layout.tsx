import { SQLiteProvider } from 'expo-sqlite';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import * as SystemUI from 'expo-system-ui';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import 'react-native-reanimated';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Drawer } from 'expo-router/drawer';
import CustomDrawer from '@/src/components/navigation/custom-drawer';
import migrateDb from '@/src/db/migration';
import { LanguageProvider, useLanguage } from '@/src/lang/LanguageContext';
import { ThemeProvider, useTheme } from '@/src/ui/theme/ThemeProvider';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

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
            <AppShell />
          </LanguageProvider>
        </SQLiteProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}

const AppShell = () => {
  const { colors, resolvedMode, isReady } = useTheme();

  useEffect(() => {
    if (!isReady) return;
    SystemUI.setBackgroundColorAsync(colors.background).catch(() => {
      // Algunos dispositivos/plataformas no permiten cambiar el fondo del sistema.
    });
  }, [colors.background, isReady]);

  return (
    <>
      <StatusBar style={resolvedMode === 'dark' ? 'light' : 'dark'} />
      <AppDrawer />
    </>
  );
};

const AppDrawer = () => {
  const { t } = useLanguage();
  const { colors } = useTheme();

  return (
    <Drawer
      drawerContent={(props) => <CustomDrawer {...props} />}
      screenOptions={{
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.text,
        drawerStyle: { backgroundColor: colors.surface },
        drawerActiveTintColor: colors.primary,
        drawerInactiveTintColor: colors.textMuted,
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
          title: t('headers.fixeds'),
          headerShown: false,
          drawerIcon: ({ color, size }) => (
            <Ionicons name="repeat" size={size} color={color as string | undefined} />
          ),
        }}
      />
      <Drawer.Screen
        name="(summaries)"
        options={{
          title: t('headers.financialsIndex'),
          headerShown: false,
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
          drawerItemStyle: { display: 'none' },
          title: t('headers.budget'),
          headerShown: true,
          drawerIcon: ({ color, size }) => (
            <Ionicons name="wallet-outline" size={size} color={color as string | undefined} />
          ),
        }}
      />
      <Drawer.Screen
        name="(vehicle)"
        options={{
          drawerItemStyle: { display: 'none' },
          title: t('headers.financialsIndex'),
          headerShown: false,
          drawerIcon: ({ color, size }) => (
            <Ionicons name="stats-chart-outline" size={size} color={color as string | undefined} />
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
    </Drawer>
  );
};
