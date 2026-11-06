import type { SqlOperator } from '@/src/orm';

export type FilterKind =
  | 'text'
  | 'number'
  | 'money'
  | 'date'
  | 'boolean'
  | 'enum'
  | 'relation';

export type FilterOption = {
  label: string;
  value: string | number;
};

export type FilterField = {
  /** Identificador estable para el selector y las pruebas. */
  id: string;
  /** Path de columna del ORM, por ejemplo `record_type_id`. */
  column: string;
  label: string;
  kind: FilterKind;
  operators: SqlOperator[];
  options?: FilterOption[];
  /** Se muestra solo cuando el usuario activa columnas avanzadas. */
  advanced?: boolean;
  /** Habilita buscador en el selector de opciones. */
  searchable?: boolean;
  nullable?: boolean;
};

export type DataFilter = {
  column: string;
  operator: SqlOperator;
  value: string;
};

export type DataOrder = {
  column: string;
  direction: 'ASC' | 'DESC';
};

export const TEXT_OPERATORS: SqlOperator[] = ['=', '!=', 'LIKE', 'IN', 'IS', 'IS NOT'];
export const RANGE_OPERATORS: SqlOperator[] = [
  '=',
  '!=',
  '>',
  '>=',
  '<',
  '<=',
  'BETWEEN',
  'IN',
  'IS',
  'IS NOT',
];
export const ENUM_OPERATORS: SqlOperator[] = ['=', '!=', 'IN', 'IS', 'IS NOT'];
export const BOOLEAN_OPERATORS: SqlOperator[] = ['=', '!=', 'IS', 'IS NOT'];

export const getOperatorsForKind = (kind: FilterKind): SqlOperator[] => {
  switch (kind) {
    case 'text':
      return TEXT_OPERATORS;
    case 'number':
    case 'money':
    case 'date':
      return RANGE_OPERATORS;
    case 'boolean':
      return BOOLEAN_OPERATORS;
    case 'enum':
    case 'relation':
      return ENUM_OPERATORS;
    default:
      return TEXT_OPERATORS;
  }
};

export const getDefaultOperator = (kind: FilterKind): SqlOperator =>
  kind === 'text' ? 'LIKE' : '=';

export const supportsBetween = (kind: FilterKind) =>
  kind === 'number' || kind === 'money' || kind === 'date';

export const supportsMultipleValues = (kind: FilterKind) =>
  kind === 'enum' || kind === 'relation';

export const splitFilterValues = (value: string): string[] =>
  value
    .split(',')
    .map((item) => item.trim())
    .filter((item) => item.length > 0);

export const joinFilterValues = (values: string[]): string => values.join(',');
