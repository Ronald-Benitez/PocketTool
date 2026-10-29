const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert');
const ts = require('typescript');
const { DatabaseSync } = require('node:sqlite');

const ROOT = path.resolve(__dirname, '..');

require.extensions['.ts'] = function (module, filename) {
  const source = fs.readFileSync(filename, 'utf8');
  const output = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
      esModuleInterop: true,
      resolveJsonModule: true,
      jsx: ts.JsxEmit.ReactJSX,
    },
    fileName: filename,
  });
  module._compile(output.outputText, filename);
};

const migrateDb = require(path.join(ROOT, 'src/db/migration.ts')).default;

// The ORM imports `useSQLiteContext` from expo-sqlite, which is a React Native
// module and cannot load under plain Node. Only the ORM class is exercised here.
const Module = require('node:module');
const originalLoad = Module._load;
const originalResolve = Module._resolveFilename;
Module._load = function (request, parent, isMain) {
  if (request === 'expo-sqlite') {
    return {
      useSQLiteContext: () => {
        throw new Error('useSQLiteContext is not available outside React Native');
      },
    };
  }
  return originalLoad.call(this, request, parent, isMain);
};
Module._resolveFilename = function (request, ...args) {
  if (request.startsWith('@/')) {
    return originalResolve.call(this, path.join(ROOT, request.slice(2)), ...args);
  }
  return originalResolve.call(this, request, ...args);
};
const { ORM } = require(path.join(ROOT, 'src/orm/index.ts'));
const { buildSqlDump, validateSqlDump } = require(path.join(ROOT, 'src/db/utils/sql-dump.ts'));
const {
  BACKUP_FORMAT_VERSION,
  createBackupSql,
  parseBackupMetadata,
} = require(path.join(ROOT, 'src/db/utils/backup.ts'));
const {
  recordInputSchema,
  groupInputSchema,
  budgetInputSchema,
} = require(path.join(ROOT, 'src/validation/entities.ts'));
const { getCreditPeriods } = require(path.join(ROOT, 'src/utils/creditPeriods.ts'));

const normalizeParams = (params) => {
  if (params.length === 1 && Array.isArray(params[0])) return params[0];
  return params;
};

const shim = (db) => ({
  execAsync: async (sql) => { db.exec(sql); },
  runAsync: async (sql, ...params) => {
    const stmt = db.prepare(sql);
    const info = stmt.run(...normalizeParams(params));
    return { lastInsertRowId: Number(info.lastInsertRowid), changes: Number(info.changes) };
  },
  getAllAsync: async (sql, params = []) => db.prepare(sql).all(...normalizeParams([params])),
  getFirstAsync: async (sql, params = []) => db.prepare(sql).get(...normalizeParams([params])) ?? null,
  withTransactionAsync: async (fn) => {
    db.exec('BEGIN');
    try { await fn(); db.exec('COMMIT'); }
    catch (e) { db.exec('ROLLBACK'); throw e; }
  },
  withExclusiveTransactionAsync: async (fn) => {
    db.exec('BEGIN EXCLUSIVE');
    try { await fn(shim(db)); db.exec('COMMIT'); }
    catch (e) { db.exec('ROLLBACK'); throw e; }
  },
});

const q = (db, sql, params = []) => db.prepare(sql).all(...params);

