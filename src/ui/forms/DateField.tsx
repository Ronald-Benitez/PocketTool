import React, { useEffect, useMemo, useState } from 'react';
import {
  Pressable,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

import { useLanguage } from '@/src/lang/LanguageContext';
import { dayShortKey, monthKey } from '@/src/lang/keys';
import useDate from '@/src/hooks/useDate';
import { useTheme } from '../theme/ThemeProvider';
import { controlHeight, radii, spacing } from '../theme/tokens';
import { AppText } from '../primitives/AppText';
import { Button } from '../actions/Button';
import { IconButton } from '../actions/IconButton';
import { BottomSheet } from '../overlays/Modal';
import { FormField } from './FormField';

export type DateFieldProps = {
  label?: string;
  required?: boolean;
  hint?: string;
  error?: string;
  value: number | null | undefined;
  onChange: (timestampMs: number) => void;
  disabled?: boolean;
  placeholder?: string;
  title?: string;
  closeLabel?: string;
  todayLabel?: string;
  cancelLabel?: string;
  containerStyle?: StyleProp<ViewStyle>;
};

const toDate = (timestamp: number | null | undefined): Date | null =>
  typeof timestamp === 'number' && Number.isFinite(timestamp) && timestamp > 0
    ? new Date(timestamp)
    : null;

export const DateField = ({
  label,
  required = false,
  hint,
  error,
  value,
  onChange,
  disabled = false,
  placeholder = 'Select a date',
  title,
  closeLabel,
  todayLabel,
  cancelLabel,
  containerStyle,
}: DateFieldProps) => {
  const { t } = useLanguage();
  const dateH = useDate();
  const { colors } = useTheme();
  const [visible, setVisible] = useState(false);

  const baseDate = useMemo(() => toDate(value) ?? new Date(), [value]);
  const [view, setView] = useState({
    year: baseDate.getFullYear(),
    month: baseDate.getMonth(),
  });

  useEffect(() => {
    if (!visible) return;
    const current = toDate(value) ?? new Date();
    setView({ year: current.getFullYear(), month: current.getMonth() });
  }, [visible, value]);

  const firstWeekday = new Date(view.year, view.month, 1).getDay();
  const daysInMonth = new Date(view.year, view.month + 1, 0).getDate();
  const today = new Date();

  const cells = useMemo(() => {
    const empty = Array.from({ length: firstWeekday }, () => null);
    const days = Array.from({ length: daysInMonth }, (_, index) => index + 1);
    return [...empty, ...days];
  }, [firstWeekday, daysInMonth]);

  const selectedDate = toDate(value);
  const formatted = selectedDate ? dateH.getStringDate(selectedDate.getTime()) : placeholder;

  const moveMonth = (delta: number) => {
    setView((current) => {
      const next = new Date(current.year, current.month + delta, 1);
      return { year: next.getFullYear(), month: next.getMonth() };
    });
  };

  const moveYear = (delta: number) => {
    setView((current) => ({ ...current, year: current.year + delta }));
  };

  const selectDay = (day: number) => {
    onChange(new Date(view.year, view.month, day).getTime());
    setVisible(false);
  };

  const selectToday = () => {
    const now = new Date();
    onChange(now.getTime());
    setVisible(false);
  };

  const isSelected = (day: number) =>
    selectedDate !== null &&
    selectedDate.getFullYear() === view.year &&
    selectedDate.getMonth() === view.month &&
    selectedDate.getDate() === day;

  const isToday = (day: number) =>
    today.getFullYear() === view.year &&
    today.getMonth() === view.month &&
    today.getDate() === day;

  return (
    <FormField
      label={label}
      required={required}
      hint={hint}
      error={error}
      style={containerStyle}
    >
      <Pressable
        onPress={disabled ? undefined : () => setVisible(true)}
        disabled={disabled}
        accessibilityRole='button'
        accessibilityLabel={label ?? placeholder}
        accessibilityHint={t('datePicker.openCalendar')}
        accessibilityState={{ disabled, expanded: visible }}
        style={[
          styles.field,
          {
            borderColor: error ? colors.danger : colors.border,
            backgroundColor: colors.inputBackground,
            opacity: disabled ? 0.6 : 1,
          },
        ]}
      >
        <AppText
          color={selectedDate ? 'default' : 'muted'}
          numberOfLines={1}
          style={styles.value}
        >
          {formatted}
        </AppText>
        <MaterialIcons name='calendar-month' size={22} color={colors.textMuted} />
      </Pressable>

      <BottomSheet
        visible={visible}
        onClose={() => setVisible(false)}
        title={title ?? label ?? placeholder}
        closeLabel={closeLabel ?? cancelLabel ?? t('datePicker.cancel')}
        footer={
          <View style={styles.footer}>
            <Button
              label={todayLabel ?? t('datePicker.today')}
              variant='outline'
              onPress={selectToday}
              style={styles.footerButton}
            />
            <Button
              label={cancelLabel ?? t('datePicker.cancel')}
              variant='ghost'
              onPress={() => setVisible(false)}
              style={styles.footerButton}
            />
          </View>
        }
      >
        <View style={styles.headerRow}>
          <IconButton
            label={t('datePicker.previousMonth')}
            icon={<MaterialIcons name='chevron-left' size={24} color={colors.text} />}
            onPress={() => moveMonth(-1)}
          />
          <AppText variant='subtitle'>{t(monthKey(view.month))}</AppText>
          <IconButton
            label={t('datePicker.nextMonth')}
            icon={<MaterialIcons name='chevron-right' size={24} color={colors.text} />}
            onPress={() => moveMonth(1)}
          />
        </View>

        <View style={styles.headerRow}>
          <IconButton
            label={t('datePicker.previousYear')}
            icon={<MaterialIcons name='chevron-left' size={20} color={colors.textMuted} />}
            size='sm'
            onPress={() => moveYear(-1)}
          />
          <AppText variant='body' color='muted'>
            {view.year}
          </AppText>
          <IconButton
            label={t('datePicker.nextYear')}
            icon={<MaterialIcons name='chevron-right' size={20} color={colors.textMuted} />}
            size='sm'
            onPress={() => moveYear(1)}
          />
        </View>

        <View style={styles.weekdays}>
          {Array.from({ length: 7 }, (_, index) => (
            <View key={index} style={styles.cell}>
              <AppText variant='caption' color='muted' align='center'>
                {t(dayShortKey(index))}
              </AppText>
            </View>
          ))}
        </View>

        <View style={styles.grid}>
          {cells.map((day, index) => {
            if (day === null) {
              return <View key={`empty-${index}`} style={styles.cell} />;
            }

            const selected = isSelected(day);
            const currentDay = isToday(day);

            return (
              <Pressable
                key={day}
                onPress={() => selectDay(day)}
                accessibilityRole='button'
                accessibilityLabel={`${day} ${t(monthKey(view.month))} ${view.year}`}
                accessibilityState={{ selected }}
                style={[
                  styles.cell,
                  styles.dayCell,
                  {
                    backgroundColor: selected ? colors.primary : 'transparent',
                    borderColor: currentDay && !selected ? colors.primary : 'transparent',
                  },
                ]}
              >
                <AppText
                  variant='body'
                  style={{ color: selected ? colors.onPrimary : colors.text }}
                >
                  {day}
                </AppText>
              </Pressable>
            );
          })}
        </View>
      </BottomSheet>
    </FormField>
  );
};

const styles = StyleSheet.create({
  field: {
    minHeight: controlHeight.md,
    borderWidth: 1,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  value: {
    flex: 1,
  },
  footer: {
    flex: 1,
    flexDirection: 'row',
    gap: spacing.sm,
  },
  footerButton: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  weekdays: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: spacing.sm,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  cell: {
    width: '14.2857%',
    minHeight: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayCell: {
    borderWidth: 1,
    borderRadius: radii.md,
  },
});
