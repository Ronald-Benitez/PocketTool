import { View, ScrollView, StyleSheet } from 'react-native';

import { useLanguage } from '@/src/lang/LanguageContext';
import useColorStore from '@/src/stores/ColorsStore';
import FinanceSimpleBlock from '@/src/components/ui/FinanceSimpleBlock';
import BalanceBlock from '@/src/components/ui/BalanceBlock';
import useFixedsResumesStore from '@/src/stores/FixedsResumesStore';

const RecordTypeScreen = () => {
    const { t } = useLanguage();
    const { colors } = useColorStore()
    const { balance, balanceByRecordType } = useFixedsResumesStore()


    return (
        <>
            <View style={localStyles.container}>

                <BalanceBlock
                    bottom={false}
                    text={t('resume.balance')}
                    value={(balance || 0).toFixed(2)}
                    color={balance < 0 ? colors?.ExpenseColor : colors?.IncomeColor}
                />
            </View >
            <ScrollView style={{ flex: 1 }}>
                <View style={localStyles.container}>
                    {
                        balanceByRecordType?.map((item) => (
                            <View style={localStyles.simpleContainer} key={item?.id}>
                                <FinanceSimpleBlock
                                    text={item.type_name}
                                    value={String(item.total)}
                                    color={item.record_color}
                                />
                            </View>
                        ))
                    }
                </View>
            </ScrollView>
        </>
    );
};

const localStyles = StyleSheet.create({
    balanceText: {
        borderTopWidth: 4,
        height: 60,
        paddingTop: 10,
        textAlign: "center",
        marginLeft: 5,
        fontWeight: "300",
        fontSize: 18
    },
    simpleContainer: {
        flexDirection: "row",
        justifyContent: "center",
        gap: 30,
        paddingVertical: 15
    },
    container: {
        padding: 10,
        paddingHorizontal: 20,
        justifyContent: 'center',
        width: '100%',
    }
})

export default RecordTypeScreen;