const legacySchema = `
CREATE TABLE Groups (id INTEGER PRIMARY KEY AUTOINCREMENT, group_name TEXT NOT NULL, goal REAL NOT NULL, year INTEGER NOT NULL, month INTEGER NOT NULL, deleted_at DATETIME DEFAULT NULL);
CREATE TABLE PaymentTypes (id INTEGER PRIMARY KEY AUTOINCREMENT, payment_type_name TEXT, payment_color TEXT DEFAULT '#000000', deleted_at DATETIME DEFAULT NULL);
CREATE TABLE PaymentMethods (id INTEGER PRIMARY KEY AUTOINCREMENT, method_name TEXT NOT NULL UNIQUE, closing_date INTEGER, payment_type_id INTEGER REFERENCES PaymentTypes(id), payment_date INTEGER, deleted_at DATETIME DEFAULT NULL);
CREATE TABLE Categories (id INTEGER PRIMARY KEY AUTOINCREMENT, category_name TEXT NOT NULL UNIQUE, deleted_at DATETIME DEFAULT NULL);
CREATE TABLE RecordTypes (id INTEGER PRIMARY KEY AUTOINCREMENT, type_name TEXT NOT NULL UNIQUE, effect TEXT DEFAULT '=', record_color TEXT DEFAULT '#000000', deleted_at DATETIME DEFAULT NULL);
CREATE TABLE Fixed (id INTEGER PRIMARY KEY AUTOINCREMENT, fixed_amount REAL NOT NULL, fixed_name TEXT NOT NULL, fixed_day INTEGER NOT NULL, record_type_id INTEGER, category_id INTEGER, payment_method_id INTEGER, deleted_at DATETIME DEFAULT NULL);
CREATE TABLE Records (id INTEGER PRIMARY KEY AUTOINCREMENT, amount REAL NOT NULL, record_name TEXT NOT NULL, date INTEGER NOT NULL, record_type_id INTEGER, group_id INTEGER, category_id INTEGER, payment_method_id INTEGER, fixed_id INTEGER, paid_credit_id INTEGER, deleted_at DATETIME DEFAULT NULL);
CREATE TABLE PaidCredits (id INTEGER PRIMARY KEY AUTOINCREMENT, amount REAL NOT NULL, date INTEGER NOT NULL, group_id INTEGER, payment_method_id INTEGER, deleted_at DATETIME DEFAULT NULL);
CREATE TABLE BudgetTemplates (id INTEGER PRIMARY KEY AUTOINCREMENT, template_name TEXT NOT NULL UNIQUE, description TEXT, deleted_at DATETIME DEFAULT NULL);
CREATE TABLE BudgetTemplateItems (id INTEGER PRIMARY KEY AUTOINCREMENT, budget_template_id INTEGER NOT NULL, amount REAL NOT NULL, record_type_id INTEGER NOT NULL, category_id INTEGER NOT NULL, deleted_at DATETIME DEFAULT NULL);
CREATE TABLE Budgets (id INTEGER PRIMARY KEY AUTOINCREMENT, amount REAL NOT NULL, record_type_id INTEGER, group_id INTEGER, category_id INTEGER, deleted_at DATETIME DEFAULT NULL);
CREATE TABLE Savings (id INTEGER PRIMARY KEY AUTOINCREMENT, saving_name TEXT NOT NULL, amount REAL NOT NULL, deleted_at DATETIME DEFAULT NULL);
CREATE TABLE SavingsHistory (id INTEGER PRIMARY KEY AUTOINCREMENT, savings_id INTEGER, previous_amount REAL NOT NULL, new_amount REAL NOT NULL, change_date INTEGER NOT NULL, deleted_at DATETIME DEFAULT NULL);
CREATE TABLE Migrations (id INTEGER PRIMARY KEY AUTOINCREMENT, migration_name TEXT NOT NULL, applied_at INTEGER NOT NULL);
CREATE TABLE fuel_refills (id INTEGER PRIMARY KEY AUTOINCREMENT, date DATETIME DEFAULT CURRENT_TIMESTAMP, odometer_reading REAL NOT NULL, total_cost REAL NOT NULL, gallons REAL NOT NULL, price_per_gallon REAL NOT NULL, is_full_tank INTEGER NOT NULL, notes TEXT, deleted_at DATETIME DEFAULT NULL);
CREATE TABLE trip_logs (id INTEGER PRIMARY KEY AUTOINCREMENT, date DATETIME DEFAULT CURRENT_TIMESTAMP, distance_traveled REAL NOT NULL, average_consumption REAL, is_counter_reset INTEGER, trip_type TEXT, notes TEXT, deleted_at DATETIME DEFAULT NULL);
`;

const legacySeed = `
INSERT INTO PaymentTypes (payment_type_name, payment_color) VALUES ('Credit', '#4CAF50'), ('Debit', '#2196F3');
INSERT INTO PaymentMethods (method_name, closing_date, payment_type_id) VALUES ('Visa', 15, 1), ('Cash', 0, 2);
INSERT INTO RecordTypes (type_name, effect, record_color) VALUES ('Income', '+', '#4CAF50'), ('Expense', '-', '#F44336'), ('Transfer', '=', '#FF9800'), ('Credit expenses', '=', '#9C27B0'), ('Payments', '-', '#F44376');
INSERT INTO Categories (category_name) VALUES ('Salary'), ('Groceries');
INSERT INTO Groups (group_name, goal, year, month) VALUES ('Legacy Group', 5000.50, 2024, 3);
INSERT INTO Records (amount, record_name, date, record_type_id, group_id, category_id, payment_method_id) VALUES (1000.25, 'Salary', 1700000000000, 1, 1, 1, 1), (200.75, 'Groceries', 1700000001000, 2, 1, 2, 2);
INSERT INTO PaidCredits (amount, date, group_id, payment_method_id) VALUES (50.50, '2024-01-15 10:00:00', 1, 1);
INSERT INTO Fixed (fixed_amount, fixed_name, fixed_day, record_type_id, category_id, payment_method_id) VALUES (99.99, 'Rent', 5, 2, 2, 2);
INSERT INTO Budgets (amount, record_type_id, group_id, category_id) VALUES (300.33, 2, 1, 2);
INSERT INTO Savings (saving_name, amount) VALUES ('Emergency', 123.45);
INSERT INTO SavingsHistory (savings_id, previous_amount, new_amount, change_date) VALUES (1, 100.10, 123.45, 1700000000);
INSERT INTO fuel_refills (date, odometer_reading, total_cost, gallons, price_per_gallon, is_full_tank) VALUES ('2024-01-15 10:00:00', 1000.5, 45.67, 10, 3.50, 1);
INSERT INTO trip_logs (date, distance_traveled, average_consumption, is_counter_reset, trip_type) VALUES ('2024-01-15', 10.5, 7.2, 0, 'city');
`;

