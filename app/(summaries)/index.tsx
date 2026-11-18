import React, { useCallback, useEffect, useRef } from 'react';
import { View } from 'react-native';
import { useFocusEffect } from 'expo-router';

import { BudgetSummaryBlock } from '@/src/components/summaries/BudgetSummaryBlock';
import { BalanceModeToggle } from '@/src/components/summaries/BalanceModeToggle';
import { SummaryModeToggle } from '@/src/components/summaries/SummaryModeToggle';
import RecordsModal, {
    type RecordsModalRef,
} from '@/src/components/records/RecordsModal';
import { useRecords } from '@/src/db';
import useRecordsStore from '@/src/stores/RecordsStore';
import { useLanguage } from '@/src/lang/LanguageContext';
import { pickSummaryAmount, useSummaryMode } from '@/src/hooks/useSummaryMode';
import { useBalanceMode } from '@/src/hooks/useBalanceMode';
import { useGroupRefresh } from '@/src/hooks/useGroupRefresh';
import GroupSelector from '@/src/components/groups/group-selector';
import useResumesStore from '@/src/stores/ResumesStore';
import { AppText } from '@/src/ui/primitives/AppText';
import { Divider } from '@/src/ui/primitives/Divider';
import { FinanceValue } from '@/src/ui/data-display/FinanceValue';
import { ListItem } from '@/src/ui/data-display/ListItem';
import { SummaryBlock } from '@/src/ui/data-display/SummaryBlock';
import { Row, Stack } from '@/src/ui/primitives/Stack';
import { Screen } from '@/src/ui/primitives/Screen';
import { Surface } from '@/src/ui/primitives/Surface';
import { useTheme } from '@/src/ui/theme/ThemeProvider';
import { formatMoneyWithSymbol } from '@/src/utils';

