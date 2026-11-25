import React from 'react';

import { useLanguage } from '@/src/lang/LanguageContext';
import { formatPeriodRange } from '@/src/utils';
import type { Period } from '@/src/domain/periods/types';
import { AppText } from '@/src/ui/primitives/AppText';

type GroupPeriodPreviewProps = {
  period: Period | null;
};

/** Read-only period preview used by the group form. */
export const GroupPeriodPreview = ({ period }: GroupPeriodPreviewProps) => {
  const { t, language } = useLanguage();
  if (!period) return null;

  return (
    <AppText variant='caption' color='muted'>
      {t('group.periodPreview', {
        range: formatPeriodRange(period, language),
      })}
    </AppText>
  );
};

export default GroupPeriodPreview;
