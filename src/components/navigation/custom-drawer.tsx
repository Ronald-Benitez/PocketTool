import { View } from 'react-native'
import React from 'react'
import { DrawerContentScrollView, DrawerItemList } from 'expo-router/drawer'

import { useTheme } from '@/src/ui/theme/ThemeProvider'

const CustomDrawer = (props: any) => {
    const { colors } = useTheme()

    return (
        <View style={{ flex: 1, backgroundColor: colors.surface }}>
            <View style={{ marginVertical: 20 }}></View>
            <DrawerContentScrollView
                {...props}
                contentContainerStyle={{ backgroundColor: colors.surface }}
            >
                <DrawerItemList {...props} />
            </DrawerContentScrollView>
        </View>
    )

}

export default CustomDrawer
