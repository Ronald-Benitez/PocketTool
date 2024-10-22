import { StyleSheet, TextStyle, View, Text } from "react-native";

interface props {
    color?: string | undefined
    bottom: boolean,
    value: string,
    text: string
}

const BalanceBlock = ({ text, color, bottom, value }: props) => {

    const border = bottom ? {
        borderBottomWidth: 4,
        paddingBottom: 5
    } as TextStyle : {
        borderTopWidth: 4,
        marginTop: 10
    } as TextStyle

    return (
        <>
            <View style={localStyles.container}>
                <Text style={[localStyles.balanceText, { borderColor: color }, border]}>
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
        borderLeftWidth: 3,
        borderBottomWidth: 1,
        borderBottomLeftRadius: 5,
        borderTopLeftRadius: 5
    },
    balanceText: {
        paddingTop: 10,
        textAlign: "center",
        fontWeight: "300",
        fontSize: 18,
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
    },
})

export default BalanceBlock