async function testLegacyMigration() {
  const raw = new DatabaseSync(':memory:');
  raw.exec(legacySchema);
  raw.exec(legacySeed);
  const db = shim(raw);

  await migrateDb(db);

  const tables = q(raw, "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name").map(r => r.name);
  for (const expected of ['groups', 'payment_types', 'payment_methods', 'categories', 'record_types', 'fixed_records', 'records', 'paid_credits', 'budget_templates', 'budget_template_items', 'budgets', 'savings', 'savings_history', 'migrations', 'fuel_refills', 'trip_logs']) {
    assert.ok(tables.includes(expected), `missing table ${expected}`);
  }
  assert.ok(!tables.includes('Groups'), 'legacy Groups should be gone');
  assert.ok(!tables.some(t => t.startsWith('__legacy_')), 'temp tables should be gone');

  const group = q(raw, 'SELECT * FROM groups')[0];
  assert.strictEqual(group.goal, 500050, 'goal should be cents');
  assert.strictEqual(group.deleted_at, null);

  const records = q(raw, 'SELECT * FROM records ORDER BY id');
  assert.strictEqual(records.length, 2);
  assert.deepStrictEqual(records.map(r => r.amount), [100025, 20075]);
  assert.deepStrictEqual(records.map(r => r.date), [1700000000000, 1700000001000]);
  assert.strictEqual(records[0].deleted_at, null);

  const paid = q(raw, 'SELECT * FROM paid_credits')[0];
  assert.strictEqual(paid.amount, 5050);
  assert.strictEqual(paid.date, Date.UTC(2024, 0, 15, 10, 0, 0), 'text date should become ms');

  const fixed = q(raw, 'SELECT * FROM fixed_records')[0];
  assert.strictEqual(fixed.fixed_amount, 9999);

  const budget = q(raw, 'SELECT * FROM budgets')[0];
  assert.strictEqual(budget.amount, 30033);
  assert.strictEqual(budget.record_type_id, 2);

  const saving = q(raw, 'SELECT * FROM savings')[0];
  assert.strictEqual(saving.amount, 12345);

  const history = q(raw, 'SELECT * FROM savings_history')[0];
  assert.strictEqual(history.previous_amount, 10010);
  assert.strictEqual(history.new_amount, 12345);
  assert.strictEqual(history.change_date, 1700000000000, 'seconds should become ms');

  const fuel = q(raw, 'SELECT * FROM fuel_refills')[0];
  assert.strictEqual(fuel.total_cost, 4567);
  assert.strictEqual(fuel.price_per_gallon, 350);
  assert.strictEqual(fuel.date, Date.UTC(2024, 0, 15, 10, 0, 0));

  const trip = q(raw, 'SELECT * FROM trip_logs')[0];
  assert.strictEqual(trip.date, Date.UTC(2024, 0, 15));

  const indexes = q(raw, "SELECT name FROM sqlite_master WHERE type='index'").map(r => r.name);
  assert.ok(indexes.includes('idx_groups_active'));
  assert.ok(indexes.includes('idx_records_group_date'));
  assert.ok(indexes.includes('idx_records_fixed'));
  assert.ok(indexes.includes('idx_fixed_category'));
  assert.ok(indexes.includes('idx_budgets_category'));

  const counts = {};
  for (const t of tables) counts[t] = q(raw, `SELECT COUNT(*) AS c FROM "${t}"`)[0].c;

  await migrateDb(db);
  for (const t of tables) {
    assert.strictEqual(q(raw, `SELECT COUNT(*) AS c FROM "${t}"`)[0].c, counts[t], `second run duplicated ${t}`);
  }
  assert.strictEqual(q(raw, 'SELECT COUNT(*) AS c FROM groups')[0].c, 1);
  assert.strictEqual(q(raw, 'SELECT COUNT(*) AS c FROM categories')[0].c, 6);

  const fk = q(raw, 'PRAGMA foreign_key_list(records)');
  assert.ok(fk.every(row => !String(row.table).startsWith('__legacy_')), 'FK should not point at temp tables');

  // ORM behavior on the migrated database.
  const recordsOrm = new ORM(db, 'Records');
  const joined = await recordsOrm.joinMany(['RecordTypes', 'Categories', 'PaymentMethods', 'PaymentMethods.PaymentTypes']).order('date', 'ASC').getAll();
  assert.strictEqual(joined.length, 2);
  assert.strictEqual(joined[0].amount, 100025);
  assert.strictEqual(joined[0].RecordTypes.type_name, 'Income');
  assert.strictEqual(joined[0].Categories.category_name, 'Salary');
  assert.strictEqual(joined[0].PaymentMethods.method_name, 'Visa');
  assert.strictEqual(joined[0].PaymentMethods.PaymentTypes.payment_type_name, 'Credit');

  const explicitId = await recordsOrm.insert({ id: 999, amount: 1, record_name: 'Explicit', date: Date.now(), group_id: 1 });
  assert.strictEqual(explicitId, 999);
  assert.strictEqual(q(raw, 'SELECT COUNT(*) AS c FROM records WHERE id=999')[0].c, 1);

  await new ORM(db, 'Records').update(999, { record_name: 'Renamed' });
  const renamed = q(raw, 'SELECT record_name FROM records WHERE id=999')[0];
  assert.strictEqual(renamed.record_name, 'Renamed');

  const baseQualified = await new ORM(db, 'Records').where('Records.category_id', 2).getAll();
  assert.strictEqual(baseQualified.length, 1);
  assert.strictEqual(baseQualified[0].record_name, 'Groceries');

  const relational = await new ORM(db, 'Records').where('PaymentMethods.method_name', 'Visa').getAll();
  assert.strictEqual(relational.length, 1);
  assert.strictEqual(relational[0].record_name, 'Salary');

  const recordsForMethods = new ORM(db, 'Records');
  assert.strictEqual(await recordsForMethods.exists(), true);
  assert.strictEqual((await recordsForMethods.getById(1))?.record_name, 'Salary');
  assert.throws(() => new ORM(db, 'Records').where('not_a_column', 1));

  const beforeRollback = q(raw, 'SELECT COUNT(*) AS c FROM records')[0].c;
  await assert.rejects(
    new ORM(db, 'Records').transaction(async (txn) => {
      await txn.insert({
        amount: 1,
        record_name: 'Rollback',
        date: Date.now(),
        group_id: 1,
      });
      throw new Error('force rollback');
    })
  );
  assert.strictEqual(q(raw, 'SELECT COUNT(*) AS c FROM records')[0].c, beforeRollback);

  const beforeCommit = q(raw, 'SELECT COUNT(*) AS c FROM records')[0].c;
  await new ORM(db, 'Records').transaction(async (txn) => {
    await txn.insert({
      amount: 2,
      record_name: 'Committed',
      date: Date.now(),
      group_id: 1,
    });
  });
  assert.strictEqual(q(raw, 'SELECT COUNT(*) AS c FROM records')[0].c, beforeCommit + 1);

  const base = new ORM(db, 'Records');
  const [visaRecords, cashRecords] = await Promise.all([
    base.where('payment_method_id', 1).getAll(),
    base.where('payment_method_id', 2).getAll(),
  ]);
  assert.ok(visaRecords.length > 0);
  assert.ok(visaRecords.every(record => record.payment_method_id === 1));
  assert.ok(cashRecords.length > 0);
  assert.ok(cashRecords.every(record => record.payment_method_id === 2));

  const page = await new ORM(db, 'Records')
    .where('group_id', 1)
    .order('id', 'ASC')
    .limit(2)
    .offset(1)
    .getAll();
  assert.strictEqual(page.length, 2);
  assert.ok(page[0].id > 1);

  await recordsOrm.delete(999);
  const visible = await new ORM(db, 'Records').getAll();
  assert.ok(!visible.some(r => r.id === 999), 'soft deleted row should be hidden');
  const all = await new ORM(db, 'Records').getAll({ includeDeleted: true });
  assert.ok(all.some(r => r.id === 999), 'includeDeleted should show row');

  raw.close();
  console.log('legacy migration + ORM: OK');
}

