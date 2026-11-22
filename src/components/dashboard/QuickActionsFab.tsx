import React, { useState } from 'react';
import { MaterialIcons } from '@expo/vector-icons';

import type { DashboardActionId } from '@/src/dashboard/types';
import {
  DASHBOARD_ACTIONS,
} from '@/src/dashboard/registry';
import { isDashboardActionAvailable } from '@/src/dashboard/layout';
import { useFeatures } from '@/src/features';
import { useLanguage } from '@/src/lang/LanguageContext';
import AddFixed from '@/src/components/fixed/AddFixed';
import AddGroup from '@/src/components/groups/add-group';
import AddItem from '@/src/components/records/add-record';
import { AddSaving } from '@/src/components/savings/add-savings';
import { FloatingActions } from '@/src/ui/actions/FloatingActions';
import { useTheme } from '@/src/ui/theme/ThemeProvider';

export type QuickActionsFabProps = {
  actions: DashboardActionId[];
  onRefresh: () => void;
  bottomOffset: number;
};

export const QuickActionsFab = ({
  actions,
  onRefresh,
  bottomOffset,
}: QuickActionsFabProps) => {
  const { t } = useLanguage();
  const { colors } = useTheme();
  const enabled = useFeatures((state) => state.enabled);
  const [opened, setOpened] = useState<DashboardActionId | null>(null);

  const available = actions.filter((id) =>
    isDashboardActionAvailable(id, enabled)
  );
  if (available.length === 0) return null;

  const [mainId, ...rest] = available;
  const mainDefinition = DASHBOARD_ACTIONS[mainId];
  const secondary = rest.map((id) => ({
    id,
    label: t(DASHBOARD_ACTIONS[id].labelKey),
    icon: (
      <MaterialIcons
        name={DASHBOARD_ACTIONS[id].icon}
        size={22}
        color={colors.primary}
      />
    ),
    onPress: () => setOpened(id),
  }));

  return (
    <>
      <FloatingActions
        mainAction={{
          id: mainId,
          label: t(mainDefinition.labelKey),
          icon: (
            <MaterialIcons
              name={mainDefinition.icon}
              size={28}
              color={colors.onPrimary}
            />
          ),
          onPress: () => setOpened(mainId),
        }}
        actions={secondary}
        bottomOffset={bottomOffset}
      />

      <AddItem
        open={opened === 'record'}
        onClose={() => setOpened(null)}
        onSaved={() => {
          setOpened(null);
          onRefresh();
        }}
      />
      <AddFixed
        open={opened === 'fixed'}
        onClose={() => setOpened(null)}
        onSaved={() => {
          setOpened(null);
          onRefresh();
        }}
      />
      <AddSaving
        open={opened === 'saving'}
        onClose={() => setOpened(null)}
        onSaved={() => {
          setOpened(null);
          onRefresh();
        }}
      />
      <AddGroup
        open={opened === 'group'}
        onClose={() => setOpened(null)}
        onSaved={() => {
          setOpened(null);
          onRefresh();
        }}
      />
    </>
  );
};
