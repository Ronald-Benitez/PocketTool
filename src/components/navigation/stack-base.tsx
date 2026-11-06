import React from 'react';
import { Tabs, useNavigation } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { View } from 'react-native';

import { useTheme } from '@/src/ui/theme/ThemeProvider';

export interface StackBaseProps {
    children: React.ReactNode;
}

const StackBase = ({ children }: StackBaseProps) => {
    const navigation = useNavigation<any>();
    const { colors } = useTheme();

    return (
        <Tabs
            screenOptions={{
                headerStyle: {
                    backgroundColor: colors.surface,
                },
                headerTintColor: colors.text,
                headerTitleStyle: {
                    color: colors.text,
                },
                headerLeft: () => (
                    <View style={{ paddingLeft: 20 }}>
                        <Ionicons
                            name="menu-outline"
                            size={24}
                            color={colors.text}
                            onPress={() => navigation.openDrawer?.()}
                        />
                    </View>
                ),
                tabBarStyle: {
                    backgroundColor: colors.surface,
                    borderTopColor: colors.border,
                },
                tabBarActiveTintColor: colors.primary,
                tabBarInactiveTintColor: colors.textMuted,
                tabBarShowLabel: false,
                sceneStyle: {
                    backgroundColor: colors.background,
                },
            }}
        >
            {children}
        </Tabs>
    );
};

export default StackBase;
