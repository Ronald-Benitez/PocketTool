import { View, ScrollView, StyleSheet } from 'react-native';
import FinnanceTableBlock from '@/src/components/ui/FinanceTableBlock';

const CategoriesScreen = () => {

    return (
        <>
            <ScrollView>
                <View style={localStyles.container}>
                    <FinnanceTableBlock render='categories' fixed />
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

export default CategoriesScreen;
