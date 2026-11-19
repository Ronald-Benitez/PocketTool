import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View } from 'react-native';

import { calculateClosingTotals, validateClosing } from '@/src/domain/closing/calculator';
import {
  DAY_MS,
  deadlineFromPeriodEnd,
  endOfLocalDay,
  isClosingEditable,
  resolveClosingPeriod,
  startOfLocalDay,
} from '@/src/domain/closing/period';
import type {
  ClosingLineDraft,
  ClosingSection as ClosingSectionType,
  ClosingStatus,
} from '@/src/domain/closing/types';
import {
  lineFromDb,
  lineToInput,
  sourceKeyFromLine,
} from '@/src/components/closing/closingModel';
import { ClosingLineForm } from '@/src/components/closing/ClosingLineForm';
import { ClosingSection } from '@/src/components/closing/ClosingSection';
import type { ClosingInput } from '@/src/db';
import { useBalanceMode } from '@/src/hooks/useBalanceMode';
import { useClosingSources } from '@/src/hooks/useClosingSources';
import { useClosingSuggestions } from '@/src/hooks/useClosingSuggestions';
import { useConfigs } from '@/src/hooks/useConfigs';
import { useLanguage } from '@/src/lang/LanguageContext';
import type { Group, GroupClosingView } from '@/src/interfaces/schema';
import { Button } from '@/src/ui/actions/Button';
import { Badge } from '@/src/ui/data-display/Badge';
import { FinanceValue } from '@/src/ui/data-display/FinanceValue';
import { InlineMessage } from '@/src/ui/feedback/InlineMessage';
import { useToast } from '@/src/ui/feedback/ToastProvider';
import { DateField } from '@/src/ui/forms/DateField';
import { SelectField } from '@/src/ui/forms/SelectField';
import { SwitchField } from '@/src/ui/forms/SwitchField';
import { TextField } from '@/src/ui/forms/TextField';
import { ConfirmDialog } from '@/src/ui/overlays/Dialog';
import { AppText } from '@/src/ui/primitives/AppText';
import { Divider } from '@/src/ui/primitives/Divider';
import { Row, Stack } from '@/src/ui/primitives/Stack';
import { Surface } from '@/src/ui/primitives/Surface';
import { useTheme } from '@/src/ui/theme/ThemeProvider';

type ClosingEditorProps = {
  group: Group;
  closing: GroupClosingView | null;
  onClose: () => void;
  onSaved: () => void;
  onCreate: (input: ClosingInput) => Promise<number | null>;
  onUpdate: (id: number, input: ClosingInput) => Promise<boolean>;
};

type LineFormState = {
  visible: boolean;
  section: ClosingSectionType;
  line: ClosingLineDraft | null;
};

const emptyLineForm: LineFormState = {
  visible: false,
  section: 'available',
  line: null,
};

