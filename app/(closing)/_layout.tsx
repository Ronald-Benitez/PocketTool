import { Tabs } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';

import StackBase from '@/src/components/navigation/stack-base';
import { useLanguage } from '@/src/lang/LanguageContext';

export default function Layout() {
  const { t } = useLanguage();

  return (
    <StackBase>
      <Tabs.Screen
        name='index'
        options={{
          title: t('headers.closing'),
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons
              name='calculate'
              size={size}
              color={color as string | undefined}
            />
          ),
        }}
      />
    </StackBase>
  );
}
