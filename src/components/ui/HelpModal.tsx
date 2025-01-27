import { StyleSheet, Text, View, ScrollView, DimensionValue } from "react-native";

import useColorStore from '@/src/stores/ColorsStore';
import ModalContainer from "./modal-container";
import { ReactNode, useState } from "react";
import { useLanguage } from "@/src/lang/LanguageContext";
import ColorText from "./color-text";

interface Props {
    label?: string
    onChange: (index: number) => void,
    options: string[] | undefined
    selected: string | undefined,
    title: string,
    blockWith?: DimensionValue,
    children?: ReactNode,
    text: string
}

const HelpModal = ({ label, selected, title, blockWith, children }: Props) => {
    const { colors } = useColorStore()
    const [closeModal, setCloseModal] = useState(false)
    const { t } = useLanguage()

    const buttonOpen = (
        <View style={[localStyles.block, { borderColor: colors?.InputStroke }]} >
            <Text style={[localStyles.text]}>
                Abrir
            </Text>
        </View>
    )

    return (
        <>
            <View style={[localStyles.colContainer, { width: blockWith ? blockWith : "80%" }]}>
                <Text style={localStyles.label}> {t("help.title." + selected)}</Text>
                <ModalContainer
                    buttonOpen={children ? children : buttonOpen}
                    close={closeModal}
                    title={title}

                >
                    <ScrollView>
                        <View style={localStyles.optionsContainer}>
                            <ColorText >
                                {t("help.description." + selected)}
                            </ColorText>
                        </View>
                    </ScrollView>
                </ModalContainer>

            </View>
        </>
    )
}

const localStyles = StyleSheet.create({
    block: {
        height: 50,
        borderWidth: 1,
        paddingHorizontal: 5,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#fff"
    },
    text: {
        fontWeight: "200",
        fontSize: 14,
        textAlign: "center"
    },
    label: {
        fontSize: 12,
        fontWeight: "200",
        textAlign: "left",
        paddingLeft: 5
    },
    colContainer: {
        flexDirection: "column"
    },
    optionsContainer: {
        flexDirection: "column",
        gap: 10,
        padding: 20
    },
    textContainer: {
        flexDirection: "row",
        justifyContent: "space-between"
    }
})

export default HelpModal
