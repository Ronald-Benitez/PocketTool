import { Tabs } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import StackBase from '@/src/components/navigation/stack-base';
import { useLanguage } from '@/src/lang/LanguageContext';

export default function Layout() {
  const { t } = useLanguage();

  return (
    <StackBase>
      <Tabs.Screen
        name='index'
        options={{
          title: t('shared.peopleTitle'),
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name='account-group-outline'
              size={size}
              color={color as string | undefined}
            />
          ),
        }}
      />
    </StackBase>
  );
}
