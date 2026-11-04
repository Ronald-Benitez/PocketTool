import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

import { usePeopleRepository } from '@/src/db';
import type { Person } from '@/src/interfaces/schema';
import { useLanguage } from '@/src/lang/LanguageContext';
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
  const [people, setPeople] = useState<Person[]>([]);
  const [visible, setVisible] = useState(false);
  const [editing, setEditing] = useState<Person | null>(null);
  const [name, setName] = useState('');
  const [notes, setNotes] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<Person | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let active = true;
    repository.fetchPeople().then((rows) => {
      if (active) setPeople(rows);
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
    } catch {
      setError(t('toast.error'));
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
    } catch {
      showToast({ message: t('toast.error'), type: 'error' });
    } finally {
      setSaving(false);
    }
  };

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
            {people.map((person) => (
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
                  <Row gap='sm' wrap>
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
            ))}
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
