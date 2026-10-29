import React, { useState } from 'react';
import { View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

import {
  AppText,
  Button,
  Column,
  Divider,
  IconButton,
  Row,
  Screen,
  Stack,
  Surface,
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
