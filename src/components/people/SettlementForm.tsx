import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { useGroups, usePersonSettlementsRepository } from '@/src/db';
import type { Group, Person } from '@/src/interfaces/schema';
import { useLanguage } from '@/src/lang/LanguageContext';
import { useToast } from '@/src/ui/feedback/ToastProvider';
import { Button } from '@/src/ui/actions/Button';
import { DateField } from '@/src/ui/forms/DateField';
import { MoneyField } from '@/src/ui/forms/MoneyField';
import { SelectField } from '@/src/ui/forms/SelectField';
import { TextField } from '@/src/ui/forms/TextField';
import { Modal } from '@/src/ui/overlays/Modal';
import { AppText } from '@/src/ui/primitives/AppText';
import { Stack } from '@/src/ui/primitives/Stack';

type SettlementDirection = 'i_paid_them' | 'they_paid_me';

type SettlementFormProps = {
  visible: boolean;
  person: Person | null;
  balanceCents: number;
  defaultGroupId?: number | null;
  onClose: () => void;
  onSaved: () => void;
};

export const SettlementForm = ({
  visible,
  person,
  balanceCents,
  defaultGroupId,
  onClose,
  onSaved,
}: SettlementFormProps) => {
  const { t } = useLanguage();
  const { showToast } = useToast();
  const settlementsRepository = usePersonSettlementsRepository();
  const groupsRepository = useGroups();
  const [direction, setDirection] =
    useState<SettlementDirection>('they_paid_me');
  const [amountCents, setAmountCents] = useState(0);
  const [date, setDate] = useState(0);
  const [groupId, setGroupId] = useState(0);
  const [notes, setNotes] = useState('');
  const [groups, setGroups] = useState<Group[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!visible) return;
    setDirection(balanceCents < 0 ? 'i_paid_them' : 'they_paid_me');
    setAmountCents(Math.abs(balanceCents));
    setDate(Date.now());
    setGroupId(defaultGroupId ?? 0);
    setNotes('');
  }, [visible, person?.id, balanceCents, defaultGroupId]);

  useEffect(() => {
    if (!visible) return;
    let active = true;
    groupsRepository
      .fetchGroups()
      .then((rows) => {
        if (active) setGroups(rows);
      })
      .catch(() => {
        // The group selector is optional; keep the default group.
      });
    return () => {
      active = false;
    };
  }, [visible]);

  const save = async () => {
    if (!person?.id || amountCents <= 0) {
      showToast({ message: t('toast.empty'), type: 'warning' });
      return;
    }
    setSaving(true);
    try {
      await settlementsRepository.add({
        person_id: person.id,
        group_id: groupId > 0 ? groupId : null,
        date,
        amount_cents: amountCents,
        direction,
        notes: notes.trim() || null,
      });
      showToast({ message: t('shared.settlementSaved'), type: 'success' });
      onSaved();
      onClose();
    } catch (error) {
      if (__DEV__) console.warn('[people] settlement save failed', error);
      const message = error instanceof Error ? error.message : '';
      showToast({
        message:
          message === 'SHARED_PERSON_NOT_FOUND'
            ? t('shared.personRequired')
            : t('toast.error'),
        type: 'error',
      });
    } finally {
      setSaving(false);
    }
  };

  const groupOptions = [
    { label: t('shared.noGroup'), value: 0 },
    ...groups.flatMap((group) =>
      group.id === undefined
        ? []
        : [
            {
              label: `${group.group_name} (${group.year})`,
              value: group.id,
            },
          ]
    ),
  ];

  return (
    <Modal
      visible={visible}
      onClose={onClose}
      title={`${t('shared.registerPayment')}${person ? ` · ${person.name}` : ''}`}
      closeLabel={t('cancel')}
      scrollable
      footer={
        <View style={styles.footer}>
          <Button
            label={t('cancel')}
            variant='outline'
            onPress={onClose}
            style={styles.footerButton}
          />
          <Button
            label={t('confirm')}
            onPress={save}
            loading={saving}
            style={styles.footerButton}
          />
        </View>
      }
    >
      <Stack gap='md'>
        <AppText variant='caption' color='muted'>
          {t('shared.settlementPartialHint')}
        </AppText>
        <SelectField<SettlementDirection>
          label={t('shared.registerPayment')}
          value={direction}
          options={[
            { label: t('shared.theyPaidMe'), value: 'they_paid_me' },
            { label: t('shared.iPaidThem'), value: 'i_paid_them' },
          ]}
          onChange={setDirection}
        />
        <MoneyField
          label={t('shared.settlementAmount')}
          required
          value={amountCents}
          onChangeCents={setAmountCents}
        />
        <DateField
          label={t('shared.settlementDate')}
          value={date}
          onChange={setDate}
        />
        <SelectField<number>
          label={t('shared.settlementGroup')}
          value={groupId}
          options={groupOptions}
          onChange={setGroupId}
        />
        <TextField
          label={t('shared.settlementNotes')}
          value={notes}
          onChangeText={setNotes}
          multiline
          numberOfLines={2}
        />
      </Stack>
    </Modal>
  );
};

const styles = StyleSheet.create({
  footer: { flex: 1, flexDirection: 'row', gap: 8 },
  footerButton: { flex: 1 },
});
