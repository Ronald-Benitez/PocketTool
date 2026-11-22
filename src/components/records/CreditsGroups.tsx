import { Pressable, View } from 'react-native'

import type { RecordFormEntry, RecordType } from '@/src/interfaces/schema'
import { useLanguage } from '@/src/lang/LanguageContext'
import { AppText } from '@/src/ui/primitives/AppText'
import { RecordRow } from './RecordRow'

type CreditsGroupsProps = {
    credits: RecordFormEntry[],
    selectedPaymentCreditType: RecordType | undefined,
    onCreditPayment: (item: RecordFormEntry) => void,
}

export const CreditsGroups = ({ credits, selectedPaymentCreditType, onCreditPayment }: CreditsGroupsProps) => {
    const { t } = useLanguage()

    if (!credits || credits.length === 0) {
        return null
    }

    return (
        <>
            <AppText
                variant='label'
                color='muted'
                align='center'
                style={{ marginTop: 12 }}
            >
                {t('records.creditPayments')}
            </AppText>
            <View style={{ gap: 5, paddingHorizontal: 16 }}>
                {credits.map((item, index) => (
                    <Pressable key={index} onPress={() => onCreditPayment(item)}>
                        <RecordRow
                            date={item.date ?? 0}
                            title={item.record_name ?? ''}
                            ownCents={item.amount ?? 0}
                            accentColor={selectedPaymentCreditType?.record_color}
                            bottomColor={selectedPaymentCreditType?.record_color}
                        />
                    </Pressable>
                ))}
            </View>
        </>
    )
}

export default CreditsGroups
