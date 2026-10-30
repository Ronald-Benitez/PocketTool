import React, { useCallback, useMemo, useState } from 'react';
import { View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';

import GroupSelector from '@/src/components/groups/group-selector';
import { BudgetGroupAverageDialog } from '@/src/components/budgets/BudgetGroupAverageDialog';
import { BudgetLineForm } from '@/src/components/budgets/BudgetLineForm';
import { BudgetTemplateApplyDialog } from '@/src/components/budgets/BudgetTemplateApplyDialog';
import { useBudgetPlan, useBudgetTemplates } from '@/src/hooks/useBudgetPlan';
import useRecordsStore from '@/src/stores/RecordsStore';
import type {
  BudgetApplyMode,
  BudgetInsight,
  BudgetLineComparison,
} from '@/src/domain/budgets/types';
import { buildBudgetCharts } from '@/src/domain/budgets/charts';
import { budgetLineStatusKey } from '@/src/lang/keys';
import type { Group } from '@/src/interfaces/schema';
import { useLanguage } from '@/src/lang/LanguageContext';
import { formatMoneyWithSymbol } from '@/src/utils';
import { Button } from '@/src/ui/actions/Button';
import { IconButton } from '@/src/ui/actions/IconButton';
import { Badge, type BadgeTone } from '@/src/ui/data-display/Badge';
import { FinanceValue } from '@/src/ui/data-display/FinanceValue';
import { ListItem } from '@/src/ui/data-display/ListItem';
import { SummaryBlock } from '@/src/ui/data-display/SummaryBlock';
import { EmptyState } from '@/src/ui/feedback/EmptyState';
import { InlineMessage } from '@/src/ui/feedback/InlineMessage';
import { LoadingState } from '@/src/ui/feedback/LoadingState';
import { useToast } from '@/src/ui/feedback/ToastProvider';
import { TextField } from '@/src/ui/forms/TextField';
import { MermaidChart } from '@/src/ui/charts/MermaidChart';
import { ConfirmDialog } from '@/src/ui/overlays/Dialog';
import { Modal } from '@/src/ui/overlays/Modal';
import { AppText } from '@/src/ui/primitives/AppText';
import { Screen } from '@/src/ui/primitives/Screen';
import { Row, Stack } from '@/src/ui/primitives/Stack';
import { Surface } from '@/src/ui/primitives/Surface';
import { useTheme } from '@/src/ui/theme/ThemeProvider';

const statusTone = (status: BudgetLineComparison['status']): BadgeTone => {
  switch (status) {
    case 'over':
      return 'danger';
    case 'warning':
      return 'warning';
    case 'fixed_pending':
      return 'info';
    default:
      return 'success';
  }
};

const statusColor = (status: BudgetLineComparison['status'], colors: ReturnType<typeof useTheme>['colors']) => {
  switch (status) {
    case 'over':
      return colors.danger;
    case 'warning':
      return colors.warning;
    case 'fixed_pending':
      return colors.info;
    default:
      return colors.success;
  }
};

const Index = () => {
  const { t } = useLanguage();
  const { colors } = useTheme();
  const { showToast } = useToast();
  const router = useRouter();
  const { group } = useRecordsStore();
  const { plan, loading, refresh, repository } = useBudgetPlan(group?.id);
  const { templates, refresh: refreshTemplates } = useBudgetTemplates();
  const [lineFormVisible, setLineFormVisible] = useState(false);
  const [selectedLine, setSelectedLine] = useState<BudgetLineComparison | null>(null);
  const [chartMode, setChartMode] = useState<
    'comparison' | 'health' | 'distribution' | 'projection'
  >('comparison');
  const [applyVisible, setApplyVisible] = useState(false);
  const [averageVisible, setAverageVisible] = useState(false);
  const [groups, setGroups] = useState<Group[]>([]);
  const [saveAsVisible, setSaveAsVisible] = useState(false);
  const [confirmDeletePlan, setConfirmDeletePlan] = useState(false);
  const [deletingPlan, setDeletingPlan] = useState(false);
  const [planEditVisible, setPlanEditVisible] = useState(false);
  const [planName, setPlanName] = useState('');
  const [planThreshold, setPlanThreshold] = useState('80');
  const [templateName, setTemplateName] = useState('');
  const [templateDescription, setTemplateDescription] = useState('');
  const [busy, setBusy] = useState(false);

  const chartLabels = useMemo(
    () => ({
      healthTitle: t('budget.chart.health'),
      distributionTitle: t('budget.chart.distribution'),
      comparisonTitle: t('budget.chart.comparison'),
      projectionTitle: t('budget.chart.projection'),
      planned: t('budget.chart.planned'),
      actual: t('budget.chart.actual'),
      projected: t('budget.lines.projected'),
      spent: t('budget.chart.spent'),
      remaining: t('budget.chart.remaining'),
      onTrack: t('budget.lineStatus.onTrack'),
      warning: t('budget.lineStatus.warning'),
      over: t('budget.lineStatus.over'),
      fixedPending: t('budget.lineStatus.fixedPending'),
    }),
    [t]
  );

  const charts = useMemo(
    () =>
      plan
        ? buildBudgetCharts(plan, chartLabels)
        : { health: null, distribution: null, comparison: null, projection: null },
    [plan, chartLabels]
  );

  const chartPalette = useMemo(() => {
    if (chartMode === 'health') {
      return [colors.success, colors.warning, colors.danger, colors.info];
    }
    if (chartMode === 'distribution') {
      return [
        colors.chartPlanned,
        colors.chartActual,
        colors.chartProjected,
        colors.primary,
        colors.secondary,
        colors.info,
        colors.warning,
        colors.danger,
      ];
    }
    if (chartMode === 'projection') {
      return [colors.chartPlanned, colors.chartProjected];
    }
    return [colors.chartPlanned, colors.chartActual];
  }, [
    chartMode,
    colors.chartActual,
    colors.chartPlanned,
    colors.chartProjected,
    colors.danger,
    colors.info,
    colors.primary,
    colors.secondary,
    colors.success,
    colors.warning,
  ]);

  const chartLegend = useMemo(() => {
    if (chartMode === 'comparison') {
      return [
        { label: t('budget.chart.planned'), color: colors.chartPlanned },
        { label: t('budget.chart.actual'), color: colors.chartActual },
      ];
    }
    if (chartMode === 'projection') {
      return [
        { label: t('budget.chart.planned'), color: colors.chartPlanned },
        { label: t('budget.lines.projected'), color: colors.chartProjected },
      ];
    }
    if (chartMode === 'health') {
      return [
        { label: t('budget.lineStatus.onTrack'), color: colors.success },
        { label: t('budget.lineStatus.warning'), color: colors.warning },
        { label: t('budget.lineStatus.over'), color: colors.danger },
        { label: t('budget.lineStatus.fixedPending'), color: colors.info },
      ];
    }
    return [];
  }, [
    chartMode,
    colors.chartActual,
    colors.chartPlanned,
    colors.chartProjected,
    colors.danger,
    colors.info,
    colors.success,
    colors.warning,
    t,
  ]);

  useFocusEffect(
    useCallback(() => {
      refresh();
      refreshTemplates();
    }, [refresh, refreshTemplates])
  );

  const start = async (action: 'blank' | 'previous' | 'fixeds' | 'actuals') => {
    if (!group?.id) return;
    setBusy(true);
    try {
      if (action === 'previous') await repository.createFromPreviousMonth(group.id);
      else if (action === 'fixeds') await repository.createFromFixeds(group.id);
      else if (action === 'actuals') await repository.createFromActuals(group.id);
      else await repository.createPlan(group.id);
      await refresh();
      showToast({ message: t('budget.toast.planCreated'), type: 'success' });
    } catch {
      showToast({ message: t('budget.toast.error'), type: 'error' });
    } finally {
      setBusy(false);
    }
  };

  const openAverage = async () => {
    setGroups(await repository.listGroups());
    setAverageVisible(true);
  };

  const createAverage = async (sourceGroupIds: number[]) => {
    if (!group?.id) return;
    await repository.createFromGroupsAverage(group.id, sourceGroupIds);
    await refresh();
    showToast({ message: t('budget.toast.planCreated'), type: 'success' });
  };

  const removePlan = async () => {
    if (!plan) return;
    setDeletingPlan(true);
    try {
      await repository.deletePlan(plan.planId);
      setConfirmDeletePlan(false);
      setPlanEditVisible(false);
      await refresh();
      showToast({ message: t('budget.planDeleted'), type: 'success' });
    } catch {
      showToast({ message: t('budget.toast.error'), type: 'error' });
    } finally {
      setDeletingPlan(false);
    }
  };

  const startWithTemplate = async () => {
    if (!group?.id) return;
    if (templates.length === 0) {
      router.push('/(budget)/templates');
      return;
    }
    await start('blank');
    setApplyVisible(true);
  };

  const applyTemplate = async (templateId: number, mode: BudgetApplyMode) => {
    if (!plan) return;
    await repository.applyTemplate(plan.planId, templateId, mode);
    await refresh();
    showToast({ message: t('budget.toast.templateApplied'), type: 'success' });
  };

  const openPlanEdit = () => {
    if (!plan) return;
    setPlanName(plan.planName);
    setPlanThreshold(String(plan.alertThresholdPercent));
    setPlanEditVisible(true);
  };

  const savePlan = async () => {
    if (!plan) return;
    const threshold = Number(planThreshold);
    if (!planName.trim() || !Number.isFinite(threshold) || threshold < 1 || threshold > 100) {
      showToast({ message: t('budget.toast.empty'), type: 'warning' });
      return;
    }
    setBusy(true);
    try {
      await repository.updatePlan(plan.planId, {
        plan_name: planName.trim(),
        alert_threshold_percent: Math.round(threshold),
      });
      setPlanEditVisible(false);
      await refresh();
      showToast({ message: t('budget.toast.lineSaved'), type: 'success' });
    } catch {
      showToast({ message: t('budget.toast.error'), type: 'error' });
    } finally {
      setBusy(false);
    }
  };

  const saveAsTemplate = async () => {
    if (!plan || templateName.trim().length === 0) {
      showToast({ message: t('budget.toast.empty'), type: 'warning' });
      return;
    }
    setBusy(true);
    try {
      await repository.saveAsTemplate(
        plan.planId,
        templateName.trim(),
        templateDescription.trim() || null
      );
      setSaveAsVisible(false);
      setTemplateName('');
      setTemplateDescription('');
      await refreshTemplates();
      showToast({ message: t('budget.toast.templateSaved'), type: 'success' });
    } catch {
      showToast({ message: t('budget.toast.error'), type: 'error' });
    } finally {
      setBusy(false);
    }
  };

  const addFixedToPlan = async (fixedId: number) => {
    if (!plan) return;
    const fixed = plan.fixedCommitments.find((item) => item.fixedId === fixedId);
    if (!fixed) return;
    try {
      await repository.saveLine({
        budget_plan_id: plan.planId,
        category_id: fixed.categoryId,
        record_type_id: fixed.recordTypeId,
        fixed_id: fixed.fixedId,
        scope: 'fixed',
        source: 'fixed',
        planned_amount: fixed.amountCents,
        priority: 2,
      });
      await refresh();
    } catch {
      showToast({ message: t('budget.toast.error'), type: 'error' });
    }
  };

  const removeFixedFromPlan = async (fixedId: number) => {
    if (!plan) return;
    const fixed = plan.fixedCommitments.find((item) => item.fixedId === fixedId);
    if (!fixed?.lineId) return;
    try {
      await repository.deleteLine(fixed.lineId);
      await refresh();
    } catch {
      showToast({ message: t('budget.toast.error'), type: 'error' });
    }
  };

  const syncFixed = async (line: BudgetLineComparison) => {
    if (!plan || !line.fixedId) return;
    const fixed = plan.fixedCommitments.find((item) => item.fixedId === line.fixedId);
    if (!fixed) return;
    try {
      await repository.saveLine({
        id: line.lineId,
        budget_plan_id: plan.planId,
        category_id: line.categoryId,
        record_type_id: line.recordTypeId,
        fixed_id: line.fixedId,
        scope: 'fixed',
        planned_amount: fixed.amountCents,
        priority: line.priority,
        notes: line.notes,
      });
      await refresh();
      showToast({ message: t('budget.toast.fixedSynced'), type: 'success' });
    } catch {
      showToast({ message: t('budget.toast.error'), type: 'error' });
    }
  };

  const insightText = (insight: BudgetInsight) => {
    if (!plan) return '';
    if (insight.kind === 'over_budget' || insight.kind === 'near_limit') {
      const line = plan.lines.find((item) => item.lineId === insight.lineId);
      const category = line?.categoryName || t('budget.lines.noCategory');
      return insight.kind === 'over_budget'
        ? t('budget.insights.overBudget', {
            category,
            amount: formatMoneyWithSymbol(insight.amountCents),
          })
        : t('budget.insights.nearLimit', {
            category,
            percent: insight.usagePercent,
          });
    }
    if (insight.kind === 'unplanned_spending') {
      const bucket = plan.unplanned.find(
        (item) =>
          item.categoryId === insight.categoryId
      );
      return t('budget.insights.unplannedSpending', {
        category: bucket?.categoryName || t('budget.lines.noCategory'),
        amount: formatMoneyWithSymbol(insight.amountCents),
      });
    }
    if (insight.kind === 'fixed_uncovered' || insight.kind === 'fixed_pending') {
      const fixed = plan.fixedCommitments.find((item) => item.fixedId === insight.fixedId);
      return insight.kind === 'fixed_uncovered'
        ? t('budget.insights.fixedUncovered', {
            name: fixed?.name ?? '',
            amount: formatMoneyWithSymbol(insight.amountCents),
          })
        : t('budget.insights.fixedPending', {
            name: fixed?.name ?? '',
            day: insight.day,
            amount: formatMoneyWithSymbol(insight.amountCents),
          });
    }
    return insight.kind === 'empty_plan'
      ? t('budget.insights.emptyPlan')
      : t('budget.insights.noPlan');
  };

  const openNewLine = () => {
    setSelectedLine(null);
    setLineFormVisible(true);
  };

  const openEditLine = (line: BudgetLineComparison) => {
    setSelectedLine(line);
    setLineFormVisible(true);
  };

  const chartFallback = plan ? (
    <Surface variant='outlined' padding='sm'>
      <Stack gap='xs'>
        {plan.lines
          .filter((line) => line.effect === '-')
          .slice(0, 10)
          .map((line) => (
            <Row key={line.lineId} justify='space-between' align='center'>
              <AppText variant='caption' numberOfLines={1} style={{ flex: 1 }}>
                {line.categoryName || t('budget.lines.noCategory')}
              </AppText>
              <AppText variant='caption' color='muted'>
                {formatMoneyWithSymbol(line.plannedCents)} / {formatMoneyWithSymbol(line.actualCents)}
              </AppText>
            </Row>
          ))}
      </Stack>
    </Surface>
  ) : null;

  if (!group?.id) {
    return (
      <Screen scroll>
        <Stack gap='lg'>
          <Row justify='center'>
            <GroupSelector />
          </Row>
          <EmptyState
            title={t('budget.noPlanTitle')}
            description={t('budget.noPlanBody')}
            icon={<MaterialIcons name='pie-chart-outline' size={28} color={colors.textMuted} />}
          />
        </Stack>
      </Screen>
    );
  }

  if (loading && !plan) {
    return (
      <Screen>
        <LoadingState message={t('budget.planTitle')} fullScreen />
      </Screen>
    );
  }

  return (
    <Screen scroll edges={['left', 'right']}>
      <Stack gap='lg'>
        <Row justify='center'>
          <GroupSelector />
        </Row>

        {!plan ? (
          <Surface variant='raised' padding='lg'>
            <Stack gap='md'>
              <Stack gap='xs'>
                <AppText variant='title'>{t('budget.noPlanTitle')}</AppText>
                <AppText color='muted'>{t('budget.noPlanBody')}</AppText>
              </Stack>
              <Stack gap='sm'>
                <Button label={t('budget.createFromScratch')} onPress={() => start('blank')} loading={busy} />
                <Button label={t('budget.fromPrevious')} variant='outline' onPress={() => start('previous')} />
                <Button label={t('budget.fromFixeds')} variant='outline' onPress={() => start('fixeds')} />
                <Button label={t('budget.fromActuals')} variant='outline' onPress={() => start('actuals')} />
                <Button
                  label={t('budget.fromAverage')}
                  variant='outline'
                  onPress={openAverage}
                />
                <Button
                  label={t('budget.useTemplate')}
                  variant='ghost'
                  onPress={startWithTemplate}
                />
              </Stack>
            </Stack>
          </Surface>
        ) : (
          <>
            <Row justify='space-between' align='flex-start'>
              <Stack gap='xxs' style={{ flex: 1 }}>
                <AppText variant='title'>{plan.planName}</AppText>
                <AppText color='muted'>{t('budget.planSubtitle')}</AppText>
                {plan.templateName ? (
                  <Row gap='xs' wrap>
                    <Badge label={plan.templateName} size='sm' />
                  </Row>
                ) : null}
              </Stack>
              <IconButton
                label={t('budget.manageTemplates')}
                variant='ghost'
                icon={<MaterialIcons name='dashboard-customize' size={22} color={colors.primary} />}
                onPress={() => router.push('/(budget)/templates')}
              />
            </Row>

            <Surface variant='raised' padding='lg'>
              <Stack gap='md'>
                <Row justify='space-between' align='flex-start' gap='md'>
                  <SummaryBlock
                    label={t('budget.totals.plannedExpense')}
                    cents={plan.totals.plannedExpenseCents}
                    size='lg'
                    accentColor={colors.primary}
                    style={{ flex: 1 }}
                  />
                  <SummaryBlock
                    label={t('budget.totals.actualExpense')}
                    cents={plan.totals.actualExpenseCents}
                    size='lg'
                    accentColor={colors.expense}
                    style={{ flex: 1 }}
                  />
                </Row>
                <Row justify='space-between' align='flex-start' gap='md'>
                  <SummaryBlock
                    label={t('budget.totals.variance')}
                    cents={plan.totals.plannedExpenseCents - plan.totals.actualExpenseCents}
                    size='md'
                    accentColor={colors.goal}
                    style={{ flex: 1 }}
                  />
                  <SummaryBlock
                    label={t('budget.totals.pendingFixed')}
                    cents={plan.totals.pendingFixedCents}
                    size='md'
                    accentColor={colors.info}
                    style={{ flex: 1 }}
                  />
                </Row>
                <Stack gap='sm'>
                  <Button
                    label={t('budget.lines.add')}
                    fullWidth
                    onPress={openNewLine}
                    leftIcon={<MaterialIcons name='add' size={18} color={colors.onPrimary} />}
                  />
                  <Button
                    label={t('budget.applyTemplate')}
                    fullWidth
                    variant='outline'
                    onPress={() =>
                      templates.length > 0
                        ? setApplyVisible(true)
                        : router.push('/(budget)/templates')
                    }
                  />
                  <Row gap='sm'>
                    <Button
                      label={t('budget.editPlan')}
                      fullWidth
                      variant='ghost'
                      onPress={openPlanEdit}
                      style={{ flex: 1 }}
                    />
                    <Button
                      label={t('budget.fromAverage')}
                      fullWidth
                      variant='ghost'
                      onPress={openAverage}
                      style={{ flex: 1 }}
                    />
                  </Row>
                  <Button
                    label={t('budget.saveAsTemplate')}
                    fullWidth
                    variant='ghost'
                    onPress={() => setSaveAsVisible(true)}
                  />
                </Stack>
              </Stack>
            </Surface>

            {plan.insights.length > 0 ? (
              <Stack gap='sm'>
                <AppText variant='subtitle'>{t('budget.insights.title')}</AppText>
                {plan.insights.slice(0, 4).map((insight, index) => (
                  <InlineMessage
                    key={`${insight.kind}-${index}`}
                    variant={
                      insight.kind === 'over_budget' || insight.kind === 'unplanned_spending'
                        ? 'warning'
                        : 'info'
                    }
                    message={insightText(insight)}
                  />
                ))}
              </Stack>
            ) : null}

            <Stack gap='sm'>
              <AppText variant='subtitle'>{t('budget.chart.title')}</AppText>
              <Row gap='xs' wrap>
                <Button
                  label={t('budget.chart.comparison')}
                  size='sm'
                  variant={chartMode === 'comparison' ? 'primary' : 'outline'}
                  onPress={() => setChartMode('comparison')}
                />
                <Button
                  label={t('budget.chart.health')}
                  size='sm'
                  variant={chartMode === 'health' ? 'primary' : 'outline'}
                  onPress={() => setChartMode('health')}
                />
                <Button
                  label={t('budget.chart.distribution')}
                  size='sm'
                  variant={chartMode === 'distribution' ? 'primary' : 'outline'}
                  onPress={() => setChartMode('distribution')}
                />
                <Button
                  label={t('budget.chart.projection')}
                  size='sm'
                  variant={chartMode === 'projection' ? 'primary' : 'outline'}
                  onPress={() => setChartMode('projection')}
                />
              </Row>
              <MermaidChart
                definition={charts[chartMode] ?? charts.comparison ?? charts.health}
                height={300}
                accessibilityLabel={t('budget.chart.title')}
                fallback={chartFallback}
                palette={chartPalette}
                legend={chartLegend}
              />
            </Stack>

            <Stack gap='sm'>
              <Row justify='space-between' align='center'>
                <AppText variant='subtitle'>{t('budget.lines.title')}</AppText>
                <Button
                  label={t('budget.lines.add')}
                  size='sm'
                  variant='ghost'
                  onPress={openNewLine}
                />
              </Row>
              {plan.lines.length === 0 ? (
                <Surface variant='muted' padding='lg'>
                  <Stack gap='xs'>
                    <AppText>{t('budget.emptyPlanTitle')}</AppText>
                    <AppText color='muted'>{t('budget.emptyPlanBody')}</AppText>
                  </Stack>
                </Surface>
              ) : (
                <Surface variant='outlined' padding='none'>
                  {plan.lines.map((line, index) => {
                    const tone = statusTone(line.status);
                    return (
                      <ListItem
                        key={line.lineId}
                        title={line.categoryName || t('budget.lines.noCategory')}
                        subtitle={`${line.typeName || t('budget.lines.noType')} · ${t(
                          budgetLineStatusKey(line.status)
                        )}`}
                        leading={
                          <View
                            style={{
                              width: 4,
                              height: 32,
                              borderRadius: 2,
                              backgroundColor: statusColor(line.status, colors),
                            }}
                          />
                        }
                        trailing={
                          <Stack gap='xxs' align='flex-end'>
                            <FinanceValue cents={line.actualCents} size='sm' />
                            <AppText variant='caption' color='muted'>
                              {t('budget.totals.planned')}: {formatMoneyWithSymbol(line.plannedCents)}
                            </AppText>
                            {line.projectedCents !== null ? (
                              <AppText variant='caption' color='muted'>
                                {t('budget.lines.projected')}:{' '}
                                {formatMoneyWithSymbol(line.projectedCents)}
                              </AppText>
                            ) : null}
                            <Badge label={`${Math.round(line.usagePercent)}%`} tone={tone} size='sm' />
                          </Stack>
                        }
                        onPress={() => openEditLine(line)}
                        showDivider={index < plan.lines.length - 1}
                      />
                    );
                  })}
                </Surface>
              )}
            </Stack>

            <Stack gap='sm'>
              <AppText variant='subtitle'>{t('budget.unplanned.title')}</AppText>
              <AppText color='muted'>{t('budget.unplanned.subtitle')}</AppText>
              {plan.unplanned.length === 0 ? (
                <InlineMessage variant='success' message={t('budget.unplanned.empty')} />
              ) : (
                <Surface variant='outlined' padding='none'>
                  {plan.unplanned.map((bucket, index) => (
                    <ListItem
                      key={`${bucket.categoryId}-${bucket.recordTypeId}`}
                      title={bucket.categoryName || t('budget.lines.noCategory')}
                      subtitle={`${t('budget.unplanned.records', { count: bucket.recordCount })} · ${
                        bucket.typeName || t('budget.lines.noType')
                      }`}
                      trailing={<FinanceValue cents={bucket.actualCents} size='sm' />}
                      showDivider={index < plan.unplanned.length - 1}
                    />
                  ))}
                </Surface>
              )}
            </Stack>

            <Stack gap='sm'>
              <AppText variant='subtitle'>{t('budget.fixed.title')}</AppText>
              <AppText color='muted'>{t('budget.fixed.subtitle')}</AppText>
              {plan.fixedCommitments.length === 0 ? (
                <InlineMessage variant='info' message={t('budget.fixed.empty')} />
              ) : (
                <Surface variant='outlined' padding='none'>
                  {plan.fixedCommitments.map((fixed, index) => {
                    const line = fixed.lineId
                      ? plan.lines.find((item) => item.lineId === fixed.lineId)
                      : null;
                    const needsSync =
                      line && line.plannedCents !== fixed.amountCents;
                    return (
                      <ListItem
                        key={fixed.fixedId}
                        title={fixed.name}
                        subtitle={`${t('budget.fixed.day', { day: fixed.day })} · ${
                          fixed.active
                            ? fixed.confirmed
                              ? t('budget.fixed.confirmed')
                              : t('budget.fixed.pending')
                            : t('budget.fixed.inactive')
                        } · ${fixed.categoryName || t('budget.lines.noCategory')}`}
                        leading={
                          <MaterialIcons
                            name={fixed.confirmed ? 'event-available' : 'event'}
                            size={20}
                            color={fixed.confirmed ? colors.success : colors.warning}
                          />
                        }
                        trailing={
                          <Stack gap='xs' align='flex-end'>
                            <FinanceValue cents={fixed.amountCents} size='sm' />
                            {fixed.lineId ? (
                              <Row gap='xs'>
                                {fixed.active && needsSync && line ? (
                                  <Button
                                    label={t('budget.fixed.sync')}
                                    size='sm'
                                    variant='ghost'
                                    onPress={() => syncFixed(line)}
                                  />
                                ) : null}
                                <Button
                                  label={t('budget.fixed.remove')}
                                  size='sm'
                                  variant='ghost'
                                  onPress={() => removeFixedFromPlan(fixed.fixedId)}
                                />
                              </Row>
                            ) : fixed.active ? (
                              <Button
                                label={t('budget.fixed.include')}
                                size='sm'
                                variant='ghost'
                                onPress={() => addFixedToPlan(fixed.fixedId)}
                              />
                            ) : null}
                          </Stack>
                        }
                        showDivider={index < plan.fixedCommitments.length - 1}
                      />
                    );
                  })}
                </Surface>
              )}
            </Stack>
          </>
        )}
      </Stack>

      {plan ? (
        <>
          <BudgetLineForm
            visible={lineFormVisible}
            planId={plan.planId}
            groupId={group.id}
            line={selectedLine}
            onClose={() => setLineFormVisible(false)}
            onSaved={refresh}
          />
          <BudgetTemplateApplyDialog
            visible={applyVisible}
            templates={templates}
            onClose={() => setApplyVisible(false)}
            onApply={applyTemplate}
          />
          <Modal
            visible={planEditVisible}
            onClose={() => setPlanEditVisible(false)}
            title={t('budget.editPlan')}
            closeLabel={t('budget.actions.cancel')}
            scrollable
            footer={
              <Row gap='sm' style={{ flex: 1 }}>
                <Button
                  label={t('budget.actions.cancel')}
                  variant='outline'
                  onPress={() => setPlanEditVisible(false)}
                  style={{ flex: 1 }}
                />
                <Button
                  label={t('budget.actions.save')}
                  onPress={savePlan}
                  loading={busy}
                  style={{ flex: 1 }}
                />
              </Row>
            }
          >
            <Stack gap='md'>
              <TextField
                label={t('budget.planName')}
                required
                value={planName}
                onChangeText={setPlanName}
              />
              <TextField
                label={t('budget.threshold')}
                value={planThreshold}
                onChangeText={setPlanThreshold}
                keyboardType='number-pad'
                hint='1 - 100'
              />
              <Button
                label={t('budget.deletePlan')}
                variant='danger'
                onPress={() => setConfirmDeletePlan(true)}
              />
            </Stack>
          </Modal>
          <Modal
            visible={saveAsVisible}
            onClose={() => setSaveAsVisible(false)}
            title={t('budget.templates.saveAsTitle')}
            closeLabel={t('budget.actions.cancel')}
            scrollable
            footer={
              <Row gap='sm' style={{ flex: 1 }}>
                <Button
                  label={t('budget.actions.cancel')}
                  variant='outline'
                  onPress={() => setSaveAsVisible(false)}
                  style={{ flex: 1 }}
                />
                <Button
                  label={t('budget.actions.save')}
                  onPress={saveAsTemplate}
                  loading={busy}
                  style={{ flex: 1 }}
                />
              </Row>
            }
          >
            <Stack gap='md'>
              <AppText color='muted'>{t('budget.templates.saveAsBody')}</AppText>
              <TextField
                label={t('budget.templates.saveAsName')}
                required
                value={templateName}
                onChangeText={setTemplateName}
                placeholder={t('budget.templates.namePlaceholder')}
              />
              <TextField
                label={t('budget.templates.saveAsDescription')}
                value={templateDescription}
                onChangeText={setTemplateDescription}
                multiline
                numberOfLines={2}
              />
            </Stack>
          </Modal>
        </>
      ) : null}

      <ConfirmDialog
        visible={confirmDeletePlan}
        title={t('budget.deletePlan')}
        message={t('budget.confirm.deletePlan')}
        confirmLabel={t('budget.deletePlan')}
        cancelLabel={t('budget.actions.cancel')}
        tone='danger'
        loading={deletingPlan}
        onConfirm={removePlan}
        onCancel={() => setConfirmDeletePlan(false)}
      />
      <BudgetGroupAverageDialog
        visible={averageVisible}
        groups={groups}
        currentGroupId={group?.id}
        onClose={() => setAverageVisible(false)}
        onApply={createAverage}
      />
    </Screen>
  );
};

export default Index;
