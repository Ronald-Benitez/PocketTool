import { useSQLiteContext } from 'expo-sqlite';
import { z } from 'zod';

import { ORM, useORM } from '@/src/orm';
import { withExclusiveTransaction } from '@/src/db/transaction';
import type {
  Financing,
  FinancingAdjustment,
  FinancingPayment,
  FinancingWithRelations,
  Insertable,
  RecordEntry,
  VehicleExpenseLink,
} from '@/src/interfaces/schema';
import {
  financingAdjustmentInputSchema,
  financingInputSchema,
  financingPaymentInputSchema,
  financingUpdateSchema,
  recordInputSchema,
} from '@/src/validation/entities';

export type FinancingLinkMode = 'create' | 'link' | 'none';

export type FinancingRecordOption = {
  id: number;
  name: string;
  date: number;
  amount: number;
  categoryId: number | null;
  categoryName: string;
  paymentMethodId: number | null;
  paymentMethodName: string;
  groupId: number | null;
  groupName: string;
};

export type FinancingPaymentRecordInput = {
  linkMode: FinancingLinkMode;
  recordId?: number | null;
  groupId?: number | null;
  categoryId?: number | null;
  paymentMethodId?: number | null;
  recordTypeId?: number | null;
};

const isSameDay = (left: number, right: number) => {
  const a = new Date(left);
  const b = new Date(right);
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
};

