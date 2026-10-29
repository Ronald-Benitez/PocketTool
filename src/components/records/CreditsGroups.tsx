import { View, Text, Pressable, StyleSheet } from "react-native"
import { AccentRow } from '@/src/ui/data-display/AccentRow'
import type { RecordFormEntry, RecordType } from "@/src/interfaces/schema"
import styles from '@/src/styles/styles'
import useDate from "@/src/hooks/useDate"
import { useLanguage } from "@/src/lang/LanguageContext"
import { formatMoneyWithSymbol } from "@/src/utils"

type CreditsGroupsProps = {
    credits: RecordFormEntry[],
    selectedPaymentCreditType: RecordType | undefined,
    onCreditPayment: (item: RecordFormEntry) => void,
}

export const CreditsGroups = ({ credits, selectedPaymentCreditType, onCreditPayment }: CreditsGroupsProps) => {
    const dateh = useDate()
    const { t } = useLanguage()

     if(!credits || credits.length === 0) {
        return
    }

    return (
        <>
            {
                credits?.length && credits?.length > 0 ? (
                    <Text style={[styles.smallText, { textAlign: "center", marginTop: 10 }]}>{t("records.creditPayments")}</Text>
                ) : null
            }
            <View style={{ gap: 5, paddingHorizontal: 30, }}>
                {credits?.map((item, index) => {
                    return (
                        <Pressable key={index} onPress={() => onCreditPayment(item)}>
                            <AccentRow
                                bottomColor={selectedPaymentCreditType?.record_color || "#000"}
                                accentColor={selectedPaymentCreditType?.record_color || "#000"}
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
                            </AccentRow>
                        </Pressable>
                    )
                })}
            </View>
        </>
    )
}

export default CreditsGroups

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