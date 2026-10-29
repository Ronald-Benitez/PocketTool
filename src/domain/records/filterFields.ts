import {
  getReferencedTable,
  getValueKind,
  resolveColumnPath,
} from '@/src/db/schema/metadata';
import {
  getOperatorsForKind,
  type FilterField,
  type FilterKind,
  type FilterOption,
} from '@/src/domain/filters/types';

export type RecordFilterOptionSource = {
  id?: number;
  label: string;
};

export type RecordFilterFieldInputs = {
  t: (key: string) => string;
  recordTypes?: { id?: number; type_name: string }[];
  categories?: { id?: number; category_name: string }[];
  paymentMethods?: { id?: number; method_name: string }[];
  groups?: { id?: number; group_name: string; month: number; year: number }[];
  fixeds?: { id?: number; fixed_name: string }[];
  months?: string[];
};

const toOptions = (items: RecordFilterOptionSource[] = []): FilterOption[] =>
  items.flatMap((item) =>
    typeof item.id === 'number' ? [{ label: item.label, value: item.id }] : []
  );

const columnLabel = (column: string, t: (key: string) => string) =>
  column
    .split('.')
    .map((part) => t(`recordsFilters.columns.${part}`))
    .join(' → ')

export const buildRecordFilterFields = ({
  t,
  recordTypes = [],
  categories = [],
  paymentMethods = [],
  groups = [],
  fixeds = [],
  months = [],
}: RecordFilterFieldInputs): FilterField[] => {
  const build = (
    column: string,
    options?: {
      kind?: FilterKind;
      values?: FilterOption[];
      advanced?: boolean;
    }
  ): FilterField | null => {
    const resolved = resolveColumnPath('Records', column);
    if (!resolved) return null;

    const kind =
      options?.kind ??
      (getReferencedTable(resolved.definition) ? 'relation' : getValueKind(resolved.definition));

    return {
      id: column,
      column,
      label: columnLabel(column, t),
      kind,
      operators: getOperatorsForKind(kind),
      options: options?.values,
      advanced: options?.advanced,
      searchable: kind === 'relation' || kind === 'enum',
      nullable: !resolved.definition.notNull,
    };
  };

  const recordTypeOptions = toOptions(
    recordTypes.map((type) => ({ id: type.id, label: type.type_name }))
  );
  const categoryOptions = toOptions(
    categories.map((category) => ({ id: category.id, label: category.category_name }))
  );
  const paymentMethodOptions = toOptions(
    paymentMethods.map((method) => ({ id: method.id, label: method.method_name }))
  );
  const groupOptions = toOptions(
    groups.map((group) => ({
      id: group.id,
      label: `${group.group_name} (${months[group.month] ?? group.month + 1} ${group.year})`,
    }))
  );
  const fixedOptions = toOptions(
    fixeds.map((fixed) => ({ id: fixed.id, label: fixed.fixed_name }))
  );
  const monthOptions = months.map((label, index) => ({
    label,
    value: String(index),
  }));
  const effectOptions: FilterOption[] = [
    { label: t('item.income'), value: '+' },
    { label: t('item.expense'), value: '-' },
    { label: t('item.transfer'), value: '=' },
  ];

  const fields: (FilterField | null)[] = [
    build('record_name', { kind: 'text' }),
    build('amount', { kind: 'money' }),
    build('date', { kind: 'date' }),
    build('record_type_id', { kind: 'relation', values: recordTypeOptions }),
    build('category_id', { kind: 'relation', values: categoryOptions }),
    build('payment_method_id', { kind: 'relation', values: paymentMethodOptions }),
    build('group_id', { kind: 'relation', values: groupOptions }),
    build('fixed_id', { kind: 'relation', values: fixedOptions }),
    build('RecordTypes.effect', { kind: 'enum', values: effectOptions }),
    build('Groups.year', { kind: 'number' }),
    build('Groups.month', { kind: 'enum', values: monthOptions }),

    build('created_at', { kind: 'date', advanced: true }),
    build('updated_at', { kind: 'date', advanced: true }),
    build('id', { kind: 'number', advanced: true }),
    build('Groups.group_name', { kind: 'text', advanced: true }),
    build('Groups.goal', { kind: 'money', advanced: true }),
    build('RecordTypes.type_name', { kind: 'text', advanced: true }),
    build('Categories.category_name', { kind: 'text', advanced: true }),
    build('PaymentMethods.method_name', { kind: 'text', advanced: true }),
    build('PaymentMethods.PaymentTypes.payment_type_name', { kind: 'text', advanced: true }),
    build('Fixed.fixed_name', { kind: 'text', advanced: true }),
    build('Fixed.fixed_amount', { kind: 'money', advanced: true }),
  ];

  return fields.filter((field): field is FilterField => field !== null);
};

export const getDefaultRecordFilterField = (fields: FilterField[]): FilterField | undefined =>
  fields.find((field) => !field.advanced);