const Index = () => {
    const { t } = useLanguage();
    const { colors } = useTheme();
    const {
        balance,
        savingsPaidCents,
        balanceByRecordType,
        cashBalance,
        cashPaidCents,
        cashIncomeCents,
        settlementsPaidCents,
        settlementsReceivedCents,
        totalPurchasesCents,
        receivableCents,
        paidBalanceCents,
    } = useResumesStore()
    const { mode } = useSummaryMode()
    const { mode: balanceMode, loaded, load } = useBalanceMode()
    const { group: selectedGroup } = useRecordsStore()
    const { fetchRecordsWithMultipleWhere } = useRecords()
    const { refreshGroupData } = useGroupRefresh()
    const recordsModalRef = useRef<RecordsModalRef | null>(null)
    const selectedGroupId = selectedGroup?.id

    useFocusEffect(
        useCallback(() => {
            if (!selectedGroupId) return
            refreshGroupData(selectedGroupId).catch((cause) => {
                if (__DEV__) console.warn('[summaries] group refresh failed', cause)
            })
        }, [selectedGroupId, refreshGroupData])
    )
    const cashReceived = cashIncomeCents + settlementsReceivedCents

    const openRecordType = async (id: number | undefined) => {
        if (id == null) return
        try {
            const rows = await fetchRecordsWithMultipleWhere([
                { column: 'Records.record_type_id', value: id },
                { column: 'Records.group_id', value: selectedGroup?.id ?? null },
            ])
            if (rows) recordsModalRef.current?.open(rows)
        } catch (cause) {
            if (__DEV__) console.warn('[summaries] record type detail failed', cause)
        }
    }

    useEffect(() => {
        if (!loaded) void load()
    }, [loaded, load])

    return (
        <Screen scroll edges={['left', 'right']}>
            <Stack gap='lg'>
                <Row justify='center'>
                    <GroupSelector />
                </Row>

                <BalanceModeToggle />
                {balanceMode === 'consumption' ? <SummaryModeToggle /> : null}

                <Surface variant='raised' padding='lg'>
                    <Stack gap='md'>
                        {[
                            {
                                key: 'consumption',
                                label: t('resume.consumptionBalance'),
                                cents: balance,
                                color: colors.primary,
                            },
                            {
                                key: 'cash',
                                label: t('resume.cashBalance'),
                                cents: cashBalance,
                                color: colors.transfer,
                            },
                            {
                                key: 'paid',
                                label: t('resume.paid'),
                                cents: paidBalanceCents,
                                color: colors.textMuted,
                            },
                        ].map((item, index) => (
                            <React.Fragment key={item.key}>
                                {index > 0 ? <Divider /> : null}
                                <Row justify='space-between' align='center' gap='md'>
                                    <Row gap='sm' align='center' style={{ flex: 1 }}>
                                        <View
                                            style={{
                                                width: 8,
                                                height: 8,
                                                borderRadius: 4,
                                                backgroundColor: item.color,
                                            }}
                                        />
                                        <AppText variant='subtitle'>{item.label}</AppText>
                                    </Row>
                                    <FinanceValue
                                        cents={item.cents}
                                        size='lg'
                                        color={colors.text}
                                    />
                                </Row>
                            </React.Fragment>
                        ))}
                    </Stack>
                </Surface>

                <Row gap='md'>
                    <SummaryBlock
                        label={
                            balanceMode === 'cash'
                                ? t('resume.cashPaid')
                                : t('resume.total')
                        }
                        cents={
                            balanceMode === 'cash'
                                ? cashPaidCents
                                : totalPurchasesCents
                        }
                        size='md'
                        valueColorOverride={colors.text}
                        accentColor={colors.primary}
                        style={{ flex: 1 }}
                    />
                    <SummaryBlock
                        label={
                            balanceMode === 'cash'
                                ? t('resume.cashReceived')
                                : t('resume.shared')
                        }
                        cents={
                            balanceMode === 'cash'
                                ? cashReceived
                                : receivableCents
                        }
                        size='md'
                        valueColorOverride={colors.textMuted}
                        accentColor={colors.textMuted}
                        style={{ flex: 1 }}
                    />
                </Row>

                {balanceMode === 'cash' ? (
                    <Surface variant='outlined' padding='md'>
                        <Stack gap='xs'>
                            <Row justify='space-between'>
                                <AppText color='muted'>{t('resume.settlementsPaid')}</AppText>
                                <AppText weight='600'>
                                    {formatMoneyWithSymbol(settlementsPaidCents)}
                                </AppText>
                            </Row>
                            <Row justify='space-between'>
                                <AppText color='muted'>{t('resume.settlementsReceived')}</AppText>
                                <AppText weight='600'>
                                    {formatMoneyWithSymbol(settlementsReceivedCents)}
                                </AppText>
                            </Row>
                        </Stack>
                    </Surface>
                ) : (
                    <Surface variant='outlined' padding='md'>
                        <SummaryBlock
                            label={t('resume.savingsPaid')}
                            cents={savingsPaidCents}
                            size='md'
                            accentColor={colors.chartPlanned}
                        />
                    </Surface>
                )}

                <BudgetSummaryBlock />

                <Stack gap='sm'>
                    <AppText variant='subtitle'>{t('resume.summaryByRecordType')}</AppText>
                    <Surface variant='outlined' padding='none'>
                        {balanceByRecordType && balanceByRecordType.length > 0 ? (
                            balanceByRecordType.map((item, index) => (
                                <ListItem
                                    key={item?.id ?? index}
                                    title={item.type_name}
                                    leading={
                                        <View
                                            style={{
                                                width: 4,
                                                height: 32,
                                                borderRadius: 2,
                                                backgroundColor: item.record_color ?? colors.primary,
                                            }}
                                        />
                                    }
                                    trailing={
                                        <FinanceValue
                                            cents={
                                                balanceMode === 'cash'
                                                    ? item.cash
                                                    : pickSummaryAmount(mode, item)
                                            }
                                            size='lg'
                                            color={colors.text}
                                        />
                                    }
                                    onPress={() => openRecordType(item.id)}
                                    showDivider={index < balanceByRecordType.length - 1}
                                />
                            ))
                        ) : (
                            <AppText color='muted' style={{ padding: 16 }}>
                                {t('resume.noData')}
                            </AppText>
                        )}
                    </Surface>
                </Stack>
            </Stack>
            <RecordsModal ref={recordsModalRef} />
        </Screen>
    );
};

export default Index;
