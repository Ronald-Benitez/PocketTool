import { Tabs } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

import StackBase from '@/src/components/navigation/stack-base';
import { useLanguage } from '@/src/lang/LanguageContext';

export default function Layout() {
  const { t } = useLanguage();

  return (
    <StackBase>
      <Tabs.Screen
        name='index'
        options={{
          title: t('headers.vehicle'),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name='car-outline' size={size} color={color as string | undefined} />
          ),
        }}
      />
      <Tabs.Screen
        name='fuel'
        options={{
          title: t('vehicle.tabs.fuel'),
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name='gas-station-outline'
              size={size}
              color={color as string | undefined}
            />
          ),
        }}
      />
      <Tabs.Screen
        name='maintenance'
        options={{
          title: t('vehicle.tabs.maintenance'),
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name='wrench-outline'
              size={size}
              color={color as string | undefined}
            />
          ),
        }}
      />
      <Tabs.Screen
        name='reminders'
        options={{
          title: t('vehicle.tabs.reminders'),
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name='calendar-clock-outline'
              size={size}
              color={color as string | undefined}
            />
          ),
        }}
      />
    </StackBase>
  );
}
