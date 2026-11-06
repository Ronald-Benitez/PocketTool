import React, { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { usePeopleRepository, useSavings, useSharedParticipantsRepository } from '@/src/db';
import { mapDatabaseError } from '@/src/db/errors';
import type { ParticipantDraft } from '@/src/db/repositories/people';
import type { SavingInput } from '@/src/db/repositories/savings';
import type { Person } from '@/src/interfaces/schema';
import { useLanguage } from '@/src/lang/LanguageContext';
import useSavingsStore from '@/src/stores/SavingsStore';
import { SharedParticipantsField } from '@/src/components/shared/SharedParticipantsField';
import { Button } from '@/src/ui/actions/Button';
import { useToast } from '@/src/ui/feedback/ToastProvider';
import { DateField } from '@/src/ui/forms/DateField';
import { MoneyField } from '@/src/ui/forms/MoneyField';
import { SelectField } from '@/src/ui/forms/SelectField';
import { SwitchField } from '@/src/ui/forms/SwitchField';
import { TextField } from '@/src/ui/forms/TextField';
import { Modal } from '@/src/ui/overlays/Modal';
import { AppText } from '@/src/ui/primitives/AppText';
import { Stack } from '@/src/ui/primitives/Stack';

type SavingFormProps = {
  isEditing?: boolean;
  children?: React.ReactNode;
  open?: boolean;
  onSaved?: () => void;
};

const parsePercent = (value: string) => {
  const parsed = Number(value.replace(',', '.').replace(/[^0-9.]/g, ''));
  return Number.isFinite(parsed) ? parsed : 0;
};

export const AddSaving = ({
  isEditing = false,
  children,
  open,
  onSaved,
}: SavingFormProps) => {
  const { t } = useLanguage();
  const { showToast } = useToast();
  const repository = useSavings();
  const peopleRepository = usePeopleRepository();
  const participantsRepository = useSharedParticipantsRepository();
  const { saving, setSaving, setSavings } = useSavingsStore();
  const firstOpenEffect = useRef(true);

  const [visible, setVisible] = useState(false);
  const [name, setName] = useState('');
  const [amountCents, setAmountCents] = useState(0);
  const [hasGoal, setHasGoal] = useState(false);
  const [targetAmountCents, setTargetAmountCents] = useState(0);
  const [targetDate, setTargetDate] = useState(() => Date.now());
  const [recordsMode, setRecordsMode] = useState<'separate' | 'linked'>('separate');
  const [contributionRule, setContributionRule] = useState<'none' | 'percent' | 'fixed'>('none');
  const [contributionPercent, setContributionPercent] = useState('10');
  const [contributionAmountCents, setContributionAmountCents] = useState(0);
  const [interestRate, setInterestRate] = useState('');
  const [people, setPeople] = useState<Person[]>([]);
  const [participants, setParticipants] = useState<ParticipantDraft[]>([]);
  const [savingBusy, setSavingBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (firstOpenEffect.current) {
      firstOpenEffect.current = false;
      return;
    }
    setVisible(true);
  }, [open]);

  useEffect(() => {
    if (!visible) return;
    let active = true;
    peopleRepository
      .fetchPeople()
      .then((rows) => {
        if (active) setPeople(rows);
      })
      .catch(() => {
        if (active) setPeople([]);
      });
    return () => {
      active = false;
    };
  }, [visible]);

  useEffect(() => {
    if (!visible) return;
    if (isEditing && saving) {
      setName(saving.saving_name);
      setAmountCents(saving.amount);
      setHasGoal((saving.target_amount_cents ?? 0) > 0);
      setTargetAmountCents(saving.target_amount_cents ?? 0);
      setTargetDate(saving.target_date ?? Date.now());
      setRecordsMode(saving.records_mode === 'linked' ? 'linked' : 'separate');
      const rule =
        saving.contribution_rule === 'percent' || saving.contribution_rule === 'fixed'
          ? saving.contribution_rule
          : 'none';
      setContributionRule(rule);
      setContributionPercent(
        String((saving.contribution_percent_bps ?? 1000) / 100)
      );
      setContributionAmountCents(saving.contribution_amount_cents ?? 0);
      setInterestRate(
        saving.interest_rate_bps != null
          ? String(saving.interest_rate_bps / 100)
          : ''
      );
      if (saving.id) {
        participantsRepository.fetchFor('saving', saving.id).then((rows) => {
          setParticipants(
            rows.map((row) => ({
              personId: row.person_id,
              sharePercent: row.share_percent,
              notes: row.notes,
            }))
          );
        });
      }
    } else {
      setName('');
      setAmountCents(0);
      setHasGoal(false);
      setTargetAmountCents(0);
      setTargetDate(Date.now());
      setRecordsMode('separate');
      setContributionRule('none');
      setContributionPercent('10');
      setContributionAmountCents(0);
      setInterestRate('');
      setParticipants([]);
    }
    setError(null);
  }, [visible, isEditing, saving?.id]);

  const closeModal = () => setVisible(false);

  const save = async () => {
    if (!name.trim() || amountCents <= 0) {
      setError(t('savings.form.required'));
      return;
    }
    if (hasGoal && targetAmountCents <= 0) {
      setError(t('savings.form.targetRequired'));
      return;
    }
    if (contributionRule === 'percent' && parsePercent(contributionPercent) <= 0) {
      setError(t('savings.form.percentRequired'));
      return;
    }
    if (contributionRule === 'fixed' && contributionAmountCents <= 0) {
      setError(t('savings.form.amountRequired'));
      return;
    }
    setSavingBusy(true);
    setError(null);
    try {
      const input: Omit<SavingInput, 'id'> = {
        saving_name: name.trim(),
        amount: amountCents,
        target_amount_cents: hasGoal ? targetAmountCents : null,
        target_date: hasGoal ? targetDate : null,
        records_mode: recordsMode,
        contribution_rule: contributionRule,
        contribution_percent_bps:
          contributionRule === 'percent'
            ? Math.round(parsePercent(contributionPercent) * 100)
            : null,
        contribution_amount_cents:
          contributionRule === 'fixed' ? contributionAmountCents : null,
        interest_rate_bps: interestRate.trim()
          ? Math.round(parsePercent(interestRate) * 100)
          : null,
        participants,
      };
      if (isEditing && saving?.id) {
        await repository.updateSaving(saving.id, input);
        showToast({ message: t('toast.edited'), type: 'success' });
      } else {
        const id = await repository.createSaving(input);
        const created = await repository.fetchSavings({ status: 'all' });
        setSavings(created);
        const selected = created.find((row) => row.id === id) ?? null;
        if (selected) setSaving(selected);
        showToast({ message: t('toast.added'), type: 'success' });
      }
      const rows = await repository.fetchSavings({ status: 'all' });
      setSavings(rows);
      onSaved?.();
      closeModal();
    } catch (cause) {
      if (__DEV__) console.warn('[savings] save failed', cause);
      const mapped = mapDatabaseError(cause, t('toast.error'));
      setError(t(`dbErrors.${mapped.code}` as never));
    } finally {
      setSavingBusy(false);
    }
  };

  return (
    <>
      {children ? <Pressable onPress={() => setVisible(true)}>{children}</Pressable> : null}
      <Modal
        visible={visible}
        onClose={closeModal}
        title={isEditing ? t('savings.edit') : t('savings.add')}
        closeLabel={t('cancel')}
        scrollable
        footer={
          <View style={styles.footer}>
            <Button
              label={t('cancel')}
              variant='outline'
              onPress={closeModal}
              style={styles.footerButton}
            />
            <Button
              label={t('confirm')}
              onPress={save}
              loading={savingBusy}
              style={styles.footerButton}
            />
          </View>
        }
      >
        <Stack gap='md'>
          <TextField label={t('item.name')} value={name} onChangeText={setName} required />
          <MoneyField
            label={isEditing ? t('savings.form.currentAmount') : t('item.value')}
            required
            value={amountCents}
            onChangeCents={setAmountCents}
          />
          <SwitchField label={t('savings.form.hasGoal')} value={hasGoal} onChange={setHasGoal} />
          {hasGoal ? (
            <>
              <MoneyField
                label={t('savings.form.targetAmount')}
                required
                value={targetAmountCents}
                onChangeCents={setTargetAmountCents}
              />
              <DateField
                label={t('savings.form.targetDate')}
                value={targetDate}
                onChange={setTargetDate}
              />
            </>
          ) : null}
          <SelectField<'none' | 'percent' | 'fixed'>
            label={t('savings.form.contributionRule')}
            value={contributionRule}
            options={[
              { label: t('savings.form.ruleNone'), value: 'none' },
              { label: t('savings.form.rulePercent'), value: 'percent' },
              { label: t('savings.form.ruleFixed'), value: 'fixed' },
            ]}
            onChange={setContributionRule}
          />
          {contributionRule === 'percent' ? (
            <TextField
              label={t('savings.form.percentOfIncome')}
              value={contributionPercent}
              onChangeText={setContributionPercent}
              keyboardType='decimal-pad'
            />
          ) : null}
          {contributionRule === 'fixed' ? (
            <MoneyField
              label={t('savings.form.fixedContribution')}
              value={contributionAmountCents}
              onChangeCents={setContributionAmountCents}
            />
          ) : null}
          <SelectField<'separate' | 'linked'>
            label={t('savings.form.recordsMode')}
            value={recordsMode}
            options={[
              { label: t('savings.form.recordsSeparate'), value: 'separate' },
              { label: t('savings.form.recordsLinked'), value: 'linked' },
            ]}
            onChange={setRecordsMode}
          />
          <TextField
            label={t('savings.form.interestRate')}
            value={interestRate}
            onChangeText={setInterestRate}
            keyboardType='decimal-pad'
            hint={t('savings.form.interestHint')}
          />
          <AppText variant='label'>{t('savings.form.participants')}</AppText>
          <SharedParticipantsField
            people={people}
            value={participants}
            onChange={setParticipants}
            totalCents={hasGoal ? targetAmountCents : amountCents}
          />
          {error ? <AppText color='danger'>{error}</AppText> : null}
        </Stack>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  footer: { flex: 1, flexDirection: 'row', gap: 8 },
  footerButton: { flex: 1 },
});

export default AddSaving;
