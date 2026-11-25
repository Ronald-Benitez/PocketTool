import React from 'react';

import { useClosings } from '@/src/hooks/useClosings';
import { useLanguage } from '@/src/lang/LanguageContext';
import { LoadingState } from '@/src/ui/feedback/LoadingState';
import { StatTile } from '@/src/ui/data-display/StatTile';
import { AppText } from '@/src/ui/primitives/AppText';
import { Row, Stack } from '@/src/ui/primitives/Stack';

export const DashboardClosingBlock = () => {
  const { t } = useLanguage();
  const { closings, loading } = useClosings();

  if (loading && closings.length === 0) return <LoadingState />;

  const latest = [...closings].sort(
    (left, right) => right.close_date - left.close_date
  )[0];

  if (!latest) {
    return (
      <AppText variant='caption' color='muted'>
        {t('closing.empty')}
      </AppText>
    );
  }

  const statusLabel =
    latest.status === 'draft'
      ? t('closing.status.draft')
      : latest.status === 'expired'
        ? t('closing.status.expired')
        : t('closing.status.final');

  return (
    <Stack gap='md'>
      <Row gap='md'>
        <StatTile
          label={t('closing.sections.result')}
          cents={latest.result_cents}
          size='sm'
          style={{ flex: 1 }}
        />
        <StatTile
          label={t('closing.sections.available')}
          cents={latest.total_available_cents}
          size='sm'
          style={{ flex: 1 }}
        />
      </Row>
      <AppText variant='caption' color='muted'>
        {statusLabel} · {new Date(latest.close_date).toLocaleDateString()}
      </AppText>
    </Stack>
  );
};
