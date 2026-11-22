import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View } from 'react-native';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useFixeds } from '@/src/db';
import { mapDatabaseError } from '@/src/db/errors';
import {
  getAvailableDashboardBlocks,
  isDashboardTargetEnabled,
  resolveDashboardBlockTarget,
} from '@/src/dashboard/navigation';
import { useDashboardLayout } from '@/src/dashboard/store';
import type {
  DashboardActionId,
  DashboardBlockId,
} from '@/src/dashboard/types';
import { useFeatures } from '@/src/features';
import { useConfigs } from '@/src/hooks/useConfigs';
import { useGroupRefresh } from '@/src/hooks/useGroupRefresh';
import { useLanguage } from '@/src/lang/LanguageContext';
import { useDataStore } from '@/src/stores';
import useColorStore from '@/src/stores/ColorsStore';
import useRecordsStore from '@/src/stores/RecordsStore';
import { Button } from '@/src/ui/actions/Button';
import { IconButton } from '@/src/ui/actions/IconButton';
import { LinkButton } from '@/src/ui/actions/LinkButton';
import { EmptyState } from '@/src/ui/feedback/EmptyState';
import { ConfirmDialog } from '@/src/ui/overlays/Dialog';
import { useToast } from '@/src/ui/feedback/ToastProvider';
import { AppText } from '@/src/ui/primitives/AppText';
import { Row, Stack } from '@/src/ui/primitives/Stack';
import { Screen } from '@/src/ui/primitives/Screen';
import { useTheme } from '@/src/ui/theme/ThemeProvider';
import { spacing } from '@/src/ui/theme/tokens';
import GroupSelector from '@/src/components/groups/group-selector';
import { DashboardBlock } from './DashboardBlock';
import { DashboardEditor } from './DashboardEditor';
import {
  DashboardRefreshProvider,
  type DashboardRefreshValue,
} from './DashboardRefreshContext';
import { QuickActionsFab } from './QuickActionsFab';
import { useDashboardNavigation } from './useDashboardNavigation';
import { DashboardSummaryBlock } from './blocks/DashboardSummaryBlock';
import { DashboardObligationsBlock } from './blocks/DashboardObligationsBlock';
import { DashboardBudgetBlock } from './blocks/DashboardBudgetBlock';
import { DashboardSavingsBlock } from './blocks/DashboardSavingsBlock';
import { DashboardPeopleBlock } from './blocks/DashboardPeopleBlock';
import { DashboardRecentRecordsBlock } from './blocks/DashboardRecentRecordsBlock';
import { DashboardCreditsBlock } from './blocks/DashboardCreditsBlock';
import { DashboardVehicleBlock } from './blocks/DashboardVehicleBlock';
import { DashboardClosingBlock } from './blocks/DashboardClosingBlock';

const greeting = (hour: number) => {
  if (hour >= 5 && hour < 12) {
    return {
      key: 'greeting.morning' as const,
      icon: 'weather-partly-cloudy' as const,
      color: 'info' as const,
    };
  }
  if (hour >= 12 && hour < 18) {
    return {
      key: 'greeting.afternoon' as const,
      icon: 'weather-sunny' as const,
      color: 'warning' as const,
    };
  }
  return {
    key: 'greeting.night' as const,
    icon: 'weather-night' as const,
    color: 'transfer' as const,
  };
};

