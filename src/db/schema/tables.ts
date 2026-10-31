import type { TableDefinition, TableSchema } from '../types';

export const SCHEMA_VERSION = 7;

export type TableName =
  | 'Groups'
  | 'PaymentTypes'
  | 'PaymentMethods'
  | 'Categories'
  | 'RecordTypes'
  | 'Fixed'
  | 'Records'
  | 'PaidCredits'
  | 'BudgetTemplates'
  | 'BudgetTemplateItems'
  | 'BudgetPlans'
  | 'BudgetLines'
  | 'Savings'
  | 'SavingsHistory'
  | 'Vehicles'
  | 'VehicleFuelEntries'
  | 'VehicleMaintenance'
  | 'VehicleMaintenanceItems'
  | 'VehicleReminders'
  | 'VehicleSettings'
  | 'VehicleExpenseLinks'
  | 'Migrations';

const softDelete = { name: 'deleted_at', type: 'INTEGER', kind: 'timestamp', defaultValue: null } as const;
const createdAt = { name: 'created_at', type: 'INTEGER', kind: 'timestamp', defaultValue: null } as const;
const updatedAt = { name: 'updated_at', type: 'INTEGER', kind: 'timestamp', defaultValue: null } as const;
const timestamps = [createdAt, updatedAt] as const;

