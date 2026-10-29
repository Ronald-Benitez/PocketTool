import { APP_SCHEMA, type TableName } from './tables';
import type { ColumnDefinition, TableDefinition } from '../types';

export const quoteIdent = (name: string) => `"${name.replace(/"/g, '""')}"`;

export const escapeSqlString = (value: string) => `'${value.replace(/'/g, "''")}'`;

export const columnDefinitionSql = (table: TableDefinition, column: ColumnDefinition) => {
  let sql = `${quoteIdent(column.name)} ${column.type}`;

  if (column.primaryKey) sql += ' PRIMARY KEY';
  if (column.autoIncrement) sql += ' AUTOINCREMENT';
  if (column.notNull) sql += ' NOT NULL';
  if (column.unique) sql += ' UNIQUE';

  if (column.defaultValue !== undefined) {
    if (column.defaultValue === null) {
      sql += ' DEFAULT NULL';
    } else if (typeof column.defaultValue === 'string') {
      sql += ` DEFAULT ${escapeSqlString(column.defaultValue)}`;
    } else {
      sql += ` DEFAULT ${column.defaultValue}`;
    }
  }

  if (column.references) {
    const target = APP_SCHEMA[column.references.table as TableName];
    sql += ` REFERENCES ${quoteIdent(target.sqlName)}(${quoteIdent(column.references.column)})`;
    if (column.references.onDelete) {
      sql += ` ON DELETE ${column.references.onDelete}`;
    }
  }

  return sql;
};

export const createTableSql = (table: TableDefinition) => {
  const columns = table.columns.map((column) => columnDefinitionSql(table, column)).join(', ');
  return `CREATE TABLE IF NOT EXISTS ${quoteIdent(table.sqlName)} (${columns});`;
};

export const createIndexSql = (table: TableDefinition) => {
  if (!table.indexes?.length) return [];
  return table.indexes.map((index) => {
    const unique = index.unique ? 'UNIQUE ' : '';
    const columns = index.columns.map(quoteIdent).join(', ');
    const where = index.where ? ` WHERE ${index.where}` : '';
    return `CREATE ${unique}INDEX IF NOT EXISTS ${quoteIdent(index.name)} ON ${quoteIdent(table.sqlName)} (${columns})${where};`;
  });
};

export const nowMsSql = "CAST((julianday('now') - 2440587.5) * 86400000 AS INTEGER)";

export const timestampTriggerNames = (table: TableDefinition) => ({
  insert: `trg_${table.sqlName}_timestamps_insert`,
  update: `trg_${table.sqlName}_timestamps_update`,
});

export const createTimestampTriggerSql = (table: TableDefinition): string[] => {
  const hasCreated = table.columns.some((column) => column.name === 'created_at');
  const hasUpdated = table.columns.some((column) => column.name === 'updated_at');

  if (!hasCreated && !hasUpdated) return [];

  const names = timestampTriggerNames(table);
  const statements: string[] = [];

  const insertSet = [
    hasCreated ? `"created_at" = COALESCE(NEW."created_at", ${nowMsSql})` : null,
    hasUpdated ? `"updated_at" = COALESCE(NEW."updated_at", ${nowMsSql})` : null,
  ].filter(Boolean);

  const insertWhen = [
    hasCreated ? 'NEW."created_at" IS NULL' : null,
    hasUpdated ? 'NEW."updated_at" IS NULL' : null,
  ].filter(Boolean);

  if (insertSet.length > 0) {
    statements.push(`DROP TRIGGER IF EXISTS ${quoteIdent(names.insert)};`);
    statements.push(`CREATE TRIGGER ${quoteIdent(names.insert)}
AFTER INSERT ON ${quoteIdent(table.sqlName)}
FOR EACH ROW
WHEN ${insertWhen.join(' OR ')}
BEGIN
  UPDATE ${quoteIdent(table.sqlName)}
  SET ${insertSet.join(', ')}
  WHERE "id" = NEW."id";
END;`);
  }

  if (hasUpdated) {
    statements.push(`DROP TRIGGER IF EXISTS ${quoteIdent(names.update)};`);
    statements.push(`CREATE TRIGGER ${quoteIdent(names.update)}
AFTER UPDATE ON ${quoteIdent(table.sqlName)}
FOR EACH ROW
WHEN NEW."updated_at" IS OLD."updated_at"
BEGIN
  UPDATE ${quoteIdent(table.sqlName)}
  SET "updated_at" = ${nowMsSql}
  WHERE "id" = NEW."id";
END;`);
  }

  return statements;
};

