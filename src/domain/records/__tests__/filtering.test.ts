import { buildRecordFilterFields } from '../filterFields';
import {
  matchesRecordFilter,
  matchesRecordFilters,
  sortRecords,
  type RecordFilter,
} from '../filtering';
import { resolveColumnPath, getValueKind } from '@/src/db/schema/metadata';

const t = (key: string) => key;

const baseRecord = {
  record_name: 'Coffee',
  amount: 1250,
  date: new Date(2026, 0, 15).getTime(),
  record_type_id: 2,
  category_id: 3,
  group_id: 1,
  is_full_tank: 1,
  RecordTypes: { effect: '-', type_name: 'Expense' },
  PaymentMethods: { PaymentTypes: { payment_type_name: 'Credit' } },
};

describe('record filtering', () => {
  it('matches money values in cents', () => {
    const filter: RecordFilter = { column: 'amount', operator: '=', value: '1250' };
    expect(matchesRecordFilter(baseRecord, filter)).toBe(true);
  });

  it('matches BETWEEN with two values', () => {
    const filter: RecordFilter = {
      column: 'amount',
      operator: 'BETWEEN',
      value: '1000,2000',
    };
    expect(matchesRecordFilter(baseRecord, filter)).toBe(true);
    expect(matchesRecordFilter(baseRecord, { ...filter, value: '1300,2000' })).toBe(false);
  });

  it('matches IN with relation ids', () => {
    const filter: RecordFilter = {
      column: 'record_type_id',
      operator: 'IN',
      value: '1,2,3',
    };
    expect(matchesRecordFilter(baseRecord, filter)).toBe(true);
  });

  it('matches null with IS', () => {
    const record = { ...baseRecord, category_id: null };
    const filter: RecordFilter = { column: 'category_id', operator: 'IS', value: 'null' };
    expect(matchesRecordFilter(record, filter)).toBe(true);
  });

  it('normalizes booleans stored as 0/1', () => {
    const filter: RecordFilter = { column: 'is_full_tank', operator: '=', value: 'true' };
    expect(matchesRecordFilter(baseRecord, filter)).toBe(true);
  });

  it('matches related columns by path', () => {
    const filter: RecordFilter = {
      column: 'PaymentMethods.PaymentTypes.payment_type_name',
      operator: '=',
      value: 'Credit',
    };
    expect(matchesRecordFilter(baseRecord, filter)).toBe(true);
  });

  it('combines filters and sorts records', () => {
    const records = [
      baseRecord,
      { ...baseRecord, record_name: 'Tea', amount: 500 },
      { ...baseRecord, record_name: 'Lunch', amount: 3000 },
    ];
    const filtered = records.filter((record) =>
      matchesRecordFilters(record, [{ column: 'amount', operator: '>=', value: '1000' }])
    );
    const sorted = sortRecords(filtered, [{ column: 'amount', direction: 'DESC' }]);
    expect(sorted.map((record) => record.record_name)).toEqual(['Lunch', 'Coffee']);
  });
});

describe('record filter fields', () => {
  it('builds typed common and advanced fields', () => {
    const fields = buildRecordFilterFields({
      t,
      recordTypes: [{ id: 1, type_name: 'Income' }],
      categories: [{ id: 2, category_name: 'Food' }],
      paymentMethods: [{ id: 3, method_name: 'Card' }],
      groups: [{ id: 4, group_name: 'January', month: 0, year: 2026 }],
      fixeds: [{ id: 5, fixed_name: 'Rent' }],
      months: ['Jan', 'Feb'],
    });

    const amount = fields.find((field) => field.column === 'amount');
    const date = fields.find((field) => field.column === 'date');
    const type = fields.find((field) => field.column === 'record_type_id');
    const effect = fields.find((field) => field.column === 'RecordTypes.effect');
    const created = fields.find((field) => field.column === 'created_at');

    expect(amount?.kind).toBe('money');
    expect(amount?.operators).toContain('BETWEEN');
    expect(date?.kind).toBe('date');
    expect(date?.operators).toContain('BETWEEN');
    expect(type?.kind).toBe('relation');
    expect(type?.options).toEqual([{ label: 'Income', value: 1 }]);
    expect(effect?.kind).toBe('enum');
    expect(effect?.options).toHaveLength(3);
    expect(created?.advanced).toBe(true);
  });

  it('resolves relation metadata without SQL', () => {
    const effect = resolveColumnPath('Records', 'RecordTypes.effect');
    const paymentType = resolveColumnPath(
      'Records',
      'PaymentMethods.PaymentTypes.payment_type_name'
    );

    expect(effect?.table).toBe('RecordTypes');
    expect(effect && getValueKind(effect.definition)).toBe('text');
    expect(paymentType?.table).toBe('PaymentTypes');
  });
});
