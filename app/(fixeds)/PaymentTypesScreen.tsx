import React from 'react';

import { CatalogSummaryScreen } from '@/src/components/summaries/CatalogSummaryScreen';

const PaymentTypesScreen = () => (
  <CatalogSummaryScreen
    kind='types'
    titleKey='resume.summaryByTypes'
    column='record_type_id'
    fixed
    showGroupSelector={false}
    filterByRecordType={false}
  />
);

export default PaymentTypesScreen;
