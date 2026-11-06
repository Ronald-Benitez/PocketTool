import React, { useState } from 'react';
import { View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

import { BudgetTemplateEditor } from '@/src/components/budgets/BudgetTemplateEditor';
import { useBudgetTemplates } from '@/src/hooks/useBudgetPlan';
import type { BudgetTemplateView } from '@/src/domain/budgets/types';
import { useLanguage } from '@/src/lang/LanguageContext';
import { formatMoneyWithSymbol } from '@/src/utils';
import { Button } from '@/src/ui/actions/Button';
import { Badge } from '@/src/ui/data-display/Badge';
import { ListItem } from '@/src/ui/data-display/ListItem';
import { EmptyState } from '@/src/ui/feedback/EmptyState';
import { LoadingState } from '@/src/ui/feedback/LoadingState';
import { useToast } from '@/src/ui/feedback/ToastProvider';
import { ConfirmDialog } from '@/src/ui/overlays/Dialog';
import { AppText } from '@/src/ui/primitives/AppText';
import { Screen } from '@/src/ui/primitives/Screen';
import { Row, Stack } from '@/src/ui/primitives/Stack';
import { Surface } from '@/src/ui/primitives/Surface';
import { useTheme } from '@/src/ui/theme/ThemeProvider';

const Index = () => {
  const { t } = useLanguage();
  const { colors } = useTheme();
  const { showToast } = useToast();
  const { templates, loading, refresh, repository } = useBudgetTemplates();
  const [editingId, setEditingId] = useState<number | null | undefined>(undefined);
  const [selected, setSelected] = useState<BudgetTemplateView | null>(null);
  const [deleting, setDeleting] = useState(false);

  const duplicate = async (template: BudgetTemplateView) => {
    try {
      await repository.duplicateTemplate(template.id);
      await refresh();
      showToast({ message: t('budget.toast.templateSaved'), type: 'success' });
    } catch {
      showToast({ message: t('budget.toast.error'), type: 'error' });
    }
  };

  const setDefault = async (template: BudgetTemplateView) => {
    try {
      await repository.setDefault(template.id);
      await refresh();
    } catch {
      showToast({ message: t('budget.toast.error'), type: 'error' });
    }
  };

  const remove = async () => {
    if (!selected) return;
    setDeleting(true);
    try {
      await repository.deleteTemplate(selected.id);
      setSelected(null);
      await refresh();
      showToast({ message: t('budget.toast.templateDeleted'), type: 'success' });
    } catch {
      showToast({ message: t('budget.toast.error'), type: 'error' });
    } finally {
      setDeleting(false);
    }
  };

  if (editingId !== undefined) {
    return (
      <Screen scroll edges={['left', 'right']}>
        <BudgetTemplateEditor
          templateId={editingId}
          onClose={() => {
            setEditingId(undefined);
            refresh();
          }}
        />
      </Screen>
    );
  }

  return (
    <Screen scroll edges={['left', 'right']}>
      <Stack gap='lg'>
        <Row justify='space-between' align='flex-start'>
          <Stack gap='xxs' style={{ flex: 1 }}>
            <AppText variant='title'>{t('budget.templates.title')}</AppText>
            <AppText color='muted'>{t('budget.templates.subtitle')}</AppText>
          </Stack>
          <Button
            label={t('budget.templates.add')}
            size='sm'
            onPress={() => setEditingId(null)}
          />
        </Row>

        {loading && templates.length === 0 ? (
          <LoadingState message={t('budget.templates.title')} />
        ) : templates.length === 0 ? (
          <EmptyState
            title={t('budget.templates.emptyTitle')}
            description={t('budget.templates.emptyBody')}
            icon={<MaterialIcons name='dashboard-customize' size={28} color={colors.textMuted} />}
            action={
              <Button
                label={t('budget.templates.add')}
                onPress={() => setEditingId(null)}
              />
            }
          />
        ) : (
          <Stack gap='md'>
            {templates.map((template) => (
              <Surface key={template.id} variant='outlined' padding='none'>
                <ListItem
                  title={template.name}
                  subtitle={
                    template.description ||
                    `${template.items.length} · ${formatMoneyWithSymbol(template.totalCents)}`
                  }
                  leading={
                    <View
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 18,
                        backgroundColor: colors.surfaceMuted,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <MaterialIcons name='dashboard-customize' size={20} color={colors.primary} />
                    </View>
                  }
                  trailing={
                    <Stack gap='xs' align='flex-end'>
                      {template.isDefault ? (
                        <Badge label={t('budget.templates.defaultBadge')} tone='primary' size='sm' />
                      ) : null}
                      <AppText variant='caption' color='muted'>
                        {formatMoneyWithSymbol(template.totalCents)}
                      </AppText>
                    </Stack>
                  }
                  onPress={() => setEditingId(template.id)}
                />
                <Row gap='xs' wrap style={{ paddingHorizontal: 12, paddingBottom: 12 }}>
                  <Button
                    label={t('budget.templates.duplicate')}
                    size='sm'
                    variant='ghost'
                    onPress={() => duplicate(template)}
                  />
                  {!template.isDefault ? (
                    <Button
                      label={t('budget.templates.setDefault')}
                      size='sm'
                      variant='ghost'
                      onPress={() => setDefault(template)}
                    />
                  ) : null}
                  <Button
                    label={t('budget.templates.delete')}
                    size='sm'
                    variant='ghost'
                    onPress={() => setSelected(template)}
                  />
                </Row>
              </Surface>
            ))}
          </Stack>
        )}
      </Stack>

      <ConfirmDialog
        visible={Boolean(selected)}
        title={t('budget.templates.delete')}
        message={t('budget.confirm.deleteTemplate')}
        confirmLabel={t('budget.templates.delete')}
        cancelLabel={t('budget.actions.cancel')}
        tone='danger'
        loading={deleting}
        onConfirm={remove}
        onCancel={() => setSelected(null)}
      />
    </Screen>
  );
};

export default Index;
