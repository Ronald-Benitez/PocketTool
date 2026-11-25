import { Pressable, View } from 'react-native'

import { useLanguage } from '@/src/lang/LanguageContext'
import type { RecordFormEntry } from '@/src/interfaces/schema'
import { AppText } from '@/src/ui/primitives/AppText'
import { RecordRow } from './RecordRow'

type FixedsGroupProps = {
    fixeds: RecordFormEntry[],
    onCreditPayment: (item: RecordFormEntry) => void,
}

const FixedsGroup = ({ fixeds, onCreditPayment }: FixedsGroupProps) => {
    const { t } = useLanguage()

    if (!fixeds || fixeds.length === 0) {
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
                {t('records.fixeds')}
            </AppText>
            <View style={{ gap: 5, paddingHorizontal: 16 }}>
                {fixeds.map((item, index) => (
                    <Pressable key={index} onPress={() => onCreditPayment(item)}>
                        <RecordRow
                            date={item.date ?? 0}
                            title={item.record_name ?? ''}
                            ownCents={item.own_amount_cents ?? item.amount ?? 0}
                            sharedCents={item.shared_amount_cents ?? 0}
                            accentColor={item.RecordTypes?.record_color}
                            bottomColor={item.PaymentMethods?.PaymentTypes?.payment_color}
                        />
                    </Pressable>
                ))}
            </View>
        </>
    )
}

export default FixedsGroup
