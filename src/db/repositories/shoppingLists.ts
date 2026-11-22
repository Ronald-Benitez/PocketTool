import { useSQLiteContext } from 'expo-sqlite';

import { mapDatabaseError } from '@/src/db/errors';
import { withExclusiveTransaction } from '@/src/db/transaction';
import { groupPeriodContains } from '@/src/domain/groups/period';
import { calculateShoppingTotal } from '@/src/domain/shopping/totals';
import { ORM, useORM } from '@/src/orm';
import type {
  FinancingPayment,
  Group,
  Insertable,
  RecordEntry,
  RecordType,
  SavingsHistoryEntry,
  ShoppingList,
  ShoppingListItem,
  VehicleExpenseLink,
} from '@/src/interfaces/schema';
import {
  recordInputSchema,
  shoppingListItemInputSchema,
  shoppingListItemUpdateSchema,
  shoppingListInputSchema,
  shoppingListUpdateSchema,
} from '@/src/validation/entities';

export type ShoppingListFilter = 'open' | 'closed' | 'all';
export type ShoppingPurchaseMode = 'create' | 'link' | 'none';

export type ShoppingListItemView = ShoppingListItem;

export type ShoppingListView = ShoppingList & {
  items: ShoppingListItemView[];
  itemCount: number;
  checkedCount: number;
  pricedCheckedCount: number;
  totalCents: number;
  isPartial: boolean;
  recordName: string | null;
  recordAmount: number | null;
  recordDate: number | null;
  recordGroupId: number | null;
  recordDeleted: boolean;
};

export type ShoppingRecordOption = {
  id: number;
  name: string;
  date: number;
  amount: number;
  categoryId: number | null;
  categoryName: string;
  paymentMethodId: number | null;
  paymentMethodName: string;
  recordTypeId: number | null;
  recordTypeName: string;
  groupId: number | null;
  groupName: string;
};

export type ShoppingPurchaseInput = {
  mode: ShoppingPurchaseMode;
  amountCents?: number | null;
  date?: number | null;
  groupId?: number | null;
  recordTypeId?: number | null;
  categoryId?: number | null;
  paymentMethodId?: number | null;
  recordId?: number | null;
  recordName?: string | null;
};

const SHOPPING_ERROR_PREFIX = 'SHOPPING_';

const shoppingError = (code: string) =>
  new Error(`${SHOPPING_ERROR_PREFIX}${code}`);

const rethrowShoppingError = (error: unknown, fallback: string): never => {
  if (
    error instanceof Error &&
    error.message.startsWith(SHOPPING_ERROR_PREFIX)
  ) {
    throw error;
  }
  throw mapDatabaseError(error, fallback);
};

const sameDay = (left: number, right: number) => {
  const a = new Date(left);
  const b = new Date(right);
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
};

const loadItems = async (
  orm: ORM<'ShoppingListItems'>,
  listIds?: number[]
): Promise<ShoppingListItem[]> => {
  let query = orm.order('sort_order', 'ASC').order('id', 'ASC');
  if (listIds && listIds.length === 0) return [];
  if (listIds) {
    query = query.where('shopping_list_id', listIds as never, 'IN');
  }
  return (await query.getAll()) as ShoppingListItem[];
};

