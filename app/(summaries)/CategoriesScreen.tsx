import { View, ScrollView, StyleSheet } from 'react-native';
import GroupSelector from '@/src/components/groups/group-selector';
import styles from '@/src/styles/styles';
import FinnanceTableBlock from '@/src/components/ui/FinanceTableBlock';
import RecordsModal, { RecordsModalRef } from '@/src/components/records/RecordsModal';
import { useRef } from 'react';
import { useRecords } from '@/src/db/handlers/RecordsHandler';
import useRecordsStore from '@/src/stores/RecordsStore';

const CategoriesScreen = () => {
    const { group } = useRecordsStore()
    const { fetchRecordsWithMultipleWhere } = useRecords()
    const recordsModalRef = useRef<RecordsModalRef | null>(null);

    const onSummarySelected = async (id: number | undefined, idRecordType: number | undefined) => {
        if (!id) return;
        try {
            const filters = [{ column: "Records.category_id", value: id }, { column: "Records.group_id", value: group?.id }]
            if (idRecordType) {
                filters.push({ column: "Records.record_type_id", value: idRecordType })
            }
            await fetchRecordsWithMultipleWhere(filters).then((res) => {
                if (res) {
                    console.log("Filtered Records:", res?.length, recordsModalRef.current);
                    recordsModalRef.current?.open(res)
                }
            })
        } catch (e) {
            console.error(e)
        }
    }


    return (
        <>
            <View style={localStyles.container}>
                <View style={[styles.row, { justifyContent: 'center', alignItems: "flex-end", marginBottom: 10, gap: 10 }]}>
                    <GroupSelector />
                </View>
            </View >
            <ScrollView>
                <View style={localStyles.container}>
                    <FinnanceTableBlock render='categories' onSummarySelected={onSummarySelected} />
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

export default CategoriesScreen;
