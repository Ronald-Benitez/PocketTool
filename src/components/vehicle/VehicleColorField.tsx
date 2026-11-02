import React from 'react';

import { useLanguage } from '@/src/lang/LanguageContext';
import { ColorChoiceField } from '@/src/ui/forms/ColorChoiceField';

type VehicleColorFieldProps = {
  value: string;
  onChange: (value: string) => void;
};

export const VehicleColorField = ({
  value,
  onChange,
}: VehicleColorFieldProps) => {
  const { t } = useLanguage();

  return (
    <ColorChoiceField
      label={t('vehicle.vehicle.color')}
      hint={t('vehicle.vehicle.colorHint')}
      placeholder={t('vehicle.vehicle.colorPlaceholder')}
      value={value}
      onChange={onChange}
    />
  );
};
