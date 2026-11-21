import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import {
  useFinancingsRepository,
  useSavings,
  useVehicleFuelRepository,
  useVehicleMaintenanceRepository,
  useVehicleRemindersRepository,
  useVehicleSettingsRepository,
} from '@/src/db';
import type { SavingView } from '@/src/db/repositories/savings';
import type {
  VehicleFuelEntryView,
  VehicleMaintenanceView,
} from '@/src/db/repositories/vehicle';
import { resolvePendingPaymentDate } from '@/src/domain/credits/pending';
import { summarizeFinancing } from '@/src/domain/credits/summary';
import type {
  BudgetObligation,
  BudgetObligationsView,
  BudgetPlanView,
} from '@/src/domain/budgets/types';
import { suggestedContributionCents } from '@/src/domain/savings/contributions';
import { forecastVehicleRemindersInPeriod } from '@/src/domain/vehicle/reminderForecast';
import { useFeature } from '@/src/features';
import { useConfigs } from '@/src/hooks/useConfigs';
import { useLanguage } from '@/src/lang/LanguageContext';
import { useCreditStore } from '@/src/stores/CreditsStore';
import type {
  FinancingWithRelations,
  Saving,
  VehicleReminder,
  VehicleSetting,
} from '@/src/interfaces/schema';

const emptyObligations = (): BudgetObligationsView => ({
  items: [],
  financingCents: 0,
  vehicleCents: 0,
  savingsCents: 0,
  cardCents: 0,
  totalConsumptionCents: 0,
  totalCashCents: 0,
});

const buildView = (items: BudgetObligation[]): BudgetObligationsView => {
  const sum = (kind: BudgetObligation['kind']) =>
    items
      .filter((item) => item.kind === kind)
      .reduce((total, item) => total + item.amountCents, 0);

  return {
    items,
    financingCents: sum('financing'),
    vehicleCents: sum('vehicle'),
    savingsCents: sum('savings'),
    cardCents: sum('card'),
    totalConsumptionCents: items
      .filter((item) => item.consumption)
      .reduce((total, item) => total + item.amountCents, 0),
    totalCashCents: items
      .filter((item) => item.cash)
      .reduce((total, item) => total + item.amountCents, 0),
  };
};

