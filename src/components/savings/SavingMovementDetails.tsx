import React from 'react';
import { StyleSheet, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

import type { SavingMovementView } from '@/src/db/repositories/savings';
import { useLanguage } from '@/src/lang/LanguageContext';
import { formatMoneyWithSymbol } from '@/src/utils';
import { Button } from '@/src/ui/actions/Button';
import { Modal } from '@/src/ui/overlays/Modal';
import { AppText } from '@/src/ui/primitives/AppText';
import { Divider } from '@/src/ui/primitives/Divider';
import { Row, Stack } from '@/src/ui/primitives/Stack';
import { Surface } from '@/src/ui/primitives/Surface';
import { useTheme } from '@/src/ui/theme/ThemeProvider';

type Props = {
  visible: boolean;
  movement: SavingMovementView | null;
  personName?: string | null;
  onClose: () => void;
};

const kindIcon = (kind: string) => {
  if (kind === 'withdrawal') return 'arrow-downward';
  if (kind === 'interest') return 'percent';
  if (kind === 'adjustment') return 'tune';
  return 'arrow-upward';
};

const formatDate = (value?: number | null) =>
  value != null ? new Date(value).toLocaleDateString() : '';

const formatDateTime = (value?: number | null) =>
  value != null ? new Date(value).toLocaleString() : '';

const DetailRow = ({ label, value }: { label: string; value: string }) => (
  <Row justify='space-between' align='flex-start' gap='md'>
    <AppText color='muted'>{label}</AppText>
    <AppText style={styles.value}>{value}</AppText>
  </Row>
);

export const SavingMovementDetails = ({
  visible,
  movement,
  personName,
  onClose,
}: Props) => {
  const { t } = useLanguage();
  const { colors } = useTheme();

  if (!movement) return null;

  const period =
    movement.period_year > 0 && movement.period_month > 0
      ? new Date(
          movement.period_year,
          movement.period_month - 1,
          1
        ).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
      : formatDate(movement.change_date);

  return (
    <Modal
      visible={visible}
      onClose={onClose}
      title={t('savings.movement.detailsTitle')}
      closeLabel={t('close')}
      scrollable
      footer={
        <Button label={t('close')} variant='outline' onPress={onClose} />
      }
    >
      <Stack gap='md'>
        <Surface variant='muted' padding='md'>
          <Row justify='space-between' align='center' gap='sm'>
            <Row gap='sm' align='center' style={{ flex: 1 }}>
              <MaterialIcons
                name={kindIcon(movement.kind)}
                size={20}
                color={
                  movement.kind === 'withdrawal'
                    ? colors.expense
                    : colors.income
                }
              />
              <AppText weight='600' style={{ flex: 1 }}>
                {t(`savings.movement.kinds.${movement.kind}` as never)}
              </AppText>
            </Row>
            <AppText weight='600'>
              {formatMoneyWithSymbol(movement.amount_cents)}
            </AppText>
          </Row>
        </Surface>

        <AppText variant='caption' color='muted'>
          {t('savings.movement.detailsHint')}
        </AppText>

        <Stack gap='sm'>
          <DetailRow
            label={t('savings.movement.date')}
            value={formatDate(movement.change_date)}
          />
          <DetailRow
            label={t('savings.movement.person')}
            value={personName || t('savings.movement.own')}
          />
          <DetailRow label={t('savings.movement.period')} value={period} />
          <DetailRow
            label={t('savings.movement.balanceBefore')}
            value={formatMoneyWithSymbol(movement.previous_amount)}
          />
          <DetailRow
            label={t('savings.movement.balanceAfter')}
            value={formatMoneyWithSymbol(movement.new_amount)}
          />
        </Stack>

        <Divider />

        <Stack gap='sm'>
          <AppText weight='600'>{t('savings.movement.note')}</AppText>
          <AppText color={movement.note ? 'default' : 'muted'}>
            {movement.note?.trim() || t('savings.movement.noNote')}
          </AppText>
        </Stack>

        <Divider />

        <Stack gap='sm'>
          <AppText weight='600'>{t('savings.movement.linkedRecord')}</AppText>
          {movement.record ? (
            <Stack gap='sm'>
              <DetailRow
                label={t('savings.movement.recordDate')}
                value={formatDate(movement.record.date)}
              />
              <DetailRow
                label={t('savings.movement.recordAmount')}
                value={formatMoneyWithSymbol(movement.record.amount)}
              />
              <DetailRow
                label={t('savings.records.recordType')}
                value={movement.record.recordTypeName ?? '-'}
              />
              <DetailRow
                label={t('savings.records.category')}
                value={movement.record.categoryName ?? '-'}
              />
              <DetailRow
                label={t('savings.records.paymentMethod')}
                value={movement.record.paymentMethodName ?? '-'}
              />
              <AppText variant='caption' color='muted'>
                {movement.record.name}
              </AppText>
            </Stack>
          ) : (
            <AppText color='muted'>{t('savings.movement.noRecord')}</AppText>
          )}
        </Stack>

        <View style={[styles.timestamps, { borderTopColor: colors.border }]}>
          <AppText variant='caption' color='muted'>
            {t('savings.movement.createdAt')}:{' '}
            {formatDateTime(movement.created_at)}
          </AppText>
          <AppText variant='caption' color='muted'>
            {t('savings.movement.updatedAt')}:{' '}
            {formatDateTime(movement.updated_at)}
          </AppText>
        </View>
      </Stack>
    </Modal>
  );
};

const styles = StyleSheet.create({
  value: {
    flex: 1,
    textAlign: 'right',
  },
  timestamps: {
    borderTopWidth: 1,
    paddingTop: 12,
    gap: 4,
  },
});
