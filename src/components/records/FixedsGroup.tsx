import { View, Text, Pressable, StyleSheet } from 'react-native'

import { useLanguage } from '@/src/lang/LanguageContext'
import useDate from '@/src/hooks/useDate'
import BorderLeftBottomBlock from '../ui/BorderLeftButtonBlock'
import { RecordJoined, Records } from '@/src/db/types/tables'
import styles from '@/src/styles/styles'

type FixedsGroupProps = {
    fixeds: RecordJoined[],
    onCreditPayment: (item: Records) => void,
}

const FixedsGroup = ({ fixeds, onCreditPayment }: FixedsGroupProps) => {
    const dateh = useDate()
    const { t } = useLanguage()

    if(!fixeds || fixeds.length === 0) {
        return (
            <>
                <View style={{height: 20, flex:1, justifyContent:"center", alignItems:"center"}}>
                    <Text style={[styles.smallText, {textAlign:"center"}]}>{t("records.fixeds")}</Text>
                    
                </View>
            </>
        )
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
                                bottomColor={item?.record_color || "#000"}
                                letfColor={item?.payment_color || "#000"}
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