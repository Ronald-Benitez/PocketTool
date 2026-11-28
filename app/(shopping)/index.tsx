import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Platform, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';

import { useShoppingListsRepository } from '@/src/db';
import { mapDatabaseError } from '@/src/db/errors';
import { calculateShoppingTotal } from '@/src/domain/shopping/totals';
import { formatQuantity } from '@/src/domain/shopping/units';
import type {
  ShoppingListFilter,
  ShoppingListView,
} from '@/src/db/repositories/shoppingLists';
import { ShoppingItemForm } from '@/src/components/shopping/ShoppingItemForm';
import type { ShoppingItemDraft } from '@/src/components/shopping/ShoppingItemForm';
import { ShoppingListForm } from '@/src/components/shopping/ShoppingListForm';
import { ShoppingPurchaseForm } from '@/src/components/shopping/ShoppingPurchaseForm';
import { ReceiptScanModal } from '@/src/components/shopping/ReceiptScanModal';
import { useGroupRefresh } from '@/src/hooks/useGroupRefresh';
import { useLanguage } from '@/src/lang/LanguageContext';
import useRecordsStore from '@/src/stores/RecordsStore';
import { formatMoneyWithSymbol } from '@/src/utils';
import { Button } from '@/src/ui/actions/Button';
import { IconButton } from '@/src/ui/actions/IconButton';
import { Badge } from '@/src/ui/data-display/Badge';
import { ListItem } from '@/src/ui/data-display/ListItem';
import { SectionCard } from '@/src/ui/data-display/SectionCard';
import { EmptyState } from '@/src/ui/feedback/EmptyState';
import { InlineMessage } from '@/src/ui/feedback/InlineMessage';
import { LoadingState } from '@/src/ui/feedback/LoadingState';
import { useToast } from '@/src/ui/feedback/ToastProvider';
import { ConfirmDialog } from '@/src/ui/overlays/Dialog';
import { SelectField } from '@/src/ui/forms/SelectField';
import { AppText } from '@/src/ui/primitives/AppText';
import { Screen } from '@/src/ui/primitives/Screen';
import { Row, Stack } from '@/src/ui/primitives/Stack';
import { Surface } from '@/src/ui/primitives/Surface';
import { useTheme } from '@/src/ui/theme/ThemeProvider';

const FILTERS: ShoppingListFilter[] = ['open', 'closed', 'all'];

const shoppingErrorKey = (message: string) => {
  if (!message.startsWith('SHOPPING_')) return null;
  const suffix = message.slice('SHOPPING_'.length).toLowerCase();
  return suffix.replace(/_([a-z])/g, (_, letter: string) =>
    letter.toUpperCase()
  );
};

