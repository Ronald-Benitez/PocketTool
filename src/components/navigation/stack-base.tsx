import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from 'expo-router';
import { DrawerActions } from '@react-navigation/native';
import { View } from 'react-native';


export interface StackBaseProps {
    children: React.ReactNode;
}

const StackBase = ({ children }: StackBaseProps) => {
    const navigation = useNavigation();

    return (
        <Tabs
            screenOptions={{
                headerLeft: () => (
                    <View style={{ paddingLeft: 20 }}>
                        <Ionicons
                            name="menu-outline"
                            size={24}
                            color="black"
                            onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
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
