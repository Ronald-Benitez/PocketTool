import React from 'react';
import { Tabs, useNavigation } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { View } from 'react-native';

export interface StackBaseProps {
    children: React.ReactNode;
}

const StackBase = ({ children }: StackBaseProps) => {
    const navigation = useNavigation<any>();

    return (
        <Tabs
            screenOptions={{
                headerLeft: () => (
                    <View style={{ paddingLeft: 20 }}>
                        <Ionicons
                            name="menu-outline"
                            size={24}
                            color="black"
                            onPress={() => navigation.openDrawer?.()}
                        />
                    </View>
                ),
                tabBarStyle: {
                    backgroundColor: '#e0e0e0',

                },
                tabBarActiveTintColor: 'black',
                tabBarShowLabel: false,

            }}

        >
            {children}
        </Tabs>
    );
};

export default StackBase;
