import { View, Text, StyleSheet, ScrollView } from 'react-native';
import React, { useState, useEffect } from 'react';

import { useRecords } from '@/src/db';
import styles from '@/src/styles/styles';
import ColorText from '@/src/components/ui/color-text';
import useCreditCardStore from '@/src/stores/CreditCardsStore';
import useColorStore from '@/src/stores/ColorsStore';
import { useLanguage } from '@/src/lang/LanguageContext';
import BalanceBlock from '@/src/components/ui/BalanceBlock';
import useRecordsStore from '@/src/stores/RecordsStore';
import { useCreditStore } from '@/src/stores/CreditsStore';

import useDate from '@/src/hooks/useDate';
import { useDataStore } from '@/src/stores';

const Index = () => {
    const { fetchResumeByCreditCards } = useRecords();
    const { creditCards, setCreditCards } = useCreditCardStore();
    const { PaymentMethods } = useDataStore()
    const { colors } = useColorStore();
    const { t } = useLanguage();
    const [totalCurrent, setTotalCurrent] = useState(0);
    const [totalPrevious, setTotalPrevious] = useState(0);
    const { records } = useRecordsStore();
    const { credits } = useCreditStore();
    const { getStringDate } = useDate();

    useEffect(() => {
        try {
            if (credits?.length && credits.length > 0) {
                let newCurrent = 0;
                let newPrevious = 0;
                credits.forEach(e => {
                    newCurrent += e?.totalCurrent || 0;
                    newPrevious += e?.totalPrevious || 0;
                });
                setTotalCurrent(newCurrent);
                setTotalPrevious(newPrevious);
            }
        } catch (e) {
            console.error("Error calculating total credits:", e);
        }
    }, [credits, PaymentMethods]);

    const closingDateToShow = (day: number) => {
        const today = new Date();
        const closingDate = new Date(today.getFullYear(), today.getMonth(), day);
        if (closingDate > today) {
            closingDate.setMonth(closingDate.getMonth() - 1);
        }
        return getStringDate(closingDate.getTime());
    }

    const nextClosingDateToShow = (day: number) => {
        const today = new Date();
        const closingDate = new Date(today.getFullYear(), today.getMonth(), day);
        if (closingDate < today) {
            closingDate.setMonth(closingDate.getMonth() + 1);
        }
        return getStringDate(closingDate.getTime());
    }

    return (
        <View style={styles.container}>
            <View style={[localStyles.summaryRow, { gap: 20 }]}>
                <View style={{ flex: 1 }}>
                    <BalanceBlock
                        bottom={true}
                        text={t("credits.previousTotal")}
                        value={`${(totalPrevious || 0).toFixed(2)}`}
                        color={colors?.GoalColor}
                    />
                </View>
                <View style={{ flex: 1 }}>
                    <BalanceBlock
                        bottom={true}
                        text={t("credits.currentTotal")}
                        value={`${(totalCurrent || 0).toFixed(2)}`}
                        color={colors?.GoalColor}
                    />
                </View>
            </View>

            <ScrollView style={{ flex: 1 }}>
                <View style={localStyles.individualCreditsContainer}>
                    {credits?.map((credit, index) => {
                        const amountPaid = credit?.totalCurrentPayments || 0;
                        const previousBalance = credit?.totalPrevious || 0;
                        const pendingAmount = (previousBalance - amountPaid).toFixed(2);
                        const isPendingNegative = parseFloat(pendingAmount) < 0;

                        return (
                            <View key={index} style={[localStyles.creditBlock, { backgroundColor: colors?.BGSimple }]}>
                                <View style={localStyles.headerRow}>
                                    <Text style={[localStyles.creditName]}>
                                        {credit?.method_name}
                                    </Text>
                                    <Text style={[localStyles.currentValue]}>
                                        {t("credits.current")}: <Text style={localStyles.amountValue}>${(credit?.totalCurrent || 0).toFixed(2)}</Text>
                                    </Text>
                                </View>

                                <View style={localStyles.detailRow}>
                                    <View style={localStyles.paymentSummary}>
                                        <View style={localStyles.detailItem}>
                                            <Text style={localStyles.detailLabel}>{t("credits.previous")}:</Text>
                                            <Text style={localStyles.amountValue}>${previousBalance.toFixed(2)}</Text>
                                        </View>
                                        <View style={localStyles.detailItem}>
                                            <Text style={localStyles.detailLabel}>{t("credits.paid")}:</Text>
                                            <Text style={[localStyles.amountValue, { color: colors?.IncomeColor }]}>${amountPaid.toFixed(2)}</Text>
                                        </View>
                                        <View style={localStyles.detailItem}>
                                            <Text style={localStyles.detailLabel}>{t("credits.pending")}:</Text>
                                            <Text style={[localStyles.amountValue, { color: isPendingNegative ? colors?.IncomeColor : colors?.ExpenseColor }]}>
                                                ${pendingAmount}
                                            </Text>
                                        </View>
                                    </View>

                                    <View style={localStyles.closingDateContainer}>
                                        <Text style={localStyles.detailLabel}>{t("credits.closingDate")}:</Text>
                                        <Text style={localStyles.amountValue}>
                                            {credit?.closing_date ? closingDateToShow(credit.closing_date) : 'N/A'}
                                        </Text>
                                    </View>
                                </View>
                                <View style={[localStyles.detailRow, { marginTop: 10, borderTopColor: '#eee', borderTopWidth: 1, paddingTop: 10 }]}>
                                    <Text style={localStyles.detailLabel}>
                                        {t("credits.nextPaymentDate")}:
                                    </Text>
                                    <Text style={localStyles.amountValue}>
                                        {credit?.closing_date ? nextClosingDateToShow(credit.closing_date) : 'N/A'}
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
        shadowColor: '#000',
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
        borderBottomColor: '#eee',
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
        color: '#666',
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