async function testTextFallbacks() {
  const raw = new DatabaseSync(':memory:');
  raw.exec(`
    CREATE TABLE PaymentTypes (id INTEGER PRIMARY KEY AUTOINCREMENT, payment_type_name TEXT, payment_color TEXT);
    CREATE TABLE RecordTypes (id INTEGER PRIMARY KEY AUTOINCREMENT, type_name TEXT, effect TEXT, record_color TEXT);
    CREATE TABLE PaymentMethods (id INTEGER PRIMARY KEY AUTOINCREMENT, method_name TEXT NOT NULL, closing_date INTEGER, payment_type TEXT);
    CREATE TABLE Categories (id INTEGER PRIMARY KEY AUTOINCREMENT, category_name TEXT);
    CREATE TABLE Groups (id INTEGER PRIMARY KEY AUTOINCREMENT, group_name TEXT, goal REAL, year INTEGER, month INTEGER);
    CREATE TABLE Budgets (id INTEGER PRIMARY KEY AUTOINCREMENT, amount REAL, budget_type TEXT, group_id INTEGER, category_id INTEGER);
  `);
  raw.exec(`
    INSERT INTO PaymentTypes (payment_type_name, payment_color) VALUES ('Credit', '#111'), ('Debit', '#222');
    INSERT INTO RecordTypes (type_name, effect, record_color) VALUES ('Income', '+', '#111'), ('Expense', '-', '#222');
    INSERT INTO PaymentMethods (method_name, closing_date, payment_type) VALUES ('Visa', 15, 'credit');
    INSERT INTO Budgets (amount, budget_type, group_id, category_id) VALUES (10.25, 'expense', 1, 1);
  `);
  const db = shim(raw);
  await migrateDb(db);

  const method = q(raw, 'SELECT * FROM payment_methods')[0];
  assert.strictEqual(method.payment_type_id, 1, 'text payment_type should map to id');
  const budget = q(raw, 'SELECT * FROM budgets')[0];
  assert.strictEqual(budget.record_type_id, 2, 'text budget_type should map to id');
  assert.strictEqual(budget.amount, 1025);
  raw.close();
  console.log('text fallbacks: OK');
}

