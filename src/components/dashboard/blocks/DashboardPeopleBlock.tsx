import React, { useEffect, useRef, useState } from 'react';

import { useSharedLedgerRepository } from '@/src/db';
import { mapDatabaseError } from '@/src/db/errors';
import { useLanguage } from '@/src/lang/LanguageContext';
import { useDashboardRefresh } from '@/src/components/dashboard/DashboardRefreshContext';
import { useToast } from '@/src/ui/feedback/ToastProvider';
import { LoadingState } from '@/src/ui/feedback/LoadingState';
import { StatTile } from '@/src/ui/data-display/StatTile';
import { AppText } from '@/src/ui/primitives/AppText';
import { Row, Stack } from '@/src/ui/primitives/Stack';

type Totals = {
  theyOweCents: number;
  iOweThemCents: number;
  peopleCount: number;
};

const EMPTY: Totals = { theyOweCents: 0, iOweThemCents: 0, peopleCount: 0 };

export const DashboardPeopleBlock = () => {
  const { t } = useLanguage();
  const { showToast } = useToast();
  const repository = useSharedLedgerRepository();
  const repositoryRef = useRef(repository);
  repositoryRef.current = repository;
  const { refreshKey } = useDashboardRefresh();
  const [totals, setTotals] = useState<Totals>(EMPTY);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    repositoryRef.current
      .fetchStatements()
      .then((result) => {
        if (!active) return;
        let theyOweCents = 0;
        let iOweThemCents = 0;
        let peopleCount = 0;
        result.statements.forEach((statement) => {
          if (statement.summary.entryCount === 0) return;
          peopleCount += 1;
          theyOweCents += statement.summary.theyOweMeCents;
          iOweThemCents += statement.summary.iOweThemCents;
        });
        setTotals({ theyOweCents, iOweThemCents, peopleCount });
      })
      .catch((cause) => {
        if (!active) return;
        if (__DEV__) console.warn('[dashboard] people load failed', cause);
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

  if (loading) return <LoadingState />;

  if (totals.peopleCount === 0) {
    return (
      <AppText variant='caption' color='muted'>
        {t('dashboard.noPeople')}
      </AppText>
    );
  }

  return (
    <Stack gap='md'>
      <Row gap='md'>
        <StatTile
          label={t('shared.theyOweYou')}
          cents={totals.theyOweCents}
          tone='income'
          size='sm'
          style={{ flex: 1 }}
        />
        <StatTile
          label={t('shared.youOweThem')}
          cents={totals.iOweThemCents}
          tone='expense'
          size='sm'
          style={{ flex: 1 }}
        />
      </Row>
      <AppText variant='caption' color='muted'>
        {t('shared.peopleTitle')}: {totals.peopleCount}
      </AppText>
    </Stack>
  );
};