export const useBudgetObligations = (plan: BudgetPlanView | null) => {
  const { t } = useLanguage();
  const { configs } = useConfigs();
  const { credits } = useCreditStore();
  const showCredits = useFeature('credits');
  const showFinancings = useFeature('financings');
  const showSavings = useFeature('savings');
  const showVehicle = useFeature('vehicle');

  const financingsRepository = useFinancingsRepository();
  const savingsRepository = useSavings();
  const fuelRepository = useVehicleFuelRepository();
  const maintenanceRepository = useVehicleMaintenanceRepository();
  const remindersRepository = useVehicleRemindersRepository();
  const vehicleSettingsRepository = useVehicleSettingsRepository();

  const repositories = useRef({
    financingsRepository,
    savingsRepository,
    fuelRepository,
    maintenanceRepository,
    remindersRepository,
    vehicleSettingsRepository,
  });
  repositories.current = {
    financingsRepository,
    savingsRepository,
    fuelRepository,
    maintenanceRepository,
    remindersRepository,
    vehicleSettingsRepository,
  };

  const [financings, setFinancings] = useState<FinancingWithRelations[]>([]);
  const [savings, setSavings] = useState<Saving[]>([]);
  const [savingViews, setSavingViews] = useState<SavingView[]>([]);
  const [fuelEntries, setFuelEntries] = useState<VehicleFuelEntryView[]>([]);
  const [maintenance, setMaintenance] = useState<VehicleMaintenanceView[]>([]);
  const [reminders, setReminders] = useState<VehicleReminder[]>([]);
  const [vehicleSettings, setVehicleSettings] = useState<VehicleSetting[]>([]);
  const [now, setNow] = useState(0);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setNow(Date.now());
    setLoading(true);
    try {
      const [
        nextFinancings,
        nextSavings,
        nextFuelEntries,
        nextMaintenance,
        nextReminders,
        nextVehicleSettings,
      ] = await Promise.all([
        showFinancings
          ? repositories.current.financingsRepository.fetchFinancings()
          : Promise.resolve([]),
        showSavings
          ? repositories.current.savingsRepository.fetchSavings({
              status: 'active',
            })
          : Promise.resolve([]),
        showVehicle
          ? repositories.current.fuelRepository.fetchFuelEntries()
          : Promise.resolve([]),
        showVehicle
          ? repositories.current.maintenanceRepository.fetchMaintenance()
          : Promise.resolve([]),
        showVehicle
          ? repositories.current.remindersRepository.fetchReminders()
          : Promise.resolve([]),
        showVehicle
          ? repositories.current.vehicleSettingsRepository.fetchSettings()
          : Promise.resolve([]),
      ]);

      setFinancings(nextFinancings);
      setSavings(nextSavings);
      setFuelEntries(nextFuelEntries);
      setMaintenance(nextMaintenance);
      setReminders(nextReminders);
      setVehicleSettings(nextVehicleSettings);
    } catch (cause) {
      if (__DEV__) console.warn('[budget] obligations failed', cause);
    } finally {
      setLoading(false);
    }
  }, [showFinancings, showSavings, showVehicle]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load])
  );

  useEffect(() => {
    if (!showSavings || !plan || savings.length === 0) {
      setSavingViews([]);
      return;
    }

    let active = true;
    Promise.all(
      savings.map((saving) =>
        saving.id == null
          ? Promise.resolve(null)
          : repositories.current.savingsRepository.fetchSavingView(
              saving.id,
              {
                groupId: plan.groupId,
                periodYear: plan.year,
                periodMonth: plan.month + 1,
                scope: 'own',
              }
            )
      )
    )
      .then((views) => {
        if (!active) return;
        setSavingViews(
          views.filter((view): view is SavingView => Boolean(view))
        );
      })
      .catch((cause) => {
        if (__DEV__) console.warn('[budget] savings projection failed', cause);
      });

    return () => {
      active = false;
    };
  }, [plan, savings, showSavings]);

  const obligations = useMemo(() => {
    if (!plan || plan.periodRelation === 'past') return emptyObligations();

    const items: BudgetObligation[] = [];

    if (showFinancings) {
      for (const financing of financings) {
        if (financing.status !== 'active' || financing.id === undefined) continue;

        const summary = summarizeFinancing(
          financing,
          financing.FinancingPayments ?? [],
          financing.FinancingAdjustments ?? []
        );
        const next = summary.schedule.rows[0];
        if (!next) continue;
        if (next.date < plan.periodStart || next.date > plan.periodEnd) continue;

        const own = Math.max(
          0,
          summary.monthlyPaymentCents - summary.sharedPaymentCents
        );
        if (own <= 0) continue;

        const coveredByLine =
          financing.category_id != null &&
          financing.record_type_id != null &&
          plan.lines.some(
            (line) =>
              line.effect === '-' &&
              line.categoryId === financing.category_id &&
              line.recordTypeId === financing.record_type_id
          );
        if (coveredByLine) continue;

        items.push({
          key: `financing:${financing.id}`,
          kind: 'financing',
          label: financing.name,
          amountCents: own,
          date: next.date,
          consumption: true,
          cash: true,
        });
      }
    }

    if (showSavings) {
      for (const view of savingViews) {
        if (view.id === undefined) continue;
        if (view.contribution_rule !== 'percent' && view.contribution_rule !== 'fixed') {
          continue;
        }

        const suggested = suggestedContributionCents({
          rule: view.contribution_rule,
          percentBps: view.contribution_percent_bps,
          fixedCents: view.contribution_amount_cents,
          incomeCents: plan.balance.expectedIncomeCents,
        });
        const ownShare = Math.round(
          (suggested.suggestedCents * view.ownSharePercent) / 100
        );
        const remaining = Math.max(
          0,
          ownShare - view.contribution.actualCents
        );
        if (remaining <= 0) continue;

        items.push({
          key: `savings:${view.id}`,
          kind: 'savings',
          label: view.saving_name,
          amountCents: remaining,
          date: plan.periodEnd,
          consumption: false,
          cash: true,
        });
      }
    }

    if (showVehicle) {
      const maintenanceCategoryId =
        vehicleSettings.find((setting) => setting.setting_key === 'maintenance')
          ?.category_id ?? null;
      const maintenanceCoveredByLine =
        maintenanceCategoryId != null &&
        plan.lines.some(
          (line) =>
            line.effect === '-' && line.categoryId === maintenanceCategoryId
        );

      const forecasts = forecastVehicleRemindersInPeriod({
        reminders: reminders.flatMap((reminder) =>
          reminder.id === undefined
            ? []
            : [{ ...reminder, id: reminder.id }]
        ),
        fuelEntries,
        maintenance,
        period: { start: plan.periodStart, end: plan.periodEnd },
        now,
      });

      for (const forecast of forecasts) {
        if (forecast.status !== 'included') continue;
        if (maintenanceCoveredByLine) continue;
        items.push({
          key: `vehicle:${forecast.vehicleId}:${forecast.reminderId}`,
          kind: 'vehicle',
          label: forecast.title,
          amountCents: forecast.amountCents,
          date: forecast.dueDate,
          consumption: true,
          cash: true,
          confidence: forecast.confidence,
          note: forecast.hasCostEstimate
            ? null
            : t('budget.vehicleNoEstimate'),
        });
      }
    }

    if (showCredits) {
      for (const credit of credits ?? []) {
        if (credit.id === undefined) continue;
        const expected = Math.max(
          0,
          (credit.totalPreviousCombined ?? credit.totalPrevious ?? 0) -
            (credit.totalCurrentPayments ?? 0)
        );
        if (expected <= 0) continue;

        const paymentDate = resolvePendingPaymentDate({
          mode: configs.pendingPaymentDateMode,
          now,
          groupYear: plan.year,
          groupMonth: plan.month,
          paymentDay: credit.payment_date ?? null,
          periodStart: plan.periodStart,
          periodEnd: plan.periodEnd,
        });
        if (paymentDate < plan.periodStart || paymentDate > plan.periodEnd) {
          continue;
        }

        items.push({
          key: `card:${credit.id}`,
          kind: 'card',
          label: credit.method_name,
          amountCents: expected,
          date: paymentDate,
          consumption: false,
          cash: true,
        });
      }
    }

    return buildView(items);
  }, [
    configs.pendingPaymentDateMode,
    credits,
    financings,
    fuelEntries,
    maintenance,
    now,
    plan,
    reminders,
    savingViews,
    showCredits,
    showFinancings,
    showSavings,
    showVehicle,
    t,
    vehicleSettings,
  ]);

  return { obligations, loading, refresh: load };
};