async function testNullOldIdWithTextFallback() {
  const raw = new DatabaseSync(':memory:');
  raw.exec(`
    CREATE TABLE PaymentTypes (id INTEGER PRIMARY KEY AUTOINCREMENT, payment_type_name TEXT, payment_color TEXT);
    CREATE TABLE RecordTypes (id INTEGER PRIMARY KEY AUTOINCREMENT, type_name TEXT, effect TEXT, record_color TEXT);
    CREATE TABLE PaymentMethods (id INTEGER PRIMARY KEY AUTOINCREMENT, method_name TEXT NOT NULL, closing_date INTEGER, payment_type_id INTEGER, payment_type TEXT);
    CREATE TABLE Categories (id INTEGER PRIMARY KEY AUTOINCREMENT, category_name TEXT);
    CREATE TABLE Groups (id INTEGER PRIMARY KEY AUTOINCREMENT, group_name TEXT, goal REAL, year INTEGER, month INTEGER);
    CREATE TABLE Budgets (id INTEGER PRIMARY KEY AUTOINCREMENT, amount REAL, record_type_id INTEGER, budget_type TEXT, group_id INTEGER, category_id INTEGER);
  `);
  raw.exec(`
    INSERT INTO PaymentTypes (payment_type_name, payment_color) VALUES ('Credit', '#111');
    INSERT INTO RecordTypes (type_name, effect, record_color) VALUES ('Expense', '-', '#222');
    INSERT INTO PaymentMethods (method_name, closing_date, payment_type_id, payment_type) VALUES ('Visa', 15, NULL, 'Credit');
    INSERT INTO Budgets (amount, record_type_id, budget_type, group_id, category_id) VALUES (10.25, NULL, 'expense', 1, 1);
  `);
  const db = shim(raw);
  await migrateDb(db);
  assert.strictEqual(q(raw, 'SELECT payment_type_id FROM payment_methods')[0].payment_type_id, 1);
  assert.strictEqual(q(raw, 'SELECT record_type_id FROM budgets')[0].record_type_id, 1);
  raw.close();
  console.log('null old id + text fallback: OK');
}

async function testBudgetIdFallback() {
  const raw = new DatabaseSync(':memory:');
  raw.exec(`
    CREATE TABLE Budgets (id_budget INTEGER PRIMARY KEY AUTOINCREMENT, amount REAL, budget_type TEXT, group_id INTEGER, category_id INTEGER);
  `);
  raw.exec(`INSERT INTO Budgets (id_budget, amount, budget_type, group_id, category_id) VALUES (5, 10.25, 'income', 1, 1);`);
  const db = shim(raw);
  await migrateDb(db);
  const budget = q(raw, 'SELECT * FROM budgets')[0];
  assert.strictEqual(budget.id, 5);
  assert.strictEqual(budget.amount, 1025);
  assert.strictEqual(q(raw, "SELECT type_name FROM record_types WHERE id = ?", [budget.record_type_id])[0].type_name, 'Income');
  raw.close();
  console.log('id_budget fallback: OK');
}