export const DashboardScreen = () => {
  const { t } = useLanguage();
  const { colors } = useTheme();
  const { showToast } = useToast();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { initializeColors } = useColorStore();
  const { loadConfigs } = useConfigs();
  const { setFixeds } = useDataStore();
  const { fetchFixeds } = useFixeds();
  const { group } = useRecordsStore();
  const { refreshGroupData } = useGroupRefresh();
  const enabled = useFeatures((state) => state.enabled);
  const layout = useDashboardLayout();
  const quickActions = layout.quickActions;
  const loadLayout = layout.load;
  const resetLayout = layout.reset;
  const moveBlock = layout.moveBlock;
  const setVisibility = layout.setVisibility;
  const setQuickActions = layout.setQuickActions;
  const { openBlock } = useDashboardNavigation();
  const [refreshKey, setRefreshKey] = useState(0);
  const [editing, setEditing] = useState(false);
  const [resetVisible, setResetVisible] = useState(false);
  const [resetting, setResetting] = useState(false);
  const groupId = group?.id;

  useEffect(() => {
    initializeColors();
    loadConfigs();
    void loadLayout();
  }, []);

  useEffect(() => {
    let active = true;
    fetchFixeds()
      .then((rows) => {
        if (active) setFixeds(rows);
      })
      .catch((cause) => {
        if (!active) return;
        if (__DEV__) console.warn('[dashboard] fixeds load failed', cause);
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

  const refresh = useCallback(() => {
    setRefreshKey((value) => value + 1);
    if (!groupId) return;
    refreshGroupData(groupId).catch((cause) => {
      if (__DEV__) console.warn('[dashboard] group refresh failed', cause);
    });
  }, [groupId, refreshGroupData]);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  const refreshValue = useMemo<DashboardRefreshValue>(
    () => ({ refreshKey, refresh }),
    [refreshKey, refresh]
  );

  const visibleBlocks = getAvailableDashboardBlocks(layout, enabled);

  const reportSaveError = useCallback(
    (cause: unknown) => {
      if (__DEV__) console.warn('[dashboard] layout save failed', cause);
      showToast({ message: t('dashboard.saveError'), type: 'error' });
    },
    [showToast, t]
  );

  const persist = useCallback(
    async (task: Promise<void>) => {
      try {
        await task;
      } catch (cause) {
        reportSaveError(cause);
      }
    },
    [reportSaveError]
  );

  const handleMove = (from: number, to: number) => {
    void persist(moveBlock(from, to));
  };

  const handleVisibility = (id: DashboardBlockId, visible: boolean) => {
    void persist(setVisibility(id, visible));
  };

  const handleQuickActions = (actions: DashboardActionId[]) => {
    void persist(setQuickActions(actions));
  };

  const performReset = async () => {
    setResetting(true);
    try {
      await resetLayout();
      setResetVisible(false);
      refresh();
    } catch (cause) {
      reportSaveError(cause);
    } finally {
      setResetting(false);
    }
  };

  const greetingValue = greeting(new Date().getHours());
  const greetingColor = {
    info: colors.info,
    warning: colors.warning,
    transfer: colors.transfer,
  }[greetingValue.color];

  return (
    <View style={{ flex: 1 }}>
      <Screen
        scroll
        edges={['left', 'right']}
        contentContainerStyle={{ paddingBottom: spacing.xxxl * 2 }}
      >
        <DashboardRefreshProvider value={refreshValue}>
          <Stack gap='xl'>
            <Stack gap='md'>
              {editing ? (
                <Row justify='space-between' align='center' gap='md'>
                  <AppText variant='title' style={{ flex: 1 }}>
                    {t('dashboard.title')}
                  </AppText>
                  <LinkButton
                    label={t('dashboard.reset')}
                    tone='danger'
                    onPress={() => setResetVisible(true)}
                  />
                  <Button
                    label={t('dashboard.done')}
                    size='sm'
                    onPress={() => setEditing(false)}
                  />
                </Row>
              ) : (
                <Row justify='space-between' align='center'>
                  <Row gap='sm' align='center' style={{ flex: 1 }}>
                    <AppText variant='title'>{t(greetingValue.key)}</AppText>
                    <MaterialCommunityIcons
                      name={greetingValue.icon}
                      size={28}
                      color={greetingColor}
                    />
                  </Row>
                  <IconButton
                    label={t('dashboard.customize')}
                    icon={
                      <MaterialIcons
                        name='tune'
                        size={22}
                        color={colors.textMuted}
                      />
                    }
                    onPress={() => setEditing(true)}
                  />
                </Row>
              )}
              {!editing ? (
                <Row justify='center'>
                  <GroupSelector />
                </Row>
              ) : null}
            </Stack>

            {editing ? (
              <DashboardEditor
                blocks={layout.blocks}
                quickActions={quickActions}
                enabled={enabled}
                onMove={handleMove}
                onToggleVisibility={handleVisibility}
                onQuickActions={handleQuickActions}
                onOpenSettings={() => router.push('/(settings)' as never)}
              />
            ) : visibleBlocks.length === 0 ? (
              <EmptyState
                title={t('dashboard.empty')}
                action={
                  <Button
                    label={t('dashboard.emptyAction')}
                    variant='outline'
                    onPress={() => void performReset()}
                  />
                }
              />
            ) : (
              visibleBlocks.map((definition) => {
                const target = resolveDashboardBlockTarget(definition.id);
                const canOpenTarget =
                  target != null &&
                  isDashboardTargetEnabled(target, enabled);
                const onAction = canOpenTarget
                  ? () => openBlock(definition.id)
                  : undefined;
                const padded =
                  definition.id !== 'obligations' &&
                  definition.id !== 'recentRecords';

                return (
                  <DashboardBlock
                    key={definition.id}
                    definition={definition}
                    actionLabel={
                      canOpenTarget ? t('dashboard.seeAll') : undefined
                    }
                    onAction={onAction}
                    padded={padded}
                  >
                    {definition.id === 'summary' ? (
                      <DashboardSummaryBlock />
                    ) : definition.id === 'obligations' ? (
                      <DashboardObligationsBlock />
                    ) : definition.id === 'budget' ? (
                      <DashboardBudgetBlock />
                    ) : definition.id === 'savings' ? (
                      <DashboardSavingsBlock />
                    ) : definition.id === 'people' ? (
                      <DashboardPeopleBlock />
                    ) : definition.id === 'recentRecords' ? (
                      <DashboardRecentRecordsBlock />
                    ) : definition.id === 'credits' ? (
                      <DashboardCreditsBlock />
                    ) : definition.id === 'vehicle' ? (
                      <DashboardVehicleBlock />
                    ) : (
                      <DashboardClosingBlock />
                    )}
                  </DashboardBlock>
                );
              })
            )}
          </Stack>
        </DashboardRefreshProvider>
      </Screen>

      {group && !editing ? (
        <QuickActionsFab
          actions={quickActions}
          onRefresh={refresh}
          bottomOffset={insets.bottom + spacing.xl}
        />
      ) : null}

      <ConfirmDialog
        visible={resetVisible}
        title={t('dashboard.reset')}
        message={t('dashboard.resetConfirm')}
        confirmLabel={t('dashboard.reset')}
        cancelLabel={t('cancel')}
        onConfirm={() => void performReset()}
        onCancel={() => setResetVisible(false)}
        loading={resetting}
      />
    </View>
  );
};
