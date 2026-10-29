import { z } from 'zod';

const id = z.number().int().nonnegative().nullable().optional();
const cents = z.number().int().finite();
const timestamp = z.number().int().finite();
const auditTimestamps = {
  created_at: timestamp.nullable().optional(),
  updated_at: timestamp.nullable().optional(),
};
const updateMeta = {
  id: z.number().int().positive().optional(),
  deleted_at: timestamp.nullable().optional(),
};

export const groupInputSchema = z
  .object({
    group_name: z.string().min(1),
    goal: cents,
    year: z.number().int().min(1970).max(9999),
    month: z.number().int(),
    ...auditTimestamps,
  })
  .strict();

export const groupUpdateSchema = groupInputSchema.partial().extend(updateMeta);

export const recordInputSchema = z
  .object({
    amount: cents,
    record_name: z.string().min(1),
    date: timestamp,
    record_type_id: id,
    group_id: id,
    category_id: id,
    payment_method_id: id,
    fixed_id: id,
    paid_credit_id: id,
    ...auditTimestamps,
  })
  .strict();

export const recordUpdateSchema = recordInputSchema.partial().extend(updateMeta);

export const paidCreditInputSchema = z
  .object({
    amount: cents,
    date: timestamp,
    group_id: id,
    payment_method_id: id,
    ...auditTimestamps,
  })
  .strict();

export const paidCreditUpdateSchema = paidCreditInputSchema.partial().extend(updateMeta);

export const budgetInputSchema = z
  .object({
    amount: cents,
    record_type_id: id,
    group_id: id,
    category_id: id,
    ...auditTimestamps,
  })
  .strict();

export const budgetUpdateSchema = budgetInputSchema.partial().extend(updateMeta);

export const savingInputSchema = z
  .object({
    saving_name: z.string().min(1),
    amount: cents,
    ...auditTimestamps,
  })
  .strict();

export const savingUpdateSchema = savingInputSchema.partial().extend(updateMeta);

export const paymentMethodInputSchema = z
  .object({
    method_name: z.string().min(1),
    closing_date: z.number().int().min(0).max(31).nullable().optional(),
    payment_date: z.number().int().min(0).max(31).nullable().optional(),
    payment_type_id: id,
    ...auditTimestamps,
  })
  .strict();

export const paymentMethodUpdateSchema = paymentMethodInputSchema.partial().extend(updateMeta);
