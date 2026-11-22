import React from 'react';

import { CatalogSummaryScreen } from '@/src/components/summaries/CatalogSummaryScreen';

const CategoriesScreen = () => (
  <CatalogSummaryScreen
    kind='categories'
    titleKey='resume.summaryByCategories'
    column='Records.category_id'
  />
);

export default CategoriesScreen;