export const APP_SCHEMA: Record<TableName, TableDefinition> = {
  Groups: {
    name: 'Groups',
    sqlName: 'groups',
    entity: 'Group',
    columns: [
      { name: 'id', type: 'INTEGER', primaryKey: true, autoIncrement: true },
      { name: 'group_name', type: 'TEXT', notNull: true },
      { name: 'goal', type: 'INTEGER', kind: 'money', notNull: true },
      { name: 'year', type: 'INTEGER', notNull: true },
      { name: 'month', type: 'INTEGER', notNull: true },
      ...timestamps,
      softDelete,
    ],
    indexes: [
      { name: 'idx_groups_active', columns: ['year', 'month'], where: 'deleted_at IS NULL' },
    ],
  },
  PaymentTypes: {
    name: 'PaymentTypes',
    sqlName: 'payment_types',
    entity: 'PaymentType',
    columns: [
      { name: 'id', type: 'INTEGER', primaryKey: true, autoIncrement: true },
      { name: 'payment_type_name', type: 'TEXT', unique: true },
      { name: 'payment_color', type: 'TEXT', defaultValue: '#000000' },
      ...timestamps,
      softDelete,
    ],
  },
  PaymentMethods: {
    name: 'PaymentMethods',
    sqlName: 'payment_methods',
    entity: 'PaymentMethod',
    columns: [
      { name: 'id', type: 'INTEGER', primaryKey: true, autoIncrement: true },
      { name: 'method_name', type: 'TEXT', notNull: true, unique: true },
      { name: 'closing_date', type: 'INTEGER' },
      { name: 'payment_date', type: 'INTEGER' },
      {
        name: 'payment_type_id',
        type: 'INTEGER',
        references: { table: 'PaymentTypes', column: 'id', onDelete: 'SET NULL' },
      },
      ...timestamps,
      softDelete,
    ],
    indexes: [
      { name: 'idx_payment_methods_type', columns: ['payment_type_id'], where: 'deleted_at IS NULL' },
    ],
  },
  Categories: {
    name: 'Categories',
    sqlName: 'categories',
    entity: 'Category',
    columns: [
      { name: 'id', type: 'INTEGER', primaryKey: true, autoIncrement: true },
      { name: 'category_name', type: 'TEXT', notNull: true, unique: true },
      ...timestamps,
      softDelete,
    ],
  },
  RecordTypes: {
    name: 'RecordTypes',
    sqlName: 'record_types',
    entity: 'RecordType',
    columns: [
      { name: 'id', type: 'INTEGER', primaryKey: true, autoIncrement: true },
      { name: 'type_name', type: 'TEXT', notNull: true, unique: true },
      { name: 'effect', type: 'TEXT', defaultValue: '=' },
      { name: 'record_color', type: 'TEXT', defaultValue: '#000000' },
      ...timestamps,
      softDelete,
    ],
  },
  Fixed: {
    name: 'Fixed',
    sqlName: 'fixed_records',
    entity: 'FixedRecord',
    columns: [
      { name: 'id', type: 'INTEGER', primaryKey: true, autoIncrement: true },
      { name: 'fixed_amount', type: 'INTEGER', kind: 'money', notNull: true },
      { name: 'fixed_name', type: 'TEXT', notNull: true },
      { name: 'fixed_day', type: 'INTEGER', notNull: true },
      {
        name: 'record_type_id',
        type: 'INTEGER',
        references: { table: 'RecordTypes', column: 'id', onDelete: 'SET NULL' },
      },
      {
        name: 'category_id',
        type: 'INTEGER',
        references: { table: 'Categories', column: 'id', onDelete: 'SET NULL' },
      },
      {
        name: 'payment_method_id',
        type: 'INTEGER',
        references: { table: 'PaymentMethods', column: 'id', onDelete: 'SET NULL' },
      },
      ...timestamps,
      softDelete,
    ],
    indexes: [
      { name: 'idx_fixed_active', columns: ['fixed_day'], where: 'deleted_at IS NULL' },
      { name: 'idx_fixed_category', columns: ['category_id'], where: 'deleted_at IS NULL' },
      { name: 'idx_fixed_payment_method', columns: ['payment_method_id'], where: 'deleted_at IS NULL' },
      { name: 'idx_fixed_record_type', columns: ['record_type_id'], where: 'deleted_at IS NULL' },
    ],
  },
  Records: {
    name: 'Records',
    sqlName: 'records',
    entity: 'RecordEntry',
    columns: [
      { name: 'id', type: 'INTEGER', primaryKey: true, autoIncrement: true },
      { name: 'amount', type: 'INTEGER', kind: 'money', notNull: true },
      { name: 'record_name', type: 'TEXT', notNull: true },
      { name: 'date', type: 'INTEGER', kind: 'timestamp', notNull: true },
      {
        name: 'record_type_id',
        type: 'INTEGER',
        references: { table: 'RecordTypes', column: 'id', onDelete: 'SET NULL' },
      },
      {
        name: 'group_id',
        type: 'INTEGER',
        references: { table: 'Groups', column: 'id', onDelete: 'CASCADE' },
      },
      {
        name: 'category_id',
        type: 'INTEGER',
        references: { table: 'Categories', column: 'id', onDelete: 'SET NULL' },
      },
      {
        name: 'payment_method_id',
        type: 'INTEGER',
        references: { table: 'PaymentMethods', column: 'id', onDelete: 'SET NULL' },
      },
      {
        name: 'fixed_id',
        type: 'INTEGER',
        references: { table: 'Fixed', column: 'id', onDelete: 'SET NULL' },
      },
      {
        name: 'paid_credit_id',
        type: 'INTEGER',
        references: { table: 'PaidCredits', column: 'id', onDelete: 'SET NULL' },
      },
      ...timestamps,
      softDelete,
    ],
    indexes: [
      { name: 'idx_records_group_date', columns: ['group_id', 'date'], where: 'deleted_at IS NULL' },
      { name: 'idx_records_category', columns: ['category_id'], where: 'deleted_at IS NULL' },
      { name: 'idx_records_payment_method', columns: ['payment_method_id'], where: 'deleted_at IS NULL' },
      { name: 'idx_records_record_type', columns: ['record_type_id'], where: 'deleted_at IS NULL' },
      { name: 'idx_records_fixed', columns: ['fixed_id'], where: 'deleted_at IS NULL' },
      { name: 'idx_records_paid_credit', columns: ['paid_credit_id'], where: 'deleted_at IS NULL' },
    ],
  },
  PaidCredits: {
    name: 'PaidCredits',
    sqlName: 'paid_credits',
    entity: 'PaidCredit',
    columns: [
      { name: 'id', type: 'INTEGER', primaryKey: true, autoIncrement: true },
      { name: 'amount', type: 'INTEGER', kind: 'money', notNull: true },
      { name: 'date', type: 'INTEGER', kind: 'timestamp', notNull: true },
      {
        name: 'group_id',
        type: 'INTEGER',
        references: { table: 'Groups', column: 'id', onDelete: 'CASCADE' },
      },
      {
        name: 'payment_method_id',
        type: 'INTEGER',
        references: { table: 'PaymentMethods', column: 'id', onDelete: 'SET NULL' },
      },
      ...timestamps,
      softDelete,
    ],
    indexes: [
      { name: 'idx_paid_credits_group', columns: ['group_id'], where: 'deleted_at IS NULL' },
      { name: 'idx_paid_credits_payment_method', columns: ['payment_method_id'], where: 'deleted_at IS NULL' },
      { name: 'idx_paid_credits_date', columns: ['date'], where: 'deleted_at IS NULL' },
    ],
  },
  BudgetTemplates: {
    name: 'BudgetTemplates',
    sqlName: 'budget_templates',
    entity: 'BudgetTemplate',
    columns: [
      { name: 'id', type: 'INTEGER', primaryKey: true, autoIncrement: true },
      { name: 'template_name', type: 'TEXT', notNull: true, unique: true },
      { name: 'description', type: 'TEXT' },
      { name: 'is_default', type: 'INTEGER', kind: 'boolean', defaultValue: 0 },
      { name: 'notes', type: 'TEXT' },
      ...timestamps,
      softDelete,
    ],
  },
  BudgetTemplateItems: {
    name: 'BudgetTemplateItems',
    sqlName: 'budget_template_items',
    entity: 'BudgetTemplateItem',
    columns: [
      { name: 'id', type: 'INTEGER', primaryKey: true, autoIncrement: true },
      {
        name: 'budget_template_id',
        type: 'INTEGER',
        references: { table: 'BudgetTemplates', column: 'id', onDelete: 'CASCADE' },
        notNull: true,
      },
      { name: 'amount', type: 'INTEGER', kind: 'money', notNull: true },
      {
        name: 'record_type_id',
        type: 'INTEGER',
        references: { table: 'RecordTypes', column: 'id', onDelete: 'SET NULL' },
        notNull: true,
      },
      {
        name: 'category_id',
        type: 'INTEGER',
        references: { table: 'Categories', column: 'id', onDelete: 'SET NULL' },
        notNull: true,
      },
      {
        name: 'fixed_id',
        type: 'INTEGER',
        references: { table: 'Fixed', column: 'id', onDelete: 'SET NULL' },
      },
      { name: 'scope', type: 'TEXT', notNull: true, defaultValue: 'category' },
      { name: 'priority', type: 'INTEGER', notNull: true, defaultValue: 2 },
      { name: 'notes', type: 'TEXT' },
      { name: 'sort_order', type: 'INTEGER', notNull: true, defaultValue: 0 },
      ...timestamps,
      softDelete,
    ],
    indexes: [
      { name: 'idx_budget_template_items_template', columns: ['budget_template_id'], where: 'deleted_at IS NULL' },
      { name: 'idx_budget_template_items_category', columns: ['category_id'], where: 'deleted_at IS NULL' },
      { name: 'idx_budget_template_items_record_type', columns: ['record_type_id'], where: 'deleted_at IS NULL' },
      { name: 'idx_budget_template_items_fixed', columns: ['fixed_id'], where: 'deleted_at IS NULL' },
    ],
  },
  BudgetPlans: {
    name: 'BudgetPlans',
    sqlName: 'budget_plans',
    entity: 'BudgetPlan',
    columns: [
      { name: 'id', type: 'INTEGER', primaryKey: true, autoIncrement: true },
      {
        name: 'group_id',
        type: 'INTEGER',
        references: { table: 'Groups', column: 'id', onDelete: 'CASCADE' },
        notNull: true,
      },
      {
        name: 'template_id',
        type: 'INTEGER',
        references: { table: 'BudgetTemplates', column: 'id', onDelete: 'SET NULL' },
      },
      { name: 'plan_name', type: 'TEXT' },
      {
        name: 'alert_threshold_percent',
        type: 'INTEGER',
        notNull: true,
        defaultValue: 80,
      },
      { name: 'notes', type: 'TEXT' },
      { name: 'applied_template_at', type: 'INTEGER', kind: 'timestamp' },
      ...timestamps,
      softDelete,
    ],
    indexes: [
      {
        name: 'idx_budget_plans_group_active',
        columns: ['group_id'],
        unique: true,
        where: 'deleted_at IS NULL',
      },
      { name: 'idx_budget_plans_template', columns: ['template_id'], where: 'deleted_at IS NULL' },
    ],
  },
  BudgetLines: {
    name: 'BudgetLines',
    sqlName: 'budget_lines',
    entity: 'BudgetLine',
    columns: [
      { name: 'id', type: 'INTEGER', primaryKey: true, autoIncrement: true },
      {
        name: 'budget_plan_id',
        type: 'INTEGER',
        references: { table: 'BudgetPlans', column: 'id', onDelete: 'CASCADE' },
        notNull: true,
      },
      {
        name: 'category_id',
        type: 'INTEGER',
        references: { table: 'Categories', column: 'id', onDelete: 'SET NULL' },
      },
      {
        name: 'record_type_id',
        type: 'INTEGER',
        references: { table: 'RecordTypes', column: 'id', onDelete: 'SET NULL' },
      },
      {
        name: 'fixed_id',
        type: 'INTEGER',
        references: { table: 'Fixed', column: 'id', onDelete: 'SET NULL' },
      },
      { name: 'scope', type: 'TEXT', notNull: true, defaultValue: 'category' },
      { name: 'source', type: 'TEXT', notNull: true, defaultValue: 'manual' },
      {
        name: 'template_item_id',
        type: 'INTEGER',
        references: { table: 'BudgetTemplateItems', column: 'id', onDelete: 'SET NULL' },
      },
      { name: 'planned_amount', type: 'INTEGER', kind: 'money', notNull: true },
      { name: 'priority', type: 'INTEGER', notNull: true, defaultValue: 2 },
      { name: 'notes', type: 'TEXT' },
      { name: 'sort_order', type: 'INTEGER', notNull: true, defaultValue: 0 },
      ...timestamps,
      softDelete,
    ],
    indexes: [
      { name: 'idx_budget_lines_plan', columns: ['budget_plan_id'], where: 'deleted_at IS NULL' },
      { name: 'idx_budget_lines_category', columns: ['category_id'], where: 'deleted_at IS NULL' },
      { name: 'idx_budget_lines_record_type', columns: ['record_type_id'], where: 'deleted_at IS NULL' },
      { name: 'idx_budget_lines_fixed', columns: ['fixed_id'], where: 'deleted_at IS NULL' },
      {
        name: 'idx_budget_lines_category_unique',
        columns: ['budget_plan_id', 'category_id', 'record_type_id'],
        unique: true,
        where: "deleted_at IS NULL AND scope = 'category' AND category_id IS NOT NULL AND record_type_id IS NOT NULL",
      },
      {
        name: 'idx_budget_lines_fixed_unique',
        columns: ['budget_plan_id', 'fixed_id'],
        unique: true,
        where: "deleted_at IS NULL AND scope = 'fixed' AND fixed_id IS NOT NULL",
      },
    ],
  },
  Savings: {
    name: 'Savings',
    sqlName: 'savings',
    entity: 'Saving',
    columns: [
      { name: 'id', type: 'INTEGER', primaryKey: true, autoIncrement: true },
      { name: 'saving_name', type: 'TEXT', notNull: true },
      { name: 'amount', type: 'INTEGER', kind: 'money', notNull: true },
      ...timestamps,
      softDelete,
    ],
  },
  SavingsHistory: {
    name: 'SavingsHistory',
    sqlName: 'savings_history',
    entity: 'SavingsHistoryEntry',
    columns: [
      { name: 'id', type: 'INTEGER', primaryKey: true, autoIncrement: true },
      {
        name: 'savings_id',
        type: 'INTEGER',
        references: { table: 'Savings', column: 'id', onDelete: 'CASCADE' },
      },
      { name: 'previous_amount', type: 'INTEGER', kind: 'money', notNull: true },
      { name: 'new_amount', type: 'INTEGER', kind: 'money', notNull: true },
      { name: 'change_date', type: 'INTEGER', kind: 'timestamp', notNull: true },
      ...timestamps,
      softDelete,
    ],
    indexes: [
      { name: 'idx_savings_history_saving', columns: ['savings_id'], where: 'deleted_at IS NULL' },
    ],
  },
  Migrations: {
    name: 'Migrations',
    sqlName: 'migrations',
    entity: 'Migration',
    columns: [
      { name: 'id', type: 'INTEGER', primaryKey: true, autoIncrement: true },
      { name: 'migration_name', type: 'TEXT', notNull: true, unique: true },
      { name: 'applied_at', type: 'INTEGER', kind: 'timestamp', notNull: true },
    ],
  },
  Vehicles: {
    name: 'Vehicles',
    sqlName: 'vehicles',
    entity: 'Vehicle',
    columns: [
      { name: 'id', type: 'INTEGER', primaryKey: true, autoIncrement: true },
      { name: 'name', type: 'TEXT', notNull: true },
      { name: 'make', type: 'TEXT' },
      { name: 'model', type: 'TEXT' },
      { name: 'year', type: 'INTEGER' },
      { name: 'plate', type: 'TEXT' },
      { name: 'color', type: 'TEXT' },
      { name: 'fuel_type', type: 'TEXT', notNull: true, defaultValue: 'gasoline' },
      { name: 'distance_unit', type: 'TEXT', notNull: true, defaultValue: 'mi' },
      { name: 'volume_unit', type: 'TEXT', notNull: true, defaultValue: 'gal' },
      { name: 'consumption_format', type: 'TEXT', notNull: true, defaultValue: 'mi_gal' },
      { name: 'tank_capacity', type: 'REAL' },
      { name: 'tank_capacity_unit', type: 'TEXT' },
      { name: 'is_default', type: 'INTEGER', kind: 'boolean', notNull: true, defaultValue: 0 },
      { name: 'notes', type: 'TEXT' },
      ...timestamps,
      softDelete,
    ],
    indexes: [
      {
        name: 'idx_vehicles_default',
        columns: ['is_default'],
        unique: true,
        where: 'is_default = 1 AND deleted_at IS NULL',
      },
    ],
  },
  VehicleFuelEntries: {
    name: 'VehicleFuelEntries',
    sqlName: 'vehicle_fuel_entries',
    entity: 'VehicleFuelEntry',
    columns: [
      { name: 'id', type: 'INTEGER', primaryKey: true, autoIncrement: true },
      {
        name: 'vehicle_id',
        type: 'INTEGER',
        references: { table: 'Vehicles', column: 'id', onDelete: 'CASCADE' },
        notNull: true,
      },
      { name: 'date', type: 'INTEGER', kind: 'timestamp', notNull: true },
      { name: 'odometer', type: 'REAL' },
      { name: 'odometer_source', type: 'TEXT' },
      { name: 'distance_unit', type: 'TEXT', notNull: true, defaultValue: 'mi' },
      { name: 'distance_traveled', type: 'REAL' },
      { name: 'distance_source', type: 'TEXT' },
      { name: 'volume', type: 'REAL', notNull: true },
      { name: 'volume_unit', type: 'TEXT', notNull: true, defaultValue: 'gal' },
      { name: 'price_per_unit', type: 'INTEGER', kind: 'money', notNull: true },
      { name: 'total_cost', type: 'INTEGER', kind: 'money', notNull: true },
      { name: 'is_full_tank', type: 'INTEGER', kind: 'boolean', notNull: true, defaultValue: 1 },
      { name: 'station', type: 'TEXT' },
      { name: 'notes', type: 'TEXT' },
      ...timestamps,
      softDelete,
    ],
    indexes: [
      { name: 'idx_vehicle_fuel_vehicle_date', columns: ['vehicle_id', 'date'], where: 'deleted_at IS NULL' },
      { name: 'idx_vehicle_fuel_vehicle_odometer', columns: ['vehicle_id', 'odometer'], where: 'deleted_at IS NULL' },
    ],
  },
  VehicleMaintenance: {
    name: 'VehicleMaintenance',
    sqlName: 'vehicle_maintenance',
    entity: 'VehicleMaintenanceEntry',
    columns: [
      { name: 'id', type: 'INTEGER', primaryKey: true, autoIncrement: true },
      {
        name: 'vehicle_id',
        type: 'INTEGER',
        references: { table: 'Vehicles', column: 'id', onDelete: 'CASCADE' },
        notNull: true,
      },
      { name: 'date', type: 'INTEGER', kind: 'timestamp', notNull: true },
      { name: 'odometer', type: 'REAL' },
      { name: 'distance_unit', type: 'TEXT', notNull: true, defaultValue: 'mi' },
      { name: 'service_type', type: 'TEXT', notNull: true },
      { name: 'title', type: 'TEXT', notNull: true },
      { name: 'cost', type: 'INTEGER', kind: 'money', notNull: true, defaultValue: 0 },
      { name: 'vendor', type: 'TEXT' },
      { name: 'notes', type: 'TEXT' },
      ...timestamps,
      softDelete,
    ],
    indexes: [
      { name: 'idx_vehicle_maintenance_vehicle_date', columns: ['vehicle_id', 'date'], where: 'deleted_at IS NULL' },
      { name: 'idx_vehicle_maintenance_vehicle_type', columns: ['vehicle_id', 'service_type'], where: 'deleted_at IS NULL' },
    ],
  },
  VehicleMaintenanceItems: {
    name: 'VehicleMaintenanceItems',
    sqlName: 'vehicle_maintenance_items',
    entity: 'VehicleMaintenanceItem',
    columns: [
      { name: 'id', type: 'INTEGER', primaryKey: true, autoIncrement: true },
      {
        name: 'maintenance_id',
        type: 'INTEGER',
        references: { table: 'VehicleMaintenance', column: 'id', onDelete: 'CASCADE' },
        notNull: true,
      },
      { name: 'name', type: 'TEXT', notNull: true },
      { name: 'notes', type: 'TEXT' },
      { name: 'quantity', type: 'REAL' },
      { name: 'unit', type: 'TEXT' },
      { name: 'cost', type: 'INTEGER', kind: 'money' },
      ...timestamps,
      softDelete,
    ],
    indexes: [
      { name: 'idx_vehicle_maintenance_items_maintenance', columns: ['maintenance_id'], where: 'deleted_at IS NULL' },
    ],
  },
  VehicleReminders: {
    name: 'VehicleReminders',
    sqlName: 'vehicle_reminders',
    entity: 'VehicleReminder',
    columns: [
      { name: 'id', type: 'INTEGER', primaryKey: true, autoIncrement: true },
      {
        name: 'vehicle_id',
        type: 'INTEGER',
        references: { table: 'Vehicles', column: 'id', onDelete: 'CASCADE' },
        notNull: true,
      },
      { name: 'service_type', type: 'TEXT', notNull: true },
      { name: 'title', type: 'TEXT', notNull: true },
      { name: 'interval_distance', type: 'REAL' },
      { name: 'interval_distance_unit', type: 'TEXT' },
      { name: 'interval_months', type: 'INTEGER' },
      { name: 'last_service_date', type: 'INTEGER', kind: 'timestamp' },
      { name: 'last_service_odometer', type: 'REAL' },
      { name: 'odometer_unit', type: 'TEXT' },
      { name: 'next_due_date', type: 'INTEGER', kind: 'timestamp' },
      { name: 'next_due_odometer', type: 'REAL' },
      { name: 'is_active', type: 'INTEGER', kind: 'boolean', notNull: true, defaultValue: 1 },
      { name: 'notes', type: 'TEXT' },
      ...timestamps,
      softDelete,
    ],
    indexes: [
      { name: 'idx_vehicle_reminders_vehicle_active', columns: ['vehicle_id', 'is_active'], where: 'deleted_at IS NULL' },
    ],
  },
  VehicleSettings: {
    name: 'VehicleSettings',
    sqlName: 'vehicle_settings',
    entity: 'VehicleSetting',
    columns: [
      { name: 'id', type: 'INTEGER', primaryKey: true, autoIncrement: true },
      { name: 'setting_key', type: 'TEXT', notNull: true, unique: true },
      {
        name: 'category_id',
        type: 'INTEGER',
        references: { table: 'Categories', column: 'id', onDelete: 'SET NULL' },
      },
      {
        name: 'payment_method_id',
        type: 'INTEGER',
        references: { table: 'PaymentMethods', column: 'id', onDelete: 'SET NULL' },
      },
      ...timestamps,
    ],
  },
  VehicleExpenseLinks: {
    name: 'VehicleExpenseLinks',
    sqlName: 'vehicle_expense_links',
    entity: 'VehicleExpenseLink',
    columns: [
      { name: 'id', type: 'INTEGER', primaryKey: true, autoIncrement: true },
      {
        name: 'record_id',
        type: 'INTEGER',
        references: { table: 'Records', column: 'id', onDelete: 'CASCADE' },
        notNull: true,
      },
      {
        name: 'fuel_entry_id',
        type: 'INTEGER',
        references: { table: 'VehicleFuelEntries', column: 'id', onDelete: 'CASCADE' },
      },
      {
        name: 'maintenance_id',
        type: 'INTEGER',
        references: { table: 'VehicleMaintenance', column: 'id', onDelete: 'CASCADE' },
      },
      ...timestamps,
    ],
    indexes: [
      { name: 'idx_vehicle_expense_links_record', columns: ['record_id'], unique: true },
      {
        name: 'idx_vehicle_expense_links_fuel',
        columns: ['fuel_entry_id'],
        unique: true,
        where: 'fuel_entry_id IS NOT NULL',
      },
      {
        name: 'idx_vehicle_expense_links_maintenance',
        columns: ['maintenance_id'],
        unique: true,
        where: 'maintenance_id IS NOT NULL',
      },
    ],
  },
};

export const TABLE_NAMES = Object.keys(APP_SCHEMA) as TableName[];

export const getTable = (name: TableName): TableDefinition => APP_SCHEMA[name];

export const getTableBySqlName = (sqlName: string): TableDefinition | undefined =>
  TABLE_NAMES.map((name) => APP_SCHEMA[name]).find((table) => table.sqlName === sqlName);

export type { TableDefinition, TableSchema };