export const ClosingEditor = ({
  group,
  closing,
  onClose,
  onSaved,
  onCreate,
  onUpdate,
}: ClosingEditorProps) => {
  const { t } = useLanguage();
  const { colors } = useTheme();
  const { showToast } = useToast();
  const { configs } = useConfigs();
  const { mode: defaultBalanceMode } = useBalanceMode();
  const { buildSuggestions, conflictRecordIds } = useClosingSuggestions();
  const { sources } = useClosingSources();
  const initialized = useRef(false);

  const [name, setName] = useState(
    closing?.close_name ?? `${t('closing.title')} · ${group.group_name}`
  );
  const [closeDate, setCloseDate] = useState(
    closing?.close_date ?? new Date().getTime()
  );
  const [status, setStatus] = useState<ClosingStatus>(
    (closing?.status as ClosingStatus) ?? 'draft'
  );
  const [notes, setNotes] = useState(closing?.notes ?? '');
  const [periodStart, setPeriodStart] = useState(closing?.period_start ?? 0);
  const [periodEnd, setPeriodEnd] = useState(closing?.period_end ?? 0);
  const [editableUntil, setEditableUntil] = useState(
    closing?.editable_until ?? 0
  );
  const [lines, setLines] = useState<ClosingLineDraft[]>(
    closing ? closing.lines.map(lineFromDb) : []
  );
  const [lineForm, setLineForm] = useState<LineFormState>(emptyLineForm);
  const [includeReceivables, setIncludeReceivables] = useState(false);
  const [balanceMode, setBalanceMode] = useState<
    'consumption' | 'total' | 'cash' | 'paid' | 'methods'
  >(defaultBalanceMode);
  const balanceModeInitialized = useRef(false);
  const [deadlineTouched, setDeadlineTouched] = useState(Boolean(closing));
  const [confirmFinalize, setConfirmFinalize] = useState(false);
  const [confirmReopen, setConfirmReopen] = useState(false);
  const [saving, setSaving] = useState(false);

  const defaultPeriod = useMemo(() => {
    if (configs.closingPeriodMode === 'custom_range') {
      const now = new Date().getTime();
      const end = endOfLocalDay(now);
      return {
        start: startOfLocalDay(now - 29 * DAY_MS),
        end,
        editableUntil: deadlineFromPeriodEnd(
          end,
          configs.closingGraceDays
        ),
      };
    }
    return resolveClosingPeriod({
      mode: configs.closingPeriodMode,
      groupYear: group.year,
      groupMonth: group.month,
      cutoffDay: configs.closingCutoffDay,
      startDay: configs.closingStartDay,
      graceDays: configs.closingGraceDays,
    });
  }, [
      configs.closingCutoffDay,
      configs.closingGraceDays,
      configs.closingPeriodMode,
      configs.closingStartDay,
      group.month,
      group.year,
    ]
  );

  useEffect(() => {
    if (closing || initialized.current) return;
    initialized.current = true;
    setPeriodStart(defaultPeriod.start);
    setPeriodEnd(defaultPeriod.end);
    setEditableUntil(defaultPeriod.editableUntil);
  }, [closing, defaultPeriod]);

  useEffect(() => {
    if (deadlineTouched || periodEnd <= 0) return;
    setEditableUntil(
      deadlineFromPeriodEnd(periodEnd, configs.closingGraceDays)
    );
  }, [configs.closingGraceDays, deadlineTouched, periodEnd]);

  useEffect(() => {
    if (balanceModeInitialized.current) return;
    balanceModeInitialized.current = true;
    setBalanceMode(defaultBalanceMode);
  }, [defaultBalanceMode]);

  const normalizedEditableUntil =
    editableUntil > 0 ? endOfLocalDay(editableUntil) : 0;
  const editable =
    normalizedEditableUntil > 0 &&
    isClosingEditable(normalizedEditableUntil);
  const persistedEditable = closing
    ? isClosingEditable(closing.editable_until)
    : true;
  const readOnlyLines = status === 'final' || !persistedEditable;
  const canEditPeriod =
    configs.closingAllowPeriodOverride ||
    configs.closingPeriodMode === 'custom_range';
  const totals = calculateClosingTotals(lines);
  const validation = validateClosing({
    lines,
    status,
    editableUntil: normalizedEditableUntil,
  });
  const draftBlocking = validation.filter(
    (code) =>
      code !== 'CLOSING_RESOLUTION_MISMATCH' &&
      code !== 'CLOSING_RESOLUTION_WITHOUT_RESULT' &&
      code !== 'CLOSING_EMPTY_FINAL' &&
      code !== 'CLOSING_PERIOD_EXPIRED'
  );
  const blocking = status === 'final' ? validation : draftBlocking;

  const resultLabel =
    totals.resultCents < 0
      ? t('closing.summary.shortfall')
      : totals.resultCents > 0
        ? t('closing.summary.surplus')
        : t('closing.summary.balanced');

  const resetPeriod = () => {
    setPeriodStart(defaultPeriod.start);
    setPeriodEnd(defaultPeriod.end);
    setEditableUntil(defaultPeriod.editableUntil);
    setDeadlineTouched(false);
  };

  const openAddLine = (section: ClosingSectionType) => {
    setLineForm({ visible: true, section, line: null });
  };

  const openEditLine = (line: ClosingLineDraft) => {
    setLineForm({ visible: true, section: line.section, line });
  };

  const closeLineForm = () => setLineForm(emptyLineForm);

  const usedSourceKeys = useMemo(() => {
    const keys = new Set<string>();
    for (const item of lines) {
      if (lineForm.line && item === lineForm.line) continue;
      const key = sourceKeyFromLine(item);
      if (key) keys.add(key);
    }
    return keys;
  }, [lineForm.line, lines]);

  const saveLine = (line: ClosingLineDraft) => {
    const key = sourceKeyFromLine(line);
    if (
      key &&
      lines.some(
        (item) =>
          item !== lineForm.line && sourceKeyFromLine(item) === key
      )
    ) {
      showToast({ message: t('closing.sources.duplicate'), type: 'warning' });
      return;
    }
    setLines((current) => {
      let index = line.id
        ? current.findIndex((item) => item.id === line.id)
        : current.indexOf(line);
      if (index < 0) {
        index = current.findIndex(
          (item) =>
            item.id == null &&
            item.section === line.section &&
            item.label === line.label &&
            item.kind === line.kind
        );
      }
      if (index >= 0) {
        const next = [...current];
        next[index] = { ...line, sortOrder: current[index].sortOrder };
        return next;
      }
      return [
        ...current,
        {
          ...line,
          sortOrder: current.length,
        },
      ];
    });
    closeLineForm();
  };

  const deleteLine = (line: ClosingLineDraft) => {
    setLines((current) =>
      current.filter((item) =>
        line.id != null ? item.id !== line.id : item !== line
      )
    );
  };

  const handleSuggest = async () => {
    const result = await buildSuggestions({
      includeReceivables,
      balanceMode,
    });
    if (!result) return;
    const existingKeys = new Set(
      lines.map(
        (line) =>
          `${line.section}:${line.kind}:${line.paymentMethodId ?? ''}:${line.savingId ?? ''}:${line.fixedId ?? ''}:${line.financingId ?? ''}:${line.label}`
      )
    );
    const additions = result.lines.filter((line) => {
      const key = `${line.section}:${line.kind}:${line.paymentMethodId ?? ''}:${line.savingId ?? ''}:${line.fixedId ?? ''}:${line.financingId ?? ''}:${line.label}`;
      return !existingKeys.has(key);
    });
    if (additions.length === 0) {
      showToast({ message: t('closing.suggestions.empty'), type: 'info' });
      return;
    }
    setLines((current) => [
      ...current,
      ...additions.map((line, index) => ({
        ...line,
        sortOrder: current.length + index,
      })),
    ]);
    showToast({ message: t('closing.suggestions.added'), type: 'success' });
  };

  const firstValidationMessage = () => {
    const code = blocking[0];
    return code ? t(`closing.errors.${code}` as never) : null;
  };

  const buildInput = (nextStatus: ClosingStatus): ClosingInput => ({
    group_id: group.id as number,
    close_name: name.trim(),
    close_date: closeDate,
    period_start: startOfLocalDay(periodStart),
    period_end: endOfLocalDay(periodEnd),
    editable_until: endOfLocalDay(editableUntil),
    status: nextStatus,
    notes: notes.trim() || null,
    lines: lines.map(lineToInput),
  });

  const save = async (nextStatus: ClosingStatus) => {
    if (!name.trim()) {
      showToast({ message: t('toast.empty'), type: 'warning' });
      return;
    }
    if (!editable) {
      showToast({ message: t('closing.period.expired'), type: 'warning' });
      return;
    }
    const message = firstValidationMessage();
    if (message) {
      showToast({ message, type: 'warning' });
      return;
    }
    setSaving(true);
    try {
      const input = buildInput(nextStatus);
      if (closing?.id) {
        const ok = await onUpdate(closing.id, input);
        if (ok) onSaved();
      } else {
        const id = await onCreate(input);
        if (id != null) onSaved();
      }
    } finally {
      setSaving(false);
    }
  };

  const finalize = async () => {
    setConfirmFinalize(false);
    await save('final');
  };

  const reopen = async () => {
    setConfirmReopen(false);
    if (!closing?.id) return;
    const ok = await onUpdate(closing.id, buildInput('draft'));
    if (ok) {
      setStatus('draft');
      onSaved();
    }
  };

  const statusTone =
    status === 'final' ? 'success' : editable ? 'primary' : 'warning';

  return (
    <Stack gap='md'>
      <Row justify='space-between' align='center' gap='sm'>
        <View style={{ flex: 1 }}>
          <AppText variant='title'>{closing ? t('closing.edit') : t('closing.new')}</AppText>
          <AppText variant='caption' color='muted'>
            {group.group_name}
          </AppText>
        </View>
        <Badge
          label={t(
            status === 'final'
              ? 'closing.status.final'
              : editable
                ? 'closing.status.draft'
                : 'closing.status.expired'
          )}
          tone={statusTone}
        />
      </Row>

      <InlineMessage variant='info' message={t('closing.notice')} />

      {conflictRecordIds.length > 0 ? (
        <InlineMessage
          variant='warning'
          message={t('closing.warnings.cardSavingConflict', {
            count: conflictRecordIds.length,
          })}
        />
      ) : null}

      {!persistedEditable ? (
        <InlineMessage variant='warning' message={t('closing.period.expired')} />
      ) : editableUntil > 0 && !editable ? (
        <InlineMessage
          variant='warning'
          message={t('closing.period.adjustToContinue')}
        />
      ) : null}

      <Surface variant='outlined' padding='md'>
        <Stack gap='md'>
          <TextField
            label={t('closing.fields.name')}
            value={name}
            onChangeText={setName}
            placeholder={t('closing.fields.name')}
            editable={!readOnlyLines}
          />
          <DateField
            label={t('closing.fields.date')}
            value={closeDate}
            onChange={setCloseDate}
            disabled={readOnlyLines}
          />

          <Row justify='space-between' align='center'>
            <AppText variant='subtitle'>{t('closing.period.title')}</AppText>
            {!readOnlyLines ? (
              <Button
                label={t('closing.period.reset')}
                variant='outline'
                size='sm'
                onPress={resetPeriod}
              />
            ) : null}
          </Row>

          {canEditPeriod && !readOnlyLines ? (
            <>
              <DateField
                label={t('closing.period.start')}
                value={periodStart}
                onChange={setPeriodStart}
              />
              <DateField
                label={t('closing.period.end')}
                value={periodEnd}
                onChange={setPeriodEnd}
              />
              <DateField
                label={t('closing.period.editableUntil')}
                value={editableUntil}
                onChange={(value) => {
                  setEditableUntil(value);
                  setDeadlineTouched(true);
                }}
              />
              <Button
                label={t('closing.period.recalculateDeadline')}
                variant='outline'
                size='sm'
                onPress={() => {
                  setEditableUntil(
                    deadlineFromPeriodEnd(
                      periodEnd,
                      configs.closingGraceDays
                    )
                  );
                  setDeadlineTouched(false);
                }}
              />
            </>
          ) : (
            <Stack gap='xs'>
              <AppText variant='caption' color='muted'>
                {t('closing.period.start')}: {new Date(periodStart).toLocaleDateString()}
              </AppText>
              <AppText variant='caption' color='muted'>
                {t('closing.period.end')}: {new Date(periodEnd).toLocaleDateString()}
              </AppText>
              <AppText variant='caption' color='muted'>
                {t('closing.period.editableUntil')}:{' '}
                {new Date(editableUntil).toLocaleDateString()}
              </AppText>
            </Stack>
          )}
        </Stack>
      </Surface>

      {!readOnlyLines ? (
        <Stack gap='sm'>
          <SelectField<'consumption' | 'total' | 'cash' | 'paid' | 'methods'>
            label={t('closing.fields.balanceMode')}
            value={balanceMode}
            options={[
              {
                label: t('closing.balanceModes.consumption'),
                value: 'consumption',
              },
              { label: t('closing.balanceModes.total'), value: 'total' },
              { label: t('closing.balanceModes.cash'), value: 'cash' },
              { label: t('closing.balanceModes.paid'), value: 'paid' },
              { label: t('closing.balanceModes.methods'), value: 'methods' },
            ]}
            onChange={setBalanceMode}
            closeLabel={t('closing.actions.close')}
          />
          <SwitchField
            label={t('closing.suggestions.includeReceivables')}
            value={includeReceivables}
            onChange={setIncludeReceivables}
          />
          <Row gap='sm'>
            <Button
              label={t('closing.actions.suggest')}
              variant='outline'
              onPress={handleSuggest}
              style={{ flex: 1 }}
            />
            <Button
              label={t('closing.actions.addLine')}
              onPress={() => openAddLine('available')}
              style={{ flex: 1 }}
            />
          </Row>
        </Stack>
      ) : null}

      <ClosingSection
        section='available'
        title={t('closing.sections.available')}
        hint={t('closing.sectionHints.available')}
        lines={lines}
        subtotalCents={totals.availableCents}
        emptyText={t('closing.sectionHints.available')}
        readOnly={readOnlyLines}
        onAdd={() => openAddLine('available')}
        onEdit={openEditLine}
        onDelete={deleteLine}
      />

      <ClosingSection
        section='obligation'
        title={t('closing.sections.obligations')}
        hint={t('closing.sectionHints.obligations')}
        lines={lines}
        subtotalCents={totals.obligationsCents}
        emptyText={t('closing.sectionHints.obligations')}
        readOnly={readOnlyLines}
        onAdd={() => openAddLine('obligation')}
        onEdit={openEditLine}
        onDelete={deleteLine}
      />

      {totals.resultCents !== 0 ||
      lines.some((line) => line.section === 'resolution') ? (
        <ClosingSection
          section='resolution'
          title={t('closing.sections.resolution')}
          hint={t('closing.sectionHints.resolution')}
          lines={lines}
          subtotalCents={totals.totalResolutionCents}
          emptyText={t('closing.sectionHints.resolution')}
          readOnly={readOnlyLines}
          onAdd={() => openAddLine('resolution')}
          onEdit={openEditLine}
          onDelete={deleteLine}
        />
      ) : null}

      <Surface variant='raised' padding='md'>
        <Stack gap='sm'>
          <AppText variant='subtitle'>{t('closing.sections.result')}</AppText>
          <Row justify='space-between' align='center'>
            <AppText variant='label' color='muted'>
              {t('closing.summary.available')}
            </AppText>
            <FinanceValue cents={totals.availableCents} size='md' color={colors.text} />
          </Row>
          <Row justify='space-between' align='center'>
            <AppText variant='label' color='muted'>
              {t('closing.summary.obligations')}
            </AppText>
            <FinanceValue
              cents={totals.obligationsCents}
              size='md'
              color={colors.text}
            />
          </Row>
          <Divider />
          <Row justify='space-between' align='center'>
            <AppText variant='subtitle'>{resultLabel}</AppText>
            <FinanceValue
              cents={Math.abs(totals.resultCents)}
              size='lg'
              color={totals.resultCents < 0 ? colors.expense : colors.income}
            />
          </Row>
          {totals.resultCents !== 0 ? (
            <Row justify='space-between' align='center'>
              <AppText variant='caption' color='muted'>
                {t('closing.summary.remaining')}
              </AppText>
              <FinanceValue
                cents={Math.abs(totals.remainingCents)}
                size='sm'
                color={totals.remainingCents === 0 ? colors.income : colors.warning}
              />
            </Row>
          ) : null}
        </Stack>
      </Surface>

      <Surface variant='outlined' padding='md'>
        <Stack gap='sm'>
          <AppText variant='subtitle'>{t('closing.sections.notes')}</AppText>
          <TextField
            value={notes}
            onChangeText={setNotes}
            placeholder={t('closing.fields.notes')}
            multiline
            editable={!readOnlyLines}
          />
        </Stack>
      </Surface>

      {firstValidationMessage() && status === 'draft' ? (
        <InlineMessage variant='warning' message={firstValidationMessage() as string} />
      ) : null}

      <Row gap='sm'>
        <Button
          label={t('closing.actions.close')}
          variant='outline'
          onPress={onClose}
          style={{ flex: 1 }}
        />
        {!readOnlyLines ? (
          <Button
            label={t('closing.actions.saveDraft')}
            onPress={() => save('draft')}
            disabled={saving}
            style={{ flex: 1 }}
          />
        ) : null}
        {!readOnlyLines ? (
          <Button
            label={t('closing.actions.finalize')}
            onPress={() => setConfirmFinalize(true)}
            disabled={saving}
            style={{ flex: 1 }}
          />
        ) : null}
        {status === 'final' && persistedEditable ? (
          <Button
            label={t('closing.actions.reopen')}
            variant='outline'
            onPress={() => setConfirmReopen(true)}
            style={{ flex: 1 }}
          />
        ) : null}
      </Row>

      <ClosingLineForm
        visible={lineForm.visible}
        section={lineForm.section}
        line={lineForm.line}
        sources={sources}
        usedSourceKeys={usedSourceKeys}
        onClose={closeLineForm}
        onSave={saveLine}
      />

      <ConfirmDialog
        visible={confirmFinalize}
        title={t('closing.actions.finalize')}
        message={t('closing.confirm.finalize')}
        confirmLabel={t('closing.actions.finalize')}
        cancelLabel={t('closing.actions.cancel')}
        onConfirm={finalize}
        onCancel={() => setConfirmFinalize(false)}
      />
      <ConfirmDialog
        visible={confirmReopen}
        title={t('closing.actions.reopen')}
        message={t('closing.confirm.reopen')}
        confirmLabel={t('closing.actions.reopen')}
        cancelLabel={t('closing.actions.cancel')}
        onConfirm={reopen}
        onCancel={() => setConfirmReopen(false)}
      />
    </Stack>
  );
};