async function testEmptyDatabase() {
  const raw = new DatabaseSync(':memory:');
  const db = shim(raw);
  await migrateDb(db);

  const tables = q(raw, "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'").map(r => r.name);
  for (const expected of ['groups', 'records', 'payment_types', 'record_types', 'categories', 'payment_methods', 'migrations']) {
    assert.ok(tables.includes(expected), `fresh database missing ${expected}`);
  }
  assert.strictEqual(q(raw, 'SELECT COUNT(*) AS c FROM groups')[0].c, 1);
  assert.strictEqual(q(raw, 'SELECT COUNT(*) AS c FROM records')[0].c, 5);
  assert.strictEqual(q(raw, 'SELECT goal FROM groups')[0].goal, 500000);
  assert.strictEqual(q(raw, 'SELECT amount FROM records ORDER BY id')[0].amount, 100000);
  assert.strictEqual(q(raw, 'SELECT migration_name FROM migrations')[0].migration_name, '0001_baseline');
  assert.strictEqual(q(raw, 'PRAGMA user_version')[0].user_version, 3);
  const recordColumns = q(raw, 'PRAGMA table_info(records)').map(c => c.name);
  assert.ok(recordColumns.includes('created_at'));
  assert.ok(recordColumns.includes('updated_at'));
  const triggers = q(raw, "SELECT name FROM sqlite_master WHERE type='trigger'").map(row => row.name);
  assert.ok(triggers.includes('trg_records_timestamps_insert'));
  assert.ok(triggers.includes('trg_records_timestamps_update'));

  const counts = {};
  for (const t of tables) counts[t] = q(raw, `SELECT COUNT(*) AS c FROM "${t}"`)[0].c;
  await migrateDb(db);
  for (const t of tables) {
    assert.strictEqual(q(raw, `SELECT COUNT(*) AS c FROM "${t}"`)[0].c, counts[t], `second bootstrap duplicated ${t}`);
  }

  raw.close();
  console.log('fresh database bootstrap: OK');
}

async function testExportImport() {
  const sourceRaw = new DatabaseSync(':memory:');
  sourceRaw.exec(legacySchema);
  sourceRaw.exec(legacySeed);
  const source = shim(sourceRaw);
  await migrateDb(source);

  const dump = await buildSqlDump(source);
  validateSqlDump(dump);
  assert.throws(() => validateSqlDump(''));
  assert.throws(() => validateSqlDump('CREATE TABLE foo (id INTEGER);'));
  assert.doesNotThrow(() => validateSqlDump(`${legacySchema}\n${legacySeed}`));

  const backupSql = await createBackupSql(source, 'test-version');
  const metadata = parseBackupMetadata(backupSql);
  assert.ok(metadata);
  assert.strictEqual(metadata.formatVersion, BACKUP_FORMAT_VERSION);
  assert.strictEqual(metadata.appVersion, 'test-version');
  assert.strictEqual(metadata.schemaVersion, 3);
  assert.ok(metadata.tables.includes('records'));
  assert.doesNotThrow(() => validateSqlDump(backupSql));
  assert.strictEqual(parseBackupMetadata(dump), null);

  const targetRaw = new DatabaseSync(':memory:');
  const target = shim(targetRaw);
  targetRaw.exec('PRAGMA foreign_keys = OFF;');
  targetRaw.exec(backupSql);
  targetRaw.exec('PRAGMA foreign_keys = ON;');
  await migrateDb(target);

  for (const table of ['groups', 'records', 'paid_credits', 'fixed_records', 'budgets', 'savings', 'savings_history']) {
    assert.strictEqual(
      q(targetRaw, `SELECT COUNT(*) AS c FROM ${table}`)[0].c,
      q(sourceRaw, `SELECT COUNT(*) AS c FROM ${table}`)[0].c,
      `imported row count differs for ${table}`
    );
  }
  assert.deepStrictEqual(
    q(targetRaw, 'SELECT amount FROM records ORDER BY id').map((row) => row.amount),
    q(sourceRaw, 'SELECT amount FROM records ORDER BY id').map((row) => row.amount)
  );
  assert.deepStrictEqual(
    q(targetRaw, 'SELECT date FROM records ORDER BY id').map((row) => row.date),
    q(sourceRaw, 'SELECT date FROM records ORDER BY id').map((row) => row.date)
  );

  sourceRaw.close();
  targetRaw.close();
  console.log('export/import dump: OK');
}

async function testAuditTimestampMigration() {
  const raw = new DatabaseSync(':memory:');
  const db = shim(raw);
  await migrateDb(db);

  raw.exec('DROP TRIGGER IF EXISTS trg_records_timestamps_insert;');
  raw.exec('DROP TRIGGER IF EXISTS trg_records_timestamps_update;');
  raw.exec('ALTER TABLE records DROP COLUMN created_at;');
  raw.exec('ALTER TABLE records DROP COLUMN updated_at;');
  raw.exec("DELETE FROM migrations WHERE migration_name = '0002_audit_timestamps';");
  raw.exec('PRAGMA user_version = 1;');

  await migrateDb(db);

  const columns = q(raw, 'PRAGMA table_info(records)').map((column) => column.name);
  assert.ok(columns.includes('created_at'));
  assert.ok(columns.includes('updated_at'));
  assert.strictEqual(q(raw, 'PRAGMA user_version')[0].user_version, 3);
  assert.strictEqual(
    q(raw, "SELECT COUNT(*) AS c FROM migrations WHERE migration_name = '0002_audit_timestamps'")[0].c,
    1
  );

  raw.close();
  console.log('audit timestamp migration: OK');
}

