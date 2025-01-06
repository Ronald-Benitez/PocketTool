import { StyleSheet, Text, View } from "react-native";
import useColorStore from '@/src/stores/ColorsStore';

interface props {
    text: string
    value: string
    color1?: string | undefined
    color2?: string | undefined
}

const DetailedFinanceBlock = ({ text, color1, color2, value }: props) => {
    const { colors } = useColorStore()

    return (
        <>
            <View style={localStyles.container}>
                <View style={[localStyles.block, { borderColor: colors?.InputStroke }]}>
                    <View style={[localStyles.circle, { backgroundColor: color1, zIndex: 1 }]}></View>
                    <View style={[localStyles.circle, { backgroundColor: color2, position: "absolute", left: 10, top: 0, zIndex: 0 }]}></View>
                    <Text style={localStyles.text}>
                        ${value}
                    </Text>
                </View>
                <Text style={localStyles.footerText}>{text}</Text>
            </View>
        </>
    )
}

const localStyles = StyleSheet.create({
    block: {
        marginVertical: 5,
        borderBottomWidth: 2,
        borderRadius: 5,
        width: 300,
        flexDirection: "row",
        alignItems: "center",
        paddingBottom: 2
    },
    text: {
        fontSize: 12,
        fontWeight: "200",
        textAlign: "center",
        padding: 0,
        margin: 0,
        paddingLeft: 20,
    },
    footerText: {
        fontWeight: "200",
        fontSize: 8,
        textAlign: "center",
        margin: 0,
        padding: 0
    },
    container: {
        width: 300,
        flexDirection: "column",
        gap: 0
    },
    circle: {
        width: 22,
        height: 22,
        borderRadius: 100,
        padding: 0,
        margin: 0
    }
})

export default DetailedFinanceBlock