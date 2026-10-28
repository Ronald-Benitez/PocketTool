import { View, Text, Pressable, StyleSheet } from 'react-native'

import { useLanguage } from '@/src/lang/LanguageContext'
import useDate from '@/src/hooks/useDate'
import BorderLeftBottomBlock from '../ui/BorderLeftButtonBlock'
import type { RecordFormEntry } from '@/src/interfaces/schema'
import styles from '@/src/styles/styles'
import { formatMoneyWithSymbol } from '@/src/utils'

type FixedsGroupProps = {
    fixeds: RecordFormEntry[],
    onCreditPayment: (item: RecordFormEntry) => void,
}

const FixedsGroup = ({ fixeds, onCreditPayment }: FixedsGroupProps) => {
    const dateh = useDate()
    const { t } = useLanguage()

    if (!fixeds || fixeds.length === 0) {
        return
    }

    return (
        <>
            {
                fixeds?.length && fixeds?.length > 0 ? (
                    <Text style={[styles.smallText, { textAlign: "center", marginTop: 10 }]}>{t("records.fixeds")}</Text>
                ) : null
            }
            <View style={{ gap: 5, paddingHorizontal: 30, }}>
                {fixeds?.map((item, index) => {
                    return (
                        <Pressable key={index} onPress={() => onCreditPayment(item)}>
                            <BorderLeftBottomBlock
                                bottomColor={item.PaymentMethods?.PaymentTypes?.payment_color || "#000"}
                                letfColor={item.RecordTypes?.record_color || "#000"}
                            >
                                <View style={localStyles.rowContainer}>
                                    <View style={localStyles.dateContainer}>
                                        <Text style={localStyles.dateText}>
                                            {dateh.getStringDay(String(item.date))}
                                        </Text>
                                        <Text style={localStyles.dateText}>
                                            {dateh.getDay(String(item.date))}
                                        </Text>
                                        <Text style={localStyles.dateText}>
                                            {dateh.getStringMonth(String(item.date))}
                                        </Text>
                                    </View>
                                    <Text style={localStyles.nameText}>{item.record_name}</Text>
                                    <Text style={localStyles.valueText}>{formatMoneyWithSymbol(item.amount)}</Text>
                                </View>
                            </BorderLeftBottomBlock>
                        </Pressable>
                    )
                })}
            </View>
        </>
    )
}

const localStyles = StyleSheet.create({
    rowContainer: {
        width: "100%",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center"
    },
    dateContainer: {
        width: 50
    },
    dateText: {
        fontWeight: "100",
        fontSize: 8,
        textAlign: "center"
    },
    nameText: {
        fontSize: 12,
        textAlign: "left",
        maxWidth: 200
    },
    valueText: {
        fontSize: 12,
        textAlign: "center",
        fontWeight: "300",
    },
    balanceText: {
        width: "80%",
        borderTopWidth: 4,
        height: 60,
        paddingTop: 10,
        textAlign: "center",
        marginLeft: 5,
        fontWeight: "300",
        fontSize: 18
    }
})

export default FixedsGroup