import { View, Text, StyleSheet } from 'react-native'

import { SwipeAction } from '@/src/ui/actions/SwipeAction'
import useDate from '@/src/hooks/useDate'
import { useLanguage } from '@/src/lang/LanguageContext'
import { AccentRow } from '@/src/ui/data-display/AccentRow'
import { useThemedStyles } from '@/src/styles/useThemedStyles'
import type { RecordView } from '@/src/interfaces/schema'
import { formatMoneyWithSymbol } from '@/src/utils'

type RecordsGroupProps = {
    records: RecordView[],
    handleUpdate: (record: RecordView) => void,
    handleDelete: (record: RecordView) => void,
}

const RecordsGroup = ({ records, handleDelete, handleUpdate }: RecordsGroupProps) => {
    const styles = useThemedStyles()
    const dateh = useDate()
    const { t } = useLanguage()
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
                                    <View style={{ flex: 1 }}>
                                        <Text style={[localStyles.nameText, styles.textPrimary]}>{item.record_name}</Text>
                                        {(item.shared_amount_cents ?? 0) > 0 ? (
                                            <Text style={[localStyles.captionText, styles.textMuted]}>
                                                {t('shared.total')}: {formatMoneyWithSymbol((item.own_amount_cents ?? item.amount) + (item.shared_amount_cents ?? 0))} · {t('shared.totalShared')}: {formatMoneyWithSymbol(item.shared_amount_cents ?? 0)}
                                            </Text>
                                        ) : null}
                                        {item.saving_name ? (
                                            <Text style={[localStyles.captionText, styles.textMuted]}>
                                                {t('savings.records.paidWith')}: {item.saving_name}
                                            </Text>
                                        ) : null}
                                    </View>
                                    <View style={{ alignItems: 'flex-end' }}>
                                        <Text style={[localStyles.valueText, styles.textPrimary]}>{formatMoneyWithSymbol(item.own_amount_cents ?? item.amount)}</Text>
                                        {(item.shared_amount_cents ?? 0) > 0 ? (
                                            <Text style={[localStyles.captionText, styles.textMuted]}>{t('shared.own')}</Text>
                                        ) : null}
                                    </View>
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
    captionText: {
        fontSize: 9,
        textAlign: 'left',
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