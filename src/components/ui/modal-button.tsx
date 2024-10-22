import { StyleSheet, Pressable, Text, TextStyle, ViewStyle, View } from "react-native";

interface props {
    text: string,
    onClick?: () => void | undefined,
    type: "base" | "bg",
    isButton?: boolean
}

const ModalButton = ({ text, onClick, type, isButton = true }: props) => {

    const color = "#8FC0C3"

    const styles = type == "base" ? {
        borderWidth: 1,
        borderColor: color,
    } as ViewStyle : {
        backgroundColor: color
    } as ViewStyle

    return (
        <>
            {isButton ? (
                <Pressable onPress={onClick} style={[localStyles.button, styles]}>
                    <Text style={localStyles.text}>{text}</Text>
                </Pressable>
            ) : (
                <View style={[localStyles.button, styles]}>
                    <Text style={localStyles.text}>{text}</Text>
                </View>
            )}
        </>
    )
}

const localStyles = StyleSheet.create({
    button: {
        width: 150,
        height: 50,
        justifyContent: "center",
        alignItems: "center",
    },
    text: {
        fontSize: 14,
        textAlign: "center"
    }
})

export default ModalButton