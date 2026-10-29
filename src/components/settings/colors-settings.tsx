import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

import type { ThemeColorTokens } from '@/src/interfaces/colors';
import { useLanguage } from '@/src/lang/LanguageContext';
import {
  COLOR_GROUPS,
  COLOR_GROUP_LABELS,
  getColorLabel,
} from '@/src/ui/theme/colors';
import { getContrastWarnings } from '@/src/ui/theme/contrast';
import {
  useTheme,
  type PaletteName,
  type ThemeMode,
} from '@/src/ui/theme/ThemeProvider';
import ColorPicker2 from '../ui/color-picker-2';
import ConfirmModal from '../ui/confirm-modal';
import ModalButton from '../ui/modal-button';

const MODES: ThemeMode[] = ['system', 'light', 'dark'];
const PALETTES: PaletteName[] = ['bright', 'dark'];

const ColorSettings = () => {
  const { t, language } = useLanguage();
  const {
    colors,
    mode,
    resolvedMode,
    palettes,
    settings,
    setMode,
    setPaletteColor,
    setUseBase,
    resetColor,
    resetPalette,
    resetAll,
  } = useTheme();

  const [activePalette, setActivePalette] = useState<PaletteName>(
    resolvedMode === 'dark' ? 'dark' : 'bright'
  );
  const palette = palettes[activePalette];
  const warnings = useMemo(() => getContrastWarnings(palette), [palette]);
  const usingBase = settings.useBase[activePalette];

  const paletteLabel = t(`theme.palette.${activePalette}`);
  const groupLabel = (key: string) =>
    COLOR_GROUP_LABELS[key]?.[language === 'es' ? 'es' : 'en'] ?? key;

  return (
    <View style={localStyles.root}>
      <Text style={[localStyles.sectionTitle, { color: colors.text }]}>
        {t('theme.title')}
      </Text>

      <Text style={[localStyles.label, { color: colors.textMuted }]}>
        {t('theme.appearance')}
      </Text>
      <View style={localStyles.row}>
        {MODES.map((option) => {
          const selected = mode === option;
          return (
            <Pressable
              key={option}
              onPress={() => setMode(option)}
              style={[
                localStyles.segment,
                {
                  backgroundColor: selected ? colors.primary : colors.surfaceMuted,
                  borderColor: selected ? colors.primary : colors.border,
                },
              ]}
            >
              <Text
                style={{
                  color: selected ? colors.onPrimary : colors.text,
                  fontWeight: selected ? '600' : '400',
                }}
              >
                {t(`theme.mode.${option}`)}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View style={localStyles.row}>
        {PALETTES.map((option) => {
          const selected = activePalette === option;
          return (
            <Pressable
              key={option}
              onPress={() => setActivePalette(option)}
              style={[
                localStyles.paletteTab,
                {
                  backgroundColor: colors.surface,
                  borderColor: selected ? colors.primary : colors.border,
                  borderWidth: selected ? 2 : 1,
                },
              ]}
            >
              <Text
                style={{
                  color: selected ? colors.primary : colors.text,
                  fontWeight: selected ? '700' : '400',
                }}
              >
                {t(`theme.palette.${option}`)}
              </Text>
              <Text style={{ color: colors.textMuted, fontSize: 11 }}>
                {settings.useBase[option]
                  ? t('theme.palette.base')
                  : t('theme.palette.custom')}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View
        style={[
          localStyles.preview,
          { backgroundColor: palette.surface, borderColor: palette.border },
        ]}
      >
        <Text style={[localStyles.previewTitle, { color: palette.text }]}>
          {t('theme.preview.title')}
        </Text>
        <Text style={{ color: palette.text }}>{t('theme.preview.text')}</Text>
        <Text style={{ color: palette.textMuted }}>
          {paletteLabel} · {usingBase ? t('theme.palette.base') : t('theme.palette.custom')}
        </Text>
        <View style={localStyles.previewRow}>
          <View
            style={[localStyles.previewChip, { backgroundColor: palette.primary }]}
          >
            <Text style={{ color: palette.onPrimary }}>
              {t('theme.preview.primary')}
            </Text>
          </View>
          <View
            style={[localStyles.previewChip, { backgroundColor: palette.income }]}
          >
            <Text style={{ color: palette.onSuccess }}>
              {t('theme.preview.income')}
            </Text>
          </View>
          <View
            style={[localStyles.previewChip, { backgroundColor: palette.expense }]}
          >
            <Text style={{ color: palette.onDanger }}>
              {t('theme.preview.expense')}
            </Text>
          </View>
        </View>
        <View
          style={[
            localStyles.previewSurface,
            { backgroundColor: palette.surfaceMuted, borderColor: palette.border },
          ]}
        >
          <Text style={{ color: palette.textMuted }}>
            {t('theme.preview.surface')}
          </Text>
        </View>
      </View>

      <View
        style={[
          localStyles.contrastBox,
          {
            backgroundColor: warnings.length ? palette.toastWarningBg : palette.toastSuccessBg,
            borderColor: warnings.length ? palette.warning : palette.success,
          },
        ]}
      >
        <Text
          style={{
            color: warnings.length ? palette.toastWarningText : palette.toastSuccessText,
            fontWeight: '600',
          }}
        >
          {t('theme.contrast.title')} · {usingBase ? paletteLabel : t('theme.palette.custom')}
        </Text>
        {warnings.length === 0 ? (
          <Text
            style={{
              color: palette.toastSuccessText,
            }}
          >
            {t('theme.contrast.ok')}
          </Text>
        ) : (
          warnings.map((warning) => (
            <Text
              key={warning.key}
              style={{ color: palette.toastWarningText }}
            >
              {t(`theme.contrast.${warning.key}`)}: {warning.ratio}:1
            </Text>
          ))
        )}
      </View>

      <View style={localStyles.row}>
        <ActionButton
          label={t('theme.useBase')}
          disabled={usingBase}
          onPress={() => setUseBase(activePalette, true)}
        />
        <ConfirmModal
          title={t('theme.resetPalette')}
          message={t('theme.confirmResetPalette').replace('{palette}', paletteLabel)}
          onConfirm={() => resetPalette(activePalette)}
        >
          <ModalButton
            isButton={false}
            text={t('theme.resetPalette')}
            type='base'
          />
        </ConfirmModal>
        <ConfirmModal
          title={t('theme.resetAll')}
          message={t('theme.confirmResetAll')}
          onConfirm={resetAll}
        >
          <ModalButton isButton={false} text={t('theme.resetAll')} type='base' />
        </ConfirmModal>
      </View>

      <Text style={[localStyles.hint, { color: colors.textMuted }]}>
        {t('theme.paletteHint')} {t('theme.colorsEdited')}
      </Text>

      {COLOR_GROUPS.map((group) => (
        <View key={group.key} style={localStyles.group}>
          <Text style={[localStyles.groupTitle, { color: colors.text }]}>
            {groupLabel(group.key)}
          </Text>
          {group.tokens.map((key) => (
            <ColorRow
              key={key}
              colorKey={key}
              label={getColorLabel(key, language === 'es' ? 'es' : 'en')}
              value={palette[key]}
              overridden={!usingBase && settings[activePalette][key] !== undefined}
              onChange={(value) => setPaletteColor(activePalette, key, value)}
              onReset={() => resetColor(activePalette, key)}
            />
          ))}
        </View>
      ))}
    </View>
  );
};

type ActionButtonProps = {
  label: string;
  disabled?: boolean;
  onPress: () => void;
};

const ActionButton = ({ label, disabled, onPress }: ActionButtonProps) => {
  const { colors } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={[
        localStyles.actionButton,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          opacity: disabled ? 0.45 : 1,
        },
      ]}
    >
      <Text style={{ color: colors.text, fontSize: 12, textAlign: 'center' }}>
        {label}
      </Text>
    </Pressable>
  );
};

type ColorRowProps = {
  colorKey: keyof ThemeColorTokens;
  label: string;
  value: string;
  overridden: boolean;
  onChange: (value: string) => void;
  onReset: () => void;
};

const ColorRow = ({
  label,
  value,
  overridden,
  onChange,
  onReset,
}: ColorRowProps) => {
  const { t } = useLanguage();
  const { colors } = useTheme();

  return (
    <View
      style={[
        localStyles.colorRow,
        { backgroundColor: colors.surface, borderColor: colors.border },
      ]}
    >
      <View style={localStyles.colorInfo}>
        <Text style={{ color: colors.text, fontSize: 14 }}>{label}</Text>
        <Text style={{ color: colors.textMuted, fontSize: 11 }}>{value}</Text>
      </View>
      <ColorPicker2 color={value} onChange={onChange} />
      <Pressable
        accessibilityRole='button'
        accessibilityLabel={t('theme.resetColor')}
        onPress={onReset}
        disabled={!overridden}
        style={{ opacity: overridden ? 1 : 0.3, padding: 6 }}
      >
        <MaterialIcons
          name='undo'
          size={20}
          color={overridden ? colors.primary : colors.textDisabled}
        />
      </Pressable>
    </View>
  );
};

const localStyles = StyleSheet.create({
  root: {
    gap: 12,
    paddingVertical: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 8,
  },
  segment: {
    minWidth: 92,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  paletteTab: {
    flex: 1,
    minWidth: 130,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 2,
    alignItems: 'center',
  },
  preview: {
    borderRadius: 10,
    borderWidth: 1,
    padding: 14,
    gap: 6,
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  previewRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  previewChip: {
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  previewSurface: {
    borderRadius: 6,
    borderWidth: 1,
    padding: 8,
    marginTop: 4,
  },
  contrastBox: {
    borderRadius: 8,
    borderWidth: 1,
    padding: 10,
    gap: 4,
  },
  actionButton: {
    minWidth: 120,
    minHeight: 42,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 10,
  },
  hint: {
    fontSize: 12,
  },
  group: {
    gap: 8,
  },
  groupTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginTop: 4,
  },
  colorRow: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    gap: 10,
  },
  colorInfo: {
    flex: 1,
    gap: 2,
  },
});

export default ColorSettings;
