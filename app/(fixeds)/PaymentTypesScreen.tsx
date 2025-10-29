import { View, ScrollView, StyleSheet } from 'react-native';
import FinnanceTableBlock from '@/src/components/ui/FinanceTableBlock';
import FinnanceTableChart from '@/src/components/ui/FinanceTableChart';
import useRecordsStore from '@/src/stores/RecordsStore';
import { useRecords } from '@/src/db/handlers/RecordsHandler';
import { useRef, useState } from 'react';
import { RecordsModalRef, RecordsModal } from '@/src/components/records/RecordsModal';
import { AntDesign } from '@expo/vector-icons';

const PaymentMethodsScreen = () => {

    const { group } = useRecordsStore()
    const { fetchRecordsWithMultipleWhere } = useRecords()
    const recordsModalRef = useRef<RecordsModalRef | null>(null);
    const [renderType, setRenderType] = useState<'chart' | 'table'>('table');

    const onSummarySelected = async (id: number | undefined) => {
        if (!id) return;
        try {
            await fetchRecordsWithMultipleWhere([{ column: "record_type_id", value: id }, { column: "Records.group_id", value: group?.id }]).then((res) => {
                if (res) {
                    console.log("Filtered Records:", res, recordsModalRef.current);
                    recordsModalRef.current?.open(res)
                }
            })
        } catch (e) {
            console.error(e)
        }
    }

    return (
        <>
            <ScrollView>
                <View style={localStyles.container}>
                    {/* <View style={{ flexDirection: "row", justifyContent: "flex-end", marginBottom: 10 }}>
                        <AntDesign
                            name={renderType === 'chart' ? 'table' : 'pie-chart'}
                            size={24}
                            color="#1313135c"
                            onPress={() => setRenderType(renderType === 'chart' ? 'table' : 'chart')}
                        />
                    </View> */}
                    {renderType === 'chart' ? (
                        <FinnanceTableChart render='types' fixed onSummarySelected={onSummarySelected} />
                    ) : (
                        <FinnanceTableBlock render='types' fixed onSummarySelected={onSummarySelected} />
                    )}
                </View>
            </ScrollView>
            <RecordsModal ref={recordsModalRef} />
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
        gap: 20
    },
    container: {
        padding: 10,
        paddingHorizontal: 20
    }
})

export default PaymentMethodsScreen;
