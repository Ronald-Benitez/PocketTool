import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import type { Group } from '@/src/interfaces/schema';
import { monthKey } from '@/src/lang/keys';
import { useLanguage } from '@/src/lang/LanguageContext';
import { Button } from '@/src/ui/actions/Button';
import { InlineMessage } from '@/src/ui/feedback/InlineMessage';
import { MultiSelectField } from '@/src/ui/forms/MultiSelectField';
import { Modal } from '@/src/ui/overlays/Modal';

type BudgetGroupAverageDialogProps = {
  visible: boolean;
  groups: Group[];
  currentGroupId?: number;
  onClose: () => void;
  onApply: (groupIds: number[]) => Promise<void> | void;
};

export const BudgetGroupAverageDialog = ({
  visible,
  groups,
  currentGroupId,
  onClose,
  onApply,
}: BudgetGroupAverageDialogProps) => {
  const { t } = useLanguage();
  const [selected, setSelected] = useState<number[]>([]);
  const [applying, setApplying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const options = useMemo(
    () =>
      groups.flatMap((group) =>
        group.id === undefined || group.id === currentGroupId
          ? []
          : [
              {
                label: `${group.group_name} · ${t(monthKey(group.month))} ${group.year}`,
                value: group.id,
              },
            ]
      ),
    [groups, currentGroupId, t]
  );

  useEffect(() => {
    if (!visible) return;
    setSelected([]);
    setError(null);
  }, [visible]);

  const apply = async () => {
    if (selected.length === 0) {
      setError(t('budget.toast.empty'));
      return;
    }
    setApplying(true);
    setError(null);
    try {
      await onApply(selected);
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
      title={t('budget.averageTitle')}
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
            label={t('budget.averageApply')}
            onPress={apply}
            loading={applying}
            style={styles.footerButton}
          />
        </View>
      }
    >
      <View style={styles.form}>
        <InlineMessage variant='info' message={t('budget.averageBody')} />
        {options.length === 0 ? (
          <InlineMessage variant='warning' message={t('budget.averageNoGroups')} />
        ) : (
          <>
            <MultiSelectField
              label={t('budget.averageSelectGroups')}
              required
              values={selected}
              options={options}
              onChange={setSelected}
              searchable
              searchPlaceholder={t('budget.averageSelectGroups')}
              hint={t('budget.averageHint', { count: selected.length })}
            />
            {error ? <InlineMessage variant='error' message={error} /> : null}
          </>
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  form: {
    gap: 16,
  },
  footer: {
    flexDirection: 'row',
    gap: 8,
  },
  footerButton: {
    flex: 1,
  },
});
