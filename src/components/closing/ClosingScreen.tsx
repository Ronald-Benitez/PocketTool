import React, { useCallback, useState } from 'react';
import { Pressable, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';

import {
  DAY_MS,
  deadlineFromPeriodEnd,
  endOfLocalDay,
  isClosingEditable,
  resolveClosingPeriod,
  startOfLocalDay,
} from '@/src/domain/closing/period';
import type { ClosingStatus } from '@/src/domain/closing/types';
import { ClosingEditor } from '@/src/components/closing/ClosingEditor';
import GroupSelector from '@/src/components/groups/group-selector';
import { useClosings } from '@/src/hooks/useClosings';
import { useConfigs } from '@/src/hooks/useConfigs';
import { useGroupRefresh } from '@/src/hooks/useGroupRefresh';
import { useLanguage } from '@/src/lang/LanguageContext';
import useRecordsStore from '@/src/stores/RecordsStore';
import type { GroupClosingView } from '@/src/interfaces/schema';
import { formatMoneyWithSymbol } from '@/src/utils';
import { Button } from '@/src/ui/actions/Button';
import { IconButton } from '@/src/ui/actions/IconButton';
import { Badge } from '@/src/ui/data-display/Badge';
import { FinanceValue } from '@/src/ui/data-display/FinanceValue';
import { EmptyState } from '@/src/ui/feedback/EmptyState';
import { InlineMessage } from '@/src/ui/feedback/InlineMessage';
import { LoadingState } from '@/src/ui/feedback/LoadingState';
import { ConfirmDialog } from '@/src/ui/overlays/Dialog';
import { AppText } from '@/src/ui/primitives/AppText';
import { Divider } from '@/src/ui/primitives/Divider';
import { Row, Stack } from '@/src/ui/primitives/Stack';
import { Surface } from '@/src/ui/primitives/Surface';
import { useTheme } from '@/src/ui/theme/ThemeProvider';

export const ClosingScreen = () => {
  const { t } = useLanguage();
  const { colors } = useTheme();
  const { group } = useRecordsStore();
  const { configs } = useConfigs();
  const { refreshGroupData } = useGroupRefresh();
  const {
    closings,
    loading,
    fetchClosing,
    createClosing,
    updateClosing,
    deleteClosing,
    duplicateClosing,
  } = useClosings();
  const [editing, setEditing] = useState<
    | { mode: 'new' }
    | { mode: 'edit'; closing: GroupClosingView }
    | null
  >(null);
  const [loadingClosing, setLoadingClosing] = useState(false);
  const [toDelete, setToDelete] = useState<number | null>(null);
  const groupId = group?.id;

  useFocusEffect(
    useCallback(() => {
      if (!groupId) return;
      refreshGroupData(groupId).catch((cause) => {
        if (__DEV__) console.warn('[closing] group refresh failed', cause);
      });
    }, [groupId, refreshGroupData])
  );

  const defaultPeriod = group
    ? configs.closingPeriodMode === 'custom_range'
      ? (() => {
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
        })()
      : resolveClosingPeriod({
          mode: configs.closingPeriodMode,
          groupYear: group.year,
          groupMonth: group.month,
          cutoffDay: configs.closingCutoffDay,
          startDay: configs.closingStartDay,
          graceDays: configs.closingGraceDays,
        })
    : null;
  const defaultExpired = defaultPeriod
    ? !isClosingEditable(defaultPeriod.editableUntil)
    : false;
  const canCreate =
    Boolean(group) &&
    (configs.closingAllowPeriodOverride ||
      configs.closingPeriodMode === 'custom_range' ||
      !defaultExpired);

  const openNew = () => {
    if (!group?.id) return;
    setEditing({ mode: 'new' });
  };

  const openExisting = async (id: number) => {
    setLoadingClosing(true);
    try {
      const closing = await fetchClosing(id);
      if (closing) setEditing({ mode: 'edit', closing });
    } finally {
      setLoadingClosing(false);
    }
  };

  const handleDelete = async () => {
    const id = toDelete;
    setToDelete(null);
    if (id == null) return;
    await deleteClosing(id, group?.id);
  };

  if (!group?.id) {
    return (
      <Stack gap='lg'>
        <Row justify='center'>
          <GroupSelector />
        </Row>
        <EmptyState title={t('closing.noGroup')} />
      </Stack>
    );
  }

  if (editing) {
    return (
      <Stack gap='md'>
        <ClosingEditor
          group={group}
          closing={editing.mode === 'edit' ? editing.closing : null}
          onClose={() => setEditing(null)}
          onSaved={() => setEditing(null)}
          onCreate={createClosing}
          onUpdate={updateClosing}
        />
      </Stack>
    );
  }

  return (
    <Stack gap='lg'>
      <Row justify='center'>
        <GroupSelector />
      </Row>

      <InlineMessage variant='info' message={t('closing.notice')} />

      <Row justify='space-between' align='center' gap='sm'>
        <View style={{ flex: 1 }}>
          <AppText variant='title'>{t('closing.history')}</AppText>
          <AppText variant='caption' color='muted'>
            {group.group_name}
          </AppText>
        </View>
        <Button
          label={t('closing.new')}
          onPress={openNew}
          disabled={!canCreate}
        />
      </Row>

      {!canCreate ? (
        <InlineMessage variant='warning' message={t('closing.period.expired')} />
      ) : defaultExpired ? (
        <InlineMessage
          variant='info'
          message={t('closing.period.defaultExpiredHint')}
        />
      ) : null}

      {loadingClosing ? <LoadingState /> : null}

      {loading ? (
        <LoadingState />
      ) : closings.length === 0 ? (
        <EmptyState
          title={t('closing.empty')}
          description={t('closing.emptyHint')}
          action={
            <Button
              label={t('closing.new')}
              onPress={openNew}
              disabled={!canCreate}
            />
          }
        />
      ) : (
        <Stack gap='sm'>
          {closings.map((closing) => {
            const editable = isClosingEditable(closing.editable_until);
            const status = closing.status as ClosingStatus;
            const period = `${new Date(
              closing.period_start
            ).toLocaleDateString()} – ${new Date(
              closing.period_end
            ).toLocaleDateString()}`;
            const result = closing.result_cents;
            return (
              <Surface key={closing.id} variant='outlined' padding='md'>
                <Stack gap='sm'>
                  <Pressable onPress={() => openExisting(closing.id as number)}>
                    <Row justify='space-between' align='center' gap='sm'>
                      <View style={{ flex: 1 }}>
                        <Row gap='xs' align='center'>
                          <AppText variant='subtitle' numberOfLines={1}>
                            {closing.close_name}
                          </AppText>
                          <Badge
                            label={t(
                              status === 'final'
                                ? 'closing.status.final'
                                : editable
                                  ? 'closing.status.draft'
                                  : 'closing.status.expired'
                            )}
                            tone={
                              status === 'final'
                                ? 'success'
                                : editable
                                  ? 'primary'
                                  : 'warning'
                            }
                            size='sm'
                          />
                        </Row>
                        <AppText variant='caption' color='muted'>
                          {period}
                        </AppText>
                        <AppText variant='caption' color='muted'>
                          {t('closing.period.editableUntil')}:{' '}
                          {new Date(closing.editable_until).toLocaleDateString()}
                        </AppText>
                      </View>
                      <View style={{ alignItems: 'flex-end' }}>
                        <AppText variant='caption' color='muted'>
                          {result < 0
                            ? t('closing.summary.shortfall')
                            : result > 0
                              ? t('closing.summary.surplus')
                              : t('closing.summary.balanced')}
                        </AppText>
                        <FinanceValue
                          cents={Math.abs(result)}
                          size='md'
                          color={result < 0 ? colors.expense : colors.income}
                        />
                      </View>
                    </Row>
                  </Pressable>

                  <Divider />
                  <Row justify='space-between' align='center'>
                    <AppText variant='caption' color='muted'>
                      {t('closing.summary.remaining')}:{' '}
                      {formatMoneyWithSymbol(Math.abs(closing.remaining_cents))}
                    </AppText>
                    <Row gap='xs'>
                      <IconButton
                        label={t('closing.actions.view')}
                        variant='surface'
                        icon={
                          <MaterialIcons
                            name='visibility'
                            size={18}
                            color={colors.text}
                          />
                        }
                        onPress={() => openExisting(closing.id as number)}
                      />
                      {editable ? (
                        <IconButton
                          label={t('closing.actions.duplicate')}
                          variant='surface'
                          icon={
                            <MaterialIcons
                              name='content-copy'
                              size={18}
                              color={colors.text}
                            />
                          }
                          onPress={() =>
                            duplicateClosing(closing.id as number, group.id)
                          }
                        />
                      ) : null}
                      {editable ? (
                        <IconButton
                          label={t('closing.actions.delete')}
                          variant='surface'
                          icon={
                            <MaterialIcons
                              name='delete-outline'
                              size={18}
                              color={colors.expense}
                            />
                          }
                          onPress={() => setToDelete(closing.id as number)}
                        />
                      ) : null}
                    </Row>
                  </Row>
                </Stack>
              </Surface>
            );
          })}
        </Stack>
      )}

      <ConfirmDialog
        visible={toDelete != null}
        title={t('closing.actions.delete')}
        message={t('closing.confirm.delete')}
        confirmLabel={t('closing.actions.delete')}
        cancelLabel={t('closing.actions.cancel')}
        tone='danger'
        onConfirm={handleDelete}
        onCancel={() => setToDelete(null)}
      />
    </Stack>
  );
};

