import type { OrderCondition } from '@/src/orm';
import type { DataOrder } from '@/src/domain/filters/types';
import type { RecordFilter } from '@/src/domain/records/filtering';
import { FilterModal } from '@/src/ui/filters/FilterModal';
import { useRecordFilterFields } from './useRecordFilterFields';

export type { RecordFilter } from '@/src/domain/records/filtering';

export const RECORDS_ORDER_STORAGE_KEY = 'recordsTableOrder';

interface RecordsFilterModalProps {
  visible: boolean;
  filters: RecordFilter[];
  order: OrderCondition<'Records'>[];
  onClose: () => void;
  onApply: (
    filters: RecordFilter[],
    order: OrderCondition<'Records'>[]
  ) => Promise<void>;
  title?: string;
  allowOrder?: boolean;
  /** `null` desactiva la persistencia del orden (por ejemplo en Summary). */
  storageKey?: string | null;
}

/**
 * Wrapper de Records sobre el modal de filtros genérico. La vista principal y
 * el detalle de Summary comparten este mismo componente.
 */
const RecordsFilterModal = ({
  visible,
  filters,
  order,
  onClose,
  onApply,
  title,
  allowOrder = true,
  storageKey = RECORDS_ORDER_STORAGE_KEY,
}: RecordsFilterModalProps) => {
  const fields = useRecordFilterFields();

  return (
    <FilterModal
      visible={visible}
      onClose={onClose}
      fields={fields}
      filters={filters}
      order={order as DataOrder[]}
      onApply={(nextFilters, nextOrder) =>
        onApply(nextFilters, nextOrder as OrderCondition<'Records'>[])
      }
      title={title}
      allowOrder={allowOrder}
      storageKey={storageKey === null ? undefined : storageKey}
    />
  );
};

export default RecordsFilterModal;
