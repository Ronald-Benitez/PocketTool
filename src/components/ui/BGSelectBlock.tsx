import { StyleSheet, View } from "react-native";
import { ReactNode } from "react";

import useColorStore from '@/src/stores/ColorsStore';

interface props {
    children: ReactNode,
}

const BGSelectBlock = ({ children }: props) => {
    const { colors } = useColorStore()
    return (
        <>
            <View style={[localStyles.block, { backgroundColor: colors?.BGPicker }]}>
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