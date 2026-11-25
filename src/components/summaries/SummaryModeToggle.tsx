import React, { useEffect } from 'react';

import { useFeature } from '@/src/features';
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
  const showShared = useFeature('shared');
  const { mode, loaded, setMode, load } = useSummaryMode();

  useEffect(() => {
    if (!loaded) void load();
  }, [loaded, load]);

  useEffect(() => {
    if (!showShared && mode === 'shared') setMode('own');
  }, [mode, setMode, showShared]);

  if (!showShared) return null;

  const modes = MODES.filter(
    (option) => option.value !== 'shared' || showShared
  );

  return (
    <Row gap='xs' wrap>
      {modes.map((option) => (
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
