import React, { useEffect, useMemo, useState } from 'react';
import { MaterialIcons } from '@expo/vector-icons';

import { BudgetTemplateItemForm } from '@/src/components/budgets/BudgetTemplateItemForm';
import { useBudgetTemplates } from '@/src/hooks/useBudgetPlan';
import type { BudgetTemplateItemView } from '@/src/domain/budgets/types';
import { useLanguage } from '@/src/lang/LanguageContext';
import { formatMoneyWithSymbol } from '@/src/utils';
import { Button } from '@/src/ui/actions/Button';
import { Badge } from '@/src/ui/data-display/Badge';
import { ListItem } from '@/src/ui/data-display/ListItem';
import { useToast } from '@/src/ui/feedback/ToastProvider';
import { SwitchField } from '@/src/ui/forms/SwitchField';
import { TextField } from '@/src/ui/forms/TextField';
import { AppText } from '@/src/ui/primitives/AppText';
import { Row, Stack } from '@/src/ui/primitives/Stack';
import { Surface } from '@/src/ui/primitives/Surface';
import { useTheme } from '@/src/ui/theme/ThemeProvider';

type BudgetTemplateEditorProps = {
  templateId: number | null;
  onClose: () => void;
};

export const BudgetTemplateEditor = ({
  templateId,
  onClose,
}: BudgetTemplateEditorProps) => {
  const { t } = useLanguage();
  const { colors } = useTheme();
  const { showToast } = useToast();
  const { templates, refresh, repository } = useBudgetTemplates();
  const [currentId, setCurrentId] = useState<number | null>(templateId);
  const template = useMemo(
    () => (currentId ? templates.find((item) => item.id === currentId) : undefined),
    [templates, currentId]
  );
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [notes, setNotes] = useState('');
  const [isDefault, setIsDefault] = useState(false);
  const [saving, setSaving] = useState(false);
  const [itemFormVisible, setItemFormVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<BudgetTemplateItemView | null>(null);

  useEffect(() => {
    if (!template) return;
    setName(template.name);
    setDescription(template.description ?? '');
    setNotes(template.notes ?? '');
    setIsDefault(template.isDefault);
  }, [template]);

  const save = async () => {
    if (name.trim().length === 0) {
      showToast({ message: t('budget.toast.empty'), type: 'warning' });
      return;
    }
    setSaving(true);
    try {
      const id = await repository.saveTemplate({
        id: currentId ?? undefined,
        template_name: name.trim(),
        description: description.trim() || null,
        notes: notes.trim() || null,
        is_default: isDefault,
      });
      if (isDefault) await repository.setDefault(id);
      await refresh();
      setCurrentId(id);
      showToast({ message: t('budget.toast.templateSaved'), type: 'success' });
    } catch {
      showToast({ message: t('budget.toast.error'), type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const openAddItem = () => {
    setSelectedItem(null);
    setItemFormVisible(true);
  };

  const openEditItem = (item: BudgetTemplateItemView) => {
    setSelectedItem(item);
    setItemFormVisible(true);
  };

  return (
    <Stack gap='lg'>
      <Row justify='space-between' align='flex-start'>
        <Row gap='sm' align='center' style={{ flex: 1 }}>
          <Button
            label={t('budget.actions.back')}
            variant='ghost'
            size='sm'
            onPress={onClose}
            leftIcon={<MaterialIcons name='arrow-back' size={18} color={colors.primary} />}
          />
          <Stack gap='xxs' style={{ flex: 1 }}>
            <AppText variant='title'>
              {currentId ? t('budget.templates.edit') : t('budget.templates.add')}
            </AppText>
            <AppText color='muted'>{t('budget.templates.subtitle')}</AppText>
          </Stack>
        </Row>
        <Button label={t('budget.templates.save')} size='sm' onPress={save} loading={saving} />
      </Row>

      <Surface variant='raised' padding='lg'>
        <Stack gap='md'>
          <TextField
            label={t('budget.templates.name')}
            required
            value={name}
            onChangeText={setName}
            placeholder={t('budget.templates.namePlaceholder')}
          />
          <TextField
            label={t('budget.templates.description')}
            value={description}
            onChangeText={setDescription}
            placeholder={t('budget.templates.descriptionPlaceholder')}
          />
          <TextField
            label={t('budget.templates.notes')}
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={3}
          />
          <SwitchField
            label={t('budget.templates.setDefault')}
            value={isDefault}
            onChange={setIsDefault}
          />
          <Row justify='space-between' align='center'>
            <Stack gap='xxs'>
              <AppText variant='label'>{t('budget.templates.total')}</AppText>
              <AppText variant='subtitle'>
                {formatMoneyWithSymbol(template?.totalCents ?? 0)}
              </AppText>
            </Stack>
            {template?.isDefault ? (
              <Badge label={t('budget.templates.defaultBadge')} tone='primary' />
            ) : null}
          </Row>
        </Stack>
      </Surface>

      {!currentId ? (
        <Surface variant='muted' padding='lg'>
          <AppText color='muted'>{t('budget.templates.noItems')}</AppText>
        </Surface>
      ) : (
        <Stack gap='sm'>
          <Row justify='space-between' align='center'>
            <AppText variant='subtitle'>{t('budget.templates.items')}</AppText>
            <Button
              label={t('budget.templates.addItem')}
              size='sm'
              variant='ghost'
              onPress={openAddItem}
              leftIcon={<MaterialIcons name='add' size={18} color={colors.primary} />}
            />
          </Row>
          {!template || template.items.length === 0 ? (
            <Surface variant='muted' padding='lg'>
              <AppText color='muted'>{t('budget.templates.noItems')}</AppText>
            </Surface>
          ) : (
            <Surface variant='outlined' padding='none'>
              {template.items.map((item, index) => (
                <ListItem
                  key={item.id}
                  title={item.categoryName}
                  subtitle={`${item.typeName} · ${t('budget.lines.priority')} ${
                    item.priority === 1
                      ? t('budget.lines.high')
                      : item.priority === 3
                        ? t('budget.lines.low')
                        : t('budget.lines.medium')
                  }`}
                  trailing={
                    <Stack gap='xxs' align='flex-end'>
                      <AppText>{formatMoneyWithSymbol(item.amountCents)}</AppText>
                      {item.fixedName ? (
                        <AppText variant='caption' color='muted'>
                          {item.fixedName}
                        </AppText>
                      ) : null}
                    </Stack>
                  }
                  onPress={() => openEditItem(item)}
                  showDivider={index < template.items.length - 1}
                />
              ))}
            </Surface>
          )}
        </Stack>
      )}

      {currentId ? (
        <BudgetTemplateItemForm
          visible={itemFormVisible}
          templateId={currentId}
          item={selectedItem}
          onClose={() => setItemFormVisible(false)}
          onSaved={refresh}
        />
      ) : null}
    </Stack>
  );
};
