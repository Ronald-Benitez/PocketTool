import React, { useEffect, useState } from 'react';

import {
  useCategories,
  usePaymentMethods,
  useSavings,
  useTableRepository,
} from '@/src/db';
import { mapDatabaseError } from '@/src/db/errors';
import type { RecordType, SavingsSetting } from '@/src/interfaces/schema';
import { useLanguage } from '@/src/lang/LanguageContext';
import { useToast } from '@/src/ui/feedback/ToastProvider';
import { ColorField } from '@/src/ui/forms/ColorField';
import { SelectField } from '@/src/ui/forms/SelectField';
import { AppText } from '@/src/ui/primitives/AppText';
import { Stack } from '@/src/ui/primitives/Stack';

export const SavingsSettingsPanel = () => {
  const { t } = useLanguage();
  const { showToast } = useToast();
  const repository = useSavings();
  const categoriesRepository = useCategories();
  const paymentsRepository = usePaymentMethods();
  const recordTypesRepository = useTableRepository('RecordTypes');

  const [settings, setSettings] = useState<SavingsSetting | null>(null);
  const [categories, setCategories] = useState<{ id?: number; category_name: string }[]>([]);
  const [payments, setPayments] = useState<{ id?: number; method_name: string }[]>([]);
  const [recordTypes, setRecordTypes] = useState<RecordType[]>([]);

  useEffect(() => {
    let active = true;
    Promise.all([
      repository.fetchSettings(),
      categoriesRepository.fetchCategories(),
      paymentsRepository.fetchPaymentMethods(),
      recordTypesRepository.fetchAll(),
    ])
      .then(([nextSettings, nextCategories, nextPayments, nextTypes]) => {
        if (!active) return;
        setSettings(nextSettings);
        setCategories(nextCategories ?? []);
        setPayments(nextPayments ?? []);
        setRecordTypes((nextTypes ?? []) as RecordType[]);
      })
      .catch((cause) => {
        if (!active) return;
        if (__DEV__) console.warn('[savings] settings load failed', cause);
        const mapped = mapDatabaseError(cause, t('toast.error'));
        showToast({ message: t(`dbErrors.${mapped.code}` as never), type: 'error' });
      });
    return () => {
      active = false;
    };
  }, []);

  const update = async (partial: Partial<SavingsSetting>) => {
    const next = {
      setting_key: 'savings',
      record_type_id: settings?.record_type_id ?? null,
      payment_method_id: settings?.payment_method_id ?? null,
      category_id: settings?.category_id ?? null,
      trophy_color: settings?.trophy_color ?? '#C9A227',
      ...partial,
    };
    try {
      await repository.saveSettings(next);
      setSettings((current) => ({ ...(current ?? { id: 0, setting_key: 'savings' }), ...next }) as SavingsSetting);
      showToast({ message: t('savings.settings.saved'), type: 'success' });
    } catch (cause) {
      if (__DEV__) console.warn('[savings] settings save failed', cause);
      const mapped = mapDatabaseError(cause, t('toast.error'));
      showToast({ message: t(`dbErrors.${mapped.code}` as never), type: 'error' });
    }
  };

  const categoryOptions = categories.flatMap((category) =>
    category.id === undefined ? [] : [{ label: category.category_name, value: category.id }]
  );
  const paymentOptions = payments.flatMap((payment) =>
    payment.id === undefined ? [] : [{ label: payment.method_name, value: payment.id }]
  );
  const recordTypeOptions = recordTypes.flatMap((type) =>
    type.id === undefined ? [] : [{ label: type.type_name, value: type.id }]
  );

  return (
    <Stack gap='md'>
      <AppText variant='title'>{t('savings.settings.title')}</AppText>
      <AppText color='muted'>{t('savings.settings.subtitle')}</AppText>
      <SelectField<number>
        label={t('savings.settings.recordType')}
        value={settings?.record_type_id ?? null}
        options={recordTypeOptions}
        onChange={(value) => update({ record_type_id: value })}
      />
      <SelectField<number>
        label={t('savings.settings.category')}
        value={settings?.category_id ?? null}
        options={categoryOptions}
        onChange={(value) => update({ category_id: value })}
        searchable
      />
      <SelectField<number>
        label={t('savings.settings.paymentMethod')}
        value={settings?.payment_method_id ?? null}
        options={paymentOptions}
        onChange={(value) => update({ payment_method_id: value })}
      />
      <ColorField
        label={t('savings.settings.trophyColor')}
        value={settings?.trophy_color ?? '#C9A227'}
        onChange={(value) => update({ trophy_color: value })}
      />
    </Stack>
  );
};
