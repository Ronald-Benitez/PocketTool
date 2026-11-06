import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import type {
  BudgetApplyMode,
  BudgetTemplateView,
} from '@/src/domain/budgets/types';
import { useLanguage } from '@/src/lang/LanguageContext';
import { Button } from '@/src/ui/actions/Button';
import { AppText } from '@/src/ui/primitives/AppText';
import { InlineMessage } from '@/src/ui/feedback/InlineMessage';
import { SelectField } from '@/src/ui/forms/SelectField';
import { ConfirmDialog } from '@/src/ui/overlays/Dialog';
import { Modal } from '@/src/ui/overlays/Modal';

type BudgetTemplateApplyDialogProps = {
  visible: boolean;
  templates: BudgetTemplateView[];
  onClose: () => void;
  onApply: (templateId: number, mode: BudgetApplyMode) => Promise<void> | void;
};

export const BudgetTemplateApplyDialog = ({
  visible,
  templates,
  onClose,
  onApply,
}: BudgetTemplateApplyDialogProps) => {
  const { t } = useLanguage();
  const [templateId, setTemplateId] = useState<number | null>(null);
  const [mode, setMode] = useState<BudgetApplyMode>('merge');
  const [applying, setApplying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmVisible, setConfirmVisible] = useState(false);

  useEffect(() => {
    if (!visible) return;
    setTemplateId(templates[0]?.id ?? null);
    setMode('merge');
    setError(null);
  }, [visible, templates]);

  const hint =
    mode === 'merge'
      ? t('budget.templates.mergeHint')
      : mode === 'replace'
        ? t('budget.templates.replaceHint')
        : t('budget.templates.resetHint');

  const apply = async () => {
    if (!templateId) {
      setError(t('budget.toast.empty'));
      return;
    }
    if (mode !== 'merge') {
      setConfirmVisible(true);
      return;
    }
    await runApply();
  };

  const runApply = async () => {
    if (!templateId) return;
    setApplying(true);
    setError(null);
    try {
      await onApply(templateId, mode);
      setConfirmVisible(false);
      onClose();
    } catch {
      setError(t('budget.toast.error'));
    } finally {
      setApplying(false);
    }
  };

  return (
    <Modal
      visible={visible}
      onClose={onClose}
      title={t('budget.templates.applyTitle')}
      closeLabel={t('budget.actions.cancel')}
      scrollable
      footer={
        <View style={styles.footer}>
          <Button
            label={t('budget.actions.cancel')}
            variant='outline'
            onPress={onClose}
            style={styles.footerButton}
          />
          <Button
            label={t('budget.templates.apply')}
            onPress={apply}
            loading={applying}
            style={styles.footerButton}
          />
        </View>
      }
    >
      <View style={styles.form}>
        <AppText color='muted'>{t('budget.templates.applyBody')}</AppText>
        <SelectField
          label={t('budget.templates.name')}
          required
          value={templateId}
          options={templates.map((template) => ({
            label: template.name,
            value: template.id,
          }))}
          onChange={(value) => setTemplateId(value)}
          searchable
          searchPlaceholder={t('budget.templates.name')}
        />
        <SelectField
          label={t('budget.templates.mode')}
          value={mode}
          options={[
            { label: t('budget.templates.merge'), value: 'merge' },
            { label: t('budget.templates.replace'), value: 'replace' },
            { label: t('budget.templates.reset'), value: 'reset' },
          ]}
          onChange={(value) => setMode(value)}
        />
        <InlineMessage variant={mode === 'replace' ? 'warning' : 'info'} message={hint} />
        {error ? <InlineMessage variant='error' message={error} /> : null}
      </View>
      <ConfirmDialog
        visible={confirmVisible}
        title={t('budget.templates.applyTitle')}
        message={
          mode === 'replace'
            ? t('budget.confirm.replacePlan')
            : t('budget.confirm.resetPlan')
        }
        confirmLabel={t('budget.templates.apply')}
        cancelLabel={t('budget.actions.cancel')}
        tone={mode === 'replace' ? 'danger' : 'default'}
        loading={applying}
        onConfirm={runApply}
        onCancel={() => setConfirmVisible(false)}
      />
    </Modal>
  );
};

const styles = StyleSheet.create({
  form: {
    gap: 16,
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
