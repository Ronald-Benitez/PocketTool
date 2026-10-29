import type { SQLiteDatabase } from 'expo-sqlite';

import { APP_SCHEMA, type TableName } from './tables';
import { quoteIdent } from './sql';
import { withExclusiveTransaction } from '../transaction';

export const seedReferenceData = async (db: SQLiteDatabase) => {
  const paymentTypes = [
    ['Credit', '#4CAF50'],
    ['Debit', '#2196F3'],
  ];
  for (const [name, color] of paymentTypes) {
    await db.runAsync(
      `INSERT OR IGNORE INTO ${quoteIdent(APP_SCHEMA.PaymentTypes.sqlName)} (payment_type_name, payment_color)
       VALUES (?, ?)`,
      name,
      color
    );
  }

  const recordTypes = [
    ['Income', '+', '#4CAF50'],
    ['Expense', '-', '#F44336'],
    ['Transfer', '=', '#FF9800'],
    ['Credit expenses', '=', '#9C27B0'],
    ['Payments', '-', '#F44376'],
  ];
  for (const [name, effect, color] of recordTypes) {
    await db.runAsync(
      `INSERT OR IGNORE INTO ${quoteIdent(APP_SCHEMA.RecordTypes.sqlName)} (type_name, effect, record_color)
       VALUES (?, ?, ?)`,
      name,
      effect,
      color
    );
  }

  const categories = ['Groceries', 'Gas', 'Entertainment', 'Utilities', 'Rent', 'Salary'];
  for (const name of categories) {
    await db.runAsync(
      `INSERT OR IGNORE INTO ${quoteIdent(APP_SCHEMA.Categories.sqlName)} (category_name)
       VALUES (?)`,
      name
    );
  }

  const paymentMethods: Array<[string, number, string]> = [
    ['Visa', 15, 'Credit'],
    ['MasterCard', 20, 'Credit'],
    ['Cash', 0, 'Debit'],
    ['Bank Transfer', 0, 'Debit'],
  ];
  for (const [name, closingDate, typeName] of paymentMethods) {
    const typeRow = await db.getFirstAsync<{ id: number }>(
      `SELECT id FROM ${quoteIdent(APP_SCHEMA.PaymentTypes.sqlName)} WHERE lower(payment_type_name) = lower(?)`,
      [typeName]
    );
    await db.runAsync(
      `INSERT OR IGNORE INTO ${quoteIdent(APP_SCHEMA.PaymentMethods.sqlName)} (method_name, closing_date, payment_type_id)
       VALUES (?, ?, ?)`,
      name,
      closingDate,
      typeRow?.id ?? null
    );
  }
};

export const seedSampleData = async (db: SQLiteDatabase) => {
  const groupCount = await db.getFirstAsync<{ total: number }>(
    `SELECT COUNT(*) AS total FROM ${quoteIdent(APP_SCHEMA.Groups.sqlName)}`
  );
  const recordCount = await db.getFirstAsync<{ total: number }>(
    `SELECT COUNT(*) AS total FROM ${quoteIdent(APP_SCHEMA.Records.sqlName)}`
  );

  if ((groupCount?.total ?? 0) > 0 || (recordCount?.total ?? 0) > 0) {
    return;
  }

  const now = new Date();
  const result = await db.runAsync(
    `INSERT INTO ${quoteIdent(APP_SCHEMA.Groups.sqlName)} (group_name, goal, year, month)
     VALUES (?, ?, ?, ?)`,
    'Default Group',
    500000,
    now.getFullYear(),
    now.getMonth() + 1
  );
  const groupId = result.lastInsertRowId;

  const lookupId = async (table: TableName, nameColumn: string, name: string) => {
    const row = await db.getFirstAsync<{ id: number }>(
      `SELECT id FROM ${quoteIdent(APP_SCHEMA[table].sqlName)} WHERE lower(${quoteIdent(nameColumn)}) = lower(?)`,
      [name]
    );
    return row?.id ?? null;
  };

  const incomeId = await lookupId('RecordTypes', 'type_name', 'Income');
  const expenseId = await lookupId('RecordTypes', 'type_name', 'Expense');
  const groceriesId = await lookupId('Categories', 'category_name', 'Groceries');
  const gasId = await lookupId('Categories', 'category_name', 'Gas');
  const entertainmentId = await lookupId('Categories', 'category_name', 'Entertainment');
  const rentId = await lookupId('Categories', 'category_name', 'Rent');
  const salaryId = await lookupId('Categories', 'category_name', 'Salary');
  const visaId = await lookupId('PaymentMethods', 'method_name', 'Visa');
  const cashId = await lookupId('PaymentMethods', 'method_name', 'Cash');
  const bankTransferId = await lookupId('PaymentMethods', 'method_name', 'Bank Transfer');

  const records: Array<[number, string, number, number | null, number | null, number | null]> = [
    [100000, 'Salary for January', incomeId ?? 0, salaryId, visaId, groupId],
    [20000, 'Groceries', expenseId ?? 0, groceriesId, cashId, groupId],
    [15000, 'Gas', expenseId ?? 0, gasId, cashId, groupId],
    [10000, 'Entertainment', expenseId ?? 0, entertainmentId, bankTransferId, groupId],
    [120000, 'Rent for January', expenseId ?? 0, rentId, bankTransferId, groupId],
  ];

  for (const [amount, name, recordTypeId, categoryId, paymentMethodId, group] of records) {
    await db.runAsync(
      `INSERT INTO ${quoteIdent(APP_SCHEMA.Records.sqlName)}
       (amount, record_name, date, record_type_id, group_id, category_id, payment_method_id)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      amount,
      name,
      now.getTime(),
      recordTypeId,
      group,
      categoryId,
      paymentMethodId
    );
  }
};

export const seedDefaults = async (db: SQLiteDatabase) => {
  await withExclusiveTransaction(db, async (txn) => {
    await seedReferenceData(txn);
    await seedSampleData(txn);
  });
};
