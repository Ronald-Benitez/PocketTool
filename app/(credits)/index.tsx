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

const Index = () => {
    const { fetchResumeByCreditCards } = useRecords()
    const { creditCards, setCreditCards } = useCreditCardStore()
    const { colors } = useColorStore()
    const { t } = useLanguage()
    const [totalCurrent, setTotalCurrent] = useState(0)
    const [totalPrevious, setTotalPrevious] = useState(0)
    const { records } = useRecordsStore()

    const fetch = async () => {
        try {
            const res = await fetchResumeByCreditCards()
            console.log(res)
            setCreditCards(res)
        } catch (e) {

        }
    }

    useEffect(() => {
        fetch()
    }, [records])

    useEffect(() => {
        try {
            if (creditCards?.length && creditCards.length > 0) {
                let newCurrent = 0
                let newPrevious = 0
                creditCards.map(e => {
                    newCurrent += e.current
                    newPrevious += e.previous
                })
                setTotalCurrent(newCurrent)
                setTotalPrevious(newPrevious)
            }
        } catch (e) {
        }

    }, [creditCards])

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
                {creditCards?.map((e, index) => (
                    <View key={index} style={[{ backgroundColor: colors?.BGSimple }, localStyles.block]}>
                        <View style={{ flex: 1 }}>
                            <ColorText backgroundColor={colors?.BGSimple} padding={0}>{e?.creditCardName}</ColorText>
                        </View>
                        <View style={[{ flex: 1 }, localStyles.row]}>
                            <View style={[localStyles.col]}>
                                <ColorText backgroundColor={colors?.BGSimple} padding={0} fontSize={10} fontWeight={200}>{t("credits.closingDate")}</ColorText>
                                <ColorText backgroundColor={colors?.BGSimple} padding={0}>{e?.closingDate}</ColorText>
                            </View>
                            <View style={[localStyles.col]}>
                                <ColorText backgroundColor={colors?.BGSimple} padding={0} fontSize={10} fontWeight={200}>{t("credits.previous")}</ColorText>
                                <ColorText backgroundColor={colors?.BGSimple} padding={0}>${e?.previous}</ColorText>
                            </View>
                            <View style={[localStyles.col]}>
                                <ColorText backgroundColor={colors?.BGSimple} padding={0} fontSize={10} fontWeight={200}>{t("credits.current")}</ColorText>
                                <ColorText backgroundColor={colors?.BGSimple} padding={0}>${e?.current}</ColorText>
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