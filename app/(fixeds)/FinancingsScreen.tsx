import React, { useEffect, useMemo, useState } from 'react';
import { Pressable } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

import { useFinancingsRepository } from '@/src/db';
import { FinancingForm } from '@/src/components/credits/FinancingForm';
import { FinancingPaymentForm } from '@/src/components/credits/FinancingPaymentForm';
import { FinancingAdjustmentForm } from '@/src/components/credits/FinancingAdjustmentForm';
import { FinancingSimulationForm } from '@/src/components/credits/FinancingSimulationForm';
import { FinancingScheduleModal } from '@/src/components/credits/FinancingScheduleModal';
import { FinancingPaymentsModal } from '@/src/components/credits/FinancingPaymentsModal';
import {
  summarizeFinancing,
  type FinancingSummary,
} from '@/src/domain/credits/summary';
import type {
  FinancingPayment,
  FinancingWithRelations,
} from '@/src/interfaces/schema';
import { useLanguage } from '@/src/lang/LanguageContext';
import { useDataStore } from '@/src/stores';
import { formatMoneyWithSymbol } from '@/src/utils';
import { SwipeAction } from '@/src/ui/actions/SwipeAction';
import { Button } from '@/src/ui/actions/Button';
import { Badge } from '@/src/ui/data-display/Badge';
import { SummaryBlock } from '@/src/ui/data-display/SummaryBlock';
import { EmptyState } from '@/src/ui/feedback/EmptyState';
import { useToast } from '@/src/ui/feedback/ToastProvider';
import { AppText } from '@/src/ui/primitives/AppText';
import { Screen } from '@/src/ui/primitives/Screen';
import { Row, Stack } from '@/src/ui/primitives/Stack';
import { Surface } from '@/src/ui/primitives/Surface';
import { useTheme } from '@/src/ui/theme/ThemeProvider';

type FinancingRow = {
  financing: FinancingWithRelations;
  summary: FinancingSummary;
};

