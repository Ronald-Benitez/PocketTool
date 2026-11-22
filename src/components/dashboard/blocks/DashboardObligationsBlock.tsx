import React, { useEffect, useRef, useState } from 'react';
import { Pressable, View } from 'react-native';

import { useFinancingsRepository, useVehicleRemindersRepository } from '@/src/db';
import { mapDatabaseError } from '@/src/db/errors';
import { FinancingPaymentForm } from '@/src/components/credits/FinancingPaymentForm';
import AddItem from '@/src/components/records/add-record';
import { useDashboardRefresh } from '@/src/components/dashboard/DashboardRefreshContext';
import { useDashboardNavigation } from '@/src/components/dashboard/useDashboardNavigation';
import {
  classifyObligationDate,
  sortObligations,
  type DashboardObligationUrgency,
} from '@/src/domain/dashboard/obligations';
import { resolvePendingPaymentDate } from '@/src/domain/credits/pending';
import { summarizeFinancing, type FinancingSummary } from '@/src/domain/credits/summary';
import { groupPeriodFromRow } from '@/src/domain/groups/period';
import { useConfigs } from '@/src/hooks/useConfigs';
import {
  usePendingFixeds,
  type PendingFixed,
} from '@/src/hooks/usePendingFixeds';
import { useFeatures } from '@/src/features';
import type {
  FinancingWithRelations,
  RecordFormEntry,
  VehicleReminder,
} from '@/src/interfaces/schema';
import { useLanguage } from '@/src/lang/LanguageContext';
import { useCreditStore } from '@/src/stores/CreditsStore';
import useRecordsStore from '@/src/stores/RecordsStore';
import { FinanceValue } from '@/src/ui/data-display/FinanceValue';
import { useToast } from '@/src/ui/feedback/ToastProvider';
import { Divider } from '@/src/ui/primitives/Divider';
import { AppText } from '@/src/ui/primitives/AppText';
import { Row } from '@/src/ui/primitives/Stack';
import { useTheme } from '@/src/ui/theme/ThemeProvider';

type ObligationItem = {
  key: string;
  title: string;
  date: number;
  amountCents: number | null;
  onPress: () => void;
};

const urgencyColor = (
  urgency: DashboardObligationUrgency,
  colors: ReturnType<typeof useTheme>['colors']
) => {
  if (urgency === 'overdue') return colors.danger;
  if (urgency === 'today') return colors.warning;
  if (urgency === 'soon') return colors.primary;
  return colors.textMuted;
};

