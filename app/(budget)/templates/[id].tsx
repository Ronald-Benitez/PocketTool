import React, { useEffect, useMemo, useState } from 'react';
import { MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';

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
import { Screen } from '@/src/ui/primitives/Screen';
import { Row, Stack } from '@/src/ui/primitives/Stack';
import { Surface } from '@/src/ui/primitives/Surface';
import { useTheme } from '@/src/ui/theme/ThemeProvider';

const TemplateEditor = () => {
  const { t } = useLanguage();
  const { colors } = useTheme();
  const router = useRouter();
  const { showToast } = useToast();
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const rawId = Array.isArray(params.id) ? params.id[0] : params.id;
  const isNew = !rawId || rawId === 'new';
  const templateId = isNew ? null : Number(rawId);
  const { templates, refresh, repository } = useBudgetTemplates();
  const template = useMemo(
    () => (templateId ? templates.find((item) => item.id === templateId) : undefined),
    [templates, templateId]
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
        id: templateId ?? undefined,
        template_name: name.trim(),
        description: description.trim() || null,
        notes: notes.trim() || null,
        is_default: isDefault,
      });
      if (isDefault) await repository.setDefault(id);
      await refresh();
      showToast({ message: t('budget.toast.templateSaved'), type: 'success' });
      if (isNew) {
        router.replace({
          pathname: '/(budget)/templates/[id]',
          params: { id },
        });
      }
      else router.back();
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
    <Screen scroll edges={['left', 'right']}>
      <Stack gap='lg'>
        <Row justify='space-between' align='flex-start'>
          <Stack gap='xxs' style={{ flex: 1 }}>
            <AppText variant='title'>
              {isNew ? t('budget.templates.add') : t('budget.templates.edit')}
            </AppText>
            <AppText color='muted'>{t('budget.templates.subtitle')}</AppText>
          </Stack>
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

        {isNew ? (
          <InlineNewHint />
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
      </Stack>

      {templateId ? (
        <BudgetTemplateItemForm
          visible={itemFormVisible}
          templateId={templateId}
          item={selectedItem}
          onClose={() => setItemFormVisible(false)}
          onSaved={refresh}
        />
      ) : null}
    </Screen>
  );
};

const InlineNewHint = () => {
  const { t } = useLanguage();
  return (
    <Surface variant='muted' padding='lg'>
      <AppText color='muted'>{t('budget.templates.noItems')}</AppText>
    </Surface>
  );
};

export default TemplateEditor;
