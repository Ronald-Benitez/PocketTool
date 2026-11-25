import React from 'react';
import { StyleSheet, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

import type { Person } from '@/src/interfaces/schema';
import type { ParticipantDraft } from '@/src/db/repositories/people';
import { computeParticipantShares } from '@/src/domain/shared/split';
import { useLanguage } from '@/src/lang/LanguageContext';
import { formatMoneyWithSymbol } from '@/src/utils';
import { Button } from '@/src/ui/actions/Button';
import { IconButton } from '@/src/ui/actions/IconButton';
import { InlineMessage } from '@/src/ui/feedback/InlineMessage';
import { MoneyField } from '@/src/ui/forms/MoneyField';
import { SelectField } from '@/src/ui/forms/SelectField';
import { TextField } from '@/src/ui/forms/TextField';
import { AppText } from '@/src/ui/primitives/AppText';
import { Row, Stack } from '@/src/ui/primitives/Stack';
import { useTheme } from '@/src/ui/theme/ThemeProvider';

type SharedParticipantsFieldProps = {
  people: Person[];
  value: ParticipantDraft[];
  onChange: (value: ParticipantDraft[]) => void;
  totalCents?: number;
  /** Savings keeps percentage-only shares for now. */
  allowAmount?: boolean;
};

const parseNumber = (value: string) => {
  const normalized = value.replace(',', '.').replace(/[^0-9.]/g, '');
  const number = Number(normalized);
  return Number.isFinite(number) ? number : 0;
};

export const SharedParticipantsField = ({
  people,
  value,
  onChange,
  totalCents,
  allowAmount = true,
}: SharedParticipantsFieldProps) => {
  const { t } = useLanguage();
  const { colors } = useTheme();
  const activePeople = people.filter((person) => person.is_active !== 0);
  const totalPercent = value
    .filter((participant) => participant.shareMode !== 'amount')
    .reduce((sum, participant) => sum + participant.sharePercent, 0);
  const split =
    totalCents != null
      ? computeParticipantShares(totalCents, value)
      : null;
  const ownPercent =
    split != null && totalCents != null && totalCents > 0
      ? (split.ownCents / totalCents) * 100
      : Math.max(0, 100 - totalPercent);
  const sharedPercent =
    split != null && totalCents != null && totalCents > 0
      ? (split.sharedCents / totalCents) * 100
      : Math.min(100, totalPercent);
  const invalid = split?.exceedsTotal ?? totalPercent > 100.0001;
  const invalidAmount = value.some(
    (participant) =>
      participant.shareMode === 'amount' &&
      (participant.shareAmountCents ?? 0) <= 0
  );
  const defaultMode =
    allowAmount && value.length > 0
      ? value[value.length - 1].shareMode ?? 'percent'
      : 'percent';

  const updateParticipant = (
    index: number,
    next: Partial<ParticipantDraft>
  ) => {
    onChange(
      value.map((participant, current) =>
        current === index ? { ...participant, ...next } : participant
      )
    );
  };

  const changeMode = (
    index: number,
    mode: 'percent' | 'amount',
    participant: ParticipantDraft
  ) => {
    updateParticipant(index, {
      shareMode: mode,
      sharePercent: mode === 'percent' ? participant.sharePercent : 0,
      shareAmountCents:
        mode === 'amount' ? participant.shareAmountCents ?? 0 : null,
    });
  };

  return (
    <Stack gap='sm'>
      <AppText weight='600'>{t('shared.title')}</AppText>
      {activePeople.length === 0 ? (
        <InlineMessage variant='info' message={t('shared.noPeople')} />
      ) : null}
      {value.map((participant, index) => {
        const usedByOthers = new Set(
          value
            .filter((_, current) => current !== index)
            .map((item) => item.personId)
        );
        const mode = allowAmount
          ? participant.shareMode ?? 'percent'
          : 'percent';
        return (
          <View key={`${participant.personId}-${index}`} style={styles.card}>
            <Stack gap='xs'>
              <Row gap='sm' align='flex-end'>
                <View style={{ flex: 1 }}>
                  <SelectField<number>
                    label={t('shared.person')}
                    value={participant.personId}
                    options={activePeople.flatMap((person) =>
                      person.id === undefined || usedByOthers.has(person.id)
                        ? []
                        : [{ label: person.name, value: person.id }]
                    )}
                    onChange={(personId) =>
                      updateParticipant(index, { personId })
                    }
                  />
                </View>
                <IconButton
                  label={t('shared.remove')}
                  size='md'
                  variant='ghost'
                  icon={
                    <MaterialIcons
                      name='delete-outline'
                      size={22}
                      color={colors.danger}
                    />
                  }
                  onPress={() =>
                    onChange(value.filter((_, current) => current !== index))
                  }
                  style={styles.removeButton}
                />
              </Row>
              <Row gap='sm' align='flex-end'>
                {allowAmount ? (
                  <View style={{ flex: 1 }}>
                    <SelectField<'percent' | 'amount'>
                      label={t('shared.mode')}
                      value={mode}
                      options={[
                        {
                          label: t('shared.modePercent'),
                          value: 'percent',
                        },
                        { label: t('shared.modeAmount'), value: 'amount' },
                      ]}
                      onChange={(nextMode) =>
                        changeMode(index, nextMode, participant)
                      }
                    />
                  </View>
                ) : null}
                <View style={{ flex: 1 }}>
                  {mode === 'amount' ? (
                    <MoneyField
                      label={t('shared.amount')}
                      value={participant.shareAmountCents ?? 0}
                      onChangeCents={(shareAmountCents) =>
                        updateParticipant(index, { shareAmountCents })
                      }
                    />
                  ) : (
                    <TextField
                      label={t('shared.percent')}
                      value={String(participant.sharePercent)}
                      onChangeText={(text) =>
                        updateParticipant(index, {
                          sharePercent: parseNumber(text),
                        })
                      }
                      keyboardType='decimal-pad'
                    />
                  )}
                </View>
              </Row>
            </Stack>
          </View>
        );
      })}
      <Button
        label={t('shared.addPerson')}
        size='sm'
        variant='outline'
        disabled={
          activePeople.length === 0 ||
          activePeople.every((person) =>
            value.some((participant) => participant.personId === person.id)
          )
        }
        onPress={() => {
          const used = new Set(
            value.map((participant) => participant.personId)
          );
          const nextPerson = activePeople.find(
            (person) => person.id !== undefined && !used.has(person.id)
          );
          if (!nextPerson?.id) return;
          onChange([
            ...value,
            {
              personId: nextPerson.id,
              shareMode: defaultMode,
              sharePercent:
                defaultMode === 'percent'
                  ? Math.max(0, Math.min(100 - totalPercent, 50))
                  : 0,
              shareAmountCents: defaultMode === 'amount' ? 0 : null,
            },
          ]);
        }}
      />
      {totalCents != null && split != null ? (
        <Stack gap='xxs'>
          <AppText variant='caption' color='muted'>
            {t('shared.total')}: {formatMoneyWithSymbol(totalCents)}
          </AppText>
          <AppText variant='caption' color='muted'>
            {t('shared.own')}: {ownPercent.toFixed(0)}% ·{' '}
            {formatMoneyWithSymbol(split.ownCents)}
          </AppText>
          <AppText variant='caption' color='muted'>
            {t('shared.totalShared')}: {sharedPercent.toFixed(0)}% ·{' '}
            {formatMoneyWithSymbol(split.sharedCents)}
          </AppText>
        </Stack>
      ) : (
        <AppText variant='caption' color='muted'>
          {t('shared.own')}: {ownPercent.toFixed(0)}% ·{' '}
          {t('shared.totalShared')}: {sharedPercent.toFixed(0)}%
        </AppText>
      )}
      {invalidAmount ? (
        <InlineMessage variant='error' message={t('shared.amountRequired')} />
      ) : invalid ? (
        <InlineMessage variant='error' message={t('shared.invalidTotal')} />
      ) : null}
    </Stack>
  );
};

const styles = StyleSheet.create({
  card: {
    gap: 8,
  },
  removeButton: {
    alignSelf: 'flex-end',
  },
});
