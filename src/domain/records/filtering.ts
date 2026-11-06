import type { DataFilter, DataOrder } from '@/src/domain/filters/types';
import type { OrderCondition } from '@/src/orm';

export type RecordFilter = DataFilter;
export type RecordOrder = DataOrder;
export type RecordOrderCondition = OrderCondition<'Records'>;

export const getRecordColumnValue = (
  record: object,
  column: string
): unknown =>
  column.split('.').reduce<unknown>((value, part) => {
    if (!value || typeof value !== 'object') return undefined
    return (value as Record<string, unknown>)[part]
  }, record)

export const parseFilterValue = (value: string): string | number | boolean | null => {
  const normalized = value.trim()
  if (normalized.toLowerCase() === 'null') return null
  if (normalized.toLowerCase() === 'true') return true
  if (normalized.toLowerCase() === 'false') return false
  if (/^-?(?:\d+\.?\d*|\.\d+)$/.test(normalized)) return Number(normalized)
  return normalized
}

export const normalizeFilterValue = (
  value: string | number | boolean | null,
  actual: unknown
): string | number | boolean | null => {
  if (typeof actual === 'number' && typeof value === 'string' && value.trim() !== '') {
    const number = Number(value)
    return Number.isNaN(number) ? value : number
  }
  if (typeof actual === 'number' && typeof value === 'boolean') {
    return value ? 1 : 0
  }
  if (typeof actual === 'boolean' && typeof value === 'string') {
    if (value.toLowerCase() === 'true' || value === '1') return true
    if (value.toLowerCase() === 'false' || value === '0') return false
  }
  return value
}

export const compareRecordValue = (left: unknown, right: unknown): number => {
  if (left == null && right == null) return 0
  if (left == null) return -1
  if (right == null) return 1
  if (typeof left === 'number' && typeof right === 'number') return left - right
  if (typeof left === 'boolean' && typeof right === 'boolean') {
    return Number(left) - Number(right)
  }
  return String(left).localeCompare(String(right), undefined, { numeric: true, sensitivity: "base" })
}

export const matchesRecordFilter = <T extends object>(
  record: T,
  filter: RecordFilter
): boolean => {
  const actual = getRecordColumnValue(record, filter.column)
  const rawValues = filter.operator === "IN" || filter.operator === "BETWEEN"
    ? filter.value.split(",").map(value => parseFilterValue(value))
    : [parseFilterValue(filter.value)]
  const values = rawValues.map(value => normalizeFilterValue(value, actual))

  if (filter.operator === "IN") {
    return values.some(value => compareRecordValue(actual, value) === 0)
  }
  if (filter.operator === "BETWEEN") {
    return values.length === 2 &&
      compareRecordValue(actual, values[0]) >= 0 &&
      compareRecordValue(actual, values[1]) <= 0
  }
  if (filter.operator === "IS") return compareRecordValue(actual, values[0]) === 0
  if (filter.operator === "IS NOT") return compareRecordValue(actual, values[0]) !== 0
  if (actual == null || values[0] == null) return false

  if (filter.operator === "LIKE") {
    const pattern = `%${filter.value}%`
      .split("")
      .map(character => character === "%"
        ? ".*"
        : character === "_"
          ? "."
          : character.replace(/[|\\{}()[\]^$+?.]/g, "\\$&"))
      .join("")
    return new RegExp(`^${pattern}$`, "i").test(String(actual))
  }

  const comparison = compareRecordValue(actual, values[0])
  switch (filter.operator) {
    case "=": return comparison === 0
    case "!=": return comparison !== 0
    case ">": return comparison > 0
    case ">=": return comparison >= 0
    case "<": return comparison < 0
    case "<=": return comparison <= 0
    default: return true
  }
}

export const matchesRecordFilters = <T extends object>(
  record: T,
  filters: RecordFilter[]
): boolean => filters.every(filter => matchesRecordFilter(record, filter))

export const sortRecords = <T extends object>(
  records: T[],
  order: { column: string; direction?: 'ASC' | 'DESC' }[]
): T[] =>
  [...records].sort((left, right) => {
    for (const condition of order) {
      const comparison = compareRecordValue(
        getRecordColumnValue(left, condition.column),
        getRecordColumnValue(right, condition.column)
      )
      if (comparison !== 0) return condition.direction === 'DESC' ? -comparison : comparison
    }
    return 0
  })