export const useFinancingsRepository = () => {
  const db = useSQLiteContext();
  const financingsOrm = useORM('Financings');
  const paymentsOrm = useORM('FinancingPayments');
  const adjustmentsOrm = useORM('FinancingAdjustments');
  const recordsOrm = useORM('Records');
  const vehicleLinksOrm = useORM('VehicleExpenseLinks');

  const fetchFinancings = async (): Promise<FinancingWithRelations[]> => {
    const [rows, payments, adjustments] = await Promise.all([
      financingsOrm.joinMany([
        'PaymentMethods',
        'Categories',
        'RecordTypes',
      ]).getAll() as Promise<FinancingWithRelations[]>,
      paymentsOrm.getAll() as Promise<FinancingPayment[]>,
      adjustmentsOrm.getAll() as Promise<FinancingAdjustment[]>,
    ]);

    return rows.map((row) => ({
      ...row,
      FinancingPayments: payments
        .filter((payment) => payment.financing_id === row.id)
        .sort((a, b) => b.date - a.date),
      FinancingAdjustments: adjustments
        .filter((adjustment) => adjustment.financing_id === row.id)
        .sort((a, b) => b.date - a.date),
    }));
  };

  const saveFinancing = async (
    input: z.infer<typeof financingInputSchema> & { id?: number }
  ) => {
    const { id, ...values } = input;
    const payload =
      id !== undefined
        ? financingUpdateSchema.parse(values)
        : financingInputSchema.parse(values);
    if (id !== undefined) {
      await financingsOrm.update(id, payload);
      return id;
    }
    return financingsOrm.insert(payload as Insertable<Financing>);
  };

  const deleteFinancing = async (id: number) => {
    await withExclusiveTransaction(db, async (txn) => {
      const payments = new ORM(txn, 'FinancingPayments');
      const adjustments = new ORM(txn, 'FinancingAdjustments');
      const financings = new ORM(txn, 'Financings');
      await payments.deleteWhere('financing_id', id);
      await adjustments.deleteWhere('financing_id', id);
      await financings.delete(id);
    });
  };

  const searchRecords = async ({
    from,
    to,
    amountMin,
    amountMax,
    categoryId,
    paymentMethodId,
    search,
    paymentId,
  }: {
    from?: number;
    to?: number;
    amountMin?: number;
    amountMax?: number;
    categoryId?: number;
    paymentMethodId?: number;
    search?: string;
    paymentId?: number;
  }): Promise<FinancingRecordOption[]> => {
    const [payments, vehicleLinks] = await Promise.all([
      paymentsOrm.getAll() as Promise<FinancingPayment[]>,
      vehicleLinksOrm.getAll() as Promise<VehicleExpenseLink[]>,
    ]);

    const linked = new Set<number>();
    for (const payment of payments) {
      if (payment.id === paymentId) continue;
      if (payment.record_id != null) linked.add(payment.record_id);
    }
    for (const link of vehicleLinks) {
      if (link.record_id != null) linked.add(link.record_id);
    }

    let query = recordsOrm
      .joinMany(['Categories', 'PaymentMethods', 'RecordTypes', 'Groups'])
      .where('RecordTypes.effect', '-');
    if (from != null) query = query.where('date', from, '>=');
    if (to != null) query = query.where('date', to, '<=');
    if (amountMin != null) query = query.where('amount', amountMin, '>=');
    if (amountMax != null) query = query.where('amount', amountMax, '<=');
    if (categoryId) query = query.where('category_id', categoryId);
    if (paymentMethodId) {
      query = query.where('payment_method_id', paymentMethodId);
    }
    if (search?.trim()) {
      query = query.where('record_name', `%${search.trim()}%`, 'LIKE');
    }
    const rows = (await query.order('date', 'DESC').getAll()) as any[];

    return rows
      .filter((row) => !linked.has(row.id))
      .map((row) => ({
        id: row.id as number,
        name: row.record_name as string,
        date: row.date as number,
        amount: row.amount as number,
        categoryId: row.category_id ?? null,
        categoryName: row.Categories?.category_name ?? '',
        paymentMethodId: row.payment_method_id ?? null,
        paymentMethodName: row.PaymentMethods?.method_name ?? '',
        groupId: row.group_id ?? null,
        groupName: row.Groups?.group_name ?? '',
      }));
  };

  const savePayment = async (
    input: z.infer<typeof financingPaymentInputSchema> & {
      id?: number;
      record?: FinancingPaymentRecordInput;
    }
  ) => {
    const { id, record, ...values } = input;
    return withExclusiveTransaction(db, async (txn) => {
      const payments = new ORM(txn, 'FinancingPayments');
      const records = new ORM(txn, 'Records');
      const vehicleLinks = new ORM(txn, 'VehicleExpenseLinks');
      const financings = new ORM(txn, 'Financings');

      const existing =
        id !== undefined
          ? ((await payments.getById(id)) as FinancingPayment | null)
          : null;
      if (id !== undefined && !existing) throw new Error('PAYMENT_NOT_FOUND');
      const financing = (await financings.getById(
        values.financing_id
      )) as Financing | null;
      if (!financing) throw new Error('FINANCING_NOT_FOUND');

      let recordId =
        record?.linkMode === 'none'
          ? null
          : existing?.record_id ?? null;
      let groupId = values.group_id ?? null;
      let paymentMethodId = values.payment_method_id ?? null;

      if (record?.linkMode === 'link') {
        if (!record.recordId) throw new Error('RECORD_REQUIRED');
        const linked = (await records.getById(
          record.recordId
        )) as RecordEntry | null;
        if (!linked) throw new Error('RECORD_NOT_FOUND');
        const otherPayments = (await payments
          .where('record_id', record.recordId)
          .getAll()) as FinancingPayment[];
        if (otherPayments.some((payment) => payment.id !== id)) {
          throw new Error('RECORD_ALREADY_LINKED');
        }
        const vehicleLink = (await vehicleLinks
          .where('record_id', record.recordId)
          .first()) as VehicleExpenseLink | null;
        if (vehicleLink) throw new Error('RECORD_ALREADY_LINKED');
        if (linked.amount !== values.amount_cents) {
          throw new Error('RECORD_AMOUNT_MISMATCH');
        }
        if (!isSameDay(linked.date, values.date)) {
          throw new Error('RECORD_DATE_MISMATCH');
        }
        recordId = record.recordId;
        groupId = linked.group_id ?? groupId;
        paymentMethodId = linked.payment_method_id ?? paymentMethodId;
      } else if (record?.linkMode === 'create') {
        const group = record.groupId ?? groupId;
        const category = record.categoryId ?? financing.category_id ?? null;
        const method =
          record.paymentMethodId ?? financing.payment_method_id ?? null;
        const recordType =
          record.recordTypeId ?? financing.record_type_id ?? null;
        if (!group) throw new Error('GROUP_REQUIRED');
        if (!category) throw new Error('CATEGORY_REQUIRED');
        if (!method) throw new Error('PAYMENT_METHOD_REQUIRED');
        if (!recordType) throw new Error('RECORD_TYPE_REQUIRED');
        const participantRows = (await new ORM(txn, 'SharedExpenseParticipants')
          .where('owner_type', 'financing')
          .where('owner_id', values.financing_id)
          .getAll()) as { share_percent: number }[];
        const sharedPercent = Math.min(
          100,
          participantRows.reduce(
            (sum, participant) => sum + participant.share_percent,
            0
          )
        );
        const sharedAmount = Math.round(
          (values.amount_cents * sharedPercent) / 100
        );

        const recordPayload = recordInputSchema.parse({
          amount: values.amount_cents,
          own_amount_cents: values.amount_cents - sharedAmount,
          shared_amount_cents: sharedAmount,
          record_name: `Payment · ${financing.name}`,
          date: values.date,
          record_type_id: recordType,
          group_id: group,
          category_id: category,
          payment_method_id: method,
        });

        if (recordId) {
          await records.update(recordId, {
            amount: recordPayload.amount,
            record_name: recordPayload.record_name,
            date: recordPayload.date,
            record_type_id: recordPayload.record_type_id,
            group_id: recordPayload.group_id,
            category_id: recordPayload.category_id,
            payment_method_id: recordPayload.payment_method_id,
          });
        } else {
          recordId = await records.insert(
            recordPayload as Insertable<RecordEntry>
          );
        }
        groupId = group;
        paymentMethodId = method;
      }

      const payload = financingPaymentInputSchema.parse({
        ...values,
        group_id: groupId,
        payment_method_id: paymentMethodId,
        record_id: recordId,
      });
      if (id !== undefined) {
        await payments.update(id, payload);
        return id;
      }
      return payments.insert(payload as Insertable<FinancingPayment>);
    });
  };

  const deletePayment = async (id: number, deleteRecord = false) => {
    await withExclusiveTransaction(db, async (txn) => {
      const payments = new ORM(txn, 'FinancingPayments');
      const records = new ORM(txn, 'Records');
      const payment = (await payments.getById(id)) as FinancingPayment | null;
      if (!payment) return;
      if (deleteRecord && payment.record_id != null) {
        await records.delete(payment.record_id);
      }
      await payments.delete(id);
    });
  };

  const fetchRecordOption = async (
    recordId: number
  ): Promise<FinancingRecordOption | null> => {
    const rows = (await recordsOrm
      .joinMany(['Categories', 'PaymentMethods', 'Groups'])
      .where('id', recordId)
      .getAll()) as any[];
    const row = rows[0];
    if (!row) return null;
    return {
      id: row.id as number,
      name: row.record_name as string,
      date: row.date as number,
      amount: row.amount as number,
      categoryId: row.category_id ?? null,
      categoryName: row.Categories?.category_name ?? '',
      paymentMethodId: row.payment_method_id ?? null,
      paymentMethodName: row.PaymentMethods?.method_name ?? '',
      groupId: row.group_id ?? null,
      groupName: row.Groups?.group_name ?? '',
    };
  };

  const saveAdjustment = async (
    input: z.infer<typeof financingAdjustmentInputSchema> & { id?: number }
  ) => {
    const { id, ...values } = input;
    const payload = financingAdjustmentInputSchema.parse(values);
    if (id !== undefined) {
      await adjustmentsOrm.update(id, payload);
      return id;
    }
    return adjustmentsOrm.insert(
      payload as Insertable<FinancingAdjustment>
    );
  };

  return {
    fetchFinancings,
    saveFinancing,
    deleteFinancing,
    savePayment,
    deletePayment,
    fetchRecordOption,
    searchRecords,
    saveAdjustment,
  };
};
