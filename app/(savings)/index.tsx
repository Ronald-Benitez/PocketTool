import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { LineChart } from 'react-native-gifted-charts';

import AddSaving from '@/src/components/savings/add-savings';
import { SavingMovementDetails } from '@/src/components/savings/SavingMovementDetails';
import { SavingMovementForm } from '@/src/components/savings/SavingMovementForm';
import { SavingsGoalTrophy } from '@/src/components/savings/SavingsGoalTrophy';
import { usePeopleRepository, useSavings } from '@/src/db';
import { mapDatabaseError } from '@/src/db/errors';
import type { SavingMovementView, SavingView } from '@/src/db/repositories/savings';
import { useLanguage } from '@/src/lang/LanguageContext';
import useRecordsStore from '@/src/stores/RecordsStore';
import useSavingsStore from '@/src/stores/SavingsStore';
import { formatMoney, formatMoneyWithSymbol } from '@/src/utils';
import { Button } from '@/src/ui/actions/Button';
import { IconButton } from '@/src/ui/actions/IconButton';
import { Badge } from '@/src/ui/data-display/Badge';
import { SummaryBlock } from '@/src/ui/data-display/SummaryBlock';
import { EmptyState } from '@/src/ui/feedback/EmptyState';
import { useToast } from '@/src/ui/feedback/ToastProvider';
import { SelectField } from '@/src/ui/forms/SelectField';
import { ConfirmDialog } from '@/src/ui/overlays/Dialog';
import { AppText } from '@/src/ui/primitives/AppText';
import { Screen } from '@/src/ui/primitives/Screen';
import { Row, Stack } from '@/src/ui/primitives/Stack';
import { Surface } from '@/src/ui/primitives/Surface';
import { useTheme } from '@/src/ui/theme/ThemeProvider';

const SAVINGS_SCOPE_KEY = 'savingsStatusScope';
const SAVINGS_PINNED_KEY = 'savings';
const SAVINGS_MOVEMENT_ORDER_KEY = 'savingsMovementOrder';

const kindIcon = (kind: string) => {
  if (kind === 'withdrawal') return 'arrow-downward';
  if (kind === 'interest') return 'percent';
  if (kind === 'adjustment') return 'tune';
  return 'arrow-upward';
};

const contributionTone = (status: string) => {
  if (status === 'exceeded' || status === 'met') return 'success' as const;
  if (status === 'not_met') return 'warning' as const;
  return 'neutral' as const;
};

