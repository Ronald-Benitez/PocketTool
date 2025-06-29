// src/db/schema.ts
import { TableSchema } from './types';

export const APP_SCHEMA: TableSchema = {
    Groups: {
        name: 'Groups',
        columns: [
            { name: 'id', type: 'INTEGER', primaryKey: true, autoIncrement: true },
            { name: 'group_name', type: 'TEXT', notNull: true },
            { name: 'goal', type: 'REAL', notNull: true },
            { name: 'year', type: 'INTEGER', notNull: true },
            { name: 'month', type: 'INTEGER', notNull: true }
        ],
    },
    PaymentTypes: {
        name: 'PaymentTypes',
        columns: [
            { name: 'id', type: 'INTEGER', primaryKey: true, autoIncrement: true },
            { name: 'payment_type_name', type: 'TEXT' },
            { name: 'payment_color', type: 'TEXT', defaultValue: '#000000' },
        ]
    },
    PaymentMethods: {
        name: 'PaymentMethods',
        columns: [
            { name: 'id', type: 'INTEGER', primaryKey: true, autoIncrement: true },
            { name: 'method_name', type: 'TEXT', notNull: true, unique: true },
            { name: 'closing_date', type: 'INTEGER' },
            { name: 'payment_type_id', type: 'INTEGER', references: { table: 'PaymentTypes', column: 'id' } },
        ],
    },
    Categories: {
        name: 'Categories',
        columns: [
            { name: 'id', type: 'INTEGER', primaryKey: true, autoIncrement: true },
            { name: 'category_name', type: 'TEXT', notNull: true, unique: true },
        ]
    },
    RecordTypes: {
        name: 'RecordTypes',
        columns: [
            { name: 'id', type: 'INTEGER', primaryKey: true, autoIncrement: true },
            { name: 'type_name', type: 'TEXT', notNull: true, unique: true },
            { name: 'effect', type: 'TEXT', defaultValue: '=' },
            { name: 'record_color', type: 'TEXT', defaultValue: '#000000' }
        ]
    },
    Fixed: {
        name: 'Fixed',
        columns: [
            { name: 'id', type: 'INTEGER', primaryKey: true, autoIncrement: true },
            { name: 'fixed_amount', type: 'REAL', notNull: true },
            { name: 'fixed_name', type: 'TEXT', notNull: true },
            { name: 'fixed_day', type: 'INTEGER', notNull: true },
            { name: 'record_type_id', type: 'INTEGER', references: { table: 'RecordTypes', column: 'id' } },
            { name: 'category_id', type: 'INTEGER', references: { table: 'Categories', column: 'id' } },
            { name: 'payment_method_id', type: 'INTEGER', references: { table: 'PaymentMethods', column: 'id' } },
        ]
    },
    Records: {
        name: 'Records',
        columns: [
            { name: 'id', type: 'INTEGER', primaryKey: true, autoIncrement: true },
            { name: 'amount', type: 'REAL', notNull: true },
            { name: 'record_name', type: 'TEXT', notNull: true },
            { name: 'date', type: 'INTEGER', notNull: true },
            { name: 'record_type_id', type: 'INTEGER', references: { table: 'RecordTypes', column: 'id' } },
            { name: 'group_id', type: 'INTEGER', references: { table: 'Groups', column: 'id' } },
            { name: 'category_id', type: 'INTEGER', references: { table: 'Categories', column: 'id' } },
            { name: 'payment_method_id', type: 'INTEGER', references: { table: 'PaymentMethods', column: 'id' } },
            { name: 'fixed_id', type: 'INTEGER', references: { table: 'Fixed', column: 'id' } },
        ]
    },
    PaidCredits: {
        name: "PaidCredits",
        columns: [
            { name: 'id', type: 'INTEGER', primaryKey: true, autoIncrement: true },
            { name: 'amount', type: 'REAL', notNull: true },
            { name: 'date', type: 'INTEGER', notNull: true },
            { name: 'group_id', type: 'INTEGER', references: { table: 'Groups', column: 'id' } },
            { name: 'payment_method_id', type: 'INTEGER', references: { table: 'PaymentMethods', column: 'id' } },
        ]
    },
    Budgets: {
        name: 'Budgets',
        columns: [
            { name: 'id', type: 'INTEGER', primaryKey: true, autoIncrement: true },
            { name: 'amount', type: 'REAL', notNull: true },
            { name: 'record_type_id', type: 'INTEGER', references: { table: 'RecordTypes', column: 'id' } },
            { name: 'group_id', type: 'INTEGER', references: { table: 'Groups', column: 'id' } },
            { name: 'category_id', type: 'INTEGER', references: { table: 'Categories', column: 'id' } },
        ]
    },
    Savings: {
        name: 'Savings',
        columns: [
            { name: 'id', type: 'INTEGER', primaryKey: true, autoIncrement: true },
            { name: 'saving_name', type: 'TEXT', notNull: true },
            { name: 'amount', type: 'REAL', notNull: true },
        ]
    },
    SavingsHistory: {
        name: 'SavingsHistory',
        columns: [
            { name: 'id', type: 'INTEGER', primaryKey: true, autoIncrement: true },
            { name: 'savings_id', type: 'INTEGER', references: { table: 'Savings', column: 'id' } },
            { name: 'previous_amount', type: 'REAL', notNull: true },
            { name: 'new_amount', type: 'REAL', notNull: true },
            { name: 'change_date', type: 'INTEGER', notNull: true },
        ]
    },
    Migrations: {
        name: 'Migrations',
        columns: [
            { name: 'id', type: 'INTEGER', primaryKey: true, autoIncrement: true },
            { name: 'migration_name', type: 'TEXT', notNull: true },
            { name: 'applied_at', type: 'INTEGER', notNull: true },
        ]
    }
};