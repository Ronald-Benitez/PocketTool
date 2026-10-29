import type { TableDefinition, TableSchema } from '../types';

export const SCHEMA_VERSION = 3;

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
  | 'Budgets'
  | 'Savings'
  | 'SavingsHistory'
  | 'Migrations'
  | 'FuelRefills'
  | 'TripLogs';

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
      ...timestamps,
      softDelete,
    ],
    indexes: [
      { name: 'idx_budget_template_items_template', columns: ['budget_template_id'], where: 'deleted_at IS NULL' },
      { name: 'idx_budget_template_items_category', columns: ['category_id'], where: 'deleted_at IS NULL' },
      { name: 'idx_budget_template_items_record_type', columns: ['record_type_id'], where: 'deleted_at IS NULL' },
    ],
  },
  Budgets: {
    name: 'Budgets',
    sqlName: 'budgets',
    entity: 'Budget',
    columns: [
      { name: 'id', type: 'INTEGER', primaryKey: true, autoIncrement: true },
      { name: 'amount', type: 'INTEGER', kind: 'money', notNull: true },
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
      ...timestamps,
      softDelete,
    ],
    indexes: [
      { name: 'idx_budgets_group', columns: ['group_id'], where: 'deleted_at IS NULL' },
      { name: 'idx_budgets_category', columns: ['category_id'], where: 'deleted_at IS NULL' },
      { name: 'idx_budgets_record_type', columns: ['record_type_id'], where: 'deleted_at IS NULL' },
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
  FuelRefills: {
    name: 'FuelRefills',
    sqlName: 'fuel_refills',
    entity: 'FuelRefill',
    columns: [
      { name: 'id', type: 'INTEGER', primaryKey: true, autoIncrement: true },
      { name: 'date', type: 'INTEGER', kind: 'timestamp', defaultValue: null },
      { name: 'odometer_reading', type: 'REAL', notNull: true },
      { name: 'total_cost', type: 'INTEGER', kind: 'money', notNull: true },
      { name: 'gallons', type: 'REAL', notNull: true },
      { name: 'price_per_gallon', type: 'INTEGER', kind: 'money', notNull: true },
      { name: 'is_full_tank', type: 'INTEGER', kind: 'boolean', notNull: true },
      { name: 'notes', type: 'TEXT' },
      ...timestamps,
      softDelete,
    ],
    indexes: [
      { name: 'idx_fuel_refills_active', columns: ['odometer_reading'], where: 'deleted_at IS NULL' },
    ],
  },
  TripLogs: {
    name: 'TripLogs',
    sqlName: 'trip_logs',
    entity: 'TripLog',
    columns: [
      { name: 'id', type: 'INTEGER', primaryKey: true, autoIncrement: true },
      { name: 'date', type: 'INTEGER', kind: 'timestamp', defaultValue: null },
      { name: 'distance_traveled', type: 'REAL', notNull: true },
      { name: 'average_consumption', type: 'REAL' },
      { name: 'is_counter_reset', type: 'INTEGER', kind: 'boolean' },
      { name: 'trip_type', type: 'TEXT' },
      { name: 'notes', type: 'TEXT' },
      ...timestamps,
      softDelete,
    ],
    indexes: [
      { name: 'idx_trip_logs_active', columns: ['date'], where: 'deleted_at IS NULL' },
    ],
  },
};

export const TABLE_NAMES = Object.keys(APP_SCHEMA) as TableName[];

export const getTable = (name: TableName): TableDefinition => APP_SCHEMA[name];

export const getTableBySqlName = (sqlName: string): TableDefinition | undefined =>
  TABLE_NAMES.map((name) => APP_SCHEMA[name]).find((table) => table.sqlName === sqlName);

export type { TableDefinition, TableSchema };
