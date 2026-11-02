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
} from '@/src/interfaces/schema';
import {
  financingAdjustmentInputSchema,
  financingInputSchema,
  financingPaymentInputSchema,
  financingUpdateSchema,
} from '@/src/validation/entities';

export const useFinancingsRepository = () => {
  const db = useSQLiteContext();
  const financingsOrm = useORM('Financings');
  const paymentsOrm = useORM('FinancingPayments');
  const adjustmentsOrm = useORM('FinancingAdjustments');

  const fetchFinancings = async (): Promise<FinancingWithRelations[]> => {
    const [rows, payments, adjustments] = await Promise.all([
      financingsOrm.getAll() as Promise<Financing[]>,
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

  const savePayment = async (
    input: z.infer<typeof financingPaymentInputSchema> & { id?: number }
  ) => {
    const { id, ...values } = input;
    const payload = financingPaymentInputSchema.parse(values);
    if (id !== undefined) {
      await paymentsOrm.update(id, payload);
      return id;
    }
    return paymentsOrm.insert(payload as Insertable<FinancingPayment>);
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
    saveAdjustment,
  };
};
