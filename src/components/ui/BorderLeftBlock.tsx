import { StyleSheet, View, ViewStyle } from "react-native";
import { ReactNode } from "react";

import BGSimpleBlock from "./BGSimpleBlock";

interface props {
    children: ReactNode,
    color: string | undefined,
    style?: ViewStyle
}

const BorderLeftBlock = ({ children, color, style }: props) => {
    return (
        <>
            <View style={[localStyles.block, { borderColor: color }, style]}>
                <BGSimpleBlock>
                    {children}
                </BGSimpleBlock>
            </View>
        </>
    )
}

const localStyles = StyleSheet.create({
    block: {
        marginVertical: 5,
        borderLeftWidth: 3,
        borderBottomLeftRadius: 5,
        borderTopLeftRadius: 5,
        width: "100%",
    }
})

export default BorderLeftBlock