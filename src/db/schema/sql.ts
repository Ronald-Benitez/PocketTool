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
