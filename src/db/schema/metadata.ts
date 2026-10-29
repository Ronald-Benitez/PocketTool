import type { ColumnDefinition } from '../types';
import { APP_SCHEMA, type TableName } from './tables';

export type ValueKind = 'text' | 'number' | 'money' | 'date' | 'boolean';

export type ResolvedColumn = {
  /** Tabla donde vive la columna. */
  table: TableName;
  column: string;
  definition: ColumnDefinition;
};

export const isTableName = (value: string): value is TableName =>
  Object.prototype.hasOwnProperty.call(APP_SCHEMA, value);

export const getTableDefinition = (table: string) =>
  isTableName(table) ? APP_SCHEMA[table] : null;

export const getColumnDefinition = (table: string, column: string) =>
  getTableDefinition(table)?.columns.find((item) => item.name === column) ?? null;

/**
 * Resuelve un path del ORM (por ejemplo `RecordTypes.effect` o
 * `record_type_id`) contra el esquema, sin ejecutar SQL.
 */
export const resolveColumnPath = (
  baseTable: TableName,
  path: string
): ResolvedColumn | null => {
  const segments = path.split('.').filter(Boolean);
  if (segments.length === 0) return null;

  let currentTable: TableName = baseTable;
  if (segments[0] === baseTable) segments.shift();
  const column = segments.pop();
  if (!column) return null;

  for (const segment of segments) {
    const table = getTableDefinition(currentTable);
    const relation = table?.columns.find(
      (item) => item.references?.table === segment
    );
    if (!relation || !isTableName(segment)) return null;
    currentTable = segment;
  }

  const definition = getColumnDefinition(currentTable, column);
  if (!definition) return null;

  return { table: currentTable, column, definition };
};

export const getValueKind = (definition: ColumnDefinition): ValueKind => {
  if (definition.kind === 'money') return 'money';
  if (definition.kind === 'timestamp') return 'date';
  if (definition.kind === 'boolean') return 'boolean';
  if (definition.type === 'INTEGER' || definition.type === 'REAL') return 'number';
  return 'text';
};

export const getReferencedTable = (
  definition: ColumnDefinition
): TableName | null => {
  const table = definition.references?.table;
  return table && isTableName(table) ? table : null;
};
