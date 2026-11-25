import React from 'react';
import { StyleSheet, View } from 'react-native';

import useDate from '@/src/hooks/useDate';
import { useLanguage } from '@/src/lang/LanguageContext';
import { formatMoneyWithSymbol } from '@/src/utils';
import { AccentRow } from '@/src/ui/data-display/AccentRow';
import { FinanceValue } from '@/src/ui/data-display/FinanceValue';
import { AppText } from '@/src/ui/primitives/AppText';
import { useTheme } from '@/src/ui/theme/ThemeProvider';

export type RecordRowProps = {
  date?: number;
  /** Replaces the full date with a compact label, for example a fixed day. */
  dayLabel?: string;
  title: string;
  /** Amount shown on the right; normally the user's share. */
  ownCents: number;
  /** Full amount when it differs from `ownCents`. */
  totalCents?: number | null;
  sharedCents?: number | null;
  paidByName?: string | null;
  savingName?: string | null;
  accentColor?: string | null;
  bottomColor?: string | null;
  showOwnLabel?: boolean;
};

/**
 * Shared row used by records, fixeds, credits and pending financings.
 *
 * It keeps the compact date column and the accent bars while moving all text to
 * AppText and the value to FinanceValue.
 */
export const RecordRow = ({
  date,
  dayLabel,
  title,
  ownCents,
  totalCents,
  sharedCents,
  paidByName,
  savingName,
  accentColor,
  bottomColor,
  showOwnLabel,
}: RecordRowProps) => {
  const dateh = useDate();
  const { t } = useLanguage();
  const { colors } = useTheme();
  const shared = sharedCents ?? 0;
  const total = totalCents ?? ownCents + shared;
  const showOwn = showOwnLabel ?? shared > 0;

  return (
    <AccentRow
      bottomColor={bottomColor ?? colors.primary}
      accentColor={accentColor ?? colors.primary}
    >
      <View style={styles.row}>
        <View style={styles.dateColumn}>
          {dayLabel ? (
            <AppText variant='subtitle' align='center' numberOfLines={1}>
              {dayLabel}
            </AppText>
          ) : date ? (
            <>
              <AppText variant='caption' color='muted' align='center' numberOfLines={1}>
                {dateh.getStringDay(String(date))}
              </AppText>
              <AppText variant='caption' color='muted' align='center' numberOfLines={1}>
                {dateh.getDay(String(date))}
              </AppText>
              <AppText variant='caption' color='muted' align='center' numberOfLines={1}>
                {dateh.getStringMonth(String(date))}
              </AppText>
            </>
          ) : null}
        </View>

        <View style={styles.content}>
          <AppText variant='label' numberOfLines={1}>
            {title}
          </AppText>
          {shared > 0 ? (
            <AppText variant='caption' color='muted' numberOfLines={2}>
              {t('shared.total')}: {formatMoneyWithSymbol(total)} ·{' '}
              {t('shared.totalShared')}: {formatMoneyWithSymbol(shared)}
            </AppText>
          ) : null}
          {paidByName ? (
            <AppText variant='caption' color='muted' numberOfLines={1}>
              {t('shared.paidByName', { name: paidByName })}
            </AppText>
          ) : null}
          {savingName ? (
            <AppText variant='caption' color='muted' numberOfLines={1}>
              {t('savings.records.paidWith')}: {savingName}
            </AppText>
          ) : null}
        </View>

        <View style={styles.amountColumn}>
          <FinanceValue cents={ownCents} size='md' color={colors.text} />
          {showOwn ? (
            <AppText variant='caption' color='muted' align='right'>
              {t('shared.own')}
            </AppText>
          ) : null}
        </View>
      </View>
    </AccentRow>
  );
};

const styles = StyleSheet.create({
  row: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  dateColumn: {
    width: 48,
  },
  content: {
    flex: 1,
    minWidth: 0,
  },
  amountColumn: {
    alignItems: 'flex-end',
  },
});
