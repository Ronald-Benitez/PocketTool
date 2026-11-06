import { Tabs } from 'expo-router';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';

import StackBase from '@/src/components/navigation/stack-base';
import { useLanguage } from '@/src/lang/LanguageContext';

export default function Layout() {
  const { t } = useLanguage();

  return (
    <StackBase>
      <Tabs.Screen
        name='index'
        options={{
          title: t('headers.budget'),
          tabBarIcon: ({ color, size }) => (
            <Ionicons
              name='pie-chart-outline'
              size={size}
              color={color as string | undefined}
            />
          ),
        }}
      />
      <Tabs.Screen
        name='templates'
        options={{
          title: t('budget.templates.title'),
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons
              name='dashboard-customize'
              size={size}
              color={color as string | undefined}
            />
          ),
        }}
      />
    </StackBase>
  );
}
