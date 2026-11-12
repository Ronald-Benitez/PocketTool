import React, { useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';

import { usePeopleRepository, usePersonSettlementsRepository, useSavings, useSharedLedgerRepository } from '@/src/db';
import type { PersonStatement } from '@/src/db';
import { mapDatabaseError } from '@/src/db/errors';
import type { Person } from '@/src/interfaces/schema';
import { useLanguage } from '@/src/lang/LanguageContext';
import useRecordsStore from '@/src/stores/RecordsStore';
import { formatMoneyWithSymbol } from '@/src/utils';
import { PersonStatementModal } from '@/src/components/people/PersonStatementModal';
import { SettlementForm } from '@/src/components/people/SettlementForm';
import { FinanceValue } from '@/src/ui/data-display/FinanceValue';
import { Button } from '@/src/ui/actions/Button';
import { Badge } from '@/src/ui/data-display/Badge';
import { EmptyState } from '@/src/ui/feedback/EmptyState';
import { useToast } from '@/src/ui/feedback/ToastProvider';
import { SwitchField } from '@/src/ui/forms/SwitchField';
import { TextField } from '@/src/ui/forms/TextField';
import { ConfirmDialog } from '@/src/ui/overlays/Dialog';
import { Modal } from '@/src/ui/overlays/Modal';
import { AppText } from '@/src/ui/primitives/AppText';
import { Screen } from '@/src/ui/primitives/Screen';
import { Row, Stack } from '@/src/ui/primitives/Stack';
import { Surface } from '@/src/ui/primitives/Surface';
import { useTheme } from '@/src/ui/theme/ThemeProvider';

const PeopleScreen = () => {
  const { t } = useLanguage();
  const { colors } = useTheme();
  const { showToast } = useToast();
  const repository = usePeopleRepository();
  const ledgerRepository = useSharedLedgerRepository();
  const settlementsRepository = usePersonSettlementsRepository();
  const savingsRepository = useSavings();
  const { group, setSettlements } = useRecordsStore();
  const [people, setPeople] = useState<Person[]>([]);
  const [statements, setStatements] = useState<Map<number, PersonStatement>>(
    new Map()
  );
  const [savingsTotals, setSavingsTotals] = useState<
    Map<number, { contributedCents: number; balanceCents: number }>
  >(new Map());
  const [ledgerPerson, setLedgerPerson] = useState<Person | null>(null);
  const [settlementPerson, setSettlementPerson] = useState<Person | null>(null);
  const [visible, setVisible] = useState(false);
  const [editing, setEditing] = useState<Person | null>(null);
  const [name, setName] = useState('');
  const [notes, setNotes] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<Person | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const focusedOnce = useRef(false);

  useFocusEffect(
    useCallback(() => {
      if (!focusedOnce.current) {
        focusedOnce.current = true;
        return;
      }
      setRefreshKey((value) => value + 1);
    }, [])
  );

  useEffect(() => {
    let active = true;
    Promise.all([
      repository.fetchPeople(),
      ledgerRepository.fetchStatements(),
      savingsRepository.fetchParticipantTotals(),
    ])
      .then(([rows, ledger, savingRows]) => {
        if (!active) return;
        setPeople(rows);
        setStatements(ledger.statements);
        setSavingsTotals(
          new Map(
            savingRows.map((row) => [
              row.personId,
              {
                contributedCents: row.contributedCents,
                balanceCents: row.balanceCents,
              },
            ])
          )
        );
      })
      .catch((cause) => {
        if (!active) return;
        if (__DEV__) console.warn('[people] load failed', cause);
        const mapped = mapDatabaseError(cause, t('toast.error'));
        showToast({
          message: t(`dbErrors.${mapped.code}` as never),
          type: 'error',
        });
      });
    return () => {
      active = false;
    };
  }, [refreshKey]);

  const openCreate = () => {
    setEditing(null);
    setName('');
    setNotes('');
    setIsActive(true);
    setError(null);
    setVisible(true);
  };

  const openEdit = (person: Person) => {
    setEditing(person);
    setName(person.name);
    setNotes(person.notes ?? '');
    setIsActive(person.is_active !== 0);
    setError(null);
    setVisible(true);
  };

  const save = async () => {
    if (!name.trim()) {
      setError(t('shared.personRequired'));
      return;
    }
    setSaving(true);
    setError(null);
    try {
      if (editing?.id) {
        await repository.updatePerson(editing.id, {
          name: name.trim(),
          notes: notes.trim() || null,
          is_active: isActive ? 1 : 0,
        });
      } else {
        await repository.addPerson({
          name: name.trim(),
          notes: notes.trim() || null,
        });
      }
      showToast({ message: t('shared.personSaved'), type: 'success' });
      setVisible(false);
      setRefreshKey((value) => value + 1);
    } catch (cause) {
      if (__DEV__) console.warn('[people] save failed', cause);
      const mapped = mapDatabaseError(cause, t('toast.error'));
      setError(t(`dbErrors.${mapped.code}` as never));
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!deleting?.id) return;
    setSaving(true);
    try {
      await repository.deletePerson(deleting.id);
      showToast({ message: t('shared.personDeleted'), type: 'success' });
      setDeleting(null);
      setRefreshKey((value) => value + 1);
    } catch (cause) {
      if (__DEV__) console.warn('[people] delete failed', cause);
      const mapped = mapDatabaseError(cause, t('toast.error'));
      showToast({
        message: t(`dbErrors.${mapped.code}` as never),
        type: 'error',
      });
    } finally {
      setSaving(false);
    }
  };

  const statementFor = (person: Person): PersonStatement | undefined =>
    person.id != null ? statements.get(person.id) : undefined;

  return (
    <Screen scroll edges={['left', 'right']}>
      <Stack gap='lg'>
        <Stack gap='xxs'>
          <AppText variant='title'>{t('shared.peopleTitle')}</AppText>
          <AppText color='muted'>{t('shared.peopleSubtitle')}</AppText>
        </Stack>
        <Button
          label={t('shared.addPersonTitle')}
          size='sm'
          onPress={openCreate}
          leftIcon={
            <MaterialIcons name='person-add' size={18} color={colors.onPrimary} />
          }
        />
        {people.length === 0 ? (
          <EmptyState
            title={t('shared.empty')}
            icon={
              <MaterialIcons name='people' size={28} color={colors.textMuted} />
            }
          />
        ) : (
          <Stack gap='md'>
            {people.map((person) => {
              const statement = statementFor(person);
              const summary = statement?.summary;
              const hasStatement = Boolean(
                summary &&
                  (summary.purchasePaidByMeCents > 0 ||
                    summary.purchasePaidByPersonCents > 0 ||
                    summary.settlementsPaidByMeCents > 0 ||
                    summary.settlementsPaidByPersonCents > 0 ||
                    summary.balanceCents !== 0)
              );
              const savings = person.id != null ? savingsTotals.get(person.id) : undefined;
              return (
                <Surface key={person.id} variant='outlined' padding='md'>
                  <Stack gap='sm'>
                    <Row justify='space-between' align='center' gap='sm'>
                      <Stack gap='xxs' style={{ flex: 1 }}>
                        <AppText weight='600'>{person.name}</AppText>
                        {person.notes ? (
                          <AppText variant='caption' color='muted'>
                            {person.notes}
                          </AppText>
                        ) : null}
                      </Stack>
                      <Badge
                        label={
                          person.is_active === 0
                            ? t('shared.inactive')
                            : t('shared.active')
                        }
                        tone={person.is_active === 0 ? 'neutral' : 'success'}
                        size='sm'
                      />
                    </Row>

                    {hasStatement && summary ? (
                      <Surface variant='muted' padding='md'>
                        <Stack gap='xs'>
                          <Row justify='space-between'>
                            <AppText variant='caption' color='muted'>
                              {t('shared.paidByYou')}
                            </AppText>
                            <AppText weight='600'>
                              {formatMoneyWithSymbol(summary.paidByMeCents)}
                            </AppText>
                          </Row>
                          <Row justify='space-between'>
                            <AppText variant='caption' color='muted'>
                              {t('shared.paidByThem')}
                            </AppText>
                            <AppText weight='600'>
                              {formatMoneyWithSymbol(summary.paidByPersonCents)}
                            </AppText>
                          </Row>
                          <Row justify='space-between' align='center'>
                            <AppText weight='600'>{t('shared.balance')}</AppText>
                            <FinanceValue
                              cents={summary.balanceCents}
                              size='md'
                              tone={
                                summary.balanceCents > 0
                                  ? 'income'
                                  : summary.balanceCents < 0
                                    ? 'expense'
                                    : 'neutral'
                              }
                            />
                          </Row>
                          <AppText variant='caption' color='muted'>
                            {summary.balanceCents > 0
                              ? t('shared.balanceInYourFavor')
                              : summary.balanceCents < 0
                                ? t('shared.balanceInTheirFavor')
                                : t('shared.settled')}
                          </AppText>
                        </Stack>
                      </Surface>
                    ) : null}

                    {savings ? (
                      <Row justify='space-between' align='center' gap='sm'>
                        <Stack gap='xxs' style={{ flex: 1 }}>
                          <AppText variant='caption' color='muted'>
                            {t('shared.savingsContributed')}
                          </AppText>
                          <AppText weight='600'>
                            {formatMoneyWithSymbol(savings.contributedCents)}
                          </AppText>
                        </Stack>
                        <Stack gap='xxs' align='flex-end'>
                          <AppText variant='caption' color='muted'>
                            {t('shared.savingsBalance')}
                          </AppText>
                          <AppText weight='600'>
                            {formatMoneyWithSymbol(savings.balanceCents)}
                          </AppText>
                        </Stack>
                      </Row>
                    ) : null}

                    <Row gap='sm' wrap>
                      {summary && summary.entryCount > 0 ? (
                        <Button
                          label={t('shared.movements')}
                          size='sm'
                          variant='ghost'
                          onPress={() => setLedgerPerson(person)}
                        />
                      ) : null}
                      {summary && summary.balanceCents !== 0 ? (
                        <Button
                          label={t('shared.registerPayment')}
                          size='sm'
                          variant='outline'
                          onPress={() => setSettlementPerson(person)}
                        />
                      ) : null}
                      <Button
                        label={t('shared.edit')}
                        size='sm'
                        variant='outline'
                        onPress={() => openEdit(person)}
                      />
                      <Button
                        label={t('delete')}
                        size='sm'
                        variant='danger'
                        onPress={() => setDeleting(person)}
                      />
                    </Row>
                  </Stack>
                </Surface>
              );
            })}
          </Stack>
        )}
      </Stack>

      <Modal
        visible={visible}
        onClose={() => setVisible(false)}
        title={
          editing ? t('shared.editPersonTitle') : t('shared.addPersonTitle')
        }
        closeLabel={t('cancel')}
        scrollable
        footer={
          <View style={styles.footer}>
            <Button
              label={t('cancel')}
              variant='outline'
              onPress={() => setVisible(false)}
              style={styles.footerButton}
            />
            <Button
              label={t('confirm')}
              onPress={save}
              loading={saving}
              style={styles.footerButton}
            />
          </View>
        }
      >
        <Stack gap='md'>
          <TextField
            label={t('shared.name')}
            required
            value={name}
            onChangeText={setName}
          />
          <TextField
            label={t('shared.notes')}
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={3}
          />
          <SwitchField
            label={t('shared.active')}
            value={isActive}
            onChange={setIsActive}
          />
          {error ? <AppText color='danger'>{error}</AppText> : null}
        </Stack>
      </Modal>

      <PersonStatementModal
        visible={Boolean(ledgerPerson)}
        person={ledgerPerson}
        statement={
          ledgerPerson?.id != null ? statements.get(ledgerPerson.id) : undefined
        }
        onClose={() => setLedgerPerson(null)}
        onRegisterPayment={() => {
          const person = ledgerPerson;
          setLedgerPerson(null);
          setSettlementPerson(person);
        }}
      />

      <SettlementForm
        visible={Boolean(settlementPerson)}
        person={settlementPerson}
        balanceCents={
          settlementPerson?.id != null
            ? statements.get(settlementPerson.id)?.summary.balanceCents ?? 0
            : 0
        }
        defaultGroupId={group?.id ?? null}
        onClose={() => setSettlementPerson(null)}
        onSaved={() => {
          setRefreshKey((value) => value + 1);
          if (group?.id) {
            settlementsRepository
              .fetchByGroup(group.id)
              .then((rows) => setSettlements(rows))
              .catch(() => {
                // The next group selection refreshes the settlements again.
              });
          }
        }}
      />

      <ConfirmDialog
        visible={Boolean(deleting)}
        title={t('delete')}
        message={t('shared.deleteConfirm')}
        confirmLabel={t('delete')}
        cancelLabel={t('cancel')}
        tone='danger'
        loading={saving}
        onConfirm={remove}
        onCancel={() => setDeleting(null)}
      />
    </Screen>
  );
};

const styles = StyleSheet.create({
  footer: { flex: 1, flexDirection: 'row', gap: 8 },
  footerButton: { flex: 1 },
});

export default PeopleScreen;
