import React from 'react';
import { Pressable, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

import type { FeatureId } from '@/src/features';
import { isDashboardBlockAvailable } from '@/src/dashboard/navigation';
import {
  DASHBOARD_ACTION_LIST,
  DASHBOARD_BLOCKS,
} from '@/src/dashboard/registry';
import { MAX_QUICK_ACTIONS } from '@/src/dashboard/layout';
import type {
  DashboardActionId,
  DashboardBlockId,
  DashboardBlockState,
} from '@/src/dashboard/types';
import { useLanguage } from '@/src/lang/LanguageContext';
import { IconButton } from '@/src/ui/actions/IconButton';
import { LinkButton } from '@/src/ui/actions/LinkButton';
import { SectionCard } from '@/src/ui/data-display/SectionCard';
import { SwitchField } from '@/src/ui/forms/SwitchField';
import {
  SortableList,
  type SortableListHelpers,
} from '@/src/ui/lists/SortableList';
import { AppText } from '@/src/ui/primitives/AppText';
import { Row, Stack } from '@/src/ui/primitives/Stack';
import { useTheme } from '@/src/ui/theme/ThemeProvider';

export type DashboardEditorProps = {
  blocks: DashboardBlockState[];
  quickActions: DashboardActionId[];
  enabled: Record<FeatureId, boolean>;
  onMove: (from: number, to: number) => void;
  onToggleVisibility: (id: DashboardBlockId, visible: boolean) => void;
  onQuickActions: (actions: DashboardActionId[]) => void;
  onOpenSettings: () => void;
};

const rowStyle = {
  minHeight: 56,
  paddingHorizontal: 16,
  paddingVertical: 8,
  gap: 8,
};

export const DashboardEditor = ({
  blocks,
  quickActions,
  enabled,
  onMove,
  onToggleVisibility,
  onQuickActions,
  onOpenSettings,
}: DashboardEditorProps) => {
  const { t } = useLanguage();
  const { colors } = useTheme();
  const visibleBlocks = blocks.filter((block) => block.visible);
  const hiddenBlocks = blocks.filter((block) => !block.visible);
  const hasUnavailableAction = DASHBOARD_ACTION_LIST.some(
    (action) => action.feature && !enabled[action.feature]
  );

  const fullIndex = (visibleIndex: number) => {
    const id = visibleBlocks[visibleIndex]?.id;
    return id ? blocks.findIndex((block) => block.id === id) : -1;
  };

  const handleReorder = (from: number, to: number) => {
    const fromIndex = fullIndex(from);
    const toIndex = fullIndex(to);
    if (fromIndex < 0 || toIndex < 0) return;
    onMove(fromIndex, toIndex);
  };

  const renderVisibleBlock = (
    block: DashboardBlockState,
    helpers: SortableListHelpers,
    dragHandle: React.ReactNode
  ) => {
    const definition = DASHBOARD_BLOCKS[block.id];
    const available = isDashboardBlockAvailable(block.id, enabled);

    return (
      <Row justify='space-between' align='center' style={rowStyle}>
        <MaterialIcons name={definition.icon} size={22} color={colors.primary} />
        <Pressable
          accessible
          accessibilityRole='adjustable'
          accessibilityLabel={`${t(definition.labelKey)}. ${t(
            'dashboard.dragHint'
          )}`}
          accessibilityActions={[
            { name: 'increment', label: t('dashboard.moveUp') },
            { name: 'decrement', label: t('dashboard.moveDown') },
          ]}
          onAccessibilityAction={({ nativeEvent }) => {
            if (nativeEvent.actionName === 'increment') helpers.moveUp();
            if (nativeEvent.actionName === 'decrement') helpers.moveDown();
          }}
          style={{ flex: 1 }}
        >
          <AppText variant='body' numberOfLines={1}>
            {t(definition.labelKey)}
          </AppText>
          {!available ? (
            <AppText variant='caption' color='muted'>
              {t('dashboard.disabledModule')}
            </AppText>
          ) : null}
        </Pressable>
        <IconButton
          label={t('dashboard.hide')}
          size='sm'
          variant='ghost'
          icon={
            <MaterialIcons
              name='visibility'
              size={20}
              color={colors.textMuted}
            />
          }
          onPress={() => onToggleVisibility(block.id, false)}
        />
        {dragHandle}
      </Row>
    );
  };

  return (
    <Stack gap='xl'>
      <SectionCard
        title={t('dashboard.visible')}
        subtitle={t('dashboard.dragHint')}
        padded={false}
        variant='outlined'
      >
        <SortableList
          items={visibleBlocks}
          keyExtractor={(block) => block.id}
          onReorder={handleReorder}
          dragLabel={t('dashboard.dragHint')}
          containerVariant={null}
          renderItem={(block, dragHandle, _index, helpers) =>
            renderVisibleBlock(block, helpers, dragHandle)
          }        />
      </SectionCard>

      {hiddenBlocks.length > 0 ? (
        <SectionCard
          title={t('dashboard.hidden')}
          padded={false}
          variant='outlined'
        >
          {hiddenBlocks.map((block) => {
            const definition = DASHBOARD_BLOCKS[block.id];
            const available = isDashboardBlockAvailable(block.id, enabled);
            return (
              <Row
                key={block.id}
                justify='space-between'
                align='center'
                style={rowStyle}
              >
                <MaterialIcons
                  name={definition.icon}
                  size={22}
                  color={colors.textMuted}
                />
                <View style={{ flex: 1 }}>
                  <AppText variant='body' numberOfLines={1}>
                    {t(definition.labelKey)}
                  </AppText>
                  {!available ? (
                    <AppText variant='caption' color='muted'>
                      {t('dashboard.disabledModule')}
                    </AppText>
                  ) : null}
                </View>
                <IconButton
                  label={t('dashboard.show')}
                  size='sm'
                  variant='ghost'
                  icon={
                    <MaterialIcons
                      name='visibility-off'
                      size={20}
                      color={colors.textMuted}
                    />
                  }
                  onPress={() => onToggleVisibility(block.id, true)}
                />
              </Row>
            );
          })}
        </SectionCard>
      ) : null}

      <SectionCard
        title={t('dashboard.quickActions')}
        tooltip={{
          title: t('dashboard.quickActions'),
          body: t('dashboard.quickActionsHint'),
        }}
        variant='outlined'
      >
        <Stack gap='md'>
          {DASHBOARD_ACTION_LIST.map((action) => {
            const selected = quickActions.includes(action.id);
            const available = !action.feature || Boolean(enabled[action.feature]);
            const atLimit =
              !selected && quickActions.length >= MAX_QUICK_ACTIONS;
            return (
              <SwitchField
                key={action.id}
                label={t(action.labelKey)}
                description={!available ? t('dashboard.disabledModule') : undefined}
                value={selected}
                disabled={action.id === 'record' || !available || atLimit}
                onChange={(value) => {
                  if (value) {
                    onQuickActions([...quickActions, action.id]);
                  } else {
                    onQuickActions(
                      quickActions.filter((id) => id !== action.id)
                    );
                  }
                }}
              />
            );
          })}
          {hasUnavailableAction ? (
            <LinkButton
              label={t('dashboard.openSettings')}
              onPress={onOpenSettings}
            />
          ) : null}
        </Stack>
      </SectionCard>
    </Stack>
  );
};
