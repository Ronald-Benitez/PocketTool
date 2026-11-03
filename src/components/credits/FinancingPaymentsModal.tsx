import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { useFinancingsRepository } from '@/src/db';
import type {
  FinancingPayment,
  FinancingWithRelations,
} from '@/src/interfaces/schema';
import type { FinancingSummary } from '@/src/domain/credits/summary';
import { useLanguage } from '@/src/lang/LanguageContext';
import { formatMoneyWithSymbol } from '@/src/utils';
import { Button } from '@/src/ui/actions/Button';
import { Badge } from '@/src/ui/data-display/Badge';
import { EmptyState } from '@/src/ui/feedback/EmptyState';
import { useToast } from '@/src/ui/feedback/ToastProvider';
import { ConfirmDialog } from '@/src/ui/overlays/Dialog';
import { Modal } from '@/src/ui/overlays/Modal';
import { AppText } from '@/src/ui/primitives/AppText';
import { Row, Stack } from '@/src/ui/primitives/Stack';
import { Surface } from '@/src/ui/primitives/Surface';

type FinancingPaymentsModalProps = {
  visible: boolean;
  financing: FinancingWithRelations | null;
  summary: FinancingSummary | null;
  onClose: () => void;
  onAdd: () => void;
  onEdit: (payment: FinancingPayment) => void;
  onChanged: () => void;
};

export const FinancingPaymentsModal = ({
  visible,
  financing,
  summary,
  onClose,
  onAdd,
  onEdit,
  onChanged,
}: FinancingPaymentsModalProps) => {
  const { t } = useLanguage();
  const { showToast } = useToast();
  const repository = useFinancingsRepository();
  const [deleting, setDeleting] = useState<FinancingPayment | null>(null);
  const [saving, setSaving] = useState(false);
  const payments = [...(financing?.FinancingPayments ?? [])].sort(
    (a, b) => b.date - a.date
  );

  const confirmDelete = async () => {
    if (!deleting?.id) return;
    setSaving(true);
    try {
      await repository.deletePayment(deleting.id, false);
      showToast({ message: t('financings.paymentDeleted'), type: 'success' });
      setDeleting(null);
      onChanged();
    } catch {
      showToast({ message: t('toast.error'), type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Modal
        visible={visible}
        onClose={onClose}
        title={t('financings.paymentHistory')}
        closeLabel={t('close')}
        scrollable
        footer={
          <View style={styles.footer}>
            <Button
              label={t('financings.addPayment')}
              onPress={onAdd}
              style={styles.footerButton}
            />
          </View>
        }
      >
        <Stack gap='md'>
          <AppText weight='600'>{financing?.name ?? ''}</AppText>
          {summary ? (
            <AppText variant='caption' color='muted'>
              {t('financings.balance')}:{' '}
              {formatMoneyWithSymbol(summary.balanceCents)} ·{' '}
              {t('financings.paidPrincipal')}:{' '}
              {formatMoneyWithSymbol(summary.paidPrincipalCents)} ·{' '}
              {t('financings.paidInterest')}:{' '}
              {formatMoneyWithSymbol(summary.paidInterestCents)}
            </AppText>
          ) : null}
          {payments.length === 0 ? (
            <EmptyState title={t('financings.noPayments')} />
          ) : (
            payments.map((payment) => (
              <Surface key={payment.id} variant='outlined' padding='md'>
                <Stack gap='sm'>
                  <Row justify='space-between' align='center' gap='sm'>
                    <Stack gap='xxs' style={{ flex: 1 }}>
                      <AppText weight='600'>
                        {new Date(payment.date).toLocaleDateString()}
                      </AppText>
                      <AppText variant='caption' color='muted'>
                        {t('financings.interest')}:{' '}
                        {formatMoneyWithSymbol(payment.interest_cents ?? 0)} ·{' '}
                        {t('financings.principalLabel')}:{' '}
                        {formatMoneyWithSymbol(payment.principal_cents ?? 0)}
                      </AppText>
                      {(payment.insurance_cents ?? 0) +
                        (payment.fees_cents ?? 0) >
                      0 ? (
                        <AppText variant='caption' color='muted'>
                          {t('financings.paidCharges')}:{' '}
                          {formatMoneyWithSymbol(
                            (payment.insurance_cents ?? 0) +
                              (payment.fees_cents ?? 0)
                          )}
                        </AppText>
                      ) : null}
                    </Stack>
                    <Stack gap='xs' align='flex-end'>
                      <AppText weight='600'>
                        {formatMoneyWithSymbol(payment.amount_cents ?? 0)}
                      </AppText>
                      {payment.record_id ? (
                        <Badge
                          label={t('financings.records.linked')}
                          tone='success'
                          size='sm'
                        />
                      ) : null}
                    </Stack>
                  </Row>
                  <Row gap='sm' wrap>
                    <Button
                      label={t('financings.editPayment')}
                      size='sm'
                      variant='outline'
                      onPress={() => onEdit(payment)}
                    />
                    <Button
                      label={t('delete')}
                      size='sm'
                      variant='danger'
                      onPress={() => setDeleting(payment)}
                    />
                  </Row>
                </Stack>
              </Surface>
            ))
          )}
        </Stack>
      </Modal>
      <ConfirmDialog
        visible={Boolean(deleting)}
        title={t('financings.deletePayment')}
        message={t('financings.deletePaymentConfirm')}
        confirmLabel={t('delete')}
        cancelLabel={t('cancel')}
        tone='danger'
        loading={saving}
        onConfirm={confirmDelete}
        onCancel={() => setDeleting(null)}
      />
    </>
  );
};

const styles = StyleSheet.create({
  footer: { flex: 1, flexDirection: 'row', gap: 8 },
  footerButton: { flex: 1 },
});
