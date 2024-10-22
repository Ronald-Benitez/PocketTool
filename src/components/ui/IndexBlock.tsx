import { StyleSheet, View } from "react-native";
import { ReactNode } from "react";

import useColorStore from '@/src/stores/ColorsStore';

interface props {
    children: ReactNode,
}

const IndexBlock = ({ children }: props) => {
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
        maxHeight: 100,
        width: 325,
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 10
    },
})

export default IndexBlock