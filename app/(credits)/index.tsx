import { useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

import { useThemedStyles } from '@/src/styles/useThemedStyles';
import useColorStore from '@/src/stores/ColorsStore';
import { useLanguage } from '@/src/lang/LanguageContext';
import { useCreditStore } from '@/src/stores/CreditsStore';
import { useDataStore } from '@/src/stores';
import { useFinancingsRepository, usePaymentMethods } from '@/src/db';
import { PaymentMethodVisual } from '@/src/components/payments/PaymentMethodVisual';
import { cardUtilization } from '@/src/domain/credits/amortization';
import { SummaryBlock } from '@/src/ui/data-display/SummaryBlock';

import useDate from '@/src/hooks/useDate';
import { formatMoney } from '@/src/utils';

const Index = () => {
    const styles = useThemedStyles();
    const { colors } = useColorStore();
    const { t } = useLanguage();
    const { credits } = useCreditStore();
    const { setFinancings, setPaymentMethods } = useDataStore();
    const financingsRepository = useFinancingsRepository();
    const paymentMethodsRepository = usePaymentMethods();
    const { getStringDate } = useDate();
    const totalCurrent = credits ? credits.reduce((total, credit) => total + (credit?.totalCurrent || 0), 0) : 0;
    const totalPrevious = credits ? credits.reduce((total, credit) => total + (credit?.totalPrevious || 0), 0): 0;
    const cardMetrics = useMemo(
        () =>
            (credits ?? []).map((credit) => {
                const amountPaid = credit.totalCurrentPayments ?? 0;
                const previousBalance = credit.totalPrevious ?? 0;
                const pendingCents = previousBalance - amountPaid;
                const cardPendingCents = Math.max(0, pendingCents);
                const installmentsPendingCents = Math.max(
                    0,
                    credit.installmentsPendingCents || 0
                );
                const usedCents = cardPendingCents + installmentsPendingCents;
                const utilization = cardUtilization({
                    limitCents: credit.credit_limit ?? 0,
                    usedCents,
                });
                return {
                    credit,
                    amountPaid,
                    previousBalance,
                    pendingCents,
                    cardPendingCents,
                    installmentsPendingCents,
                    usedCents,
                    utilization,
                };
            }),
        [credits]
    );
    const totalLimit = cardMetrics.reduce(
        (total, item) => total + (item.credit.credit_limit ?? 0),
        0
    );
    const totalUsed = cardMetrics.reduce(
        (total, item) => total + item.usedCents,
        0
    );
    const totalAvailable = Math.max(0, totalLimit - totalUsed);
    const totalUtilization =
        totalLimit > 0 ? Math.min(100, (totalUsed / totalLimit) * 100) : 0;

    useEffect(() => {
        let active = true;
        Promise.all([
            financingsRepository.fetchFinancings(),
            paymentMethodsRepository.fetchPaymentMethods(),
        ]).then(([rows, methods]) => {
            if (!active) return;
            setFinancings(rows);
            setPaymentMethods(methods);
        });
        return () => {
            active = false;
        };
    }, []);

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

            <View style={[localStyles.summaryRow, { gap: 20 }]}>
                <View style={{ flex: 1 }}>
                    <SummaryBlock
                        label={t("credits.totalLimit")}
                        cents={totalLimit}
                        valueColorOverride={colors?.text}
                        accentColor={colors?.GoalColor}
                        size='md'
                    />
                </View>
                <View style={{ flex: 1 }}>
                    <SummaryBlock
                        label={t("credits.totalUsed")}
                        cents={totalUsed}
                        valueColorOverride={colors?.text}
                        accentColor={colors?.GoalColor}
                        size='md'
                    />
                </View>
            </View>
            <View style={[localStyles.summaryRow, { gap: 20 }]}>
                <View style={{ flex: 1 }}>
                    <SummaryBlock
                        label={t("credits.totalAvailable")}
                        cents={totalAvailable}
                        valueColorOverride={colors?.text}
                        accentColor={colors?.GoalColor}
                        size='md'
                    />
                </View>
                <View style={{ flex: 1 }}>
                    <SummaryBlock
                        label={t("credits.utilization")}
                        value={`${totalUtilization.toFixed(0)}%`}
                        valueColorOverride={colors?.text}
                        accentColor={colors?.GoalColor}
                        size='md'
                    />
                </View>
            </View>

            <ScrollView style={{ flex: 1 }}>
                <View style={localStyles.individualCreditsContainer}>
                    {cardMetrics.map(({ credit, amountPaid, previousBalance, cardPendingCents, installmentsPendingCents, usedCents, utilization }) => {
                        const pendingAmount = formatMoney(cardPendingCents);
                        return (
                            <View key={credit.id} style={[localStyles.creditBlock, { backgroundColor: colors?.surfaceMuted, shadowColor: colors?.shadow }]}>
                                <View style={{ marginBottom: 12 }}>
                                    <PaymentMethodVisual
                                        kind={credit.is_credit_card ? 'credit_card' : credit.visual_kind}
                                        brand={credit.card_brand}
                                        style={credit.card_style}
                                        color={credit.card_color ?? colors?.GoalColor}
                                        name={credit.method_name}
                                        last4={credit.card_last4}
                                        holder={credit.card_holder}
                                        issuer={credit.card_issuer}
                                        limitCents={credit.credit_limit}
                                        usedCents={usedCents}
                                        closingDate={credit.closing_date}
                                        paymentDate={credit.payment_date}
                                        height={110}
                                    />
                                </View>
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
                                        <View style={localStyles.detailItem}>
                                            <Text style={[localStyles.detailLabel, { color: colors?.textMuted }]}>{t("credits.installmentsPending")}:</Text>
                                            <Text style={[localStyles.amountValue, { color: colors?.text }]}>
                                                ${formatMoney(installmentsPendingCents)}
                                            </Text>
                                        </View>
                                        <View style={localStyles.detailItem}>
                                            <Text style={[localStyles.detailLabel, { color: colors?.textMuted }]}>{t("credits.totalUsed")}:</Text>
                                            <Text style={[localStyles.amountValue, { color: colors?.text }]}>
                                                ${formatMoney(usedCents)}
                                            </Text>
                                        </View>
                                        <View style={localStyles.detailItem}>
                                            <Text style={[localStyles.detailLabel, { color: colors?.textMuted }]}>{t("credits.limit")}:</Text>
                                            <Text style={[localStyles.amountValue, { color: colors?.text }]}>
                                                {credit.credit_limit != null ? `$${formatMoney(credit.credit_limit)}` : '—'}
                                            </Text>
                                        </View>
                                        <View style={localStyles.detailItem}>
                                            <Text style={[localStyles.detailLabel, { color: colors?.textMuted }]}>{t("credits.available")}:</Text>
                                            <Text style={[localStyles.amountValue, { color: colors?.text }]}>
                                                {credit.credit_limit != null ? `$${formatMoney(utilization.availableCents)}` : '—'}
                                            </Text>
                                        </View>
                                        <View style={localStyles.detailItem}>
                                            <Text style={[localStyles.detailLabel, { color: colors?.textMuted }]}>{t("credits.utilization")}:</Text>
                                            <Text style={[localStyles.amountValue, { color: colors?.text }]}>
                                                {credit.credit_limit != null ? `${utilization.utilizationPercent.toFixed(0)}%` : '—'}
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