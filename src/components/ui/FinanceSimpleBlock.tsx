import { StyleSheet, Text, View } from "react-native";

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
                <Text style={[localStyles.block, { borderColor: color, width: blockwidth }]}>
                    ${value}
                </Text>
                <Text style={localStyles.footerText}>{text}</Text>
            </View>
        </>
    )
}

const localStyles = StyleSheet.create({
    block: {
        marginVertical: 5,
        borderBottomWidth: 1,
        borderRadius: 5,
        fontSize: 14,
        fontWeight: "300",
        textAlign: "center",
        paddingBottom: 5
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