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

const distanceUnit = z.enum(['mi', 'km']);
const volumeUnit = z.enum(['gal', 'L']);
const consumptionFormat = z.enum([
  'mi_gal',
  'km_gal',
  'mi_l',
  'km_l',
  'l_100km',
  'gal_100km',
  'l_60mi',
  'gal_60mi',
]);
const odometerSource = z.enum(['manual', 'inferred']);
const distanceSource = z.enum(['odometer', 'manual', 'inferred']);
const fuelType = z.enum(['gasoline']);
const vehicleServiceType = z.enum([
  'oil_change',
  'tires',
  'brakes',
  'battery',
  'filter',
  'inspection',
  'repair',
  'other',
]);
const vehicleSettingKey = z.enum([
  'fuel',
  'maintenance',
  'repair',
  'tires',
  'oil_change',
  'insurance',
  'inspection',
  'other',
]);
const optionalPositiveReal = z.number().finite().positive().nullable().optional();

export const vehicleInputSchema = z
  .object({
    name: z.string().min(1).max(120),
    make: z.string().max(120).nullable().optional(),
    model: z.string().max(120).nullable().optional(),
    year: z.number().int().min(1900).max(2200).nullable().optional(),
    plate: z.string().max(40).nullable().optional(),
    color: z.string().max(40).nullable().optional(),
    fuel_type: fuelType.optional(),
    distance_unit: distanceUnit.optional(),
    volume_unit: volumeUnit.optional(),
    consumption_format: consumptionFormat.optional(),
    tank_capacity: optionalPositiveReal,
    tank_capacity_unit: volumeUnit.nullable().optional(),
    is_default: z.boolean().or(z.number().int().min(0).max(1)).optional(),
    notes: z.string().nullable().optional(),
    ...auditTimestamps,
  })
  .strict();

export const vehicleUpdateSchema = vehicleInputSchema.partial().extend(updateMeta);

export const vehicleFuelEntryInputSchema = z
  .object({
    vehicle_id: z.number().int().positive(),
    date: timestamp,
    odometer: optionalPositiveReal,
    odometer_source: odometerSource.nullable().optional(),
    distance_unit: distanceUnit.optional(),
    distance_traveled: optionalPositiveReal,
    distance_source: distanceSource.nullable().optional(),
    volume: z.number().finite().positive(),
    volume_unit: volumeUnit.optional(),
    price_per_unit: cents.nonnegative(),
    total_cost: cents.nonnegative(),
    is_full_tank: z.boolean().or(z.number().int().min(0).max(1)).optional(),
    station: z.string().max(120).nullable().optional(),
    notes: z.string().nullable().optional(),
    ...auditTimestamps,
  })
  .strict()
  .refine((value) => value.odometer != null || value.distance_traveled != null, {
    message: 'Odometer or distance is required',
    path: ['odometer'],
  });

export const vehicleFuelEntryUpdateSchema =
  vehicleFuelEntryInputSchema.innerType().partial().extend(updateMeta);

export const vehicleMaintenanceInputSchema = z
  .object({
    vehicle_id: z.number().int().positive(),
    date: timestamp,
    odometer: optionalPositiveReal,
    distance_unit: distanceUnit.optional(),
    service_type: vehicleServiceType,
    title: z.string().min(1).max(160),
    cost: cents.nonnegative().optional(),
    vendor: z.string().max(120).nullable().optional(),
    notes: z.string().nullable().optional(),
    ...auditTimestamps,
  })
  .strict();

export const vehicleMaintenanceUpdateSchema =
  vehicleMaintenanceInputSchema.partial().extend(updateMeta);

export const vehicleMaintenanceItemInputSchema = z
  .object({
    maintenance_id: z.number().int().positive(),
    name: z.string().min(1).max(120),
    notes: z.string().nullable().optional(),
    quantity: z.number().finite().positive().nullable().optional(),
    unit: z.string().max(40).nullable().optional(),
    cost: cents.nonnegative().nullable().optional(),
    ...auditTimestamps,
  })
  .strict();

export const vehicleMaintenanceItemUpdateSchema =
  vehicleMaintenanceItemInputSchema.partial().extend(updateMeta);

export const vehicleReminderInputSchema = z
  .object({
    vehicle_id: z.number().int().positive(),
    service_type: vehicleServiceType,
    title: z.string().min(1).max(160),
    interval_distance: optionalPositiveReal,
    interval_distance_unit: distanceUnit.nullable().optional(),
    interval_months: z.number().int().positive().nullable().optional(),
    last_service_date: timestamp.nullable().optional(),
    last_service_odometer: optionalPositiveReal,
    odometer_unit: distanceUnit.nullable().optional(),
    next_due_date: timestamp.nullable().optional(),
    next_due_odometer: optionalPositiveReal,
    is_active: z.boolean().or(z.number().int().min(0).max(1)).optional(),
    notes: z.string().nullable().optional(),
    ...auditTimestamps,
  })
  .strict()
  .refine(
    (value) => value.interval_distance != null || value.interval_months != null,
    { message: 'A distance or month interval is required', path: ['interval_distance'] }
  );

export const vehicleReminderUpdateSchema =
  vehicleReminderInputSchema.innerType().partial().extend(updateMeta);

export const vehicleSettingInputSchema = z
  .object({
    setting_key: vehicleSettingKey,
    category_id: id,
    payment_method_id: id,
    ...auditTimestamps,
  })
  .strict();

export const vehicleSettingUpdateSchema =
  vehicleSettingInputSchema.partial().extend(updateMeta);

export const vehicleExpenseLinkInputSchema = z
  .object({
    record_id: z.number().int().positive(),
    fuel_entry_id: id,
    maintenance_id: id,
  })
  .strict()
  .refine(
    (value) =>
      (value.fuel_entry_id != null && value.maintenance_id == null) ||
      (value.fuel_entry_id == null && value.maintenance_id != null),
    { message: 'Exactly one vehicle entry is required', path: ['fuel_entry_id'] }
  );

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
