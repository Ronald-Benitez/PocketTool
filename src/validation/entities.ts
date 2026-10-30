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

const budgetScope = z.enum(['category', 'fixed']);
const budgetSource = z.enum([
  'manual',
  'template',
  'fixed',
  'previous_month',
  'actuals',
  'group_average',
]);
const priority = z.number().int().min(1).max(3);

export const budgetPlanInputSchema = z
  .object({
    group_id: z.number().int().positive(),
    template_id: id,
    plan_name: z.string().max(120).nullable().optional(),
    alert_threshold_percent: z.number().int().min(1).max(100).optional(),
    notes: z.string().nullable().optional(),
    applied_template_at: timestamp.nullable().optional(),
    ...auditTimestamps,
  })
  .strict();

export const budgetPlanUpdateSchema = budgetPlanInputSchema.partial().extend(updateMeta);

export const budgetLineInputSchema = z
  .object({
    budget_plan_id: z.number().int().positive(),
    category_id: id,
    record_type_id: id,
    fixed_id: id,
    scope: budgetScope.optional(),
    source: budgetSource.optional(),
    template_item_id: id,
    planned_amount: cents.positive(),
    priority: priority.optional(),
    notes: z.string().nullable().optional(),
    sort_order: z.number().int().optional(),
    ...auditTimestamps,
  })
  .strict()
  .superRefine((value, ctx) => {
    if ((value.scope ?? 'category') === 'category') {
      if (!value.category_id) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['category_id'], message: 'Required' });
      }
      if (!value.record_type_id) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['record_type_id'], message: 'Required' });
      }
      if (value.fixed_id) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['fixed_id'], message: 'Not allowed' });
      }
    } else if (!value.fixed_id) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['fixed_id'], message: 'Required' });
    }
  });

export const budgetLineUpdateSchema = z
  .object({
    budget_plan_id: z.number().int().positive().optional(),
    category_id: id,
    record_type_id: id,
    fixed_id: id,
    scope: budgetScope.optional(),
    source: budgetSource.optional(),
    template_item_id: id,
    planned_amount: cents.positive().optional(),
    priority: priority.optional(),
    notes: z.string().nullable().optional(),
    sort_order: z.number().int().optional(),
    ...auditTimestamps,
    ...updateMeta,
  })
  .strict();

export const budgetTemplateInputSchema = z
  .object({
    template_name: z.string().min(1).max(120),
    description: z.string().nullable().optional(),
    is_default: z.boolean().or(z.number().int().min(0).max(1)).optional(),
    notes: z.string().nullable().optional(),
    ...auditTimestamps,
  })
  .strict();

export const budgetTemplateUpdateSchema =
  budgetTemplateInputSchema.partial().extend(updateMeta);

export const budgetTemplateItemInputSchema = z
  .object({
    budget_template_id: z.number().int().positive(),
    amount: cents.positive(),
    record_type_id: z.number().int().positive(),
    category_id: z.number().int().positive(),
    fixed_id: id,
    scope: budgetScope.optional(),
    priority: priority.optional(),
    notes: z.string().nullable().optional(),
    sort_order: z.number().int().optional(),
    ...auditTimestamps,
  })
  .strict();

export const budgetTemplateItemUpdateSchema =
  budgetTemplateItemInputSchema.partial().extend(updateMeta);

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