const Index = () => {
  const { t } = useLanguage();
  const { colors } = useTheme();
  const { showToast } = useToast();
  const { group } = useRecordsStore();
  const { refreshGroupData } = useGroupRefresh();
  const repository = useShoppingListsRepository();
  const router = useRouter();

  const [filter, setFilter] = useState<ShoppingListFilter>('open');
  const [lists, setLists] = useState<ShoppingListView[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  const [listFormVisible, setListFormVisible] = useState(false);
  const [listFormEditing, setListFormEditing] = useState(false);
  const [listFormBusy, setListFormBusy] = useState(false);
  const [listFormError, setListFormError] = useState<string | null>(null);

  const [itemFormVisible, setItemFormVisible] = useState(false);
  const [itemFormBusy, setItemFormBusy] = useState(false);
  const [itemFormError, setItemFormError] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<{
    id: number;
    item_name: string;
    price_cents: number | null;
    quantity: number | null;
    unit: string | null;
  } | null>(null);

  const [purchaseVisible, setPurchaseVisible] = useState(false);
  const [purchaseList, setPurchaseList] = useState<ShoppingListView | null>(
    null
  );
  const [purchaseInitial, setPurchaseInitial] = useState<{
    amountCents: number | null;
    date: number | null;
  } | null>(null);
  const [scanVisible, setScanVisible] = useState(false);
  const [closeVisible, setCloseVisible] = useState(false);
  const [deleteListVisible, setDeleteListVisible] = useState(false);
  const [deleteItemId, setDeleteItemId] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);

  const listsRef = useRef<ShoppingListView[]>([]);
  const hasLoadedRef = useRef(false);
  const appliedListParamRef = useRef<string | null>(null);
  const { listId: listIdParam } = useLocalSearchParams<{ listId?: string }>();

  useEffect(() => {
    listsRef.current = lists;
  }, [lists]);

  const refresh = () => setRefreshKey((value) => value + 1);

  useEffect(() => {
    let active = true;
    if (!hasLoadedRef.current) setLoading(true);
    repository
      .fetchLists('all')
      .then((rows) => {
        if (!active) return;
        setLists(rows);
        setSelectedId((current) => {
          if (current != null && rows.some((row) => row.id === current)) {
            return current;
          }
          return rows[0]?.id ?? null;
        });
      })
      .catch((cause) => {
        if (!active) return;
        if (__DEV__) console.warn('[shopping] list failed', cause);
        const mapped = mapDatabaseError(cause, t('toast.error'));
        showToast({
          message: t(`dbErrors.${mapped.code}` as never),
          type: 'error',
        });
      })
      .finally(() => {
        if (!active) return;
        hasLoadedRef.current = true;
        setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [refreshKey]);

  const selected = useMemo(
    () => lists.find((list) => list.id === selectedId) ?? null,
    [lists, selectedId]
  );

  useEffect(() => {
    if (!listIdParam || appliedListParamRef.current === listIdParam) return;
    const id = Number(listIdParam);
    if (!Number.isFinite(id)) return;
    if (lists.some((list) => list.id === id)) {
      setSelectedId(id);
      appliedListParamRef.current = listIdParam;
      router.setParams({ listId: undefined } as never);
    }
  }, [listIdParam, lists]);

  const visibleLists = useMemo(
    () =>
      filter === 'all'
        ? lists
        : lists.filter((list) => list.status === filter),
    [lists, filter]
  );

  const listOptions = visibleLists.flatMap((list) =>
    list.id == null ? [] : [{ label: list.list_name, value: list.id }]
  );

  const handleError = (cause: unknown) => {
    if (__DEV__) console.warn('[shopping] operation failed', cause);
    const message = cause instanceof Error ? cause.message : '';
    const key = shoppingErrorKey(message);
    if (key) {
      showToast({
        message: t(`shopping.errors.${key}` as never),
        type: 'error',
      });
      return;
    }
    const mapped = mapDatabaseError(cause, t('toast.error'));
    showToast({
      message: t(`dbErrors.${mapped.code}` as never),
      type: 'error',
    });
  };

  const submitList = async (name: string) => {
    if (!name) return;
    setListFormBusy(true);
    setListFormError(null);
    try {
      if (listFormEditing && selected?.id) {
        await repository.renameList(selected.id, name);
        showToast({
          message: t('shopping.toast.listRenamed'),
          type: 'success',
        });
      } else {
        const id = await repository.createList(name);
        setSelectedId(id);
        showToast({
          message: t('shopping.toast.listCreated'),
          type: 'success',
        });
      }
      setListFormVisible(false);
      setFilter('open');
      refresh();
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : '';
      const key = shoppingErrorKey(message);
      if (key) {
        setListFormError(t(`shopping.errors.${key}` as never));
      } else {
        const mapped = mapDatabaseError(cause, t('toast.error'));
        setListFormError(t(`dbErrors.${mapped.code}` as never));
      }
    } finally {
      setListFormBusy(false);
    }
  };

  const submitItem = async (draft: ShoppingItemDraft) => {
    if (!selected?.id || !draft.item_name) return;
    setItemFormBusy(true);
    setItemFormError(null);
    try {
      if (editingItem) {
        await repository.updateItem(editingItem.id, draft);
        showToast({
          message: t('shopping.toast.itemUpdated'),
          type: 'success',
        });
      } else {
        await repository.addItem({
          shopping_list_id: selected.id,
          ...draft,
        });
        showToast({
          message: t('shopping.toast.itemAdded'),
          type: 'success',
        });
      }
      setItemFormVisible(false);
      setEditingItem(null);
      refresh();
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : '';
      const key = shoppingErrorKey(message);
      if (key) {
        setItemFormError(t(`shopping.errors.${key}` as never));
      } else {
        const mapped = mapDatabaseError(cause, t('toast.error'));
        setItemFormError(t(`dbErrors.${mapped.code}` as never));
      }
    } finally {
      setItemFormBusy(false);
    }
  };

  const updateItemCheckedLocally = (itemId: number, checked: boolean) => {
    setLists((current) => {
      const next = current.map((list) => {
        if (list.id !== selectedId) return list;
        const items = list.items.map((item) =>
          item.id === itemId
            ? { ...item, is_checked: checked ? 1 : 0 }
            : item
        );
        const total = calculateShoppingTotal(
          items.map((item) => ({
            priceCents: item.price_cents ?? null,
            isChecked: Boolean(item.is_checked),
          }))
        );
        return {
          ...list,
          items,
          checkedCount: total.checkedCount,
          pricedCheckedCount: total.pricedCheckedCount,
          totalCents: total.totalCents,
          isPartial: total.isPartial,
        };
      });
      listsRef.current = next;
      return next;
    });
  };

  const toggleItem = async (itemId: number, checked: boolean) => {
    const previous = listsRef.current;
    updateItemCheckedLocally(itemId, checked);
    try {
      await repository.toggleItem(itemId, checked);
    } catch (cause) {
      setLists(previous);
      handleError(cause);
    }
  };

  const confirmClose = async () => {
    if (!selected?.id) return;
    setBusy(true);
    try {
      await repository.closeList(selected.id);
      setCloseVisible(false);
      setFilter('closed');
      showToast({
        message: t('shopping.toast.listClosed'),
        type: 'success',
      });
      refresh();
      setPurchaseList(null);
      setPurchaseInitial(null);
      setPurchaseVisible(true);
    } catch (cause) {
      handleError(cause);
      setCloseVisible(false);
    } finally {
      setBusy(false);
    }
  };

  const confirmDeleteList = async () => {
    if (!selected?.id) return;
    setBusy(true);
    try {
      await repository.deleteList(selected.id);
      setDeleteListVisible(false);
      setSelectedId(null);
      showToast({
        message: t('shopping.toast.listDeleted'),
        type: 'success',
      });
      refresh();
    } catch (cause) {
      handleError(cause);
    } finally {
      setBusy(false);
    }
  };

  const confirmDeleteItem = async () => {
    if (deleteItemId == null) return;
    setBusy(true);
    try {
      await repository.deleteItem(deleteItemId);
      setDeleteItemId(null);
      showToast({
        message: t('shopping.toast.itemDeleted'),
        type: 'success',
      });
      refresh();
    } catch (cause) {
      handleError(cause);
    } finally {
      setBusy(false);
    }
  };

  const unlinkRecord = async () => {
    if (!selected?.id) return;
    setBusy(true);
    try {
      await repository.unlinkRecord(selected.id);
      showToast({
        message: t('shopping.toast.unlinked'),
        type: 'success',
      });
      refresh();
    } catch (cause) {
      handleError(cause);
    } finally {
      setBusy(false);
    }
  };

  const purchaseSaved = () => {
    setPurchaseList(null);
    setPurchaseInitial(null);
    if (group?.id) {
      refreshGroupData(group.id).catch((cause) => {
        if (__DEV__) console.warn('[shopping] group refresh failed', cause);
      });
    }
    refresh();
  };

  const handleScanCreated = async (
    listId: number,
    amountCents: number | null,
    date: number | null
  ) => {
    setScanVisible(false);
    try {
      const list = await repository.fetchList(listId);
      if (!list) return;
      setFilter('closed');
      setLists((current) => [
        list,
        ...current.filter((item) => item.id !== listId),
      ]);
      setSelectedId(listId);
      setPurchaseList(list);
      setPurchaseInitial({ amountCents, date });
      setPurchaseVisible(true);
      showToast({
        message: t('shopping.scan.created'),
        type: 'success',
      });
      refresh();
    } catch (cause) {
      handleError(cause);
    }
  };

  const openNewList = () => {
    setListFormEditing(false);
    setListFormError(null);
    setListFormVisible(true);
  };

  const openRename = () => {
    if (!selected) return;
    setListFormEditing(true);
    setListFormError(null);
    setListFormVisible(true);
  };

  const openNewItem = () => {
    setEditingItem(null);
    setItemFormError(null);
    setItemFormVisible(true);
  };

  const openEditItem = (item: ShoppingListView['items'][number]) => {
    if (item.id == null) return;
    setEditingItem({
      id: item.id,
      item_name: item.item_name,
      price_cents: item.price_cents ?? null,
      quantity: item.quantity ?? null,
      unit: item.unit ?? null,
    });
    setItemFormError(null);
    setItemFormVisible(true);
  };

  return (
    <Screen scroll>
      <Stack gap='lg'>
        <SectionCard
          title={t('shopping.title')}
          subtitle={t('shopping.subtitle')}
          icon={
            <MaterialCommunityIcons
              name='cart-outline'
              size={20}
              color={colors.primary}
            />
          }
          action={
            <Row gap='xs' align='center'>
              {Platform.OS === 'android' ? (
                <IconButton
                  icon={
                    <MaterialCommunityIcons
                      name='camera-outline'
                      size={20}
                      color={colors.primary}
                    />
                  }
                  label={t('shopping.scan.title')}
                  size='sm'
                  onPress={() => setScanVisible(true)}
                />
              ) : null}
              <Button
                label={t('shopping.actions.newList')}
                size='sm'
                onPress={openNewList}
              />
            </Row>
          }
          tooltip={{
            title: t('shopping.title'),
            body: t('help.topics.shopping.summary'),
          }}
        >
          <Stack gap='md'>
            {loading ? (
              <LoadingState message={t('shopping.title')} />
            ) : lists.length === 0 ? (
              <EmptyState
                title={t('shopping.list.empty')}
                description={t('shopping.list.emptyBody')}
              />
            ) : (
              <SelectField<number>
                label={t('shopping.list.selector')}
                value={selected?.id ?? null}
                options={listOptions}
                onChange={(id) => setSelectedId(id)}
                title={t('shopping.list.selectorTitle')}
                placeholder={t('shopping.list.choose')}
                emptyMessage={t('shopping.list.emptyFiltered')}
                extra={
                  <Row gap='sm'>
                    {FILTERS.map((value) => (
                      <Button
                        key={value}
                        label={t(`shopping.filters.${value}`)}
                        size='sm'
                        variant={filter === value ? 'primary' : 'outline'}
                        onPress={() => setFilter(value)}
                        style={{ flex: 1 }}
                      />
                    ))}
                  </Row>
                }
                renderTrigger={() => (
                  <Surface variant='outlined' padding='md' style={{ width: '100%' }}>
                    <Row justify='space-between' align='center' gap='sm'>
                      <Row gap='sm' align='center' style={{ flex: 1 }}>
                        <MaterialCommunityIcons
                          name={
                            selected?.status === 'closed'
                              ? 'cart-check'
                              : 'cart-outline'
                          }
                          size={22}
                          color={
                            selected?.status === 'closed'
                              ? colors.success
                              : colors.primary
                          }
                        />
                        <Stack flex={1} gap='xs'>
                          <AppText variant='label' numberOfLines={1}>
                            {selected?.list_name ?? t('shopping.list.choose')}
                          </AppText>
                          {selected ? (
                            <AppText
                              variant='caption'
                              color='muted'
                              numberOfLines={1}
                            >
                              {t('shopping.list.items', {
                                count: selected.itemCount,
                              })}{' '}
                              · {formatMoneyWithSymbol(selected.totalCents)}
                            </AppText>
                          ) : null}
                        </Stack>
                      </Row>
                      <Row gap='sm' align='center'>
                        {selected ? (
                          <Badge
                            label={
                              selected.status === 'closed'
                                ? t('shopping.status.closed')
                                : t('shopping.status.open')
                            }
                            tone={
                              selected.status === 'closed'
                                ? 'success'
                                : 'info'
                            }
                            size='sm'
                          />
                        ) : null}
                        <MaterialIcons
                          name='expand-more'
                          size={22}
                          color={colors.textMuted}
                        />
                      </Row>
                    </Row>
                  </Surface>
                )}
                renderOption={(option) => {
                  const list = visibleLists.find(
                    (item) => item.id === option.value
                  );
                  return (
                    <Row gap='sm' align='center'>
                      <MaterialCommunityIcons
                        name={
                          list?.status === 'closed'
                            ? 'cart-check'
                            : 'cart-outline'
                        }
                        size={20}
                        color={
                          list?.status === 'closed'
                            ? colors.success
                            : colors.primary
                        }
                      />
                      <Stack flex={1} gap='xs'>
                        <AppText variant='body' numberOfLines={1}>
                          {option.label}
                        </AppText>
                        {list ? (
                          <AppText variant='caption' color='muted'>
                            {t('shopping.list.items', {
                              count: list.itemCount,
                            })}{' '}
                            · {formatMoneyWithSymbol(list.totalCents)} ·{' '}
                            {list.status === 'closed'
                              ? t('shopping.status.closed')
                              : t('shopping.status.open')}
                          </AppText>
                        ) : null}
                      </Stack>
                    </Row>
                  );
                }}
              />
            )}
          </Stack>
        </SectionCard>

        {selected ? (
          <SectionCard
            title={selected.list_name}
            subtitle={`${t('shopping.list.checked', {
              checked: selected.checkedCount,
              total: selected.itemCount,
            })}`}
            action={
              <Row gap='sm'>
                {selected.status === 'open' ? (
                  <IconButton
                    icon={
                      <Ionicons
                        name='create-outline'
                        size={20}
                        color={colors.text}
                      />
                    }
                    label={t('shopping.actions.editList')}
                    size='sm'
                    onPress={openRename}
                  />
                ) : null}
                <IconButton
                  icon={
                    <Ionicons
                      name='trash-outline'
                      size={20}
                      color={colors.danger ?? colors.text}
                    />
                  }
                  label={t('shopping.actions.deleteList')}
                  size='sm'
                  onPress={() => setDeleteListVisible(true)}
                />
              </Row>
            }
          >
            <Stack gap='md'>
              <Surface variant='muted' padding='md'>
                <Row justify='space-between' align='center'>
                  <AppText variant='caption' color='muted'>
                    {t('shopping.total.label')}
                  </AppText>
                  <AppText variant='title'>
                    {formatMoneyWithSymbol(selected.totalCents)}
                  </AppText>
                </Row>
                {selected.isPartial ? (
                  <InlineMessage
                    variant='warning'
                    message={t('shopping.total.partial', {
                      count: selected.items.filter(
                        (item) => item.is_checked && item.price_cents == null
                      ).length,
                    })}
                  />
                ) : null}
              </Surface>

              {selected.items.length === 0 ? (
                <EmptyState title={t('shopping.list.noItems')} />
              ) : (
                <View>
                  {selected.items.map((item, index) => {
                    const itemId = item.id as number;
                    const checked = Boolean(item.is_checked);
                    const priceText =
                      item.price_cents == null
                        ? t('shopping.item.noPrice')
                        : formatMoneyWithSymbol(item.price_cents);
                    const quantityText =
                      item.quantity != null
                        ? `${formatQuantity(item.quantity)} ${
                            item.unit
                              ? t(
                                  `shopping.item.units.${item.unit}` as never
                                )
                              : ''
                          }`.trim()
                        : null;
                    return (
                      <ListItem
                        key={itemId}
                        title={item.item_name}
                        subtitle={
                          quantityText
                            ? `${priceText} · ${quantityText}`
                            : priceText
                        }
                        leading={
                          <IconButton
                            icon={
                              <Ionicons
                                name={
                                  checked
                                    ? 'checkmark-circle'
                                    : 'ellipse-outline'
                                }
                                size={24}
                                color={
                                  checked
                                    ? colors.success
                                    : colors.textMuted ?? colors.text
                                }
                              />
                            }
                            label={
                              checked
                                ? t('shopping.item.toggleUnchecked', {
                                    name: item.item_name,
                                  })
                                : t('shopping.item.toggleChecked', {
                                    name: item.item_name,
                                  })
                            }
                            size='sm'
                            disabled={selected.status === 'closed'}
                            selected={checked}
                            onPress={() => toggleItem(itemId, !checked)}
                          />
                        }
                        trailing={
                          selected.status === 'open' ? (
                            <Row gap='xs'>
                              <IconButton
                                icon={
                                  <Ionicons
                                    name='create-outline'
                                    size={18}
                                    color={colors.text}
                                  />
                                }
                                label={t('shopping.item.editTitle')}
                                size='sm'
                                onPress={() => openEditItem(item)}
                              />
                              <IconButton
                                icon={
                                  <Ionicons
                                    name='trash-outline'
                                    size={18}
                                    color={colors.danger ?? colors.text}
                                  />
                                }
                                label={t('shopping.item.deleteTitle')}
                                size='sm'
                                onPress={() => setDeleteItemId(itemId)}
                              />
                            </Row>
                          ) : null
                        }
                        showDivider={index < selected.items.length - 1}
                      />
                    );
                  })}
                </View>
              )}

              {selected.status === 'open' ? (
                <Row gap='sm'>
                  <Button
                    label={t('shopping.actions.addItem')}
                    variant='outline'
                    size='sm'
                    onPress={openNewItem}
                    style={{ flex: 1 }}
                  />
                  <Button
                    label={t('shopping.actions.closeList')}
                    size='sm'
                    onPress={() => setCloseVisible(true)}
                    style={{ flex: 1 }}
                  />
                </Row>
              ) : selected.record_id != null ? (
                <Surface variant='muted' padding='md'>
                  <Stack gap='xs'>
                    <AppText variant='caption' color='muted'>
                      {t('shopping.record.linked')}
                    </AppText>
                    <AppText variant='body'>
                      {selected.recordName ?? t('shopping.record.missing')}
                    </AppText>
                    {selected.recordAmount != null ? (
                      <AppText variant='caption' color='muted'>
                        {formatMoneyWithSymbol(selected.recordAmount)}
                        {selected.recordDate
                          ? ` · ${new Date(
                              selected.recordDate
                            ).toLocaleDateString()}`
                          : ''}
                      </AppText>
                    ) : null}
                    {selected.recordDeleted ? (
                      <>
                        <InlineMessage
                          variant='warning'
                          message={t('shopping.record.missing')}
                        />
                        <Button
                          label={t('shopping.actions.unlink')}
                          variant='outline'
                          size='sm'
                          onPress={unlinkRecord}
                          loading={busy}
                        />
                      </>
                    ) : null}
                  </Stack>
                </Surface>
              ) : (
                <Button
                  label={t('shopping.actions.registerPurchase')}
                  onPress={() => {
                    setPurchaseList(null);
                    setPurchaseInitial(null);
                    setPurchaseVisible(true);
                  }}
                />
              )}
            </Stack>
          </SectionCard>
        ) : null}
      </Stack>

      <ShoppingListForm
        visible={listFormVisible}
        initialName={listFormEditing ? selected?.list_name ?? '' : ''}
        isEditing={listFormEditing}
        busy={listFormBusy}
        error={listFormError}
        onClose={() => setListFormVisible(false)}
        onSubmit={submitList}
      />

      <ShoppingItemForm
        visible={itemFormVisible}
        initial={
          editingItem
            ? {
                item_name: editingItem.item_name,
                price_cents: editingItem.price_cents,
                quantity: editingItem.quantity,
                unit: editingItem.unit,
              }
            : null
        }
        isEditing={editingItem != null}
        busy={itemFormBusy}
        error={itemFormError}
        onClose={() => {
          setItemFormVisible(false);
          setEditingItem(null);
        }}
        onSubmit={submitItem}
      />

      <ShoppingPurchaseForm
        visible={purchaseVisible}
        list={purchaseList ?? selected}
        initialAmountCents={purchaseInitial?.amountCents}
        initialDate={purchaseInitial?.date}
        onClose={() => {
          setPurchaseVisible(false);
          setPurchaseList(null);
          setPurchaseInitial(null);
        }}
        onSaved={purchaseSaved}
      />

      <ReceiptScanModal
        visible={scanVisible}
        onClose={() => setScanVisible(false)}
        onCreated={handleScanCreated}
      />

      <ConfirmDialog
        visible={closeVisible}
        title={t('shopping.list.closeTitle')}
        message={t('shopping.list.closeMessage')}
        confirmLabel={t('shopping.actions.closeList')}
        cancelLabel={t('cancel')}
        tone='default'
        loading={busy}
        onConfirm={confirmClose}
        onCancel={() => setCloseVisible(false)}
        closeLabel={t('cancel')}
      />

      <ConfirmDialog
        visible={deleteListVisible}
        title={t('shopping.list.deleteTitle')}
        message={t('shopping.list.deleteMessage')}
        confirmLabel={t('delete')}
        cancelLabel={t('cancel')}
        tone='danger'
        loading={busy}
        onConfirm={confirmDeleteList}
        onCancel={() => setDeleteListVisible(false)}
        closeLabel={t('cancel')}
      />

      <ConfirmDialog
        visible={deleteItemId != null}
        title={t('shopping.item.deleteTitle')}
        message={t('shopping.item.deleteMessage')}
        confirmLabel={t('delete')}
        cancelLabel={t('cancel')}
        tone='danger'
        loading={busy}
        onConfirm={confirmDeleteItem}
        onCancel={() => setDeleteItemId(null)}
        closeLabel={t('cancel')}
      />
    </Screen>
  );
};

export default Index;
