import { SQLiteProvider } from 'expo-sqlite';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import React, { useEffect } from 'react';
import 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

import { useColorScheme } from '@/hooks/useColorScheme';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Drawer } from 'expo-router/drawer';
import CustomDrawer from '@/src/components/navigation/custom-drawer';
import migrateDb from '@/src/db/migration';
import { LanguageProvider } from '@/src/lang/LanguageContext';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
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
      <SQLiteProvider databaseName='db.db' onInit={migrateDb}>
        <LanguageProvider>
          <Drawer
            drawerContent={(props) => <CustomDrawer {...props} />}
          >
            <Drawer.Screen
              name="index"
              options={{
                title: 'Home',
                drawerIcon: ({ color, size }) => (
                  <Ionicons name="home-outline" size={size} color={color} />
                ),
                headerStyle: {
                  backgroundColor: '#fff',
                },
              }}

            />
            <Drawer.Screen
              name="(financials)"
              options={{
                title: 'Financials',
                headerShown: false,
                drawerIcon: ({ color, size }) => (
                  <Ionicons name="wallet-outline" size={size} color={color} />
                )
              }}
            />
             <Drawer.Screen
              name="(settings)/index"
              options={{
                title: 'Settings',
                headerShown: true,
                drawerIcon: ({ color, size }) => (
                  <Ionicons name="settings-outline" size={size} color={color} />
                )
              }}
            />
            {/* <Drawer.Screen
              name="+not-found"
              options={{ drawerLabel: () => null }}
            /> */}
          </Drawer>
        </LanguageProvider>
      </SQLiteProvider>
    </GestureHandlerRootView>
  );
}
