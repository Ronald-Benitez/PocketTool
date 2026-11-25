import React from 'react';

import type { BudgetLineComparison } from '@/src/domain/budgets/types';
import { useLanguage } from '@/src/lang/LanguageContext';
import { SortableList } from '@/src/ui/lists/SortableList';

type BudgetDraggableLinesProps = {
  lines: BudgetLineComparison[];
  onReorder: (from: number, to: number) => void;
  renderLine: (
    line: BudgetLineComparison,
    dragHandle: React.ReactNode,
    index: number
  ) => React.ReactNode;
};

export const BudgetDraggableLines = ({
  lines,
  onReorder,
  renderLine,
}: BudgetDraggableLinesProps) => {
  const { t } = useLanguage();

  return (
    <SortableList
      items={lines}
      keyExtractor={(line) => line.lineId}
      onReorder={onReorder}
      dragLabel={t('budget.lines.reorder')}
      renderItem={(line, dragHandle, index) =>
        renderLine(line, dragHandle, index)
      }
    />
  );
};
