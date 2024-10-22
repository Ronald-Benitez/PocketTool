import { View, Text, Image, StyleSheet } from 'react-native'
import React from 'react'
import { DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer'

const CustomDrawer = (props: any) => {
    return (
        <View style={{ flex: 1 }}>
            <View style={{ marginVertical: 20 }}></View>
            <DrawerContentScrollView {...props}>
                {/* <View style={styles.header}>
                    <Image source={require('@/assets/images/basics/drawer-header.png')} style={styles.image} />
                </View> */}
                <DrawerItemList {...props} />
            </DrawerContentScrollView>
            {/* <Image source={require('@/assets/images/basics/drawer-footer.png')} style={styles.footer} /> */}
        </View>
    )

}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
    },
    header: {
        width: "100%",
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        borderBlockColor: "#1D5D9B",
        borderBottomWidth: 4,
        borderRadius: 90,
        marginBottom: 10,
    },

    image: {
        width: 200,
        height: 150,
        objectFit: "scale-down",
    },
    footer: {
        width: "100%",
        height: 300,
    }
})



export default CustomDrawer