import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import type {
  ClosingDirection,
  ClosingKind,
  ClosingLineDraft,
  ClosingOperation,
  ClosingSection,
} from '@/src/domain/closing/types';
import { sourceKeyFromLine } from '@/src/components/closing/closingModel';
import type { ClosingSourceOption } from '@/src/hooks/useClosingSources';
import { useLanguage } from '@/src/lang/LanguageContext';
import { Button } from '@/src/ui/actions/Button';
import { MoneyField } from '@/src/ui/forms/MoneyField';
import { SelectField } from '@/src/ui/forms/SelectField';
import { TextField } from '@/src/ui/forms/TextField';
import { Modal } from '@/src/ui/overlays/Modal';
import { AppText } from '@/src/ui/primitives/AppText';
import { useToast } from '@/src/ui/feedback/ToastProvider';

type ClosingLineFormProps = {
  visible: boolean;
  section: ClosingSection;
  line?: ClosingLineDraft | null;
  sources: ClosingSourceOption[];
  usedSourceKeys: Set<string>;
  onClose: () => void;
  onSave: (line: ClosingLineDraft) => void;
};

const reasonValues = ['cashback', 'discount', 'return', 'other'] as const;
type ReasonValue = (typeof reasonValues)[number];

export const ClosingLineForm = ({
  visible,
  section,
  line,
  sources,
  usedSourceKeys,
  onClose,
  onSave,
}: ClosingLineFormProps) => {
  const { t } = useLanguage();
  const { showToast } = useToast();
  const [sourceKey, setSourceKey] = useState('manual');
  const [kind, setKind] = useState<ClosingKind>('manual');
  const [label, setLabel] = useState('');
  const [selectedSection, setSelectedSection] =
    useState<ClosingSection>(section);
  const [amountCents, setAmountCents] = useState(0);
  const [referenceCents, setReferenceCents] = useState<number | null>(null);
  const [operation, setOperation] = useState<ClosingOperation>('add');
  const [direction, setDirection] = useState<ClosingDirection>('from');
  const [reason, setReason] = useState<ReasonValue>('other');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (!visible) return;
    setSourceKey(line ? sourceKeyFromLine(line) ?? 'manual' : 'manual');
    setKind(line?.kind ?? 'manual');
    setLabel(line?.label ?? '');
    setSelectedSection(line?.section ?? section);
    setAmountCents(line?.amountCents ?? 0);
    setReferenceCents(line?.referenceCents ?? null);
    setOperation(line?.operation ?? 'add');
    setDirection(line?.direction ?? 'from');
    setReason(
      reasonValues.includes(line?.reason as ReasonValue)
        ? (line?.reason as ReasonValue)
        : 'other'
    );
    setNotes(line?.notes ?? '');
  }, [visible, line, section]);

  const isCard = kind === 'card';
  const isResolution = selectedSection === 'resolution';

  const sourceTypeLabel = (value: string) => {
    if (value === 'manual') return t('closing.sources.types.manual');
    const source = sources.find((item) => item.key === value);
    return source
      ? t(`closing.sources.types.${source.kind}` as never)
      : t('closing.sources.types.manual');
  };

  const renderSourceOption = (option: { label: string; value: string }) => (
    <View style={styles.sourceOption}>
      <AppText numberOfLines={1} style={{ flexShrink: 1 }}>
        {option.label}
      </AppText>
      <AppText variant='helper' color='muted'>
        · {sourceTypeLabel(option.value)}
      </AppText>
    </View>
  );
  const sourceOptions = [
    { label: t('closing.sources.manual'), value: 'manual' },
    ...sources
      .filter((source) => !usedSourceKeys.has(source.key))
      .map((source) => ({ label: source.label, value: source.key })),
  ];
  if (
    sourceKey !== 'manual' &&
    !sourceOptions.some((option) => option.value === sourceKey)
  ) {
    sourceOptions.push({
      label: line?.label ?? t('closing.sources.manual'),
      value: sourceKey,
    });
  }

  const handleSourceChange = (value: string) => {
    setSourceKey(value);
    if (value === 'manual') {
      setKind('manual');
      return;
    }
    const source = sources.find((item) => item.key === value);
    if (!source) return;
    setKind(source.kind);
    setLabel(source.label);
    setSelectedSection(source.section);
    setAmountCents(source.amountCents);
    setReferenceCents(source.referenceCents ?? null);
  };

  const handleSave = () => {
    if (!label.trim()) {
      showToast({ message: t('toast.empty'), type: 'warning' });
      return;
    }
    if (amountCents <= 0) {
      showToast({ message: t('toast.empty'), type: 'warning' });
      return;
    }

    const chosen = sources.find((item) => item.key === sourceKey) ?? null;
    const preserveExisting = sourceKey !== 'manual' && !chosen;
    const nextKind: ClosingKind = chosen
      ? chosen.kind
      : preserveExisting
        ? line?.kind ?? 'manual'
        : 'manual';

    onSave({
      id: line?.id,
      section: selectedSection,
      kind: nextKind,
      label: label.trim(),
      operation: isResolution ? 'add' : operation,
      direction: isResolution ? direction : null,
      amountCents,
      referenceCents: isResolution
        ? referenceCents
        : chosen?.referenceCents ??
          (preserveExisting ? line?.referenceCents ?? null : null),
      reason: nextKind === 'card' ? reason : line?.reason ?? null,
      paymentMethodId:
        chosen?.paymentMethodId ??
        (preserveExisting ? line?.paymentMethodId ?? null : null),
      savingId:
        chosen?.savingId ??
        (preserveExisting ? line?.savingId ?? null : null),
      fixedId:
        chosen?.fixedId ??
        (preserveExisting ? line?.fixedId ?? null : null),
      financingId:
        chosen?.financingId ??
        (preserveExisting ? line?.financingId ?? null : null),
      relatedGroupId: preserveExisting
        ? line?.relatedGroupId ?? null
        : null,
      notes: notes.trim() || null,
      sortOrder: line?.sortOrder ?? 0,
    });
  };

  return (
    <Modal
      visible={visible}
      onClose={onClose}
      title={line ? t('closing.line.editTitle') : t('closing.line.addTitle')}
      closeLabel={t('closing.actions.close')}
      scrollable
      footer={
        <View style={styles.footer}>
          <Button
            label={t('closing.actions.cancel')}
            variant='outline'
            onPress={onClose}
            style={styles.footerButton}
          />
          <Button
            label={t('closing.actions.save')}
            onPress={handleSave}
            style={styles.footerButton}
          />
        </View>
      }
    >
      <View style={styles.form}>
        <SelectField<string>
          label={t('closing.fields.sourceData')}
          value={sourceKey}
          options={sourceOptions}
          onChange={handleSourceChange}
          closeLabel={t('closing.actions.close')}
          renderValue={(option) =>
            option ? (
              renderSourceOption(option)
            ) : (
              <AppText color='muted'>{t('closing.fields.sourceData')}</AppText>
            )
          }
          renderOption={(option) => renderSourceOption(option)}
        />
        <AppText variant='caption' color='muted'>
          {t('closing.sources.usedHint')}
        </AppText>
        <SelectField<ClosingSection>
          label={t('closing.fields.section')}
          value={selectedSection}
          options={[
            {
              label: t('closing.sections.available'),
              value: 'available',
            },
            {
              label: t('closing.sections.obligations'),
              value: 'obligation',
            },
            {
              label: t('closing.sections.resolution'),
              value: 'resolution',
            },
          ]}
          onChange={setSelectedSection}
          closeLabel={t('closing.actions.close')}
        />
        <TextField
          label={t('closing.fields.label')}
          value={label}
          onChangeText={setLabel}
          placeholder={t('closing.fields.label')}
        />
        <MoneyField
          label={
            isCard ? t('closing.cards.actual') : t('closing.fields.amount')
          }
          value={amountCents}
          onChangeCents={setAmountCents}
        />
        {isResolution ? (
          <>
            <SelectField<ClosingDirection>
              label={t('closing.fields.direction')}
              value={direction}
              options={[
                { label: t('closing.directions.from'), value: 'from' },
                { label: t('closing.directions.to'), value: 'to' },
              ]}
              onChange={setDirection}
              closeLabel={t('closing.actions.close')}
            />
            <MoneyField
              label={t('closing.fields.limit')}
              value={referenceCents ?? 0}
              onChangeCents={(value) =>
                setReferenceCents(value > 0 ? value : null)
              }
            />
          </>
        ) : (
          <SelectField<ClosingOperation>
            label={t('closing.fields.operation')}
            value={operation}
            options={[
              { label: t('closing.operations.add'), value: 'add' },
              { label: t('closing.operations.subtract'), value: 'subtract' },
            ]}
            onChange={setOperation}
            closeLabel={t('closing.actions.close')}
          />
        )}
        {isCard ? (
          <SelectField<ReasonValue>
            label={t('closing.fields.reason')}
            value={reason}
            options={reasonValues.map((value) => ({
              label: t(`closing.reasons.${value}` as never),
              value,
            }))}
            onChange={setReason}
            closeLabel={t('closing.actions.close')}
          />
        ) : null}
        <TextField
          label={t('closing.fields.notes')}
          value={notes}
          onChangeText={setNotes}
          placeholder={t('closing.fields.notes')}
          multiline
        />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  form: {
    gap: 16,
  },
  sourceOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  footer: {
    flex: 1,
    flexDirection: 'row',
    gap: 8,
  },
  footerButton: {
    flex: 1,
  },
});
