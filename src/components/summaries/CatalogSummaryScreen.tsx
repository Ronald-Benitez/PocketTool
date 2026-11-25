import React, { useRef } from 'react';

import GroupSelector from '@/src/components/groups/group-selector';
import FinanceTableBlock from '@/src/components/summaries/FinanceTableBlock';
import RecordsModal, {
  type RecordsModalRef,
} from '@/src/components/records/RecordsModal';
import { useRecords } from '@/src/db';
import type { TranslationKey } from '@/src/lang/messages';
import { useLanguage } from '@/src/lang/LanguageContext';
import useRecordsStore from '@/src/stores/RecordsStore';
import { SectionCard } from '@/src/ui/data-display/SectionCard';
import { Row, Stack } from '@/src/ui/primitives/Stack';
import { Screen } from '@/src/ui/primitives/Screen';

export type CatalogSummaryKind = 'categories' | 'payments' | 'types';

export type CatalogSummaryScreenProps = {
  kind: CatalogSummaryKind;
  titleKey: TranslationKey;
  /** Column used for the main filter, for example `Records.category_id`. */
  column: string;
  fixed?: boolean;
  showGroupSelector?: boolean;
  /** Adds `Records.record_type_id` when the summary provides a nested type. */
  filterByRecordType?: boolean;
};

/**
 * Shared analytical catalog used by the Summary and Commitments tabs.
 *
 * It keeps the existing calculations and only replaces the legacy screen
 * wrapper with the standard Screen + SectionCard composition.
 */
export const CatalogSummaryScreen = ({
  kind,
  titleKey,
  column,
  fixed = false,
  showGroupSelector = true,
  filterByRecordType = true,
}: CatalogSummaryScreenProps) => {
  const { t } = useLanguage();
  const { group } = useRecordsStore();
  const { fetchRecordsWithMultipleWhere } = useRecords();
  const recordsModalRef = useRef<RecordsModalRef | null>(null);

  const onSummarySelected = async (
    id: number | undefined,
    idRecordType: number | undefined
  ) => {
    if (!id) return;
    try {
      const filters: { column: string; value: string | number | null }[] = [
        { column, value: id },
        { column: 'Records.group_id', value: group?.id ?? null },
      ];
      if (filterByRecordType && idRecordType) {
        filters.push({
          column: 'Records.record_type_id',
          value: idRecordType,
        });
      }
      const records = await fetchRecordsWithMultipleWhere(filters);
      if (records) recordsModalRef.current?.open(records);
    } catch (cause) {
      if (__DEV__) console.warn('[catalog] record detail failed', cause);
    }
  };

  const title = t(titleKey);

  return (
    <>
      <Screen scroll edges={['left', 'right']}>
        <Stack gap='xl'>
          {showGroupSelector ? (
            <Row justify='center'>
              <GroupSelector />
            </Row>
          ) : null}
          <SectionCard title={title}>
            <FinanceTableBlock
              render={kind}
              fixed={fixed}
              showTitle={false}
              onSummarySelected={onSummarySelected}
            />
          </SectionCard>
        </Stack>
      </Screen>
      <RecordsModal ref={recordsModalRef} />
    </>
  );
};
