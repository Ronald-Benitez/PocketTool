import React, { useEffect, useState } from 'react';

import { resolvePendingPaymentDate } from '@/src/domain/credits/pending';
import { groupPeriodFromRow } from '@/src/domain/groups/period';
import { useConfigs } from '@/src/hooks/useConfigs';
import { useLanguage } from '@/src/lang/LanguageContext';
import { useDashboardRefresh } from '@/src/components/dashboard/DashboardRefreshContext';
import { useCreditStore } from '@/src/stores/CreditsStore';
import useRecordsStore from '@/src/stores/RecordsStore';
import { formatMoneyWithSymbol } from '@/src/utils';
import { LoadingState } from '@/src/ui/feedback/LoadingState';
import { StatTile } from '@/src/ui/data-display/StatTile';
import { AppText } from '@/src/ui/primitives/AppText';
import { Row, Stack } from '@/src/ui/primitives/Stack';

export const DashboardCreditsBlock = () => {
  const { t } = useLanguage();
  const { credits } = useCreditStore();
  const { configs } = useConfigs();
  const { group } = useRecordsStore();
  const { refreshKey } = useDashboardRefresh();
  const [now, setNow] = useState(0);

  useEffect(() => {
    setNow(Date.now());
  }, [refreshKey, group?.id]);

  if (!credits || !now) return <LoadingState />;

  if (credits.length === 0) {
    return (
      <AppText variant='caption' color='muted'>
        {t('dashboard.noCredits')}
      </AppText>
    );
  }

  const period = group ? groupPeriodFromRow(group) : null;
  const items = credits
    .flatMap((credit) => {
      if (credit.id === undefined) return [];
      const expected = Math.max(
        0,
        (credit.totalPreviousCombined ?? credit.totalPrevious ?? 0) -
          (credit.totalCurrentPayments ?? 0)
      );
      if (expected <= 0) return [];
      const date = resolvePendingPaymentDate({
        mode: configs.pendingPaymentDateMode,
        now,
        groupYear: group?.year,
        groupMonth: group?.month,
        paymentDay: credit.payment_date ?? null,
        periodStart: period?.start,
        periodEnd: period?.end,
      });
      return [{ credit, expected, date }];
    })
    .sort((left, right) => left.date - right.date);

  const totalCents = items.reduce((total, item) => total + item.expected, 0);
  const next = items[0];
  const totalLimit = credits.reduce(
    (total, credit) => total + Math.max(0, credit.credit_limit ?? 0),
    0
  );

  return (
    <Stack gap='md'>
      <Row gap='md'>
        <StatTile
          label={t('credits.pending')}
          cents={totalCents}
          size='sm'
          style={{ flex: 1 }}
        />
        <StatTile
          label={t('credits.nextPaymentDate')}
          value={
            next ? new Date(next.date).toLocaleDateString() : t('resume.noData')
          }
          size='sm'
          style={{ flex: 1 }}
        />
      </Row>
      {totalLimit > 0 ? (
        <AppText variant='caption' color='muted'>
          {t('credits.totalLimit')}: {formatMoneyWithSymbol(totalLimit)}
        </AppText>
      ) : null}
    </Stack>
  );
};
