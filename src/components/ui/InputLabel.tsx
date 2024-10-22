import { StyleSheet, TextInput, TextInputProps, View, Text } from "react-native";

import useColorStore from '@/src/stores/ColorsStore';
import Input from "./Input";

const InputLabel = (props: TextInputProps) => {
    return (
        <>
            <View style={localStyles.colContainer}>
                <Text style={localStyles.label}>{props.placeholder}</Text>
                <Input
                    {...props}
                />
            </View>
        </>
    )
}

const localStyles = StyleSheet.create({
    block: {
        height: 50,
        borderWidth: 1,
    },
    label: {
        fontSize: 12,
        fontWeight: "200",
        textAlign: "left",
        paddingLeft: 5
    },
    rowContainer: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "flex-end",
        gap: 10
    },
    colContainer: {
        width: "80%",
        flexDirection: "column"
    },
})

export default InputLabel