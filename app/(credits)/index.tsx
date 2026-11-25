import { useEffect, useMemo, useState } from 'react';
import { View } from 'react-native';

import { useLanguage } from '@/src/lang/LanguageContext';
import { useCreditStore, type Credit } from '@/src/stores/CreditsStore';
import { useDataStore } from '@/src/stores';
import {
  useFinancingsRepository,
  usePaymentMethods,
} from '@/src/db';
import { mapDatabaseError } from '@/src/db/errors';
import { PaymentMethodVisual } from '@/src/components/payments/PaymentMethodVisual';
import { SummaryModeToggle } from '@/src/components/summaries/SummaryModeToggle';
import { cardUtilization } from '@/src/domain/credits/amortization';
import { resolveNextMonthlyDay } from '@/src/domain/shared/recurrence';
import { useSummaryMode } from '@/src/hooks/useSummaryMode';
import useDate from '@/src/hooks/useDate';
import { formatMoneyWithSymbol } from '@/src/utils';
import { SectionCard } from '@/src/ui/data-display/SectionCard';
import { StatTile } from '@/src/ui/data-display/StatTile';
import { EmptyState } from '@/src/ui/feedback/EmptyState';
import { LoadingState } from '@/src/ui/feedback/LoadingState';
import { useToast } from '@/src/ui/feedback/ToastProvider';
import { AppText } from '@/src/ui/primitives/AppText';
import { Row, Stack } from '@/src/ui/primitives/Stack';
import { Screen } from '@/src/ui/primitives/Screen';
import { useTheme } from '@/src/ui/theme/ThemeProvider';