async function testValidationSchemas() {
  assert.doesNotThrow(() =>
    recordInputSchema.parse({
      amount: 1000,
      record_name: 'Salary',
      date: Date.now(),
      record_type_id: 1,
      group_id: 1,
      category_id: 1,
      payment_method_id: 1,
    })
  );
  assert.throws(() =>
    recordInputSchema.parse({
      amount: 10.5,
      record_name: 'Invalid cents',
      date: Date.now(),
    })
  );
  assert.throws(() =>
    recordInputSchema.parse({
      amount: 10,
      record_name: 'Unknown column',
      date: Date.now(),
      not_a_column: true,
    })
  );
  assert.throws(() =>
    groupInputSchema.parse({
      group_name: '',
      goal: 100,
      year: 2026,
      month: 1,
    })
  );
  assert.doesNotThrow(() =>
    budgetInputSchema.parse({
      amount: 500,
      record_type_id: 1,
      group_id: 1,
      category_id: 1,
    })
  );
  console.log('validation schemas: OK');
}

async function testCreditPeriods() {
  const card = { closing_date: 15 };
  const afterCutoff = new Date(2026, 9, 28);
  const after = getCreditPeriods(card, afterCutoff);
  assert.strictEqual(after.currentPeriodStart, new Date(2026, 9, 16).getTime());
  assert.strictEqual(after.currentPeriodEnd, new Date(2026, 10, 15, 23, 59, 59, 999).getTime());
  assert.strictEqual(after.previousPeriodStart, new Date(2026, 8, 16).getTime());
  assert.strictEqual(after.previousPeriodEnd, new Date(2026, 9, 15, 23, 59, 59, 999).getTime());

  const beforeCutoff = new Date(2026, 9, 10);
  const before = getCreditPeriods(card, beforeCutoff);
  assert.strictEqual(before.currentPeriodStart, new Date(2026, 8, 16).getTime());
  assert.strictEqual(before.currentPeriodEnd, new Date(2026, 9, 15, 23, 59, 59, 999).getTime());
  assert.strictEqual(before.previousPeriodStart, new Date(2026, 7, 16).getTime());
  assert.strictEqual(before.previousPeriodEnd, new Date(2026, 8, 15, 23, 59, 59, 999).getTime());

  // A record after the last cutoff belongs to the current period.
  const recordAfterCutoff = new Date(2026, 9, 20).getTime();
  assert.ok(recordAfterCutoff >= after.currentPeriodStart && recordAfterCutoff <= after.currentPeriodEnd);
  assert.ok(recordAfterCutoff < after.previousPeriodStart || recordAfterCutoff > after.previousPeriodEnd);

  // A record before the cutoff belongs to the previous period when today is after it.
  const recordBeforeCutoff = new Date(2026, 9, 10).getTime();
  assert.ok(recordBeforeCutoff >= after.previousPeriodStart && recordBeforeCutoff <= after.previousPeriodEnd);
  assert.ok(recordBeforeCutoff < after.currentPeriodStart);

  console.log('credit periods: OK');
}

async function testCreditTotalsWithPeriods() {
  const raw = new DatabaseSync(':memory:');
  const db = shim(raw);
  await migrateDb(db);

  const currentDate = new Date(2026, 9, 20).getTime();
  const previousDate = new Date(2026, 9, 10).getTime();
  const periods = getCreditPeriods({ closing_date: 15 }, new Date(2026, 9, 28));

  const methodId = await new ORM(db, 'PaymentMethods').insert({
    method_name: 'Period Test Card',
    closing_date: 15,
    payment_type_id: 1,
  });

  const records = new ORM(db, 'Records');
  await records.insert({
    amount: 10000,
    record_name: 'Current period',
    date: currentDate,
    group_id: 1,
    payment_method_id: methodId,
  });
  await records.insert({
    amount: 20000,
    record_name: 'Previous period',
    date: previousDate,
    group_id: 1,
    payment_method_id: methodId,
  });

  const [currentRows, previousRows] = await Promise.all([
    new ORM(db, 'Records')
      .where('payment_method_id', methodId)
      .where('date', [periods.currentPeriodStart, periods.currentPeriodEnd], 'BETWEEN')
      .getAll(),
    new ORM(db, 'Records')
      .where('payment_method_id', methodId)
      .where('date', [periods.previousPeriodStart, periods.previousPeriodEnd], 'BETWEEN')
      .getAll(),
  ]);

  assert.strictEqual(currentRows.reduce((total, row) => total + row.amount, 0), 10000);
  assert.strictEqual(previousRows.reduce((total, row) => total + row.amount, 0), 20000);

  raw.close();
  console.log('credit totals by period: OK');
}

