import React from 'react';

import { CatalogSummaryScreen } from '@/src/components/summaries/CatalogSummaryScreen';

const PaymentMethodsScreen = () => (
  <CatalogSummaryScreen
    kind='payments'
    titleKey='resume.summaryByPayments'
    column='Records.payment_method_id'
    fixed
    showGroupSelector={false}
    filterByRecordType={false}
  />
);

export default PaymentMethodsScreen;
