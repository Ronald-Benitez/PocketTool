import React, { useState } from 'react';
import { View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

import {
  AccentRow,
  AppText,
  Badge,
  Button,
  Card,
  ColorField,
  Column,
  DateField,
  Dialog,
  Divider,
  EmptyState,
  FinanceValue,
  IconButton,
  InlineMessage,
  LinkButton,
  ListItem,
  LoadingState,
  MoneyField,
  MonthField,
  Row,
  Screen,
  SelectField,
  Stack,
  SummaryBlock,
  SummaryGroup,
  Surface,
  SwitchField,
  SwipeAction,
  TextField,
  useTheme,
  useToast,
} from '@/src/ui';

const GalleryScreen = () => {
  const { colors, mode, resolvedMode, palettes, setMode } = useTheme();
  const { showToast } = useToast();
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [cents, setCents] = useState(0);
  const [category, setCategory] = useState<string | undefined>(undefined);
  const [date, setDate] = useState<number>(() => Date.now());
  const [month, setMonth] = useState<number>(new Date().getMonth());
  const [enabled, setEnabled] = useState(true);
  const [color, setColor] = useState(colors.primary);
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <Screen scroll>
      <Stack gap='xl'>
        <Stack gap='xs'>
          <AppText variant='display'>UI gallery</AppText>
          <AppText color='muted'>
            Development route for checking primitives, variants and theme modes.
          </AppText>
          <AppText variant='caption' color='muted'>
            Mode: {mode} · resolved: {resolvedMode} · bright {palettes.bright.background} · dark{' '}
            {palettes.dark.background}
          </AppText>
        </Stack>

        <Surface variant='outlined'>
          <Stack gap='sm'>
            <AppText variant='title'>Theme</AppText>
            <Row gap='sm' wrap>
              {(['system', 'light', 'dark'] as const).map((option) => (
                <Button
                  key={option}
                  label={option}
                  size='sm'
                  variant={mode === option ? 'primary' : 'outline'}
                  onPress={() => setMode(option)}
                />
              ))}
            </Row>
            <Row gap='sm' wrap>
              {(['success', 'error', 'warning', 'info'] as const).map((type) => (
                <Button
                  key={type}
                  label={type}
                  size='sm'
                  variant='outline'
                  onPress={() => showToast({ message: `Sample ${type} toast`, type })}
                />
              ))}
            </Row>
          </Stack>
        </Surface>

        <Stack gap='sm'>
          <AppText variant='title'>Typography</AppText>
          <AppText variant='display'>Display</AppText>
          <AppText variant='title'>Title</AppText>
          <AppText variant='subtitle'>Subtitle</AppText>
          <AppText variant='body'>Body text with the default color token.</AppText>
          <AppText variant='label'>Label</AppText>
          <AppText variant='caption' color='muted'>
            Caption and muted color.
          </AppText>
          <AppText variant='helper' color='danger'>
            Helper text with danger color.
          </AppText>
        </Stack>

        <Divider inset={4} />

        <Stack gap='sm'>
          <AppText variant='title'>Buttons</AppText>
          <Row gap='sm' wrap>
            <Button label='Primary' onPress={() => {}} />
            <Button label='Secondary' variant='secondary' onPress={() => {}} />
            <Button label='Outline' variant='outline' onPress={() => {}} />
            <Button label='Ghost' variant='ghost' onPress={() => {}} />
            <Button label='Danger' variant='danger' onPress={() => {}} />
          </Row>
          <Row gap='sm' wrap>
            <Button label='Small' size='sm' onPress={() => {}} />
            <Button label='Medium' size='md' onPress={() => {}} />
            <Button label='Large' size='lg' onPress={() => {}} />
            <Button label='Loading' loading onPress={() => {}} />
            <Button label='Disabled' disabled onPress={() => {}} />
          </Row>
          <Row gap='sm' wrap>
            <Button
              label='With icon'
              leftIcon={<MaterialIcons name='add' size={18} color={colors.onPrimary} />}
              onPress={() => {}}
            />
            <IconButton
              icon={<MaterialIcons name='settings' size={22} color={colors.text} />}
              label='Settings'
              variant='surface'
              onPress={() => {}}
            />
            <IconButton
              icon={<MaterialIcons name='add' size={22} color={colors.onPrimary} />}
              label='Add'
              variant='primary'
              onPress={() => {}}
            />
          </Row>
        </Stack>

        <Divider inset={4} />

        <Stack gap='md'>
          <AppText variant='title'>Form fields</AppText>
          <TextField
            label='Name'
            placeholder='Record name'
            value={name}
            onChangeText={setName}
            required
            hint='This label, hint and required marker are shared.'
          />
          <TextField
            label='Amount'
            placeholder='0.00'
            value={amount}
            onChangeText={setAmount}
            keyboardType='decimal-pad'
            leftIcon={<AppText color='muted'>$</AppText>}
          />
          <TextField
            label='Invalid field'
            placeholder='Try to fix me'
            value=''
            onChangeText={() => {}}
            error='This field is required.'
            required
          />
          <TextField
            label='Disabled'
            placeholder='Cannot edit'
            value='Read only'
            onChangeText={() => {}}
            disabled
          />
          <TextField
            label='Notes'
            placeholder='Long text'
            value={notes}
            onChangeText={setNotes}
            multiline
            hint='Multiline fields grow vertically.'
          />
        </Stack>

        <Divider inset={4} />

        <Stack gap='md'>
          <AppText variant='title'>Specialized fields</AppText>
          <MoneyField
            label='Money'
            value={cents}
            onChangeCents={setCents}
            hint='Stored as integer cents.'
          />
          <SelectField
            label='Category'
            placeholder='Pick a category'
            value={category}
            onChange={setCategory}
            options={[
              { label: 'Food', value: 'food' },
              { label: 'Transport', value: 'transport' },
              { label: 'Health', value: 'health' },
            ]}
          />
          <DateField label='Date' value={date} onChange={setDate} />
          <MonthField label='Month' value={month} onChange={setMonth} />
          <SwitchField
            label='Notifications'
            description='Receive reminders for fixed transactions.'
            value={enabled}
            onChange={setEnabled}
            onLabel='On'
            offLabel='Off'
          />
          <ColorField
            label='Accent color'
            value={color}
            onChange={setColor}
            hint='Uses the existing color picker while the new overlay is migrated.'
          />
          <LinkButton
            label='Learn more about fields'
            onPress={() => showToast({ message: 'Link pressed', type: 'info' })}
            underline
          />
        </Stack>

        <Divider inset={4} />

        <Stack gap='md'>
          <AppText variant='title'>Feedback</AppText>
          <InlineMessage
            variant='info'
            title='Information'
            message='Inline messages follow the same semantic tokens as toasts.'
            onDismiss={() => showToast({ message: 'Dismissed', type: 'info' })}
          />
          <InlineMessage variant='success' message='Saved successfully.' />
          <InlineMessage variant='warning' message='Review the amount before continuing.' />
          <InlineMessage variant='error' title='Invalid form' message='Check the highlighted fields.' />
          <LoadingState message='Loading sample data...' />
          <EmptyState
            title='Nothing here yet'
            description='Empty states share the same text hierarchy and spacing.'
            action={<Button label='Create item' size='sm' onPress={() => {}} />}
          />
          <Button label='Open dialog' variant='outline' onPress={() => setDialogOpen(true)} />
        </Stack>

        <Dialog
          visible={dialogOpen}
          title='Confirm action'
          message='Dialogs use the shared overlay, buttons and text tokens.'
          confirmLabel='Confirm'
          cancelLabel='Cancel'
          closeLabel='Cancel'
          onConfirm={() => {
            setDialogOpen(false);
            showToast({ message: 'Confirmed', type: 'success' });
          }}
          onCancel={() => setDialogOpen(false)}
        />

        <Divider inset={4} />

        <Stack gap='md'>
          <AppText variant='title'>Rows and groups</AppText>
          <AccentRow accentColor={colors.primary} bottomColor={colors.success}>
            <Row justify='space-between' align='center' style={{ flex: 1 }}>
              <Column gap='xs'>
                <AppText variant='label'>Accent row</AppText>
                <AppText variant='caption' color='muted'>
                  Colored accent and bottom border
                </AppText>
              </Column>
              <FinanceValue cents={1250} size='md' color={colors.text} />
            </Row>
          </AccentRow>
          <SwipeAction
            handleDelete={() => showToast({ message: 'Delete action', type: 'warning' })}
            handleUpdate={() => showToast({ message: 'Edit action', type: 'info' })}
          >
            <ListItem
              title='Swipe row'
              subtitle='Swipe left to delete, right to edit'
              showDivider
            />
          </SwipeAction>
          <SummaryGroup
            title='Food & beverages'
            totalCents={-1250}
            items={[
              { key: 'expense', label: 'Expense', cents: -1250, color: colors.expense },
              { key: 'transfer', label: 'Transfer', cents: 0, color: colors.transfer },
            ]}
          />
        </Stack>

        <Divider inset={4} />

        <Stack gap='md'>
          <AppText variant='title'>Data display</AppText>
          <Row gap='sm' wrap>
            <Badge label='Neutral' />
            <Badge label='Primary' tone='primary' />
            <Badge label='Success' tone='success' dot />
            <Badge label='Warning' tone='warning' />
            <Badge label='Danger' tone='danger' />
            <Badge label='Info' tone='info' size='sm' />
          </Row>
          <Card
            title='Card title'
            subtitle='A reusable surface with header and footer slots.'
            footer={<Badge label='Updated' tone='info' size='sm' />}
            onPress={() => showToast({ message: 'Card pressed', type: 'info' })}
          >
            <AppText color='muted'>Cards compose Surface, AppText and Badge.</AppText>
          </Card>
          <Surface variant='outlined' padding='none'>
            <ListItem
              title='Food'
              subtitle='Category · 12 records'
              leading={<MaterialIcons name='restaurant' size={22} color={colors.primary} />}
              trailing={<FinanceValue cents={-1250} size='sm' />}
              onPress={() => {}}
              showDivider
            />
            <ListItem
              title='Salary'
              subtitle='Income · monthly'
              leading={<MaterialIcons name='payments' size={22} color={colors.success} />}
              trailing={<FinanceValue cents={250000} size='sm' />}
              onPress={() => {}}
            />
          </Surface>
          <Row gap='lg' wrap>
            <SummaryBlock label='Income' cents={250000} size='lg' />
            <SummaryBlock label='Expense' cents={-1250} size='lg' />
            <SummaryBlock label='Balance' cents={248750} size='lg' tone='auto' />
            <SummaryBlock label='Transfer' cents={5000} tone='transfer' size='lg' />
          </Row>
        </Stack>

        <Divider inset={4} />

        <Stack gap='md'>
          <AppText variant='title'>Surfaces</AppText>
          <Row gap='md' wrap>
            <View style={{ flex: 1, minWidth: 150 }}>
              <Surface>
                <AppText variant='label'>Flat</AppText>
                <AppText variant='caption' color='muted'>
                  surface + border
                </AppText>
              </Surface>
            </View>
            <View style={{ flex: 1, minWidth: 150 }}>
              <Surface variant='muted'>
                <AppText variant='label'>Muted</AppText>
                <AppText variant='caption' color='muted'>
                  surfaceMuted
                </AppText>
              </Surface>
            </View>
          </Row>
          <Surface variant='raised'>
            <Column gap='xs'>
              <AppText variant='label'>Raised</AppText>
              <AppText variant='caption' color='muted'>
                surfaceElevated with floating shadow token.
              </AppText>
            </Column>
          </Surface>
        </Stack>

        <Surface variant='muted'>
          <Stack gap='xs'>
            <AppText variant='label'>Current tokens</AppText>
            <AppText variant='caption' color='muted'>
              background {colors.background} · surface {colors.surface} · primary {colors.primary}
            </AppText>
            <AppText variant='caption' color='muted'>
              text {colors.text} · danger {colors.danger} · success {colors.success}
            </AppText>
          </Stack>
        </Surface>
      </Stack>
    </Screen>
  );
};

export default GalleryScreen;
