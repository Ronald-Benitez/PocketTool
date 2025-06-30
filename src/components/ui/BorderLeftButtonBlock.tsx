import { StyleSheet, View, ViewStyle } from "react-native";
import { ReactNode } from "react";

import BGSimpleBlock from "./BGSimpleBlock";
import styles from "@/src/styles/styles";

interface props {
    children: ReactNode,
    letfColor?: string | undefined
    bottomColor?: string | undefined,
    style?: ViewStyle
}

const BorderLeftBottomBlock = ({ children, letfColor, bottomColor, style }: props) => {
    return (
        <>
            <View style={[localStyles.block, { borderLeftColor: letfColor, borderBottomColor: bottomColor }, style]}>
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
        borderBottomWidth: 1,
        borderBottomLeftRadius: 5,
        borderTopLeftRadius: 5
    }
})

export default BorderLeftBottomBlock