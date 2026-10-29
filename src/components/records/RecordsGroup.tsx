import { View, Text, StyleSheet } from 'react-native'

import { SwipeAction } from '@/src/ui/actions/SwipeAction'
import useDate from '@/src/hooks/useDate'
import { AccentRow } from '@/src/ui/data-display/AccentRow'
import { useThemedStyles } from '@/src/styles/useThemedStyles'
import type { RecordWithRelations } from '@/src/interfaces/schema'
import { formatMoneyWithSymbol } from '@/src/utils'

type RecordsGroupProps = {
    records: RecordWithRelations[],
    handleUpdate: (record: RecordWithRelations) => void,
    handleDelete: (record: RecordWithRelations) => void,
}

const RecordsGroup = ({ records, handleDelete, handleUpdate }: RecordsGroupProps) => {
    const styles = useThemedStyles()
    const dateh = useDate()
    return (
        <>
            <View style={{ gap: 5, paddingHorizontal: 30, }}>
                {records?.map(item => {
                    return (
                        <SwipeAction
                            handleDelete={() => handleDelete(item)}
                            handleUpdate={() => handleUpdate(item)}
                            key={item.id}
                        >
                            <AccentRow
                                bottomColor={item.PaymentMethods?.PaymentTypes?.payment_color ?? "#000"}
                                accentColor={item.RecordTypes?.record_color ?? "#000"}
                            >
                                <View style={localStyles.rowContainer}>
                                    <View style={localStyles.dateContainer}>
                                        <Text style={[localStyles.dateText, styles.textMuted]}>
                                            {dateh.getStringDay(String(item.date))}
                                        </Text>
                                        <Text style={[localStyles.dateText, styles.textMuted]}>
                                            {dateh.getDay(String(item.date))}
                                        </Text>
                                        <Text style={[localStyles.dateText, styles.textMuted]}>
                                            {dateh.getStringMonth(String(item.date))}
                                        </Text>
                                    </View>
                                    <Text style={[localStyles.nameText, styles.textPrimary]}>{item.record_name}</Text>
                                    <Text style={[localStyles.valueText, styles.textPrimary]}>{formatMoneyWithSymbol(item.amount)}</Text>
                                </View>
                            </AccentRow>
                        </SwipeAction>
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
        fontWeight: "500",
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

export default RecordsGroup