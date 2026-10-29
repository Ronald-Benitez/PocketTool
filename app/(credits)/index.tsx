import { View, Text, StyleSheet, ScrollView } from 'react-native';

import { useThemedStyles } from '@/src/styles/useThemedStyles';
import useColorStore from '@/src/stores/ColorsStore';
import { useLanguage } from '@/src/lang/LanguageContext';
import { useCreditStore } from '@/src/stores/CreditsStore';
import { SummaryBlock } from '@/src/ui/data-display/SummaryBlock';

import useDate from '@/src/hooks/useDate';
import { formatMoney } from '@/src/utils';

const Index = () => {
    const styles = useThemedStyles();
    const { colors } = useColorStore();
    const { t } = useLanguage();
    const { credits } = useCreditStore();
    const { getStringDate } = useDate();
    const totalCurrent = credits ? credits.reduce((total, credit) => total + (credit?.totalCurrent || 0), 0) : 0;
    const totalPrevious = credits ? credits.reduce((total, credit) => total + (credit?.totalPrevious || 0), 0): 0;

    const dateForDay = (year: number, month: number, day: number) =>
        new Date(year, month, Math.min(day, new Date(year, month + 1, 0).getDate()));

    const closingDateToShow = (day: number) => {
        const today = new Date();
        let closingDate = dateForDay(today.getFullYear(), today.getMonth(), day);
        if (closingDate > today) {
            closingDate = dateForDay(today.getFullYear(), today.getMonth() - 1, day);
        }
        return getStringDate(closingDate.getTime());
    }

    const nextPaymentDateToShow = (day: number) => {
        const today = new Date();
        let paymentDate = dateForDay(today.getFullYear(), today.getMonth(), day);
        if (paymentDate < new Date(today.getFullYear(), today.getMonth(), today.getDate())) {
            paymentDate = dateForDay(today.getFullYear(), today.getMonth() + 1, day);
        }
        return getStringDate(paymentDate.getTime());
    }

    return (
        <View style={styles.container}>
            <View style={[localStyles.summaryRow, { gap: 20 }]}>
                <View style={{ flex: 1 }}>
                    <SummaryBlock
                        label={t("credits.previousTotal")}
                        cents={totalPrevious}
                        valueColorOverride={colors?.text}
                        accentColor={colors?.GoalColor}
                        size='lg'
                    />
                </View>
                <View style={{ flex: 1 }}>
                    <SummaryBlock
                        label={t("credits.currentTotal")}
                        cents={totalCurrent}
                        valueColorOverride={colors?.text}
                        accentColor={colors?.GoalColor}
                        size='lg'
                    />
                </View>
            </View>

            <ScrollView style={{ flex: 1 }}>
                <View style={localStyles.individualCreditsContainer}>
                    {credits && credits.map(credit => {
                        const amountPaid = credit.totalCurrentPayments;
                        const previousBalance = credit.totalPrevious;
                        const pendingCents = (previousBalance || 0) - (amountPaid || 0);
                        const pendingAmount = formatMoney(pendingCents);
                        return (
                            <View key={credit.id} style={[localStyles.creditBlock, { backgroundColor: colors?.surfaceMuted, shadowColor: colors?.shadow }]}>
                                <View style={[localStyles.headerRow, { borderBottomColor: colors?.border }]}>
                                    <Text style={[localStyles.creditName, { color: colors?.text }]}>
                                        {credit.method_name}
                                    </Text>
                                    <Text style={[localStyles.currentValue, { color: colors?.text }]}>
                                        {t("credits.current")}: <Text style={[localStyles.amountValue, { color: colors?.text }]}>${formatMoney(credit?.totalCurrent)}</Text>
                                    </Text>
                                </View>

                                <View style={localStyles.detailRow}>
                                    <View style={localStyles.paymentSummary}>
                                        <View style={localStyles.detailItem}>
                                            <Text style={[localStyles.detailLabel, { color: colors?.textMuted }]}>{t("credits.previous")}:</Text>
                                            <Text style={[localStyles.amountValue, { color: colors?.text }]}>${formatMoney(previousBalance)}</Text>
                                        </View>
                                        <View style={localStyles.detailItem}>
                                            <Text style={[localStyles.detailLabel, { color: colors?.textMuted }]}>{t("credits.paid")}:</Text>
                                            <Text style={[localStyles.amountValue, { color: colors?.text }]}>${formatMoney(amountPaid)}</Text>
                                        </View>
                                        <View style={localStyles.detailItem}>
                                            <Text style={[localStyles.detailLabel, { color: colors?.textMuted }]}>{t("credits.pending")}:</Text>
                                            <Text style={[localStyles.amountValue, { color: colors?.text }]}>
                                                ${pendingAmount}
                                            </Text>
                                        </View>
                                    </View>

                                    <View style={localStyles.closingDateContainer}>
                                        <Text style={[localStyles.detailLabel, { color: colors?.textMuted }]}>{t("credits.closingDate")}:</Text>
                                        <Text style={[localStyles.amountValue, { color: colors?.text }]}>
                                            {credit.closing_date ? closingDateToShow(credit.closing_date) : 'N/A'}
                                        </Text>
                                    </View>
                                </View>
                                <View style={[localStyles.detailRow, { marginTop: 10, borderTopColor: colors?.border, borderTopWidth: 1, paddingTop: 10 }]}>
                                    <Text style={[localStyles.detailLabel, { color: colors?.textMuted }]}>
                                        {t("credits.paidDate")}:
                                    </Text>
                                    <Text style={[localStyles.amountValue, { color: colors?.text }]}>
                                        {credit.payment_date ? nextPaymentDateToShow(credit.payment_date) : 'N/A'}
                                    </Text>
                                </View>
                            </View>
                        );
                    })}
                </View>
            </ScrollView>
        </View>
    );
};

const localStyles = StyleSheet.create({
    summaryRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingHorizontal: 10,
        marginBottom: 15,
    },
    individualCreditsContainer: {
        flexDirection: "column",
        gap: 10,
        paddingHorizontal: 10,
        marginBottom: 10,
    },
    creditBlock: {
        borderRadius: 8,
        padding: 15,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    headerRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 10,
        borderBottomWidth: 1,
        paddingBottom: 8,
    },
    creditName: {
        fontSize: 18,
        fontWeight: "600",
        flex: 2,
    },
    currentValue: {
        fontSize: 14,
        fontWeight: "bold",
        flex: 1,
        textAlign: 'right',
    },
    detailRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
    },
    paymentSummary: {
        flex: 2,
        flexDirection: "column",
        gap: 5,
    },
    detailItem: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 2,
    },
    detailLabel: {
        fontSize: 12,
        fontWeight: "400",
        flex: 1,
    },
    amountValue: {
        fontSize: 14,
        fontWeight: "500",
        textAlign: 'right',
        flex: 1,
    },
    closingDateContainer: {
        flex: 1,
        flexDirection: "column",
        alignItems: "flex-end",
        justifyContent: "center",
        paddingLeft: 10,
    },
});

export default Index;