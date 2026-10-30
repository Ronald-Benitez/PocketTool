import { Stack } from 'expo-router';

import { useLanguage } from '@/src/lang/LanguageContext';
import { useTheme } from '@/src/ui/theme/ThemeProvider';

export default function Layout() {
  const { t } = useLanguage();
  const { colors } = useTheme();

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.text,
        headerTitleStyle: { color: colors.text },
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name='index' options={{ headerShown: false }} />
      <Stack.Screen
        name='templates'
        options={{ title: t('budget.templates.title') }}
      />
      <Stack.Screen
        name='templates/[id]'
        options={{ title: t('budget.templates.edit') }}
      />
    </Stack>
  );
}