const Index = () => {
    const { colors } = useTheme();
    const { t } = useLanguage();
    const { showToast } = useToast();
    const { credits } = useCreditStore();
    const { setFinancings, setPaymentMethods } = useDataStore();
    const financingsRepository = useFinancingsRepository();
    const paymentMethodsRepository = usePaymentMethods();
    const { getStringDate } = useDate();
    const { mode } = useSummaryMode();
    const [now, setNow] = useState(0);

    useEffect(() => {
        setNow(Date.now());
    }, []);

    const currentAmount = (credit: Credit) =>
        mode === 'total' || mode === 'paid'
            ? credit.totalCurrentCombined ?? credit.totalCurrent ?? 0
            : mode === 'shared'
              ? credit.totalCurrentShared ?? 0
              : credit.totalCurrentOwn ?? credit.totalCurrent ?? 0;
    const previousAmount = (credit: Credit) =>
        mode === 'total' || mode === 'paid'
            ? credit.totalPreviousCombined ?? credit.totalPrevious ?? 0
            : mode === 'shared'
              ? credit.totalPreviousShared ?? 0
              : credit.totalPreviousOwn ?? credit.totalPrevious ?? 0;

    const totalCurrent = credits
        ? credits.reduce((total, credit) => total + currentAmount(credit), 0)
        : 0;
    const totalPrevious = credits
        ? credits.reduce((total, credit) => total + previousAmount(credit), 0)
        : 0;

    const cardMetrics = useMemo(
        () =>
            (credits ?? []).map((credit) => {
                const amountPaid = credit.totalCurrentPayments ?? 0;
                const previousBalance = previousAmount(credit);
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
                    cardPendingCents,
                    installmentsPendingCents,
                    usedCents,
                    utilization,
                };
            }),
        [credits, mode]
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
        ])
            .then(([rows, methods]) => {
                if (!active) return;
                setFinancings(rows);
                setPaymentMethods(methods);
            })
            .catch((cause) => {
                if (!active) return;
                if (__DEV__) console.warn('[credits] data load failed', cause);
                const mapped = mapDatabaseError(cause, t('toast.error'));
                showToast({
                    message: t(`dbErrors.${mapped.code}` as never),
                    type: 'error',
                });
            });
        return () => {
            active = false;
        };
    }, []);

    const dateForDay = (year: number, month: number, day: number) =>
        new Date(
            year,
            month,
            Math.min(day, new Date(year, month + 1, 0).getDate())
        );

    const closingDateToShow = (day: number) => {
        const today = new Date(now);
        let closingDate = dateForDay(
            today.getFullYear(),
            today.getMonth(),
            day
        );
        if (closingDate > today) {
            closingDate = dateForDay(
                today.getFullYear(),
                today.getMonth() - 1,
                day
            );
        }
        return getStringDate(closingDate.getTime());
    };

    const nextPaymentDateToShow = (day: number) =>
        getStringDate(resolveNextMonthlyDay({ now, day }));

    if (!credits || !now) {
        return (
            <Screen>
                <LoadingState fullScreen />
            </Screen>
        );
    }

    return (
        <Screen scroll edges={['left', 'right']}>
            <Stack gap='xl'>
                <SummaryModeToggle />

                <SectionCard title={t('headers.credits')}>
                    <Stack gap='md'>
                        <Row gap='md'>
                            <StatTile
                                label={t('credits.previousTotal')}
                                cents={totalPrevious}
                                size='sm'
                                valueColor={colors.text}
                                style={{ flex: 1 }}
                            />
                            <StatTile
                                label={t('credits.currentTotal')}
                                cents={totalCurrent}
                                size='sm'
                                valueColor={colors.text}
                                style={{ flex: 1 }}
                            />
                        </Row>
                        <Row gap='md'>
                            <StatTile
                                label={t('credits.totalLimit')}
                                cents={totalLimit}
                                size='sm'
                                valueColor={colors.text}
                                style={{ flex: 1 }}
                            />
                            <StatTile
                                label={t('credits.totalUsed')}
                                cents={totalUsed}
                                size='sm'
                                valueColor={colors.text}
                                style={{ flex: 1 }}
                            />
                        </Row>
                        <Row gap='md'>
                            <StatTile
                                label={t('credits.totalAvailable')}
                                cents={totalAvailable}
                                size='sm'
                                valueColor={colors.text}
                                style={{ flex: 1 }}
                            />
                            <StatTile
                                label={t('credits.utilization')}
                                value={`${totalUtilization.toFixed(0)}%`}
                                size='sm'
                                valueColor={colors.text}
                                style={{ flex: 1 }}
                            />
                        </Row>
                    </Stack>
                </SectionCard>

                {cardMetrics.length === 0 ? (
                    <EmptyState title={t('resume.noData')} />
                ) : (
                    cardMetrics.map(
                        ({
                            credit,
                            amountPaid,
                            previousBalance,
                            cardPendingCents,
                            installmentsPendingCents,
                            usedCents,
                            utilization,
                        }) => {
                            const details = [
                                `${t('credits.previous')}: ${formatMoneyWithSymbol(previousBalance)}`,
                                `${t('credits.paid')}: ${formatMoneyWithSymbol(amountPaid)}`,
                                `${t('credits.installmentsPending')}: ${formatMoneyWithSymbol(installmentsPendingCents)}`,
                                `${t('credits.totalUsed')}: ${formatMoneyWithSymbol(usedCents)}`,
                                `${t('credits.limit')}: ${
                                    credit.credit_limit != null
                                        ? formatMoneyWithSymbol(credit.credit_limit)
                                        : '—'
                                }`,
                                `${t('credits.closingDate')}: ${
                                    credit.closing_date
                                        ? closingDateToShow(credit.closing_date)
                                        : 'N/A'
                                }`,
                                `${t('credits.paidDate')}: ${
                                    credit.payment_date
                                        ? nextPaymentDateToShow(credit.payment_date)
                                        : 'N/A'
                                }`,
                            ].join('\n');

                            return (
                                <SectionCard
                                    key={credit.id}
                                    title={credit.method_name}
                                    tooltip={{
                                        title: credit.method_name,
                                        body: details,
                                    }}
                                >
                                    <View style={{ marginBottom: 12 }}>
                                        <PaymentMethodVisual
                                            kind={
                                                credit.is_credit_card
                                                    ? 'credit_card'
                                                    : credit.visual_kind
                                            }
                                            brand={credit.card_brand}
                                            style={credit.card_style}
                                            color={credit.card_color ?? colors.primary}
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
                                    <Row gap='md'>
                                        <StatTile
                                            label={t('credits.current')}
                                            cents={currentAmount(credit)}
                                            size='sm'
                                            valueColor={colors.text}
                                            style={{ flex: 1 }}
                                        />
                                        <StatTile
                                            label={t('credits.pending')}
                                            cents={cardPendingCents}
                                            size='sm'
                                            valueColor={colors.text}
                                            style={{ flex: 1 }}
                                        />
                                        <StatTile
                                            label={t('credits.available')}
                                            cents={utilization.availableCents}
                                            size='sm'
                                            valueColor={colors.text}
                                            style={{ flex: 1 }}
                                        />
                                    </Row>
                                    <AppText
                                        variant='caption'
                                        color='muted'
                                        style={{ marginTop: 12 }}
                                    >
                                        {t('credits.paidDate')}:{' '}
                                        {credit.payment_date
                                            ? nextPaymentDateToShow(credit.payment_date)
                                            : 'N/A'}
                                    </AppText>
                                </SectionCard>
                            );
                        }
                    )
                )}
            </Stack>
        </Screen>
    );
};

export default Index;