export const DashboardObligationsBlock = () => {
  const { t } = useLanguage();
  const { colors } = useTheme();
  const { showToast } = useToast();
  const { group } = useRecordsStore();
  const { configs } = useConfigs();
  const enabled = useFeatures((state) => state.enabled);
  const showFixeds = Boolean(enabled.fixeds);
  const showFinancings = Boolean(enabled.financings);
  const showCredits = Boolean(enabled.credits);
  const showVehicle = Boolean(enabled.vehicle);
  const { pendingFixeds } = usePendingFixeds({ onlyDueToday: false });
  const { credits } = useCreditStore();
  const { openBlock } = useDashboardNavigation();
  const { refreshKey, refresh } = useDashboardRefresh();
  const financingsRepository = useFinancingsRepository();
  const remindersRepository = useVehicleRemindersRepository();
  const repositoriesRef = useRef({ financingsRepository, remindersRepository });
  repositoriesRef.current = { financingsRepository, remindersRepository };

  const [financings, setFinancings] = useState<FinancingWithRelations[]>([]);
  const [reminders, setReminders] = useState<VehicleReminder[]>([]);
  const [now, setNow] = useState(() => Date.now());
  const [fixedToSave, setFixedToSave] = useState<RecordFormEntry>();
  const [fixedOpen, setFixedOpen] = useState(false);
  const [paymentVisible, setPaymentVisible] = useState(false);
  const [selectedFinancing, setSelectedFinancing] =
    useState<FinancingWithRelations | null>(null);
  const [selectedSummary, setSelectedSummary] =
    useState<FinancingSummary | null>(null);
  const [paymentInitialDate, setPaymentInitialDate] = useState<number>();

  useEffect(() => {
    let active = true;
    setNow(Date.now());

    Promise.all([
      showFinancings
        ? repositoriesRef.current.financingsRepository.fetchFinancings()
        : Promise.resolve([]),
      showVehicle
        ? repositoriesRef.current.remindersRepository.fetchReminders()
        : Promise.resolve([]),
    ])
      .then(([financingRows, reminderRows]) => {
        if (!active) return;
        setFinancings(financingRows);
        setReminders(reminderRows);
      })
      .catch((cause) => {
        if (!active) return;
        if (__DEV__) console.warn('[dashboard] obligations load failed', cause);
        const mapped = mapDatabaseError(cause, t('toast.error'));
        showToast({
          message: t(`dbErrors.${mapped.code}` as never),
          type: 'error',
        });
      });

    return () => {
      active = false;
    };
  }, [refreshKey, showFinancings, showVehicle, showToast, t]);

  const openFixed = (obligation: PendingFixed) => {
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
    });
    setFixedOpen(true);
  };

  const openFinancing = (
    financing: FinancingWithRelations,
    summary: FinancingSummary,
    date: number
  ) => {
    setSelectedFinancing(financing);
    setSelectedSummary(summary);
    setPaymentInitialDate(date);
    setPaymentVisible(true);
  };

  const items: ObligationItem[] = [];

  pendingFixeds.forEach((obligation) => {
    if (!showFixeds) return;
    items.push({
      key: `fixed-${obligation.fixed.id}-${obligation.date}`,
      title: obligation.fixed.fixed_name,
      date: obligation.date,
      amountCents: obligation.ownCents,
      onPress: () => openFixed(obligation),
    });
  });

  financings.forEach((financing) => {
    if (!showFinancings) return;
    if (financing.status !== 'active') return;
    const summary = summarizeFinancing(
      financing,
      financing.FinancingPayments ?? [],
      financing.FinancingAdjustments ?? []
    );
    const next = summary.schedule.rows[0];
    if (!next) return;
    const own = Math.max(
      0,
      summary.monthlyPaymentCents - summary.sharedPaymentCents
    );
    items.push({
      key: `financing-${financing.id}-${next.number}`,
      title: financing.name,
      date: next.date,
      amountCents: own,
      onPress: () => openFinancing(financing, summary, next.date),
    });
  });

  const period = group ? groupPeriodFromRow(group) : null;
  (credits ?? []).forEach((credit) => {
    if (!showCredits) return;
    if (credit.id === undefined) return;
    const expected = Math.max(
      0,
      (credit.totalPreviousCombined ?? credit.totalPrevious ?? 0) -
        (credit.totalCurrentPayments ?? 0)
    );
    if (expected <= 0) return;
    const date = resolvePendingPaymentDate({
      mode: configs.pendingPaymentDateMode,
      now,
      groupYear: group?.year,
      groupMonth: group?.month,
      paymentDay: credit.payment_date ?? null,
      periodStart: period?.start,
      periodEnd: period?.end,
    });
    items.push({
      key: `card-${credit.id}`,
      title: credit.method_name,
      date,
      amountCents: expected,
      onPress: () => openBlock('credits'),
    });
  });

  reminders
    .filter((reminder) => Boolean(reminder.is_active) && reminder.next_due_date)
    .forEach((reminder) => {
      if (!showVehicle) return;
      items.push({
        key: `vehicle-${reminder.id}`,
        title: reminder.title,
        date: reminder.next_due_date as number,
        amountCents: null,
        onPress: () => openBlock('vehicle'),
      });
    });

  const visible = sortObligations(items, now).slice(0, 5);

  return (
    <>
      {visible.length === 0 ? (
        <AppText variant='caption' color='muted' style={{ padding: 16 }}>
          {t('dashboard.noPending')}
        </AppText>
      ) : (
        <View>
          {visible.map((item, index) => {
            const urgency = classifyObligationDate({
              date: item.date,
              now,
            });
            return (
              <React.Fragment key={item.key}>
                <Pressable
                  onPress={item.onPress}
                  accessibilityRole='button'
                  accessibilityLabel={item.title}
                  style={({ pressed }) => ({
                    opacity: pressed ? 0.75 : 1,
                  })}
                >
                  <Row
                    justify='space-between'
                    align='center'
                    gap='md'
                    style={{
                      minHeight: 44,
                      paddingHorizontal: 16,
                      paddingVertical: 10,
                    }}
                  >
                    <Row gap='sm' align='center' style={{ flex: 1 }}>
                      <View
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: 4,
                          backgroundColor: urgencyColor(urgency, colors),
                        }}
                      />
                      <View style={{ flex: 1 }}>
                        <AppText variant='body' numberOfLines={1}>
                          {item.title}
                        </AppText>
                        <AppText variant='caption' color='muted'>
                          {new Date(item.date).toLocaleDateString()}
                        </AppText>
                      </View>
                    </Row>
                    {item.amountCents != null ? (
                      <FinanceValue
                        cents={item.amountCents}
                        size='md'
                        color={colors.text}
                      />
                    ) : null}
                  </Row>
                </Pressable>
                {index < visible.length - 1 ? <Divider /> : null}
              </React.Fragment>
            );
          })}
        </View>
      )}

      <AddItem
        open={fixedOpen}
        item={fixedToSave}
        onClose={() => setFixedOpen(false)}
        onSaved={() => {
          setFixedOpen(false);
          refresh();
        }}
      />
      <FinancingPaymentForm
        visible={paymentVisible}
        financing={selectedFinancing}
        summary={selectedSummary}
        initialDate={paymentInitialDate}
        defaultLinkMode='create'
        onClose={() => {
          setPaymentVisible(false);
          setPaymentInitialDate(undefined);
        }}
        onSaved={() => {
          setPaymentVisible(false);
          setPaymentInitialDate(undefined);
          refresh();
        }}
      />
    </>
  );
};