async function testQueryPlans() {
  const raw = new DatabaseSync(':memory:');
  const db = shim(raw);
  await migrateDb(db);

  const checks = [
    {
      name: 'records by group/date',
      sql: 'EXPLAIN QUERY PLAN SELECT * FROM records WHERE group_id = 1 AND deleted_at IS NULL ORDER BY date ASC',
    },
    {
      name: 'records by payment method/date',
      sql: 'EXPLAIN QUERY PLAN SELECT * FROM records WHERE payment_method_id = 1 AND date BETWEEN 0 AND 9999999999999 AND deleted_at IS NULL',
    },
    {
      name: 'records by category',
      sql: 'EXPLAIN QUERY PLAN SELECT * FROM records WHERE category_id = 1 AND deleted_at IS NULL',
    },
    {
      name: 'paid credits by group/date',
      sql: 'EXPLAIN QUERY PLAN SELECT * FROM paid_credits WHERE group_id = 1 AND date BETWEEN 0 AND 9999999999999 AND deleted_at IS NULL',
    },
    {
      name: 'budgets by group',
      sql: 'EXPLAIN QUERY PLAN SELECT * FROM budgets WHERE group_id = 1 AND deleted_at IS NULL',
    },
    {
      name: 'active fixed records',
      sql: 'EXPLAIN QUERY PLAN SELECT * FROM fixed_records WHERE deleted_at IS NULL',
    },
  ];

  for (const check of checks) {
    const plan = q(raw, check.sql).map((row) => row.detail).join(' | ');
    assert.match(plan, /USING (COVERING )?INDEX/i, `${check.name} should use an index: ${plan}`);
  }

  raw.close();
  console.log('query plans: OK');
}

function testNoLegacyHandlerImports() {
  const roots = [path.join(ROOT, 'src'), path.join(ROOT, 'app')];
  const forbidden = /db\/handlers|records-handler|groups-handler|budget-handler|savings-handler|savings-history-handler|payment-methods-handler|categories-handler/;
  const extensions = new Set(['.ts', '.tsx', '.js', '.jsx']);

  const walk = (directory) => {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      const fullPath = path.join(directory, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath);
      } else if (extensions.has(path.extname(entry.name))) {
        const content = fs.readFileSync(fullPath, 'utf8');
        assert.ok(
          !forbidden.test(content),
          `Legacy handler import found in ${path.relative(ROOT, fullPath)}`
        );
      }
    }
  };

  for (const root of roots) walk(root);
  console.log('legacy handler imports: OK');
}

async function testTimestampTriggers() {
  const raw = new DatabaseSync(':memory:');
  const db = shim(raw);
  await migrateDb(db);

  const id = await new ORM(db, 'Records').insert({
    amount: 1234,
    record_name: 'Trigger insert',
    date: Date.now(),
    group_id: 1,
  });

  const inserted = q(raw, 'SELECT created_at, updated_at FROM records WHERE id = ?', [id])[0];
  assert.ok(inserted.created_at > 0);
  assert.ok(inserted.updated_at >= inserted.created_at);
  assert.ok(Math.abs(inserted.created_at - Date.now()) < 60_000);

  await new Promise((resolve) => setTimeout(resolve, 5));

  await new ORM(db, 'Records').update(id, { record_name: 'Trigger update' });
  const updated = q(raw, 'SELECT created_at, updated_at FROM records WHERE id = ?', [id])[0];
  assert.strictEqual(updated.created_at, inserted.created_at);
  assert.ok(updated.updated_at > inserted.updated_at);

  // Raw inserts must also receive timestamps from the trigger.
  raw.exec(`
    INSERT INTO records (amount, record_name, date, group_id)
    VALUES (77, 'Raw insert', ${Date.now()}, 1);
  `);
  const rawRow = q(raw, "SELECT created_at, updated_at FROM records WHERE record_name = 'Raw insert'")[0];
  assert.ok(rawRow.created_at > 0);
  assert.ok(rawRow.updated_at > 0);

  raw.close();
  console.log('timestamp triggers: OK');
}

async function testInterruptedRebuild() {
  const raw = new DatabaseSync(':memory:');
  raw.exec(legacySchema);
  raw.exec(legacySeed);
  // Simulate a crash after renaming Groups but before creating the new table.
  raw.exec('ALTER TABLE Groups RENAME TO __legacy_groups');
  const db = shim(raw);
  await migrateDb(db);
  const tables = q(raw, "SELECT name FROM sqlite_master WHERE type='table'").map(r => r.name);
  assert.ok(!tables.includes('__legacy_groups'));
  assert.strictEqual(q(raw, 'SELECT group_name FROM groups')[0].group_name, 'Legacy Group');
  assert.strictEqual(q(raw, 'SELECT goal FROM groups')[0].goal, 500050);
  raw.close();
  console.log('interrupted rebuild recovery: OK');
}

(async () => {
  await testLegacyMigration();
  await testTextFallbacks();
  await testNullOldIdWithTextFallback();
  await testBudgetIdFallback();
  await testEmptyDatabase();
  await testExportImport();
  await testAuditTimestampMigration();
  await testTimestampTriggers();
  await testValidationSchemas();
  await testCreditPeriods();
  await testCreditTotalsWithPeriods();
  await testQueryPlans();
  testNoLegacyHandlerImports();
  await testInterruptedRebuild();
  console.log('ALL TESTS PASSED');
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
