import { StyleSheet, Text, View } from "react-native";

import ColorText from "./color-text";

interface props {
    text: string
    value: string
    color?: string | undefined
    blockwidth?: number
}

const FinanceSimpleBlock = ({ text, color, value, blockwidth = 175 }: props) => {
    return (
        <>
            <View style={[localStyles.container, { width: blockwidth }]}>
                <View style={[localStyles.block, { backgroundColor: color, width: blockwidth }]}>
                    <ColorText backgroundColor={color || "#fff"} textAlign="center">
                        ${Number(value).toFixed(2)}
                    </ColorText>
                </View>
                <Text style={localStyles.footerText}>{text}</Text>
            </View>
        </>
    )
}

const localStyles = StyleSheet.create({
    block: {
        marginTop: 5,
        borderRadius: 100,
        fontSize: 14,
        fontWeight: "300",
        textAlign: "center",
        justifyContent:"center",
        alignItems:"center",
    },
    footerText: {
        fontWeight: "200",
        fontSize: 8,
        textAlign: "center",
        margin: 0,
        padding: 0
    },
    container: {
        flexDirection: "column",
        gap: 0
    }
})

export default FinanceSimpleBlock