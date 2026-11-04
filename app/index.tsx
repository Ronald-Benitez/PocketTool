import { View, Pressable } from 'react-native';
import React, { useEffect, useMemo, useState } from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { useLanguage } from '@/src/lang/LanguageContext';
import useColorStore from '@/src/stores/ColorsStore';
import GroupSelector from '@/src/components/groups/group-selector';
import useRecordsStore from '@/src/stores/RecordsStore';
import AddItem from '@/src/components/records/add-record';
import useResumesStore from '@/src/stores/ResumesStore';
import { useDataStore } from '@/src/stores';
import type {
  FinancingWithRelations,
  FixedView,
  RecordFormEntry,
  SharedExpenseParticipant,
} from '@/src/interfaces/schema';
import type { FinancingScheduleRow } from '@/src/domain/credits/types';
import {
  summarizeFinancing,
  type FinancingSummary,
} from '@/src/domain/credits/summary';
import {
    useFinancingsRepository,
    useRecords,
    useSharedParticipantsRepository,
} from '@/src/db';
import { mapDatabaseError } from '@/src/db/errors';
import { FinancingPaymentForm } from '@/src/components/credits/FinancingPaymentForm';
import { useConfigs } from '@/src/hooks/useConfigs';
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
    const [todayFixeds, setTodayFixeds] = useState<FixedView[]>([])
    const { balance, todayBalanceByRecordType } = useResumesStore()
    const [fixedToSave, setFixedToSave] = useState<RecordFormEntry>()
    const { loadConfigs } = useConfigs()
    const [open, setOpen] = useState(false)
    const { records } = useRecordsStore()
    const { Fixeds } = useDataStore()
    const financingsRepository = useFinancingsRepository();
    const participantsRepository = useSharedParticipantsRepository();
    const { fetchRecords } = useRecords();
    const [participants, setParticipants] = useState<SharedExpenseParticipant[]>([]);
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
        participantsRepository.fetchAll().then((rows) => {
            if (active) setParticipants(rows);
        }).catch((cause) => {
            if (!active) return;
            if (__DEV__) console.warn('[home] participants load failed', cause);
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

    const splitFixed = (fixed: FixedView) => {
        const percent = Math.min(
            100,
            participants
                .filter(
                    (participant) =>
                        participant.owner_type === 'fixed' &&
                        participant.owner_id === fixed.id
                )
                .reduce((sum, participant) => sum + participant.share_percent, 0)
        );
        const shared = Math.round((fixed.fixed_amount * percent) / 100);
        return { own: fixed.fixed_amount - shared, shared };
    };

    const verifyFixedsForToday = () => {
        const today = new Date()
        const day = today.getDate()
        const list: FixedView[] = []
        const todayFixeds = Fixeds.filter(fixed => fixed.fixed_day === day)
        todayFixeds.forEach((fixed) => {
            const record = records.find(record => record.fixed_id === fixed.id)
            if (!record) {
                list.push(fixed)
            }
        })
        setTodayFixeds(list)
    }

    useEffect(verifyFixedsForToday, [records, Fixeds, participants])

    const todayFinancings = useMemo<Obligation[]>(() => {
        const today = new Date();
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
        const rows = await fetchRecords(group.id);
        useRecordsStore.getState().setRecords(rows ?? []);
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

    const onFixedPress = (item: FixedView) => {
        const today = new Date()
        today.setDate(item.fixed_day)
        const split = splitFixed(item)
        setFixedToSave({
            amount: split.own,
            own_amount_cents: split.own,
            shared_amount_cents: split.shared,
            date: today.getTime(),
            group_id: group?.id ?? null,
            record_name: item.fixed_name,
            record_type_id: item.record_type_id,
            category_id: item.category_id,
            payment_method_id: item.payment_method_id,
            fixed_id: item.id,
        })
        setOpen(!open)
    }

    const [message, Icon] = decideText()

    return (
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

                {todayFixeds.length > 0 || todayFinancings.length > 0 ? (
                    <Surface variant='outlined' padding='md'>
                        <Stack gap='sm'>
                            <AppText variant='label'>{t("index.obligations")}</AppText>
                            {todayFixeds.map((item) => {
                                const split = splitFixed(item);
                                return (
                                    <Pressable key={`fixed-${item.id}`} onPress={() => onFixedPress(item)}>
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
                                                    {split.shared > 0 ? (
                                                        <AppText variant='caption' color='muted'>
                                                            {t('shared.total')}: {formatMoneyWithSymbol(split.own + split.shared)} · {t('shared.totalShared')}: {formatMoneyWithSymbol(split.shared)}
                                                        </AppText>
                                                    ) : null}
                                                </View>
                                            </Row>
                                            <View style={{ alignItems: 'flex-end' }}>
                                                <FinanceValue cents={split.own} size='md' color={colors.text} />
                                                {split.shared > 0 ? (
                                                    <AppText variant='caption' color='muted'>{t('shared.own')}</AppText>
                                                ) : null}
                                            </View>
                                        </Row>
                                    </Pressable>
                                );
                            })}
                            {todayFinancings.map((obligation) => {
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
                                                        {t('records.financingPayments')} #{obligation.next.number}
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
                            })}
                        </Stack>
                    </Surface>
                ) : null}

                <Surface variant='raised' padding='lg'>
                    <SummaryBlock
                        label={t("resume.balance")}
                        cents={balance}
                        size='xl'
                        labelVariant='subtitle'
                        valueColorOverride={colors.text}
                        accentColor={colors.primary}
                    />
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
                                    <FinanceValue cents={item.total} size='lg' color={colors.text} />
                                </Row>
                            ))
                        ) : (
                            <AppText color='muted'>{t("resume.noData")}</AppText>
                        )}
                    </Stack>
                </Surface>
            </Stack>

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
        </Screen>
    );
};

export default Index;
