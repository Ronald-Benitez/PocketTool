import React, { useEffect } from 'react';

import { useSummaryMode, type SummaryMode } from '@/src/hooks/useSummaryMode';
import { useLanguage } from '@/src/lang/LanguageContext';
import { Button } from '@/src/ui/actions/Button';
import { Row } from '@/src/ui/primitives/Stack';

const MODES: {
  value: SummaryMode;
  labelKey: 'resume.own' | 'resume.total' | 'resume.shared' | 'resume.paid';
}[] = [
  { value: 'own', labelKey: 'resume.own' },
  { value: 'shared', labelKey: 'resume.shared' },
  { value: 'total', labelKey: 'resume.total' },
  { value: 'paid', labelKey: 'resume.paid' },
];

export const SummaryModeToggle = () => {
  const { t } = useLanguage();
  const { mode, loaded, setMode, load } = useSummaryMode();

  useEffect(() => {
    if (!loaded) void load();
  }, [loaded, load]);

  return (
    <Row gap='xs' wrap>
      {MODES.map((option) => (
        <Button
          key={option.value}
          label={t(option.labelKey)}
          size='sm'
          variant={mode === option.value ? 'primary' : 'outline'}
          onPress={() => setMode(option.value)}
        />
      ))}
    </Row>
  );
};
