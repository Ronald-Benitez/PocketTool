import React, { useEffect, useState } from 'react';

import {
  useCategories,
  usePaymentMethods,
  useTableRepository,
  useVehicleSettingsRepository,
} from '@/src/db';
import type { RecordType, VehicleSetting } from '@/src/interfaces/schema';
import { useLanguage } from '@/src/lang/LanguageContext';
import { useToast } from '@/src/ui/feedback/ToastProvider';
import { SelectField } from '@/src/ui/forms/SelectField';
import { AppText } from '@/src/ui/primitives/AppText';
import { Stack } from '@/src/ui/primitives/Stack';

const keys = [
  'fuel',
  'maintenance',
  'repair',
  'tires',
  'oil_change',
  'insurance',
  'inspection',
  'other',
] as const;

export const VehicleSettingsPanel = () => {
  const { t } = useLanguage();
  const { showToast } = useToast();
  const settingsRepository = useVehicleSettingsRepository();
  const categoriesRepository = useCategories();
  const paymentsRepository = usePaymentMethods();
  const recordTypesRepository = useTableRepository('RecordTypes');
  const [settings, setSettings] = useState<VehicleSetting[]>([]);
  const [categories, setCategories] = useState<{ id?: number; category_name: string }[]>([]);
  const [payments, setPayments] = useState<{ id?: number; method_name: string }[]>([]);
  const [recordTypes, setRecordTypes] = useState<RecordType[]>([]);

  useEffect(() => {
    let active = true;
    Promise.all([
      settingsRepository.fetchSettings(),
      categoriesRepository.fetchCategories(),
      paymentsRepository.fetchPaymentMethods(),
      recordTypesRepository.fetchAll(),
    ]).then(([nextSettings, nextCategories, nextPayments, nextRecordTypes]) => {
      if (!active) return;
      setSettings(nextSettings);
      setCategories(nextCategories ?? []);
      setPayments(nextPayments ?? []);
      setRecordTypes((nextRecordTypes ?? []) as RecordType[]);
    });
    return () => {
      active = false;
    };
  }, []);

  const categoryOptions = categories.flatMap((category) =>
    category.id === undefined
      ? []
      : [{ label: category.category_name, value: category.id }]
  );
  const paymentOptions = payments.flatMap((method) =>
    method.id === undefined ? [] : [{ label: method.method_name, value: method.id }]
  );
  const recordTypeOptions = recordTypes.flatMap((type) =>
    type.id === undefined || type.effect !== '-'
      ? []
      : [{ label: type.type_name, value: type.id }]
  );

  const update = async (
    key: (typeof keys)[number],
    categoryId: number | null,
    paymentMethodId: number | null,
    recordTypeId: number | null
  ) => {
    await settingsRepository.saveSetting({
      setting_key: key,
      category_id: categoryId,
      payment_method_id: paymentMethodId,
      record_type_id: recordTypeId,
    });
    setSettings((current) =>
      current.map((setting) =>
        setting.setting_key === key
          ? {
              ...setting,
              category_id: categoryId,
              payment_method_id: paymentMethodId,
              record_type_id: recordTypeId,
            }
          : setting
      )
    );
    showToast({ message: t('vehicle.settings.saved'), type: 'success' });
  };

  return (
    <Stack gap='md'>
      <AppText variant='title'>{t('vehicle.settings.title')}</AppText>
      <AppText color='muted'>{t('vehicle.settings.subtitle')}</AppText>
      {keys.map((key) => {
        const setting = settings.find((item) => item.setting_key === key);
        return (
          <Stack key={key} gap='xs'>
            <SelectField
              label={t(
                key === 'oil_change'
                  ? 'vehicle.settings.oilChange'
                  : key === 'fuel'
                    ? 'vehicle.settings.fuel'
                    : key === 'maintenance'
                      ? 'vehicle.settings.maintenance'
                      : key === 'repair'
                        ? 'vehicle.settings.repair'
                        : key === 'tires'
                          ? 'vehicle.settings.tires'
                          : key === 'insurance'
                            ? 'vehicle.settings.insurance'
                            : key === 'inspection'
                              ? 'vehicle.settings.inspection'
                              : 'vehicle.settings.other'
              )}
              value={setting?.category_id ?? null}
              options={categoryOptions}
              onChange={(value) =>
                update(
                  key,
                  value,
                  setting?.payment_method_id ?? null,
                  setting?.record_type_id ?? null
                )
              }
              searchable
            />
            <SelectField
              label={`${t('vehicle.settings.paymentMethod')} · ${key}`}
              value={setting?.payment_method_id ?? null}
              options={paymentOptions}
              onChange={(value) =>
                update(
                  key,
                  setting?.category_id ?? null,
                  value,
                  setting?.record_type_id ?? null
                )
              }
            />
            <SelectField
              label={`${t('vehicle.settings.recordType')} · ${key}`}
              value={setting?.record_type_id ?? null}
              options={recordTypeOptions}
              onChange={(value) =>
                update(
                  key,
                  setting?.category_id ?? null,
                  setting?.payment_method_id ?? null,
                  value
                )
              }
            />
          </Stack>
        );
      })}
    </Stack>
  );
};

