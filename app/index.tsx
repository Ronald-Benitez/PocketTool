import { View, Pressable } from 'react-native';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';

import { useLanguage } from '@/src/lang/LanguageContext';
import useColorStore from '@/src/stores/ColorsStore';
import GroupSelector from '@/src/components/groups/group-selector';
import useRecordsStore from '@/src/stores/RecordsStore';
import AddItem from '@/src/components/records/add-record';
import useResumesStore from '@/src/stores/ResumesStore';
import { useDataStore } from '@/src/stores';
import type {
  FinancingWithRelations,
  RecordFormEntry,
} from '@/src/interfaces/schema';
import type { FinancingScheduleRow } from '@/src/domain/credits/types';
import {
  summarizeFinancing,
  type FinancingSummary,
} from '@/src/domain/credits/summary';
import {
    useFinancingsRepository,
    useFixeds,
} from '@/src/db';
import { usePendingFixeds, type PendingFixed } from '@/src/hooks/usePendingFixeds';
import { mapDatabaseError } from '@/src/db/errors';
import { FinancingPaymentForm } from '@/src/components/credits/FinancingPaymentForm';
import { useFeature } from '@/src/features';
import { useConfigs } from '@/src/hooks/useConfigs';
import { useGroupRefresh } from '@/src/hooks/useGroupRefresh';
import { formatMoneyWithSymbol } from '@/src/utils';
import { useToast } from '@/src/ui/feedback/ToastProvider';
import { AppText } from '@/src/ui/primitives/AppText';
import { Row, Stack } from '@/src/ui/primitives/Stack';
import { Screen } from '@/src/ui/primitives/Screen';
import { Surface } from '@/src/ui/primitives/Surface';
import { SummaryBlock } from '@/src/ui/data-display/SummaryBlock';
import { FinanceValue } from '@/src/ui/data-display/FinanceValue';
import { useTheme } from '@/src/ui/theme/ThemeProvider';

type Obligation = {
    financing: FinancingWithRelations;
    summary: FinancingSummary;
    next: FinancingScheduleRow;
};

const isSameDay = (left: number, right: number) => {
    const a = new Date(left);
    const b = new Date(right);
    return (
        a.getFullYear() === b.getFullYear() &&
        a.getMonth() === b.getMonth() &&
        a.getDate() === b.getDate()
    );
};

