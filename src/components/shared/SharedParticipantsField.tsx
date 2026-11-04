import React from 'react';
import { StyleSheet, View } from 'react-native';

import type { Person } from '@/src/interfaces/schema';
import type { ParticipantDraft } from '@/src/db/repositories/people';
import { useLanguage } from '@/src/lang/LanguageContext';
import { formatMoneyWithSymbol } from '@/src/utils';
import { Button } from '@/src/ui/actions/Button';
import { InlineMessage } from '@/src/ui/feedback/InlineMessage';
import { SelectField } from '@/src/ui/forms/SelectField';
import { TextField } from '@/src/ui/forms/TextField';
import { AppText } from '@/src/ui/primitives/AppText';
import { Stack } from '@/src/ui/primitives/Stack';

type SharedParticipantsFieldProps = {
  people: Person[];
  value: ParticipantDraft[];
  onChange: (value: ParticipantDraft[]) => void;
  totalCents?: number;
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
}: SharedParticipantsFieldProps) => {
  const { t } = useLanguage();
  const activePeople = people.filter((person) => person.is_active !== 0);
  const totalPercent = value.reduce(
    (sum, participant) => sum + participant.sharePercent,
    0
  );
  const ownPercent = Math.max(0, 100 - totalPercent);
  const sharedCents =
    totalCents != null
      ? Math.round((totalCents * Math.min(100, totalPercent)) / 100)
      : null;
  const ownCents =
    totalCents != null ? Math.max(0, totalCents - (sharedCents ?? 0)) : null;

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
        return (
        <View key={`${participant.personId}-${index}`} style={styles.row}>
          <View style={{ flex: 2 }}>
            <SelectField<number>
              label={t('shared.person')}
              value={participant.personId}
              options={activePeople.flatMap((person) =>
                person.id === undefined || usedByOthers.has(person.id)
                  ? []
                  : [{ label: person.name, value: person.id }]
              )}
              onChange={(personId) => updateParticipant(index, { personId })}
            />
          </View>
          <View style={{ flex: 1 }}>
            <TextField
              label={t('shared.percent')}
              value={String(participant.sharePercent)}
              onChangeText={(text) =>
                updateParticipant(index, { sharePercent: parseNumber(text) })
              }
              keyboardType='decimal-pad'
            />
          </View>
          <Button
            label={t('shared.remove')}
            size='sm'
            variant='danger'
            onPress={() =>
              onChange(value.filter((_, current) => current !== index))
            }
          />
        </View>
        );
      })}
      <Button
        label={t('shared.addPerson')}
        size='sm'
        variant='outline'
        disabled={activePeople.length === 0 || totalPercent >= 100}
        onPress={() => {
          const used = new Set(value.map((participant) => participant.personId));
          const nextPerson = activePeople.find(
            (person) => person.id !== undefined && !used.has(person.id)
          );
          if (!nextPerson?.id) return;
          onChange([
            ...value,
            {
              personId: nextPerson.id,
              sharePercent: Math.min(100 - totalPercent, 50),
            },
          ]);
        }}
      />
      <AppText variant='caption' color='muted'>
        {t('shared.totalShared')}: {totalPercent.toFixed(0)}% ·{' '}
        {t('shared.own')}: {ownPercent.toFixed(0)}%
      </AppText>
      {totalCents != null && sharedCents != null && ownCents != null ? (
        <AppText variant='caption' color='muted'>
          {t('shared.total')}: {formatMoneyWithSymbol(totalCents)} ·{' '}
          {t('shared.ownAmount')}: {formatMoneyWithSymbol(ownCents)} ·{' '}
          {t('shared.sharedAmount')}: {formatMoneyWithSymbol(sharedCents)}
        </AppText>
      ) : null}
      {totalPercent > 100 ? (
        <InlineMessage variant='error' message={t('shared.invalidTotal')} />
      ) : null}
    </Stack>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'flex-end',
  },
});
