import React from 'react';
import { View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

import type { ClosingLineDraft, ClosingSection as ClosingSectionType } from '@/src/domain/closing/types';
import { useLanguage } from '@/src/lang/LanguageContext';
import { formatMoneyWithSymbol } from '@/src/utils';
import { Button } from '@/src/ui/actions/Button';
import { IconButton } from '@/src/ui/actions/IconButton';
import { Badge } from '@/src/ui/data-display/Badge';
import { FinanceValue } from '@/src/ui/data-display/FinanceValue';
import { AppText } from '@/src/ui/primitives/AppText';
import { Divider } from '@/src/ui/primitives/Divider';
import { Row, Stack } from '@/src/ui/primitives/Stack';
import { Surface } from '@/src/ui/primitives/Surface';
import { useTheme } from '@/src/ui/theme/ThemeProvider';

type ClosingSectionProps = {
  section: ClosingSectionType;
  title: string;
  hint: string;
  lines: ClosingLineDraft[];
  subtotalCents?: number;
  emptyText: string;
  readOnly: boolean;
  onAdd: () => void;
  onEdit: (line: ClosingLineDraft) => void;
  onDelete: (line: ClosingLineDraft) => void;
};

const kindLabelKey = (kind: ClosingLineDraft['kind']) => {
  switch (kind) {
    case 'cash':
      return 'closing.kinds.cash';
    case 'account':
      return 'closing.kinds.account';
    case 'receivable':
      return 'closing.kinds.receivable';
    case 'saving':
      return 'closing.kinds.saving';
    case 'card':
      return 'closing.kinds.card';
    case 'fixed':
      return 'closing.kinds.fixed';
    case 'financing':
      return 'closing.kinds.financing';
    case 'next_group':
      return 'closing.kinds.nextGroup';
    case 'adjustment':
      return 'closing.kinds.adjustment';
    default:
      return 'closing.kinds.manual';
  }
};

export const ClosingSection = ({
  section,
  title,
  hint,
  lines,
  subtotalCents,
  emptyText,
  readOnly,
  onAdd,
  onEdit,
  onDelete,
}: ClosingSectionProps) => {
  const { t } = useLanguage();
  const { colors } = useTheme();
  const visibleLines = lines.filter((line) => line.section === section);

  return (
    <Surface variant='outlined' padding='md'>
      <Stack gap='sm'>
        <Row justify='space-between' align='center' gap='sm'>
          <View style={{ flex: 1 }}>
            <AppText variant='subtitle'>{title}</AppText>
            <AppText variant='caption' color='muted'>
              {hint}
            </AppText>
          </View>
          {subtotalCents != null ? (
            <FinanceValue cents={subtotalCents} size='md' color={colors.text} />
          ) : null}
        </Row>

        {visibleLines.length === 0 ? (
          <AppText variant='caption' color='muted'>
            {emptyText}
          </AppText>
        ) : null}

        {visibleLines.map((line, index) => {
          const isSubtract = line.operation === 'subtract';
          const isResolution = line.section === 'resolution';
          const difference =
            line.kind === 'card' && line.referenceCents != null
              ? line.amountCents - line.referenceCents
              : null;

          return (
            <React.Fragment key={`${line.kind}-${line.id ?? index}-${index}`}>
              {index > 0 ? <Divider /> : null}
              <Row justify='space-between' align='center' gap='sm'>
                <View style={{ flex: 1 }}>
                  <Row gap='xs' align='center'>
                    <AppText variant='body' numberOfLines={1} style={{ flexShrink: 1 }}>
                      {line.label}
                    </AppText>
                    <Badge
                      label={t(kindLabelKey(line.kind) as never)}
                      tone='neutral'
                      size='sm'
                    />
                    {isResolution && line.direction ? (
                      <Badge
                        label={t(
                          `closing.directions.${line.direction}` as never
                        )}
                        tone={line.direction === 'from' ? 'warning' : 'success'}
                        size='sm'
                      />
                    ) : null}
                  </Row>
                  {difference != null ? (
                    <AppText
                      variant='caption'
                      color={difference === 0 ? 'muted' : undefined}
                      style={
                        difference === 0
                          ? undefined
                          : {
                              color:
                                difference > 0 ? colors.expense : colors.income,
                            }
                      }
                    >
                      {t('closing.cards.expected')}:{' '}
                      {formatMoneyWithSymbol(line.referenceCents ?? 0)} ·{' '}
                      {t('closing.cards.actual')}:{' '}
                      {formatMoneyWithSymbol(line.amountCents)} ·{' '}
                      {t('closing.cards.difference')}:{' '}
                      {formatMoneyWithSymbol(difference)}
                    </AppText>
                  ) : null}
                  {line.reason ? (
                    <AppText variant='caption' color='muted'>
                      {t(`closing.reasons.${line.reason}` as never)}
                    </AppText>
                  ) : null}
                  {line.notes ? (
                    <AppText variant='caption' color='muted' numberOfLines={2}>
                      {line.notes}
                    </AppText>
                  ) : null}
                </View>
                <Row gap='xs' align='center'>
                  <AppText variant='body' color={isSubtract ? 'muted' : 'default'}>
                    {isSubtract ? '-' : ''}
                    {formatMoneyWithSymbol(line.amountCents)}
                  </AppText>
                  {!readOnly ? (
                    <>
                      <IconButton
                        label={t('closing.actions.edit')}
                        variant='surface'
                        icon={
                          <MaterialIcons
                            name='edit'
                            size={18}
                            color={colors.text}
                          />
                        }
                        onPress={() => onEdit(line)}
                      />
                      <IconButton
                        label={t('closing.actions.delete')}
                        variant='surface'
                        icon={
                          <MaterialIcons
                            name='delete-outline'
                            size={18}
                            color={colors.expense}
                          />
                        }
                        onPress={() => onDelete(line)}
                      />
                    </>
                  ) : null}
                </Row>
              </Row>
            </React.Fragment>
          );
        })}

        {!readOnly ? (
          <Button
            label={t('closing.actions.addLine')}
            variant='outline'
            size='sm'
            onPress={onAdd}
          />
        ) : null}
      </Stack>
    </Surface>
  );
};

