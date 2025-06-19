// src/db/types.ts
export type ColumnType = 'TEXT' | 'INTEGER' | 'REAL' | 'BLOB';

export interface ColumnDefinition {
  name: string;
  type: ColumnType;
  primaryKey?: boolean;
  autoIncrement?: boolean; // For INTEGER PRIMARY KEY
  notNull?: boolean;
  unique?: boolean;
  defaultValue?: string | number | null;
  references?: {
    table: string;
    column: string;
  };
}

export interface TableDefinition {
  name: string;
  columns: ColumnDefinition[];
}

export type TableSchema = {
  [tableName: string]: TableDefinition;
};

export interface Entity {
  id?: number;
}

export type QueryWhereClause = {
  [key: string]: string | number | boolean | null | QueryComparisonOperator;
};

export interface QueryComparisonOperator {
    _eq?: string | number | boolean | null;
    _ne?: string | number | boolean | null;
    _gt?: number;
    _gte?: number;
    _lt?: number;
    _lte?: number;
    _like?: string;
    _in?: (string | number)[];
    _nin?: (string | number)[];
    _is_null?: boolean;
    _is_not_null?: boolean;
}