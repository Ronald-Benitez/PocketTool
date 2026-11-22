import React from 'react';

import { CatalogSummaryScreen } from '@/src/components/summaries/CatalogSummaryScreen';

const PaymentTypesScreen = () => (
  <CatalogSummaryScreen
    kind='types'
    titleKey='resume.summaryByTypes'
    column='PaymentMethods.payment_type_id'
  />
);

export default PaymentTypesScreen;
