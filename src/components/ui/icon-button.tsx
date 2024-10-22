import { StyleSheet, Pressable, View } from "react-native";
import { ReactNode } from "react";

interface props {
    children: ReactNode,
    onClick?: () => {},
    isButton?: boolean
}

const IconButton = ({ children, onClick, isButton = true }: props) => {
    return (
        <>
            {isButton ? (
                <Pressable onPress={onClick} style={[localStyles.button]}>
                    {children}
                </Pressable>
            ) : (
                <View style={[localStyles.button]}>
                    {children}
                </View>
            )}
        </>
    )
}

const localStyles = StyleSheet.create({
    button: {
        width: 50,
        height: 50,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#fff",
        shadowColor: "black",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5,
    },
})

export default IconButton