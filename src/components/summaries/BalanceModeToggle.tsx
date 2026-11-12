import React, { useEffect } from 'react';

import { useBalanceMode, type BalanceMode } from '@/src/hooks/useBalanceMode';
import { useLanguage } from '@/src/lang/LanguageContext';
import { Button } from '@/src/ui/actions/Button';
import { Row } from '@/src/ui/primitives/Stack';

const MODES: { value: BalanceMode; labelKey: 'resume.modeConsumption' | 'resume.modeCash' }[] = [
  { value: 'consumption', labelKey: 'resume.modeConsumption' },
  { value: 'cash', labelKey: 'resume.modeCash' },
];

export const BalanceModeToggle = () => {
  const { t } = useLanguage();
  const { mode, loaded, setMode, load } = useBalanceMode();

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
