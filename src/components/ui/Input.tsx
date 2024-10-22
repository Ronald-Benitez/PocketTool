import { StyleSheet, TextInput, TextInputProps } from "react-native";

import useColorStore from '@/src/stores/ColorsStore';

const Input = (props: TextInputProps) => {
    const { colors } = useColorStore()
    return (
        <>
            <TextInput style={[localStyles.block, { borderColor: colors?.InputStroke }]} {...props}>
            </TextInput >
        </>
    )
}

const localStyles = StyleSheet.create({
    block: {
        height: 50,
        borderWidth: 1,
        paddingHorizontal: 5,
        textAlign: "center"
    },
})

export default Input