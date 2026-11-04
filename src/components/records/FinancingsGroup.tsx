import { View, Text, Pressable, StyleSheet } from 'react-native';

import type { FinancingWithRelations } from '@/src/interfaces/schema';
import type { FinancingSummary } from '@/src/domain/credits/summary';
import type { FinancingScheduleRow } from '@/src/domain/credits/types';
import { useLanguage } from '@/src/lang/LanguageContext';
import useDate from '@/src/hooks/useDate';
import { AccentRow } from '@/src/ui/data-display/AccentRow';
import { useThemedStyles } from '@/src/styles/useThemedStyles';
import { formatMoneyWithSymbol } from '@/src/utils';

export type PendingFinancingPayment = {
  financing: FinancingWithRelations;
  summary: FinancingSummary;
  next: FinancingScheduleRow;
};

type FinancingsGroupProps = {
  payments: PendingFinancingPayment[];
  onPress: (payment: PendingFinancingPayment) => void;
};

const FinancingsGroup = ({ payments, onPress }: FinancingsGroupProps) => {
  const styles = useThemedStyles();
  const dateh = useDate();
  const { t } = useLanguage();

  if (!payments || payments.length === 0) return null;

  return (
    <>
      <Text
        style={[
          styles.smallText,
          { textAlign: 'center', marginTop: 10 },
        ]}
      >
        {t('records.financingPayments')}
      </Text>
      <View style={{ gap: 5, paddingHorizontal: 30 }}>
        {payments.map((item) => (
          <Pressable
            key={`${item.financing.id}-${item.next.number}`}
            onPress={() => onPress(item)}
          >
            <AccentRow
              bottomColor={
                item.financing.PaymentMethods?.PaymentTypes?.payment_color ??
                '#000'
              }
              accentColor={item.financing.RecordTypes?.record_color ?? '#000'}
            >
              <View style={localStyles.rowContainer}>
                <View style={localStyles.dateContainer}>
                  <Text style={[localStyles.dateText, styles.textMuted]}>
                    {dateh.getStringDay(String(item.next.date))}
                  </Text>
                  <Text style={[localStyles.dateText, styles.textMuted]}>
                    {dateh.getDay(String(item.next.date))}
                  </Text>
                  <Text style={[localStyles.dateText, styles.textMuted]}>
                    {dateh.getStringMonth(String(item.next.date))}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[localStyles.nameText, styles.textPrimary]}>
                    {item.financing.name}
                  </Text>
                  {item.financing.is_shared ? (
                    <Text style={[localStyles.captionText, styles.textMuted]}>
                      {t('shared.total')}:{' '}
                      {formatMoneyWithSymbol(item.summary.monthlyPaymentCents)} ·{' '}
                      {t('shared.totalShared')}:{' '}
                      {formatMoneyWithSymbol(item.summary.sharedPaymentCents)}
                    </Text>
                  ) : null}
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={[localStyles.valueText, styles.textPrimary]}>
                    {formatMoneyWithSymbol(
                      item.summary.monthlyPaymentCents -
                        item.summary.sharedPaymentCents
                    )}
                  </Text>
                  {item.financing.is_shared ? (
                    <Text style={[localStyles.captionText, styles.textMuted]}>
                      {t('shared.own')}
                    </Text>
                  ) : null}
                </View>
              </View>
            </AccentRow>
          </Pressable>
        ))}
      </View>
    </>
  );
};

const localStyles = StyleSheet.create({
  rowContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateContainer: {
    width: 50,
  },
  dateText: {
    fontWeight: '500',
    fontSize: 8,
    textAlign: 'center',
  },
  nameText: {
    fontSize: 12,
    textAlign: 'left',
    maxWidth: 200,
  },
  captionText: {
    fontSize: 9,
    textAlign: 'left',
  },
  valueText: {
    fontSize: 12,
    textAlign: 'center',
    fontWeight: '300',
  },
});

export default FinancingsGroup;
