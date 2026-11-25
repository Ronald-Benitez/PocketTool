import { View } from 'react-native';

import { SwipeAction } from '@/src/ui/actions/SwipeAction';
import { useLanguage } from '@/src/lang/LanguageContext';
import type { RecordView } from '@/src/interfaces/schema';
import { RecordRow } from './RecordRow';

type RecordsGroupProps = {
    records: RecordView[],
    handleUpdate: (record: RecordView) => void,
    handleDelete: (record: RecordView) => void,
}

const RecordsGroup = ({ records, handleDelete, handleUpdate }: RecordsGroupProps) => {
    const { t } = useLanguage()

    return (
        <View style={{ gap: 5, paddingHorizontal: 16 }}>
            {records?.map((item) => (
                <SwipeAction
                    handleDelete={() => handleDelete(item)}
                    handleUpdate={() => handleUpdate(item)}
                    key={item.id}
                >
                    <RecordRow
                        date={item.date}
                        title={item.record_name}
                        ownCents={item.own_amount_cents ?? item.amount}
                        sharedCents={item.shared_amount_cents ?? 0}
                        accentColor={item.RecordTypes?.record_color}
                        bottomColor={item.PaymentMethods?.PaymentTypes?.payment_color}
                        paidByName={
                            item.paid_by_person_id != null
                                ? item.People?.name ?? t('shared.deletedPerson')
                                : null
                        }
                        savingName={item.saving_name}
                    />
                </SwipeAction>
            ))}
        </View>
    )
}

export default RecordsGroup