export const useShoppingListsRepository = () => {
  const db = useSQLiteContext();
  const listsOrm = useORM('ShoppingLists');
  const itemsOrm = useORM('ShoppingListItems');
  const recordsOrm = useORM('Records');

  const buildView = async (
    list: ShoppingList,
    items: ShoppingListItem[]
  ): Promise<ShoppingListView> => {
    const total = calculateShoppingTotal(
      items.map((item) => ({
        priceCents: item.price_cents ?? null,
        isChecked: Boolean(item.is_checked),
      }))
    );

    let recordName: string | null = null;
    let recordAmount: number | null = null;
    let recordDate: number | null = null;
    let recordGroupId: number | null = null;
    let recordDeleted = false;

    if (list.record_id != null) {
      const record = (await recordsOrm.getById(list.record_id, {
        includeDeleted: true,
      })) as RecordEntry | null;
      if (record) {
        recordName = record.record_name;
        recordAmount = record.amount;
        recordDate = record.date;
        recordGroupId = record.group_id ?? null;
        recordDeleted = Boolean(record.deleted_at);
      } else {
        recordDeleted = true;
      }
    }

    return {
      ...list,
      items,
      itemCount: items.length,
      checkedCount: total.checkedCount,
      pricedCheckedCount: total.pricedCheckedCount,
      totalCents: total.totalCents,
      isPartial: total.isPartial,
      recordName,
      recordAmount,
      recordDate,
      recordGroupId,
      recordDeleted,
    };
  };

  const fetchLists = async (
    filter: ShoppingListFilter = 'all'
  ): Promise<ShoppingListView[]> => {
    try {
      let query = listsOrm.order('id', 'DESC');
      if (filter !== 'all') query = query.where('status', filter);
      const lists = (await query.getAll()) as ShoppingList[];
      const items = await loadItems(
        itemsOrm,
        lists
          .map((list) => list.id)
          .filter((id): id is number => id != null)
      );
      const byList = new Map<number, ShoppingListItem[]>();
      for (const item of items) {
        const bucket = byList.get(item.shopping_list_id) ?? [];
        bucket.push(item);
        byList.set(item.shopping_list_id, bucket);
      }
      return await Promise.all(
        lists.map((list) =>
          buildView(list, byList.get(list.id as number) ?? [])
        )
      );
    } catch (error) {
      throw mapDatabaseError(error, 'Could not load shopping lists');
    }
  };

  const fetchList = async (id: number): Promise<ShoppingListView | null> => {
    try {
      const list = (await listsOrm.getById(id)) as ShoppingList | null;
      if (!list) return null;
      const items = await loadItems(itemsOrm, [id]);
      return await buildView(list, items);
    } catch (error) {
      throw mapDatabaseError(error, 'Could not load the shopping list');
    }
  };

  const createList = async (listName: string): Promise<number> => {
    try {
      const payload = shoppingListInputSchema.parse({
        list_name: listName.trim(),
        status: 'open',
      });
      return await listsOrm.insert(payload as Insertable<ShoppingList>);
    } catch (error) {
      throw rethrowShoppingError(error, 'Could not create the shopping list');
    }
  };

  const renameList = async (id: number, listName: string): Promise<void> => {
    try {
      const list = (await listsOrm.getById(id)) as ShoppingList | null;
      if (!list) throw shoppingError('LIST_NOT_FOUND');
      if (list.status === 'closed') throw shoppingError('LIST_CLOSED');
      const payload = shoppingListUpdateSchema.parse({
        list_name: listName.trim(),
      });
      await listsOrm.update(id, payload);
    } catch (error) {
      throw rethrowShoppingError(error, 'Could not rename the shopping list');
    }
  };

  const deleteList = async (id: number): Promise<void> => {
    try {
      await withExclusiveTransaction(db, async (txn) => {
        const lists = new ORM(txn, 'ShoppingLists');
        const items = new ORM(txn, 'ShoppingListItems');
        const list = (await lists.getById(id)) as ShoppingList | null;
        if (!list) throw shoppingError('LIST_NOT_FOUND');
        await items.deleteWhere('shopping_list_id', id);
        await lists.delete(id);
      });
    } catch (error) {
      throw rethrowShoppingError(error, 'Could not delete the shopping list');
    }
  };

  const assertOpenList = async (
    orm: ORM<'ShoppingLists'>,
    listId: number
  ): Promise<ShoppingList> => {
    const list = (await orm.getById(listId)) as ShoppingList | null;
    if (!list) throw shoppingError('LIST_NOT_FOUND');
    if (list.status === 'closed') throw shoppingError('LIST_CLOSED');
    return list;
  };

  const addItem = async (input: {
    shopping_list_id: number;
    item_name: string;
    price_cents?: number | null;
  }): Promise<number> => {
    try {
      return await withExclusiveTransaction(db, async (txn) => {
        const lists = new ORM(txn, 'ShoppingLists');
        await assertOpenList(lists, input.shopping_list_id);
        const items = new ORM(txn, 'ShoppingListItems');
        const last = (await items
          .where('shopping_list_id', input.shopping_list_id)
          .order('sort_order', 'DESC')
          .first()) as ShoppingListItem | null;
        const payload = shoppingListItemInputSchema.parse({
          shopping_list_id: input.shopping_list_id,
          item_name: input.item_name.trim(),
          price_cents:
            input.price_cents != null && input.price_cents > 0
              ? input.price_cents
              : null,
          is_checked: false,
          sort_order: (last?.sort_order ?? -1) + 1,
        });
        return await items.insert(payload as Insertable<ShoppingListItem>);
      });
    } catch (error) {
      throw rethrowShoppingError(error, 'Could not add the item');
    }
  };

  const updateItem = async (
    id: number,
    input: { item_name?: string; price_cents?: number | null }
  ): Promise<void> => {
    try {
      await withExclusiveTransaction(db, async (txn) => {
        const items = new ORM(txn, 'ShoppingListItems');
        const item = (await items.getById(id)) as ShoppingListItem | null;
        if (!item) throw shoppingError('ITEM_NOT_FOUND');
        await assertOpenList(
          new ORM(txn, 'ShoppingLists'),
          item.shopping_list_id
        );
        const payload = shoppingListItemUpdateSchema.parse({
          item_name: input.item_name?.trim(),
          price_cents:
            input.price_cents === undefined
              ? undefined
              : input.price_cents != null && input.price_cents > 0
                ? input.price_cents
                : null,
        });
        await items.update(id, payload);
      });
    } catch (error) {
      throw rethrowShoppingError(error, 'Could not update the item');
    }
  };

  const toggleItem = async (id: number, isChecked: boolean): Promise<void> => {
    try {
      await withExclusiveTransaction(db, async (txn) => {
        const items = new ORM(txn, 'ShoppingListItems');
        const item = (await items.getById(id)) as ShoppingListItem | null;
        if (!item) throw shoppingError('ITEM_NOT_FOUND');
        await assertOpenList(
          new ORM(txn, 'ShoppingLists'),
          item.shopping_list_id
        );
        await items.update(id, { is_checked: isChecked ? 1 : 0 });
      });
    } catch (error) {
      throw rethrowShoppingError(error, 'Could not update the item');
    }
  };

  const deleteItem = async (id: number): Promise<void> => {
    try {
      await withExclusiveTransaction(db, async (txn) => {
        const items = new ORM(txn, 'ShoppingListItems');
        const item = (await items.getById(id)) as ShoppingListItem | null;
        if (!item) throw shoppingError('ITEM_NOT_FOUND');
        await assertOpenList(
          new ORM(txn, 'ShoppingLists'),
          item.shopping_list_id
        );
        await items.delete(id);
      });
    } catch (error) {
      throw rethrowShoppingError(error, 'Could not delete the item');
    }
  };

  const reorderItems = async (
    listId: number,
    orderedIds: number[]
  ): Promise<void> => {
    try {
      await withExclusiveTransaction(db, async (txn) => {
        await assertOpenList(new ORM(txn, 'ShoppingLists'), listId);
        const items = new ORM(txn, 'ShoppingListItems');
        for (let index = 0; index < orderedIds.length; index += 1) {
          const orderedId = orderedIds[index];
          if (orderedId == null) continue;
          const item = (await items.getById(orderedId)) as
            | ShoppingListItem
            | null;
          if (!item || item.shopping_list_id !== listId) continue;
          await items.update(item.id as number, { sort_order: index });
        }
      });
    } catch (error) {
      throw rethrowShoppingError(error, 'Could not reorder the items');
    }
  };

  const closeList = async (id: number): Promise<void> => {
    try {
      await withExclusiveTransaction(db, async (txn) => {
        const lists = new ORM(txn, 'ShoppingLists');
        const list = (await lists.getById(id)) as ShoppingList | null;
        if (!list) throw shoppingError('LIST_NOT_FOUND');
        if (list.status === 'closed') return;
        const items = await loadItems(new ORM(txn, 'ShoppingListItems'), [id]);
        if (items.length === 0) throw shoppingError('LIST_EMPTY');
        await lists.update(id, {
          status: 'closed',
          closed_at: Date.now(),
        });
      });
    } catch (error) {
      throw rethrowShoppingError(error, 'Could not close the shopping list');
    }
  };

  const listGroupsForDate = async (date: number): Promise<Group[]> => {
    try {
      const groups = (await new ORM(db, 'Groups').getAll()) as Group[];
      return groups.filter((group) => groupPeriodContains(group, date));
    } catch (error) {
      throw mapDatabaseError(error, 'Could not load groups for the date');
    }
  };

  const searchRecords = async ({
    groupId,
    from,
    to,
    amount,
    search,
  }: {
    groupId?: number | null;
    from?: number | null;
    to?: number | null;
    amount?: number | null;
    search?: string;
  }): Promise<ShoppingRecordOption[]> => {
    try {
      const [vehicleLinks, financingPayments, savingsMovements, shoppingLists] =
        await Promise.all([
          new ORM(db, 'VehicleExpenseLinks').getAll() as Promise<
            VehicleExpenseLink[]
          >,
          new ORM(db, 'FinancingPayments').getAll() as Promise<
            FinancingPayment[]
          >,
          new ORM(db, 'SavingsHistory').getAll() as Promise<
            SavingsHistoryEntry[]
          >,
          listsOrm.getAll() as Promise<ShoppingList[]>,
        ]);

      const linked = new Set<number>();
      vehicleLinks.forEach((link) => {
        if (link.record_id != null) linked.add(link.record_id);
      });
      financingPayments.forEach((payment) => {
        if (payment.record_id != null) linked.add(payment.record_id);
      });
      savingsMovements.forEach((movement) => {
        if (movement.record_id != null) linked.add(movement.record_id);
      });
      shoppingLists.forEach((list) => {
        if (list.record_id != null) linked.add(list.record_id);
      });

      let query = recordsOrm
        .joinMany(['Categories', 'PaymentMethods', 'RecordTypes', 'Groups'])
        .where('RecordTypes.effect', '-');
      if (groupId) query = query.where('group_id', groupId);
      if (from != null) query = query.where('date', from, '>=');
      if (to != null) query = query.where('date', to, '<=');
      if (amount != null) query = query.where('amount', amount);
      if (search?.trim()) {
        query = query.where('record_name', `%${search.trim()}%`, 'LIKE');
      }
      const rows = (await query.order('date', 'DESC').getAll()) as any[];
      return rows
        .filter(
          (row) =>
            !linked.has(row.id) &&
            row.paid_credit_id == null &&
            row.saving_id == null
        )
        .map((row) => ({
          id: row.id as number,
          name: row.record_name as string,
          date: row.date as number,
          amount: row.amount as number,
          categoryId: row.category_id ?? null,
          categoryName: row.Categories?.category_name ?? '',
          paymentMethodId: row.payment_method_id ?? null,
          paymentMethodName: row.PaymentMethods?.method_name ?? '',
          recordTypeId: row.record_type_id ?? null,
          recordTypeName: row.RecordTypes?.type_name ?? '',
          groupId: row.group_id ?? null,
          groupName: row.Groups?.group_name ?? '',
        }));
    } catch (error) {
      throw mapDatabaseError(
        error,
        'Could not search records for the shopping list'
      );
    }
  };

  const assertRecordAvailable = async (
    txn: Parameters<typeof withExclusiveTransaction>[0],
    recordId: number
  ) => {
    const [vehicleLinks, financingPayments, savingsMovements, shoppingLists] =
      await Promise.all([
        new ORM(txn, 'VehicleExpenseLinks')
          .where('record_id', recordId)
          .getAll() as Promise<VehicleExpenseLink[]>,
        new ORM(txn, 'FinancingPayments')
          .where('record_id', recordId)
          .getAll() as Promise<FinancingPayment[]>,
        new ORM(txn, 'SavingsHistory')
          .where('record_id', recordId)
          .getAll() as Promise<SavingsHistoryEntry[]>,
        new ORM(txn, 'ShoppingLists')
          .where('record_id', recordId)
          .getAll() as Promise<ShoppingList[]>,
      ]);
    if (
      vehicleLinks.length > 0 ||
      financingPayments.length > 0 ||
      savingsMovements.length > 0 ||
      shoppingLists.length > 0
    ) {
      throw shoppingError('RECORD_ALREADY_LINKED');
    }
  };

  const requirePurchaseFields = (
    input: ShoppingPurchaseInput
  ): {
    amountCents: number;
    date: number;
    groupId: number;
    recordTypeId: number;
    categoryId: number;
    paymentMethodId: number;
  } => {
    if (!input.amountCents || input.amountCents <= 0) {
      throw shoppingError('AMOUNT_REQUIRED');
    }
    if (!input.date) throw shoppingError('DATE_REQUIRED');
    if (!input.groupId) throw shoppingError('GROUP_REQUIRED');
    if (!input.recordTypeId) throw shoppingError('RECORD_TYPE_REQUIRED');
    if (!input.categoryId) throw shoppingError('CATEGORY_REQUIRED');
    if (!input.paymentMethodId) throw shoppingError('PAYMENT_METHOD_REQUIRED');
    return {
      amountCents: input.amountCents,
      date: input.date,
      groupId: input.groupId,
      recordTypeId: input.recordTypeId,
      categoryId: input.categoryId,
      paymentMethodId: input.paymentMethodId,
    };
  };

  const assertGroupForDate = async (
    txn: Parameters<typeof withExclusiveTransaction>[0],
    groupId: number,
    date: number
  ) => {
    const group = (await new ORM(txn, 'Groups').getById(groupId)) as
      | Group
      | null;
    if (!group) throw shoppingError('GROUP_NOT_FOUND');
    if (!groupPeriodContains(group, date)) {
      throw shoppingError('GROUP_DATE_MISMATCH');
    }
  };

  const registerPurchase = async (
    listId: number,
    input: ShoppingPurchaseInput
  ): Promise<number | null> => {
    try {
      if (input.mode === 'none') return null;
      return await withExclusiveTransaction(db, async (txn) => {
        const lists = new ORM(txn, 'ShoppingLists');
        const list = (await lists.getById(listId)) as ShoppingList | null;
        if (!list) throw shoppingError('LIST_NOT_FOUND');
        if (list.status !== 'closed') throw shoppingError('LIST_NOT_CLOSED');
        if (list.record_id != null) {
          throw shoppingError('ALREADY_RECORDED');
        }

        const fields = requirePurchaseFields(input);
        await assertGroupForDate(txn, fields.groupId, fields.date);

        let recordId: number | null = null;
        if (input.mode === 'create') {
          const payload = recordInputSchema.parse({
            amount: fields.amountCents,
            own_amount_cents: fields.amountCents,
            shared_amount_cents: 0,
            record_name:
              input.recordName?.trim() || list.list_name || 'Shopping',
            date: fields.date,
            record_type_id: fields.recordTypeId,
            group_id: fields.groupId,
            category_id: fields.categoryId,
            payment_method_id: fields.paymentMethodId,
          });
          recordId = await new ORM(txn, 'Records').insert(
            payload as Insertable<RecordEntry>
          );
        } else {
          if (!input.recordId) throw shoppingError('RECORD_REQUIRED');
          const linkedRecordId = input.recordId;
          const record = (await new ORM(txn, 'Records').getById(
            linkedRecordId
          )) as RecordEntry | null;
          if (!record) throw shoppingError('RECORD_NOT_FOUND');
          const recordType = (await new ORM(txn, 'RecordTypes').getById(
            record.record_type_id as number
          )) as RecordType | null;
          if (recordType?.effect !== '-') {
            throw shoppingError('RECORD_NOT_EXPENSE');
          }
          if (record.amount !== fields.amountCents) {
            throw shoppingError('RECORD_MISMATCH');
          }
          if (!sameDay(record.date, fields.date)) {
            throw shoppingError('RECORD_MISMATCH');
          }
          if (record.group_id && record.group_id !== fields.groupId) {
            throw shoppingError('RECORD_MISMATCH');
          }
          if (record.paid_credit_id != null || record.saving_id != null) {
            throw shoppingError('RECORD_ALREADY_LINKED');
          }
          await assertRecordAvailable(txn, linkedRecordId);
          recordId = record.id as number;
        }

        await lists.update(listId, {
          record_id: recordId,
          record_total_cents: fields.amountCents,
          purchase_date: fields.date,
        });
        return recordId;
      });
    } catch (error) {
      throw rethrowShoppingError(error, 'Could not register the purchase');
    }
  };

  const unlinkRecord = async (listId: number): Promise<void> => {
    try {
      await withExclusiveTransaction(db, async (txn) => {
        const lists = new ORM(txn, 'ShoppingLists');
        const list = (await lists.getById(listId)) as ShoppingList | null;
        if (!list) throw shoppingError('LIST_NOT_FOUND');
        if (list.record_id == null) return;
        const record = (await new ORM(txn, 'Records').getById(list.record_id, {
          includeDeleted: true,
        })) as RecordEntry | null;
        if (record && !record.deleted_at) {
          throw shoppingError('RECORD_STILL_ACTIVE');
        }
        await lists.update(listId, {
          record_id: null,
          record_total_cents: null,
          purchase_date: null,
        });
      });
    } catch (error) {
      throw rethrowShoppingError(error, 'Could not unlink the record');
    }
  };

  return {
    fetchLists,
    fetchList,
    createList,
    renameList,
    deleteList,
    addItem,
    updateItem,
    toggleItem,
    deleteItem,
    reorderItems,
    closeList,
    listGroupsForDate,
    searchRecords,
    registerPurchase,
    unlinkRecord,
  };
};

export type ShoppingListsRepository = ReturnType<
  typeof useShoppingListsRepository
>;
