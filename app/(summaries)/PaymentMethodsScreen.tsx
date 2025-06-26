import { View, ScrollView, StyleSheet } from 'react-native';
import GroupSelector from '@/src/components/groups/group-selector';
import styles from '@/src/styles/styles';
import FinnanceTableBlock from '@/src/components/ui/FinanceTableBlock';

const PaymentMethodsScreen = () => {

    return (
        <>
            <View style={localStyles.container}>
                <View style={[styles.row, { justifyContent: 'center', alignItems: "flex-end", marginBottom: 10, gap: 10 }]}>
                    <GroupSelector />
                </View>

            </View >
            <ScrollView>
                <View style={localStyles.container}>
                    <FinnanceTableBlock render='payments' />
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
        gap: 20
    },
    container: {
        padding: 10,
        paddingHorizontal: 20
    }
})

export default PaymentMethodsScreen;