const Index = () => {
    const { t } = useLanguage();
    const { showToast } = useToast();
    const { initializeColors } = useColorStore()
    const { colors } = useTheme()
    const { group } = useRecordsStore()
    const showFixeds = useFeature('fixeds')
    const showFinancings = useFeature('financings')
    const { pendingFixeds } = usePendingFixeds({ onlyDueToday: true })
    const { balance, cashBalance, todayBalanceByRecordType } = useResumesStore()
    const [fixedToSave, setFixedToSave] = useState<RecordFormEntry>()
    const { loadConfigs } = useConfigs()
    const [open, setOpen] = useState(false)
    const { setFixeds } = useDataStore()
    const { fetchFixeds } = useFixeds();
    const financingsRepository = useFinancingsRepository();
    const { refreshGroupData } = useGroupRefresh();
    const groupId = group?.id;

    useFocusEffect(
        useCallback(() => {
            if (!groupId) return;
            refreshGroupData(groupId).catch((cause) => {
                if (__DEV__) console.warn('[home] group refresh failed', cause);
            });
        }, [groupId, refreshGroupData])
    );
    const [financings, setFinancings] = useState<FinancingWithRelations[]>([]);
    const [financingsRefreshKey, setFinancingsRefreshKey] = useState(0);
    const [selectedFinancing, setSelectedFinancing] =
        useState<FinancingWithRelations | null>(null);
    const [selectedFinancingSummary, setSelectedFinancingSummary] =
        useState<FinancingSummary | null>(null);
    const [paymentVisible, setPaymentVisible] = useState(false);
    const [paymentInitialDate, setPaymentInitialDate] = useState<number>();

    useEffect(() => {
        initializeColors()
        loadConfigs()
    }, [])

    useEffect(() => {
        let active = true;
        fetchFixeds()
            .then((rows) => {
                if (active) setFixeds(rows);
            })
            .catch((cause) => {
                if (!active) return;
                if (__DEV__) console.warn('[home] fixeds load failed', cause);
                const mapped = mapDatabaseError(cause, t('toast.error'));
                showToast({ message: t(`dbErrors.${mapped.code}` as never), type: 'error' });
            });
        return () => { active = false; };
    }, []);

    useEffect(() => {
        let active = true;
        financingsRepository.fetchFinancings().then((rows) => {
            if (active) setFinancings(rows);
        }).catch((cause) => {
            if (!active) return;
            if (__DEV__) console.warn('[home] financings load failed', cause);
            const mapped = mapDatabaseError(cause, t('toast.error'));
            showToast({ message: t(`dbErrors.${mapped.code}` as never), type: 'error' });
        });
        return () => { active = false; };
    }, [financingsRefreshKey]);

    const pendingFinancings = useMemo<Obligation[]>(() => {
        const today = new Date()
        return financings
            .filter((financing) => financing.status === 'active')
            .flatMap((financing) => {
                const summary = summarizeFinancing(
                    financing,
                    financing.FinancingPayments ?? [],
                    financing.FinancingAdjustments ?? []
                );
                const next = summary.schedule.rows[0];
                if (!next || !isSameDay(next.date, today.getTime())) return [];
                return [{ financing, summary, next }];
            });
    }, [financings]);

    const openFinancingPayment = (obligation: Obligation) => {
        setSelectedFinancing(obligation.financing);
        setSelectedFinancingSummary(obligation.summary);
        setPaymentInitialDate(obligation.next.date);
        setPaymentVisible(true);
    };

    const refreshHomeRecords = async () => {
        if (!group?.id) return;
        await refreshGroupData(group.id);
    };

    const decideText = () => {
        const hour = new Date().getHours()
        let message = ""
        let icon = <></>
        if (hour >= 5 && hour < 12) {
            message = t("greeting.morning")
            icon = <MaterialCommunityIcons name="weather-partly-cloudy" size={28} color={colors.info} />
        } else if (hour >= 12 && hour < 18) {
            icon = <MaterialCommunityIcons name="weather-sunny" size={28} color={colors.warning} />
            message = t("greeting.afternoon")
        } else {
            message = t("greeting.night")
            icon = <MaterialCommunityIcons name="weather-night" size={28} color={colors.transfer} />
        }

        return [message, icon]
    }

    const onFixedPress = (obligation: PendingFixed) => {
        setFixedToSave({
            amount: obligation.ownCents,
            own_amount_cents: obligation.ownCents,
            shared_amount_cents: obligation.sharedCents,
            date: obligation.date,
            group_id: group?.id ?? null,
            record_name: obligation.fixed.fixed_name,
            record_type_id: obligation.fixed.record_type_id,
            category_id: obligation.fixed.category_id,
            payment_method_id: obligation.fixed.payment_method_id,
            fixed_id: obligation.fixed.id,
        })
        setOpen(!open)
    }

    const [message, Icon] = decideText()

    return (
        <>
        <Screen scroll edges={['left', 'right']}>
            <Stack gap='lg'>
                <Row justify='space-between' align='center'>
                    <Row gap='sm' align='center'>
                        <AppText variant='title'>{message}</AppText>
                        {Icon}
                    </Row>
                </Row>

                <Row justify='center'>
                    <GroupSelector />
                </Row>

                {(showFixeds && pendingFixeds.length > 0) ||
                (showFinancings && pendingFinancings.length > 0) ? (
                    <Surface variant='outlined' padding='md'>
                        <Stack gap='sm'>
                            <AppText variant='label'>{t("index.obligations")}</AppText>
                            {showFixeds ? pendingFixeds.map((obligation) => {
                                const item = obligation.fixed;
                                return (
                                    <Pressable key={`fixed-${item.id}`} onPress={() => onFixedPress(obligation)}>
                                        <Row justify='space-between' align='center' style={{ minHeight: 40, gap: 12 }}>
                                            <Row gap='sm' align='center' style={{ flex: 1 }}>
                                                <View
                                                    style={{
                                                        width: 8,
                                                        height: 8,
                                                        borderRadius: 4,
                                                        backgroundColor: item.RecordTypes?.record_color ?? colors.primary,
                                                    }}
                                                />
                                                <View style={{ flex: 1 }}>
                                                    <AppText variant='body' numberOfLines={1}>
                                                        {item.fixed_name}
                                                    </AppText>
                                                    <AppText variant='caption' color='muted'>
                                                        {new Date(obligation.date).toLocaleDateString()}
                                                    </AppText>
                                                    {obligation.sharedCents > 0 ? (
                                                        <AppText variant='caption' color='muted'>
                                                            {t('shared.total')}: {formatMoneyWithSymbol(obligation.ownCents + obligation.sharedCents)} · {t('shared.totalShared')}: {formatMoneyWithSymbol(obligation.sharedCents)}
                                                        </AppText>
                                                    ) : null}
                                                </View>
                                            </Row>
                                            <View style={{ alignItems: 'flex-end' }}>
                                                <FinanceValue cents={obligation.ownCents} size='md' color={colors.text} />
                                                {obligation.sharedCents > 0 ? (
                                                    <AppText variant='caption' color='muted'>{t('shared.own')}</AppText>
                                                ) : null}
                                            </View>
                                        </Row>
                                    </Pressable>
                                );
                            }) : null}
                            {showFinancings ? pendingFinancings.map((obligation) => {
                                const own =
                                    obligation.summary.monthlyPaymentCents -
                                    obligation.summary.sharedPaymentCents;
                                return (
                                    <Pressable
                                        key={`financing-${obligation.financing.id}-${obligation.next.number}`}
                                        onPress={() => openFinancingPayment(obligation)}
                                    >
                                        <Row justify='space-between' align='center' style={{ minHeight: 40, gap: 12 }}>
                                            <Row gap='sm' align='center' style={{ flex: 1 }}>
                                                <View
                                                    style={{
                                                        width: 8,
                                                        height: 8,
                                                        borderRadius: 4,
                                                        backgroundColor:
                                                            obligation.financing.RecordTypes?.record_color ??
                                                            colors.primary,
                                                    }}
                                                />
                                                <View style={{ flex: 1 }}>
                                                    <AppText variant='body' numberOfLines={1}>
                                                        {obligation.financing.name}
                                                    </AppText>
                                                    <AppText variant='caption' color='muted'>
                                                        {new Date(obligation.next.date).toLocaleDateString()} · {t('records.financingPayments')} #{obligation.next.number}
                                                    </AppText>
                                                </View>
                                            </Row>
                                            <View style={{ alignItems: 'flex-end' }}>
                                                <FinanceValue cents={own} size='md' color={colors.text} />
                                                {obligation.financing.is_shared ? (
                                                    <AppText variant='caption' color='muted'>{t('shared.own')}</AppText>
                                                ) : null}
                                            </View>
                                        </Row>
                                    </Pressable>
                                );
                            }) : null}
                        </Stack>
                    </Surface>
                ) : null}

                <Surface variant='raised' padding='lg'>
                    <Stack gap='md'>
                        <SummaryBlock
                            label={t("resume.consumptionBalance")}
                            cents={balance}
                            size='xl'
                            labelVariant='subtitle'
                            valueColorOverride={colors.text}
                            accentColor={colors.primary}
                        />
                        <SummaryBlock
                            label={t("resume.cashBalance")}
                            cents={cashBalance}
                            size='lg'
                            labelVariant='subtitle'
                            valueColorOverride={colors.text}
                            accentColor={colors.transfer}
                        />
                    </Stack>
                </Surface>

                <Surface variant='outlined' padding='md'>
                    <SummaryBlock
                        label={t("resume.goal")}
                        cents={group?.goal}
                        size='lg'
                        valueColorOverride={colors.text}
                        accentColor={colors.goal}
                    />
                </Surface>

                <Surface variant='muted' padding='md'>
                    <Stack gap='md'>
                        <Row justify='space-between' align='center'>
                            <AppText variant='subtitle'>{t("resume.today")}</AppText>
                            {group ? (
                                <AddItem>
                                    <View style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}>
                                        <MaterialCommunityIcons name='plus' size={26} color={colors.primary} />
                                    </View>
                                </AddItem>
                            ) : null}
                        </Row>

                        {todayBalanceByRecordType && todayBalanceByRecordType.length > 0 ? (
                            todayBalanceByRecordType.map((item) => (
                                <Row key={item.id} justify='space-between' align='center' style={{ minHeight: 36, gap: 12 }}>
                                    <Row gap='sm' align='center' style={{ flex: 1 }}>
                                        <View
                                            style={{
                                                width: 8,
                                                height: 8,
                                                borderRadius: 4,
                                                backgroundColor: item.record_color ?? colors.primary,
                                            }}
                                        />
                                        <AppText variant='body' numberOfLines={1} style={{ flex: 1 }}>
                                            {item.type_name}
                                        </AppText>
                                    </Row>
                                    <FinanceValue cents={item.own} size='lg' color={colors.text} />
                                </Row>
                            ))
                        ) : (
                            <AppText color='muted'>{t("resume.noData")}</AppText>
                        )}
                    </Stack>
                </Surface>
            </Stack>
        </Screen>

            {group && <AddItem open={open} item={fixedToSave} />}
            <FinancingPaymentForm
                visible={paymentVisible}
                financing={selectedFinancing}
                summary={selectedFinancingSummary}
                initialDate={paymentInitialDate}
                defaultLinkMode='create'
                onClose={() => {
                    setPaymentVisible(false);
                    setPaymentInitialDate(undefined);
                }}
                onSaved={() => {
                    setPaymentInitialDate(undefined);
                    setFinancingsRefreshKey((value) => value + 1);
                    refreshHomeRecords().catch((cause) => {
                        if (__DEV__) console.warn('[home] records refresh failed', cause);
                        const mapped = mapDatabaseError(cause, t('toast.error'));
                        showToast({ message: t(`dbErrors.${mapped.code}` as never), type: 'error' });
                    });
                }}
            />
        </>
    );
};

export default Index;