const Index = () => {
  const { t } = useLanguage();
  const { colors } = useTheme();
  const { showToast } = useToast();
  const repository = useSavings();
  const peopleRepository = usePeopleRepository();
  const { group } = useRecordsStore();
  const { saving, savings, setSaving, setSavings } = useSavingsStore();

  const [view, setView] = useState<SavingView | null>(null);
  const [peopleById, setPeopleById] = useState<Map<number, string>>(new Map());
  const [statusFilter, setStatusFilter] = useState<'active' | 'archived' | 'all'>('active');
  const [scope, setScope] = useState<'own' | 'global'>('own');
  const [pinnedId, setPinnedId] = useState<number | null>(null);
  const [movementOrder, setMovementOrder] = useState<'asc' | 'desc'>('desc');
  const [preferencesLoaded, setPreferencesLoaded] = useState(false);
  const [trophyColor, setTrophyColor] = useState('#C9A227');
  const [refreshKey, setRefreshKey] = useState(0);
  const [movementVisible, setMovementVisible] = useState(false);
  const [detailMovement, setDetailMovement] = useState<SavingMovementView | null>(null);
  const [deleteVisible, setDeleteVisible] = useState(false);
  const [deleteMovementId, setDeleteMovementId] = useState<number | null>(null);

  const refresh = () => setRefreshKey((value) => value + 1);

  useEffect(() => {
    let active = true;
    Promise.all([
      AsyncStorage.getItem(SAVINGS_SCOPE_KEY).catch(() => null),
      AsyncStorage.getItem(SAVINGS_PINNED_KEY).catch(() => null),
      AsyncStorage.getItem(SAVINGS_MOVEMENT_ORDER_KEY).catch(() => null),
      repository.fetchSettings().catch(() => null),
      peopleRepository.fetchPeople().catch(() => []),
    ]).then(([scopeStored, pinnedStored, orderStored, settings, people]) => {
      if (!active) return;
      if (scopeStored === 'global' || scopeStored === 'own') {
        setScope(scopeStored);
      }
      const parsedPinned = Number(pinnedStored);
      if (pinnedStored && Number.isFinite(parsedPinned)) {
        setPinnedId(parsedPinned);
      }
      if (orderStored === 'asc' || orderStored === 'desc') {
        setMovementOrder(orderStored);
      }
      if (settings?.trophy_color) setTrophyColor(settings.trophy_color);
      setPeopleById(
        new Map(
          people.flatMap((person) =>
            person.id == null ? [] : [[person.id, person.name] as const]
          )
        )
      );
      setPreferencesLoaded(true);
    });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    AsyncStorage.setItem(SAVINGS_SCOPE_KEY, scope).catch(() => {
      // Preferences are optional.
    });
  }, [scope]);

  useEffect(() => {
    AsyncStorage.setItem(SAVINGS_MOVEMENT_ORDER_KEY, movementOrder).catch(() => {
      // Preferences are optional.
    });
  }, [movementOrder]);

  useEffect(() => {
    if (!preferencesLoaded) return;
    let active = true;
    repository
      .fetchSavings({ status: statusFilter })
      .then((rows) => {
        if (!active) return;
        setSavings(rows);
        const current = useSavingsStore.getState().saving;
        const pinned =
          pinnedId != null ? rows.find((row) => row.id === pinnedId) : null;
        const next =
          current?.id && rows.some((row) => row.id === current.id)
            ? rows.find((row) => row.id === current.id) ?? null
            : pinned ?? rows[0] ?? null;
        setSaving(next);
      })
      .catch((cause) => {
        if (!active) return;
        if (__DEV__) console.warn('[savings] list failed', cause);
        const mapped = mapDatabaseError(cause, t('toast.error'));
        showToast({
          message: t(`dbErrors.${mapped.code}` as never),
          type: 'error',
        });
      });
    return () => {
      active = false;
    };
  }, [refreshKey, statusFilter, pinnedId, preferencesLoaded]);

  useEffect(() => {
    if (!saving?.id) {
      setView(null);
      return;
    }
    let active = true;
    repository
      .fetchSavingView(saving.id, { groupId: group?.id, scope })
      .then((next) => {
        if (active) setView(next);
      })
      .catch((cause) => {
        if (!active) return;
        if (__DEV__) console.warn('[savings] view failed', cause);
        const mapped = mapDatabaseError(cause, t('toast.error'));
        showToast({
          message: t(`dbErrors.${mapped.code}` as never),
          type: 'error',
        });
      });
    return () => {
      active = false;
    };
  }, [saving?.id, group?.id, scope, refreshKey]);

  const chart = useMemo(() => {
    if (!view) return { data: [], data2: [], data3: [] };
    const toItem = (cents: number) => ({ value: Number(formatMoney(cents)) });
    return {
      data: view.chart.map((point) => toItem(point.totalCents)),
      data2: view.chart.map((point) => toItem(point.ownCents)),
      data3: view.chart.map((point) => toItem(point.sharedCents)),
    };
  }, [view]);

  const orderedMovements = useMemo(() => {
    const rows = view?.movements ?? [];
    return movementOrder === 'asc' ? rows : [...rows].reverse();
  }, [view?.movements, movementOrder]);

  const detailPersonName =
    detailMovement?.person_id != null
      ? peopleById.get(detailMovement.person_id) ?? ''
      : t('savings.movement.own');

  useEffect(() => {
    setDetailMovement(null);
  }, [saving?.id]);

  const togglePin = async () => {
    if (!saving?.id) return;
    if (pinnedId === saving.id) {
      await AsyncStorage.removeItem(SAVINGS_PINNED_KEY);
      setPinnedId(null);
    } else {
      await AsyncStorage.setItem(SAVINGS_PINNED_KEY, String(saving.id));
      setPinnedId(saving.id);
    }
  };

  const archive = async () => {
    if (!saving?.id) return;
    try {
      await repository.archiveSaving(saving.id, saving.status !== 'archived');
      showToast({ message: t('savings.toast.updated'), type: 'success' });
      refresh();
    } catch (cause) {
      const mapped = mapDatabaseError(cause, t('toast.error'));
      showToast({ message: t(`dbErrors.${mapped.code}` as never), type: 'error' });
    }
  };

  const removeSaving = async () => {
    if (!saving?.id) return;
    try {
      await repository.deleteSaving(saving.id);
      setSaving(null);
      setDeleteVisible(false);
      showToast({ message: t('toast.deleted'), type: 'success' });
      refresh();
    } catch (cause) {
      const mapped = mapDatabaseError(cause, t('toast.error'));
      showToast({ message: t(`dbErrors.${mapped.code}` as never), type: 'error' });
    }
  };

  const removeMovement = async () => {
    if (!deleteMovementId) return;
    try {
      await repository.deleteMovement(deleteMovementId);
      setDeleteMovementId(null);
      showToast({ message: t('toast.deleted'), type: 'success' });
      refresh();
    } catch (cause) {
      const mapped = mapDatabaseError(cause, t('toast.error'));
      showToast({ message: t(`dbErrors.${mapped.code}` as never), type: 'error' });
    }
  };

  const statusLabel = (status: string) => {
    if (status === 'exceeded') return t('savings.contribution.exceeded');
    if (status === 'met') return t('savings.contribution.met');
    if (status === 'not_met') return t('savings.contribution.notMet');
    if (status === 'no_base') return t('savings.contribution.noBase');
    return t('savings.contribution.noRule');
  };

  return (
    <>
      <Screen scroll edges={['left', 'right']}>
        <Stack gap='lg'>
          <Row justify='space-between' align='flex-start' gap='md'>
            <Stack gap='xxs' style={{ flex: 1 }}>
              <AppText variant='title'>{t('savings.title')}</AppText>
              <AppText color='muted'>{t('savings.subtitle')}</AppText>
            </Stack>
            {saving ? (
              <AddSaving isEditing onSaved={refresh}>
                <View style={styles.iconButton}>
                  <MaterialIcons name='edit' size={20} color={colors.text} />
                </View>
              </AddSaving>
            ) : null}
            <AddSaving isEditing={false} onSaved={refresh}>
              <View style={styles.iconButton}>
                <MaterialIcons name='add' size={22} color={colors.primary} />
              </View>
            </AddSaving>
          </Row>

          <SelectField<'active' | 'archived' | 'all'>
            label={t('savings.filter')}
            value={statusFilter}
            options={[
              { label: t('savings.active'), value: 'active' },
              { label: t('savings.archived'), value: 'archived' },
              { label: t('savings.all'), value: 'all' },
            ]}
            onChange={setStatusFilter}
          />

          {savings.length === 0 ? (
            <EmptyState
              title={t('savings.empty')}
              icon={<MaterialCommunityIcons name='piggy-bank-outline' size={28} color={colors.textMuted} />}
            />
          ) : (
            <SelectField<number>
              label={t('savings.select')}
              value={saving?.id}
              options={savings.flatMap((item) =>
                item.id === undefined
                  ? []
                  : [{ label: item.saving_name, value: item.id }]
              )}
              onChange={(id) => {
                const next = savings.find((item) => item.id === id);
                if (next) setSaving(next);
              }}
            />
          )}

          <Row gap='xs' wrap>
            {savings.map((item) => {
              const reached =
                (item.target_amount_cents ?? 0) > 0 &&
                item.amount >= (item.target_amount_cents ?? 0);
              return (
                <Pressable
                  key={item.id}
                  onPress={() => setSaving(item)}
                  accessibilityRole='button'
                >
                  <Surface
                    variant={saving?.id === item.id ? 'raised' : 'outlined'}
                    padding='sm'
                  >
                    <Row gap='xs' align='center' style={styles.savingChipRow}>
                      {reached ? (
                        <SavingsGoalTrophy color={trophyColor} size={20} />
                      ) : null}
                      {pinnedId === item.id ? (
                        <Ionicons name='pin' size={12} color={colors.primary} />
                      ) : null}
                      <AppText variant='caption' numberOfLines={1}>
                        {item.saving_name}
                      </AppText>
                    </Row>
                  </Surface>
                </Pressable>
              );
            })}
          </Row>

          {view ? (
            <>
              <Surface variant='raised' padding='lg'>
                <Stack gap='sm'>
                  <Row justify='space-between' align='center' gap='sm'>
                    <Stack gap='xxs' style={{ flex: 1 }}>
                      <Row gap='sm' align='center' wrap>
                        <AppText variant='subtitle'>{view.saving_name}</AppText>
                        {view.goal.reached ? (
                          <SavingsGoalTrophy
                            color={trophyColor}
                            size={36}
                            accessibilityLabel={t('savings.goal.reached')}
                          />
                        ) : null}
                        {view.status === 'archived' ? (
                          <Badge label={t('savings.archived')} tone='neutral' size='sm' />
                        ) : null}
                      </Row>
                      <AppText color='muted'>{formatMoneyWithSymbol(view.amount)}</AppText>
                    </Stack>
                    <Row gap='xs'>
                      <IconButton
                        label={pinnedId === view.id ? t('savings.unpin') : t('savings.pin')}
                        variant='surface'
                        selected={pinnedId === view.id}
                        icon={
                          <Ionicons
                            name={pinnedId === view.id ? 'pin' : 'pin-outline'}
                            size={20}
                            color={colors.text}
                          />
                        }
                        onPress={togglePin}
                      />
                      <IconButton
                        label={view.status === 'archived' ? t('savings.restore') : t('savings.archive')}
                        variant='surface'
                        icon={
                          <MaterialCommunityIcons
                            name={view.status === 'archived' ? 'archive-arrow-up-outline' : 'archive-outline'}
                            size={20}
                            color={colors.text}
                          />
                        }
                        onPress={archive}
                      />
                      <IconButton
                        label={t('savings.delete')}
                        variant='surface'
                        icon={<MaterialIcons name='delete-outline' size={20} color={colors.danger} />}
                        onPress={() => setDeleteVisible(true)}
                      />
                    </Row>
                  </Row>

                  <Row gap='md'>
                    <SummaryBlock
                      label={t('savings.summary.total')}
                      cents={view.snapshot.totalCents}
                      size='md'
                      accentColor={colors.chartPlanned}
                      style={{ flex: 1 }}
                    />
                    <SummaryBlock
                      label={t('savings.summary.own')}
                      cents={view.snapshot.ownCents}
                      size='md'
                      accentColor={colors.primary}
                      style={{ flex: 1 }}
                    />
                    <SummaryBlock
                      label={t('savings.summary.shared')}
                      cents={view.snapshot.sharedCents}
                      size='md'
                      accentColor={colors.textMuted}
                      style={{ flex: 1 }}
                    />
                  </Row>
                </Stack>
              </Surface>

              <Surface variant='outlined' padding='md'>
                <Stack gap='md'>
                  <Row justify='space-between' align='center' gap='sm'>
                    <AppText weight='600'>{t('savings.contribution.title')}</AppText>
                    <Row gap='xs'>
                      <Button
                        label={t('savings.scope.own')}
                        size='sm'
                        variant={scope === 'own' ? 'primary' : 'outline'}
                        onPress={() => setScope('own')}
                      />
                      <Button
                        label={t('savings.scope.global')}
                        size='sm'
                        variant={scope === 'global' ? 'primary' : 'outline'}
                        onPress={() => setScope('global')}
                      />
                    </Row>
                  </Row>
                  {view.contribution.hasRule ? (
                    <>
                      <Row justify='space-between' gap='sm'>
                        <AppText color='muted'>{t('savings.contribution.suggested')}</AppText>
                        <AppText>{formatMoneyWithSymbol(view.contribution.suggestedCents)}</AppText>
                      </Row>
                      <Row justify='space-between' gap='sm'>
                        <AppText color='muted'>{t('savings.contribution.actual')}</AppText>
                        <AppText>{formatMoneyWithSymbol(view.contribution.actualCents)}</AppText>
                      </Row>
                      <Badge
                        label={statusLabel(view.contribution.status)}
                        tone={contributionTone(view.contribution.status)}
                        size='sm'
                      />
                    </>
                  ) : (
                    <AppText color='muted'>{t('savings.contribution.noRuleHint')}</AppText>
                  )}
                </Stack>
              </Surface>

              {view.goal.hasGoal ? (
                <Surface variant='outlined' padding='md'>
                  <Stack gap='sm'>
                    <Row justify='space-between' align='center' gap='sm'>
                      <AppText weight='600'>{t('savings.goal.title')}</AppText>
                      <AppText>{`${view.goal.progressPercent.toFixed(0)}%`}</AppText>
                    </Row>
                    <View style={[styles.progressTrack, { backgroundColor: colors.surfaceMuted }]}>
                      <View
                        style={[
                          styles.progressFill,
                          {
                            width: `${Math.min(100, view.goal.progressPercent)}%`,
                            backgroundColor: view.goal.reached ? trophyColor : colors.primary,
                          },
                        ]}
                      />
                    </View>
                    <Row justify='space-between' gap='sm'>
                      <AppText color='muted'>{t('savings.goal.target')}</AppText>
                      <AppText>{formatMoneyWithSymbol(view.goal.targetCents)}</AppText>
                    </Row>
                    <Row justify='space-between' gap='sm'>
                      <AppText color='muted'>{t('savings.goal.remaining')}</AppText>
                      <AppText>{formatMoneyWithSymbol(view.goal.remainingCents)}</AppText>
                    </Row>
                    {view.goal.reached ? (
                      <AppText color='success' weight='600'>{t('savings.goal.reached')}</AppText>
                    ) : (
                      <>
                        {view.goal.actualDate ? (
                          <Row justify='space-between' gap='sm'>
                            <AppText color='muted'>{t('savings.goal.actualProjection')}</AppText>
                            <AppText>{new Date(view.goal.actualDate).toLocaleDateString()}</AppText>
                          </Row>
                        ) : null}
                        {view.goal.expectedDate ? (
                          <Row justify='space-between' gap='sm'>
                            <AppText color='muted'>{t('savings.goal.expectedProjection')}</AppText>
                            <AppText>{new Date(view.goal.expectedDate).toLocaleDateString()}</AppText>
                          </Row>
                        ) : null}
                      </>
                    )}
                  </Stack>
                </Surface>
              ) : null}

              <Surface variant='outlined' padding='md'>
                <Stack gap='sm'>
                  <Row justify='space-between' align='center'>
                    <AppText weight='600'>{t('savings.chart.title')}</AppText>
                    <Row gap='sm' wrap>
                      {[
                        { label: t('savings.chart.total'), color: colors.chartPlanned },
                        { label: t('savings.chart.own'), color: colors.primary },
                        { label: t('savings.chart.shared'), color: colors.textMuted },
                      ].map((series) => (
                        <Row key={series.label} gap='xxs' align='center'>
                          <View
                            style={[styles.legendDot, { backgroundColor: series.color }]}
                          />
                          <AppText variant='caption' color='muted'>
                            {series.label}
                          </AppText>
                        </Row>
                      ))}
                    </Row>
                  </Row>
                  {view.chart.length > 0 ? (
                    <LineChart
                      data={chart.data}
                      data2={chart.data2}
                      data3={chart.data3}
                      color={colors.chartPlanned}
                      color2={colors.primary}
                      color3={colors.textMuted}
                      thickness={2}
                      thickness2={2}
                      thickness3={2}
                      dataPointsColor={colors.chartPlanned}
                      dataPointsColor2={colors.primary}
                      dataPointsColor3={colors.textMuted}
                      yAxisTextStyle={{ color: colors.textMuted }}
                      yAxisLabelPrefix='$'
                      yAxisColor={colors.border}
                      xAxisColor={colors.border}
                      width={300}
                      height={240}
                      adjustToWidth
                      hideDataPoints
                    />
                  ) : (
                    <AppText color='muted'>{t('savings.chart.empty')}</AppText>
                  )}
                </Stack>
              </Surface>

              <Button
                label={t('savings.movement.add')}
                size='sm'
                onPress={() => setMovementVisible(true)}
              />

              <Stack gap='sm'>
                <Row justify='space-between' align='center' gap='sm'>
                  <AppText variant='subtitle'>{t('savings.history.title')}</AppText>
                  <Row gap='xs'>
                    <Button
                      label={t('savings.history.newest')}
                      size='sm'
                      variant={movementOrder === 'desc' ? 'primary' : 'outline'}
                      onPress={() => setMovementOrder('desc')}
                    />
                    <Button
                      label={t('savings.history.oldest')}
                      size='sm'
                      variant={movementOrder === 'asc' ? 'primary' : 'outline'}
                      onPress={() => setMovementOrder('asc')}
                    />
                  </Row>
                </Row>
                {orderedMovements.length === 0 ? (
                  <AppText color='muted'>{t('savings.history.empty')}</AppText>
                ) : (
                  orderedMovements.map((movement) => {
                    const personName =
                      movement.person_id != null
                        ? peopleById.get(movement.person_id) ?? ''
                        : t('savings.movement.own');
                    return (
                      <Surface key={movement.id} variant='muted' padding='sm'>
                        <Row justify='space-between' align='center' gap='sm'>
                          <Pressable
                            onPress={() => setDetailMovement(movement)}
                            accessibilityRole='button'
                            accessibilityLabel={t('savings.movement.viewDetails')}
                            style={styles.movementPressable}
                          >
                            <Row justify='space-between' align='center' gap='sm'>
                              <Row gap='sm' align='center' style={{ flex: 1 }}>
                                <MaterialIcons
                                  name={kindIcon(movement.kind)}
                                  size={18}
                                  color={
                                    movement.kind === 'withdrawal'
                                      ? colors.expense
                                      : colors.income
                                  }
                                />
                                <Stack gap='xxs' style={{ flex: 1 }}>
                                  <AppText numberOfLines={1}>
                                    {t(`savings.movement.kinds.${movement.kind}` as never)}
                                  </AppText>
                                  <AppText variant='caption' color='muted'>
                                    {new Date(movement.change_date).toLocaleDateString()} · {personName}
                                    {movement.note ? ` · ${movement.note}` : ''}
                                  </AppText>
                                </Stack>
                              </Row>
                              <Row gap='xs' align='center'>
                                <AppText>
                                  {formatMoneyWithSymbol(movement.amount_cents)}
                                </AppText>
                                <MaterialIcons
                                  name='chevron-right'
                                  size={18}
                                  color={colors.textMuted}
                                />
                              </Row>
                            </Row>
                          </Pressable>
                          <IconButton
                            label={t('savings.history.delete')}
                            size='sm'
                            variant='ghost'
                            icon={<MaterialIcons name='delete-outline' size={18} color={colors.danger} />}
                            onPress={() => setDeleteMovementId(movement.id ?? null)}
                          />
                        </Row>
                      </Surface>
                    );
                  })
                )}
              </Stack>
            </>
          ) : null}
        </Stack>
      </Screen>

      {view ? (
        <SavingMovementForm
          visible={movementVisible}
          saving={view}
          onClose={() => setMovementVisible(false)}
          onSaved={refresh}
        />
      ) : null}
      <SavingMovementDetails
        visible={detailMovement != null}
        movement={detailMovement}
        personName={detailPersonName}
        onClose={() => setDetailMovement(null)}
      />
      <ConfirmDialog
        visible={deleteVisible}
        title={t('savings.delete')}
        message={t('savings.deleteConfirm')}
        confirmLabel={t('delete')}
        cancelLabel={t('cancel')}
        tone='danger'
        onConfirm={removeSaving}
        onCancel={() => setDeleteVisible(false)}
      />
      <ConfirmDialog
        visible={deleteMovementId != null}
        title={t('savings.history.delete')}
        message={t('savings.history.deleteConfirm')}
        confirmLabel={t('delete')}
        cancelLabel={t('cancel')}
        tone='danger'
        onConfirm={removeMovement}
        onCancel={() => setDeleteMovementId(null)}
      />
    </>
  );
};

const styles = StyleSheet.create({
  iconButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  movementPressable: {
    flex: 1,
  },
  savingChipRow: {
    height: 22,
  },
  progressTrack: {
    height: 10,
    borderRadius: 10,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 10,
  },
});

export default Index;
