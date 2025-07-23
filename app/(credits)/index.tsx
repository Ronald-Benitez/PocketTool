import { View, StyleSheet } from 'react-native'
import React, { useState, useEffect } from 'react'

import { useRecords } from '@/src/db'
import styles from '@/src/styles/styles'
import ColorText from '@/src/components/ui/color-text';
import useCreditCardStore from '@/src/stores/CreditCardsStore';
import useColorStore from '@/src/stores/ColorsStore';
import { useLanguage } from '@/src/lang/LanguageContext';
import BalanceBlock from '@/src/components/ui/BalanceBlock';
import useRecordsStore from '@/src/stores/RecordsStore';
import { useCreditStore } from '@/src/stores/CreditsStore';

const Index = () => {
    const { fetchResumeByCreditCards } = useRecords()
    const { creditCards, setCreditCards } = useCreditCardStore()
    const { colors } = useColorStore()
    const { t } = useLanguage()
    const [totalCurrent, setTotalCurrent] = useState(0)
    const [totalPrevious, setTotalPrevious] = useState(0)
    const { records } = useRecordsStore()
    const { credits } = useCreditStore()

    useEffect(() => {
        try {
            if (credits?.length && credits.length > 0) {
                let newCurrent = 0
                let newPrevious = 0
                credits.map(e => {
                    newCurrent += e?.totalCurrent || 0
                    newPrevious += e?.totalPrevious || 0
                })
                setTotalCurrent(newCurrent)
                setTotalPrevious(newPrevious)
            }
        } catch (e) {
        }

    }, [credits])

    return (
        <View style={styles.container}>
            <View style={[localStyles.row, { gap: 20 }]}>
                <View style={{ flex: 1 }}>
                    <BalanceBlock
                        bottom={true}
                        text={t("credits.previous")}
                        value={(totalPrevious || 0).toFixed(2)}
                        color={colors?.GoalColor}
                    />
                </View>
                <View style={{ flex: 1 }}>
                    <BalanceBlock
                        bottom={true}
                        text={t("credits.current")}
                        value={(totalCurrent || 0).toFixed(2)}
                        color={colors?.GoalColor}
                    />
                </View>
            </View>
            <View style={[localStyles.container]}>
                {credits?.map((e, index) => (
                    <View key={index} style={[{ backgroundColor: colors?.BGSimple }, localStyles.block]}>
                        <View style={{ flex: 1 }}>
                            <ColorText backgroundColor={colors?.BGSimple} padding={0}>{e?.method_name}</ColorText>
                        </View>
                        <View style={[{ flex: 1 }, localStyles.row]}>
                            <View style={[localStyles.col]}>
                                <ColorText backgroundColor={colors?.BGSimple} padding={0} fontSize={10} fontWeight={200}>{t("credits.closingDate")}</ColorText>
                                <ColorText backgroundColor={colors?.BGSimple} padding={0}>{e?.closing_date}</ColorText>
                            </View>
                            <View style={[localStyles.col]}>
                                <ColorText backgroundColor={colors?.BGSimple} padding={0} fontSize={10} fontWeight={200}>{t("credits.previous")}</ColorText>
                                <ColorText backgroundColor={colors?.BGSimple} padding={0}>${e?.totalPrevious}</ColorText>
                            </View>
                            <View style={[localStyles.col]}>
                                <ColorText backgroundColor={colors?.BGSimple} padding={0} fontSize={10} fontWeight={200}>{t("credits.current")}</ColorText>
                                <ColorText backgroundColor={colors?.BGSimple} padding={0}>${e?.totalCurrent}</ColorText>
                            </View>
                        </View>
                    </View>
                ))}
            </View>
        </View>
    )
}

const localStyles = StyleSheet.create({
    container: {
        flexDirection: "column"
    },
    col: {
        flexDirection: "column",
        alignItems: "center"
    },
    row: {
        flexDirection: "row",
        justifyContent: "space-between"
    },
    block: {
        flexDirection: "row",
        margin: 5,
        padding: 10,
        justifyContent: "center",
        alignItems: "center"
    }

})

export default Index