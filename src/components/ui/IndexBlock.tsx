import { StyleSheet, View, ViewStyle } from "react-native";
import { ReactNode } from "react";

import useColorStore from '@/src/stores/ColorsStore';

interface props {
    children: ReactNode,
    style?: ViewStyle
}

const IndexBlock = ({ children, style }: props) => {
    const { colors } = useColorStore()
    return (
        <>
            <View style={[localStyles.block, { backgroundColor: colors?.BGSimple }, style ? style : { maxHeight: 100 }]}>
                {children}
            </View>
        </>
    )
}

const localStyles = StyleSheet.create({
    block: {
        flex: 1,
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 10
    },
})

export default IndexBlock