import { StyleSheet, View, ViewStyle } from "react-native";
import { ReactNode } from "react";

import useColorStore from '@/src/stores/ColorsStore';

interface props {
    children: ReactNode,
    style?: ViewStyle
}

const BGSelectBlock = ({ children, style }: props) => {
    const { colors } = useColorStore()
    return (
        <>
            <View style={[localStyles.block, { backgroundColor: colors?.BGPicker }, style]}>
                {children}
            </View>
        </>
    )
}

const localStyles = StyleSheet.create({
    block: {
        flex: 1,
        height: 50,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 10
    },
})

export default BGSelectBlock