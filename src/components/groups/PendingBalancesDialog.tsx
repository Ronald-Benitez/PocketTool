import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import type { Person } from '@/src/interfaces/schema';
import { useLanguage } from '@/src/lang/LanguageContext';
import { Button } from '@/src/ui/actions/Button';
import { FinanceValue } from '@/src/ui/data-display/FinanceValue';
import { Modal } from '@/src/ui/overlays/Modal';
import { AppText } from '@/src/ui/primitives/AppText';
import { Row, Stack } from '@/src/ui/primitives/Stack';
import { Surface } from '@/src/ui/primitives/Surface';
import { SwitchField } from '@/src/ui/forms/SwitchField';

export type PendingBalanceItem = {
  person: Person;
  balanceCents: number;
};

type PendingBalancesDialogProps = {
  visible: boolean;
  items: PendingBalanceItem[];
  canSettleInPrevious: boolean;
  onClose: () => void;
  onSettle: (
    target: 'previous' | 'new',
    personIds: number[]
  ) => void | Promise<void>;
};

export const PendingBalancesDialog = ({
  visible,
  items,
  canSettleInPrevious,
  onClose,
  onSettle,
}: PendingBalancesDialogProps) => {
  const { t } = useLanguage();
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!visible) return;
    setSelected(
      new Set(
        items.flatMap((item) =>
          item.person.id === undefined ? [] : [item.person.id]
        )
      )
    );
  }, [visible, items]);

  const toggle = (personId: number, value: boolean) => {
    setSelected((current) => {
      const next = new Set(current);
      if (value) next.add(personId);
      else next.delete(personId);
      return next;
    });
  };

  const settle = async (target: 'previous' | 'new') => {
    if (selected.size === 0) {
      onClose();
      return;
    }
    setSaving(true);
    try {
      await onSettle(target, [...selected]);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      visible={visible}
      onClose={onClose}
      title={t('shared.pendingBalances')}
      closeLabel={t('close')}
      scrollable
      footer={
        <View style={styles.footer}>
          <Button
            label={t('shared.carryOver')}
            variant='outline'
            onPress={onClose}
            style={styles.footerButton}
          />
          <Button
            label={t('shared.settleInNewGroup')}
            onPress={() => settle('new')}
            loading={saving}
            style={styles.footerButton}
          />
        </View>
      }
    >
      <Stack gap='md'>
        <AppText color='muted'>{t('shared.pendingBalancesMessage')}</AppText>
        {items.length === 0 ? (
          <AppText color='muted'>{t('shared.pendingBalancesEmpty')}</AppText>
        ) : (
          <Stack gap='sm'>
            {items.map((item) => {
              const personId = item.person.id;
              const positive = item.balanceCents > 0;
              return (
                <Surface key={personId} variant='muted' padding='md'>
                  <Row justify='space-between' align='center' gap='sm'>
                    <Stack gap='xxs' style={{ flex: 1 }}>
                      <AppText weight='600'>{item.person.name}</AppText>
                      <AppText variant='caption' color='muted'>
                        {positive
                          ? t('shared.balanceInYourFavor')
                          : t('shared.balanceInTheirFavor')}
                      </AppText>
                    </Stack>
                    <FinanceValue
                      cents={item.balanceCents}
                      size='md'
                      tone={positive ? 'income' : 'expense'}
                    />
                  </Row>
                  {personId !== undefined ? (
                    <SwitchField
                      label={`${t('shared.settlement')} · ${item.person.name}`}
                      value={selected.has(personId)}
                      onChange={(value) => toggle(personId, value)}
                    />
                  ) : null}
                </Surface>
              );
            })}
          </Stack>
        )}
        {canSettleInPrevious ? (
          <Button
            label={t('shared.settleInPreviousGroup')}
            variant='outline'
            onPress={() => settle('previous')}
            loading={saving}
          />
        ) : null}
      </Stack>
    </Modal>
  );
};

const styles = StyleSheet.create({
  footer: { flex: 1, flexDirection: 'row', gap: 8 },
  footerButton: { flex: 1 },
});
