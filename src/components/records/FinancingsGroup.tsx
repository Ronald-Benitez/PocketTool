import { Pressable, View } from 'react-native';

import type { FinancingWithRelations } from '@/src/interfaces/schema';
import type { FinancingSummary } from '@/src/domain/credits/summary';
import type { FinancingScheduleRow } from '@/src/domain/credits/types';
import { useLanguage } from '@/src/lang/LanguageContext';
import { AppText } from '@/src/ui/primitives/AppText';
import { RecordRow } from './RecordRow';

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
  const { t } = useLanguage();

  if (!payments || payments.length === 0) return null;

  return (
    <>
      <AppText
        variant='label'
        color='muted'
        align='center'
        style={{ marginTop: 12 }}
      >
        {t('records.financingPayments')}
      </AppText>
      <View style={{ gap: 5, paddingHorizontal: 16 }}>
        {payments.map((item) => (
          <Pressable
            key={`${item.financing.id}-${item.next.number}`}
            onPress={() => onPress(item)}
          >
            <RecordRow
              date={item.next.date}
              title={item.financing.name}
              ownCents={
                item.summary.monthlyPaymentCents -
                item.summary.sharedPaymentCents
              }
              totalCents={item.summary.monthlyPaymentCents}
              sharedCents={item.summary.sharedPaymentCents}
              showOwnLabel={Boolean(item.financing.is_shared)}
              accentColor={item.financing.RecordTypes?.record_color}
              bottomColor={
                item.financing.PaymentMethods?.PaymentTypes?.payment_color
              }
            />
          </Pressable>
        ))}
      </View>
    </>
  );
};

export default FinancingsGroup;
