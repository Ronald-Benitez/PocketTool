import React, { useEffect, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { useSavings } from '@/src/db';
import { mapDatabaseError } from '@/src/db/errors';
import type { Saving } from '@/src/interfaces/schema';
import { useLanguage } from '@/src/lang/LanguageContext';
import { useDashboardRefresh } from '@/src/components/dashboard/DashboardRefreshContext';
import { LinkButton } from '@/src/ui/actions/LinkButton';
import { ProgressBar } from '@/src/ui/data-display/ProgressBar';
import { StatTile } from '@/src/ui/data-display/StatTile';
import { LoadingState } from '@/src/ui/feedback/LoadingState';
import { useToast } from '@/src/ui/feedback/ToastProvider';
import { SwitchField } from '@/src/ui/forms/SwitchField';
import { Modal } from '@/src/ui/overlays/Modal';
import { AppText } from '@/src/ui/primitives/AppText';
import { Row, Stack } from '@/src/ui/primitives/Stack';
import { formatMoneyWithSymbol } from '@/src/utils';

export const DASHBOARD_SAVINGS_SELECTION_KEY = 'dashboardSavingsSelection';

const parseSelection = (value: string | null): number[] | null => {
  if (!value) return null;
  try {
    const parsed = JSON.parse(value);
    if (!Array.isArray(parsed)) return null;
    const ids = parsed.filter(
      (item): item is number => typeof item === 'number' && Number.isInteger(item)
    );
    return ids.length > 0 ? ids : null;
  } catch {
    return null;
  }
};

export const DashboardSavingsBlock = () => {
  const { t } = useLanguage();
  const { showToast } = useToast();
  const repository = useSavings();
  const repositoryRef = useRef(repository);
  repositoryRef.current = repository;
  const { refreshKey } = useDashboardRefresh();
  const [savings, setSavings] = useState<Saving[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<number[] | null>(null);
  const [pickerVisible, setPickerVisible] = useState(false);

  useEffect(() => {
    let active = true;
    AsyncStorage.getItem(DASHBOARD_SAVINGS_SELECTION_KEY)
      .then((raw) => {
        if (active) setSelectedIds(parseSelection(raw));
      })
      .catch(() => {
        if (active) setSelectedIds(null);
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;
    setLoading(true);
    repositoryRef.current
      .fetchSavings({ status: 'active' })
      .then((rows) => {
        if (active) setSavings(rows);
      })
      .catch((cause) => {
        if (!active) return;
        if (__DEV__) console.warn('[dashboard] savings load failed', cause);
        const mapped = mapDatabaseError(cause, t('toast.error'));
        showToast({
          message: t(`dbErrors.${mapped.code}` as never),
          type: 'error',
        });
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [refreshKey, showToast, t]);

  const persistSelection = async (next: number[] | null) => {
    try {
      if (next === null) {
        await AsyncStorage.removeItem(DASHBOARD_SAVINGS_SELECTION_KEY);
      } else {
        await AsyncStorage.setItem(
          DASHBOARD_SAVINGS_SELECTION_KEY,
          JSON.stringify(next)
        );
      }
    } catch (cause) {
      if (__DEV__) console.warn('[dashboard] savings selection save failed', cause);
      showToast({ message: t('dashboard.saveError'), type: 'error' });
    }
  };

  const updateSelection = (next: number[] | null) => {
    setSelectedIds(next);
    void persistSelection(next);
  };

  const allIds = savings.flatMap((saving) =>
    typeof saving.id === 'number' ? [saving.id] : []
  );
  const included =
    selectedIds === null
      ? savings
      : savings.filter(
          (saving) =>
            typeof saving.id === 'number' && selectedIds.includes(saving.id)
        );
  const includedIds = new Set(
    included.flatMap((saving) =>
      typeof saving.id === 'number' ? [saving.id] : []
    )
  );

  const toggle = (id: number) => {
    const current = new Set(selectedIds ?? allIds);
    if (current.has(id)) current.delete(id);
    else current.add(id);
    const next = [...current];
    updateSelection(next.length === allIds.length ? null : next);
  };

  if (loading) return <LoadingState />;

  if (savings.length === 0) {
    return (
      <AppText variant='caption' color='muted'>
        {t('savings.empty')}
      </AppText>
    );
  }

  const totalCents = included.reduce(
    (total, saving) => total + saving.amount,
    0
  );
  const targetCents = included.reduce(
    (total, saving) => total + Math.max(0, saving.target_amount_cents ?? 0),
    0
  );
  const progress = targetCents > 0 ? totalCents / targetCents : 0;

  return (
    <Stack gap='md'>
      {included.length > 0 ? (
        <>
          <StatTile
            label={t('savings.summary.total')}
            cents={totalCents}
          />
          {targetCents > 0 ? (
            <ProgressBar
              progress={progress}
              label={t('savings.goal.title')}
              valueLabel={`${Math.round(Math.min(1, progress) * 100)}%`}
              tone='goal'
            />
          ) : null}
        </>
      ) : (
        <AppText variant='caption' color='muted'>
          {t('dashboard.noSelectedSavings')}
        </AppText>
      )}

      <Row justify='space-between' align='center' gap='sm'>
        <AppText variant='caption' color='muted'>
          {included.length}/{savings.length}
        </AppText>
        <LinkButton
          label={t('dashboard.chooseSavings')}
          onPress={() => setPickerVisible(true)}
        />
      </Row>

      <Modal
        visible={pickerVisible}
        onClose={() => setPickerVisible(false)}
        title={t('dashboard.chooseSavings')}
        closeLabel={t('close')}
        scrollable
      >
        <Stack gap='sm'>
          <AppText variant='caption' color='muted'>
            {t('dashboard.chooseSavingsHint')}
          </AppText>
          {savings.map((saving) => {
            if (typeof saving.id !== 'number') return null;
            return (
              <SwitchField
                key={saving.id}
                label={saving.saving_name}
                description={formatMoneyWithSymbol(saving.amount)}
                value={includedIds.has(saving.id)}
                onChange={() => toggle(saving.id as number)}
              />
            );
          })}
          <LinkButton
            label={t('dashboard.selectAllSavings')}
            onPress={() => updateSelection(null)}
          />
        </Stack>
      </Modal>
    </Stack>
  );
};
