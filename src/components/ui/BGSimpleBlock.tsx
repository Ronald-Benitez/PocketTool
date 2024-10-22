import { StyleSheet, View } from "react-native";
import { ReactNode } from "react";

import useColorStore from '@/src/stores/ColorsStore';

interface props {
    children: ReactNode,
}

const BGSimpleBlock = ({ children }: props) => {
    const { colors } = useColorStore()
    return (
        <>
            <View style={[localStyles.block, { backgroundColor: colors?.BGSimple }]}>
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
        paddingHorizontal: 10
    },
})

export default BGSimpleBlock