const FinancingsScreen = () => {
  const { t } = useLanguage();
  const { colors } = useTheme();
  const { showToast } = useToast();
  const repository = useFinancingsRepository();
  const { setFinancings: setStoredFinancings } = useDataStore();
  const [financings, setFinancings] = useState<FinancingWithRelations[]>([]);
  const [formVisible, setFormVisible] = useState(false);
  const [paymentVisible, setPaymentVisible] = useState(false);
  const [paymentsVisible, setPaymentsVisible] = useState(false);
  const [adjustmentVisible, setAdjustmentVisible] = useState(false);
  const [simulationVisible, setSimulationVisible] = useState(false);
  const [scheduleVisible, setScheduleVisible] = useState(false);
  const [editingPayment, setEditingPayment] =
    useState<FinancingPayment | null>(null);
  const [paymentInitialDate, setPaymentInitialDate] = useState<number>();
  const [selected, setSelected] = useState<FinancingWithRelations | null>(null);
  const [selectedSummary, setSelectedSummary] =
    useState<FinancingSummary | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let active = true;
    repository.fetchFinancings().then((rows) => {
      if (!active) return;
      setFinancings(rows);
      setStoredFinancings(rows);
      setSelected((current) =>
        current ? rows.find((row) => row.id === current.id) ?? current : current
      );
    });
    return () => {
      active = false;
    };
  }, [refreshKey]);

  const rows = useMemo<FinancingRow[]>(
    () =>
      financings.map((financing) => ({
        financing,
        summary: summarizeFinancing(
          financing,
          financing.FinancingPayments ?? [],
          financing.FinancingAdjustments ?? []
        ),
      })),
    [financings]
  );

  const totalDebt = rows.reduce((total, row) => total + row.summary.balanceCents, 0);
  const totalMonthly = rows.reduce(
    (total, row) => total + row.summary.monthlyPaymentCents,
    0
  );
  const weightedRate = rows.reduce(
    (total, row) =>
      total + row.summary.effectiveRateBps * row.summary.balanceCents,
    0
  );
  const averageRate =
    totalDebt > 0 ? weightedRate / totalDebt / 100 : 0;
  const maxMonths = rows.reduce(
    (max, row) => Math.max(max, row.summary.monthsRemaining),
    0
  );
  const orderedRows = useMemo(
    () =>
      [...rows].sort((a, b) => {
        const aNext = a.summary.schedule.rows[0]?.date ?? Number.MAX_SAFE_INTEGER;
        const bNext = b.summary.schedule.rows[0]?.date ?? Number.MAX_SAFE_INTEGER;
        return (
          aNext - bNext || b.summary.balanceCents - a.summary.balanceCents
        );
      }),
    [rows]
  );
  const upcoming = useMemo(
    () =>
      orderedRows
        .flatMap((row) => {
          const next = row.summary.schedule.rows[0];
          return next ? [{ ...row, next }] : [];
        })
        .sort((a, b) => a.next.date - b.next.date),
    [orderedRows]
  );
  const activeSummary =
    rows.find((row) => row.financing.id === selected?.id)?.summary ??
    selectedSummary;
  const editingSummary = useMemo(
    () =>
      editingPayment && selected
        ? summarizeFinancing(
            selected,
            (selected.FinancingPayments ?? []).filter(
              (payment) => payment.id !== editingPayment.id
            ),
            selected.FinancingAdjustments ?? []
          )
        : activeSummary,
    [editingPayment, selected, activeSummary]
  );

  const openUpcomingPayment = (row: (typeof upcoming)[number]) => {
    setSelected(row.financing);
    setSelectedSummary(row.summary);
    setEditingPayment(null);
    setPaymentInitialDate(row.next.date);
    setPaymentVisible(true);
  };

  const remove = async (id?: number) => {
    if (!id) return;
    try {
      await repository.deleteFinancing(id);
      showToast({ message: t('toast.deleted'), type: 'success' });
      setRefreshKey((value) => value + 1);
    } catch {
      showToast({ message: t('toast.error'), type: 'error' });
    }
  };

  return (
    <Screen scroll edges={['left', 'right']}>
      <Stack gap='lg'>
        <Stack gap='xxs'>
          <AppText variant='title'>{t('financings.title')}</AppText>
          <AppText color='muted'>{t('financings.subtitle')}</AppText>
        </Stack>

        <Row gap='md'>
          <SummaryBlock
            label={t('financings.totalDebt')}
            cents={totalDebt}
            size='md'
            accentColor={colors.expense}
            style={{ flex: 1 }}
          />
          <SummaryBlock
            label={t('financings.monthlyPayment')}
            cents={totalMonthly}
            size='md'
            accentColor={colors.chartMaintenanceCost}
            style={{ flex: 1 }}
          />
        </Row>
        <Row gap='md'>
          <SummaryBlock
            label={t('financings.averageRate')}
            value={`${averageRate.toFixed(2)}%`}
            size='md'
            accentColor={colors.warning}
            style={{ flex: 1 }}
          />
          <SummaryBlock
            label={t('financings.remainingTime')}
            value={`${maxMonths} ${t('financings.months')} / ${(
              maxMonths / 12
            ).toFixed(1)} ${t('financings.years')}`}
            size='md'
            accentColor={colors.chartPlanned}
            style={{ flex: 1 }}
          />
        </Row>

        {upcoming.length > 0 ? (
          <Surface variant='muted' padding='md'>
            <Stack gap='sm'>
              <AppText weight='600'>{t('financings.upcomingPayments')}</AppText>
              {upcoming.map((row) => (
                <Pressable
                  key={`${row.financing.id}-${row.next.number}`}
                  onPress={() => openUpcomingPayment(row)}
                  accessibilityRole='button'
                  accessibilityLabel={row.financing.name}
                >
                  <Row
                    justify='space-between'
                    align='center'
                    gap='sm'
                    style={{ minHeight: 44 }}
                  >
                    <Stack gap='xxs' style={{ flex: 1 }}>
                      <AppText numberOfLines={1}>{row.financing.name}</AppText>
                      <AppText variant='caption' color='muted'>
                        {new Date(row.next.date).toLocaleDateString()} ·{' '}
                        {t('financings.payment')} #{row.next.number}
                      </AppText>
                    </Stack>
                    <Stack gap='xxs' style={{ alignItems: 'flex-end' }}>
                      <AppText>
                        {formatMoneyWithSymbol(row.summary.monthlyPaymentCents)}
                      </AppText>
                      {row.financing.is_shared ? (
                        <AppText variant='caption' color='muted'>
                          {t('shared.own')}:{' '}
                          {formatMoneyWithSymbol(
                            row.summary.monthlyPaymentCents -
                              row.summary.sharedPaymentCents
                          )}
                        </AppText>
                      ) : null}
                    </Stack>
                  </Row>
                </Pressable>
              ))}
            </Stack>
          </Surface>
        ) : null}

        <Button
          label={t('financings.add')}
          size='sm'
          onPress={() => {
            setSelected(null);
            setFormVisible(true);
          }}
          leftIcon={
            <MaterialIcons name='add' size={18} color={colors.onPrimary} />
          }
        />

        {rows.length === 0 ? (
          <EmptyState
            title={t('financings.empty')}
            icon={
              <MaterialIcons
                name='account-balance'
                size={28}
                color={colors.textMuted}
              />
            }
          />
        ) : (
          <Stack gap='md'>
            {orderedRows.map(({ financing, summary }) => (
              <SwipeAction
                key={financing.id}
                handleDelete={() => remove(financing.id)}
                handleUpdate={() => {
                  setSelected(financing);
                  setFormVisible(true);
                }}
              >
                <Surface variant='outlined' padding='md'>
                  <Stack gap='sm'>
                    <Row justify='space-between' align='flex-start' gap='sm'>
                      <Stack gap='xxs' style={{ flex: 1 }}>
                        <AppText weight='600'>{financing.name}</AppText>
                        <AppText variant='caption' color='muted'>
                          {t(`financings.kinds.${financing.kind}` as never)}
                          {financing.lender ? ` · ${financing.lender}` : ''}
                        </AppText>
                      </Stack>
                      <Badge
                        label={t(`financings.kinds.${financing.kind}` as never)}
                        tone='info'
                        size='sm'
                      />
                    </Row>
                    <Row gap='md'>
                      <SummaryBlock
                        label={t('financings.balance')}
                        cents={summary.balanceCents}
                        size='sm'
                        accentColor={colors.expense}
                        style={{ flex: 1 }}
                      />
                      <SummaryBlock
                        label={t('financings.payment')}
                        cents={summary.monthlyPaymentCents}
                        size='sm'
                        accentColor={colors.chartPlanned}
                        style={{ flex: 1 }}
                      />
                    </Row>
                    <AppText variant='caption' color='muted'>
                      {t('financings.paidOf', {
                        paid: summary.paidInstallments,
                        total: financing.term_months,
                      })}
                      {' · '}
                      {`${(summary.effectiveRateBps / 100).toFixed(2)}%`}
                      {summary.payoffDate
                        ? ` · ${t('financings.payoffDate')}: ${new Date(
                            summary.payoffDate
                          ).toLocaleDateString()}`
                        : ''}
                    </AppText>
                    {financing.is_shared ? (
                      <AppText variant='caption' color='muted'>
                        {t('shared.total')}:{' '}
                        {formatMoneyWithSymbol(summary.monthlyPaymentCents)} ·{' '}
                        {t('shared.own')}:{' '}
                        {formatMoneyWithSymbol(
                          summary.monthlyPaymentCents -
                            summary.sharedPaymentCents
                        )}{' '}
                        · {t('shared.totalShared')}:{' '}
                        {formatMoneyWithSymbol(summary.sharedPaymentCents)}
                      </AppText>
                    ) : null}
                    <AppText variant='caption' color='muted'>
                      {t('financings.paidPrincipal')}:{' '}
                      {formatMoneyWithSymbol(summary.paidPrincipalCents)} ·{' '}
                      {t('financings.paidInterest')}:{' '}
                      {formatMoneyWithSymbol(summary.paidInterestCents)}
                    </AppText>
                    {summary.paidInsuranceCents + summary.paidFeesCents > 0 ? (
                      <AppText variant='caption' color='muted'>
                        {t('financings.paidCharges')}:{' '}
                        {formatMoneyWithSymbol(
                          summary.paidInsuranceCents + summary.paidFeesCents
                        )}
                      </AppText>
                    ) : null}
                    {summary.adjustment ? (
                      <AppText variant='caption' color='muted'>
                        {t('financings.lastAdjustment')}:{' '}
                        {new Date(summary.adjustment.date).toLocaleDateString()}{' '}
                        ·{' '}
                        {t(
                          `financings.adjustmentKinds.${summary.adjustment.kind}` as never
                        )}
                      </AppText>
                    ) : null}
                    <Row gap='sm' wrap>
                      <Button
                        label={t('financings.addPayment')}
                        size='sm'
                        onPress={() => {
                          setSelected(financing);
                          setSelectedSummary(summary);
                          setEditingPayment(null);
                          setPaymentInitialDate(undefined);
                          setPaymentVisible(true);
                        }}
                      />
                      <Button
                        label={t('financings.paymentHistory')}
                        size='sm'
                        variant='outline'
                        onPress={() => {
                          setSelected(financing);
                          setSelectedSummary(summary);
                          setPaymentsVisible(true);
                        }}
                      />
                      <Button
                        label={t('financings.refinance')}
                        size='sm'
                        variant='outline'
                        onPress={() => {
                          setSelected(financing);
                          setSelectedSummary(summary);
                          setAdjustmentVisible(true);
                        }}
                      />
                      <Button
                        label={t('financings.simulate')}
                        size='sm'
                        variant='outline'
                        onPress={() => {
                          setSelected(financing);
                          setSelectedSummary(summary);
                          setSimulationVisible(true);
                        }}
                      />
                      <Button
                        label={t('financings.schedule')}
                        size='sm'
                        variant='outline'
                        onPress={() => {
                          setSelected(financing);
                          setSelectedSummary(summary);
                          setScheduleVisible(true);
                        }}
                      />
                      <Button
                        label={t('financings.edit')}
                        size='sm'
                        variant='ghost'
                        onPress={() => {
                          setSelected(financing);
                          setFormVisible(true);
                        }}
                      />
                    </Row>
                  </Stack>
                </Surface>
              </SwipeAction>
            ))}
          </Stack>
        )}
      </Stack>

      <FinancingForm
        visible={formVisible}
        financing={selected}
        onClose={() => setFormVisible(false)}
        onSaved={() => setRefreshKey((value) => value + 1)}
      />
      <FinancingPaymentForm
        visible={paymentVisible}
        financing={selected}
        summary={editingSummary}
        payment={editingPayment}
        initialDate={paymentInitialDate}
        onClose={() => {
          setPaymentVisible(false);
          setEditingPayment(null);
          setPaymentInitialDate(undefined);
        }}
        onSaved={() => {
          setPaymentInitialDate(undefined);
          setRefreshKey((value) => value + 1);
        }}
      />
      <FinancingPaymentsModal
        visible={paymentsVisible}
        financing={selected}
        summary={activeSummary}
        onClose={() => setPaymentsVisible(false)}
        onAdd={() => {
          setPaymentsVisible(false);
          setEditingPayment(null);
          setPaymentInitialDate(undefined);
          setPaymentVisible(true);
        }}
        onEdit={(payment) => {
          setPaymentsVisible(false);
          setEditingPayment(payment);
          setPaymentInitialDate(undefined);
          setPaymentVisible(true);
        }}
        onChanged={() => setRefreshKey((value) => value + 1)}
      />
      <FinancingAdjustmentForm
        visible={adjustmentVisible}
        financing={selected}
        summary={activeSummary}
        onClose={() => setAdjustmentVisible(false)}
        onSaved={() => setRefreshKey((value) => value + 1)}
      />
      <FinancingSimulationForm
        visible={simulationVisible}
        financing={selected}
        summary={activeSummary}
        onClose={() => setSimulationVisible(false)}
      />
      <FinancingScheduleModal
        visible={scheduleVisible}
        financing={selected}
        summary={activeSummary}
        onClose={() => setScheduleVisible(false)}
      />
    </Screen>
  );
};

export default FinancingsScreen;
