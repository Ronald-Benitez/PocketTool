import { StyleSheet, View } from "react-native";
import { ReactNode } from "react";

import BGSimpleBlock from "./BGSimpleBlock";

interface props {
    children: ReactNode,
    letfColor?: string | undefined
    bottomColor?: string | undefined
}

const BorderLeftBottomBlock = ({ children, letfColor, bottomColor }: props) => {
    return (
        <>
            <View style={[localStyles.block, { borderLeftColor: letfColor, borderBottomColor: bottomColor }]}>
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