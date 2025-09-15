import { View, Text, Pressable, StyleSheet } from "react-native"
import BorderLeftBottomBlock from "../ui/BorderLeftButtonBlock"
import { Records, RecordTypes, RecordJoined } from "@/src/db/types/tables"
import { MaterialIcons } from "@expo/vector-icons"
import styles from '@/src/styles/styles'
import useDate from "@/src/hooks/useDate"
import { useLanguage } from "@/src/lang/LanguageContext"

type CreditsGroupsProps = {
    credits: Records[],
    selectedPaymentCreditType: RecordTypes | undefined,
    onCreditPayment: (item: Records) => void,
}

export const CreditsGroups = ({ credits, selectedPaymentCreditType, onCreditPayment }: CreditsGroupsProps) => {
    const dateh = useDate()
    const { t } = useLanguage()

     if(!credits || credits.length === 0) {
        return (
            <>
                <View style={{height: 20, flex:1, justifyContent:"center", alignItems:"center"}}>
                    <MaterialIcons name="credit-card-off" size={20} color="gray" />
                </View>
            </>
        )
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
                            <BorderLeftBottomBlock
                                bottomColor={selectedPaymentCreditType?.record_color || "#000"}
                                letfColor={selectedPaymentCreditType?.record_color || "#000"}
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
                                    <Text style={localStyles.valueText}>${item.amount}</Text>
                                </View>
                            </BorderLeftBottomBlock>
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