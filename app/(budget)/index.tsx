import { View, TouchableOpacity } from 'react-native'

import Table from '@/src/components/budgets/budgets-table'
import GroupSelector from '@/src/components/groups/group-selector'
import { useThemedStyles } from '@/src/styles/useThemedStyles'

const Index = () => {
    const styles = useThemedStyles()

    return (
        <View style={styles.container}>
            <View style={[styles.row, { justifyContent: "space-around", alignItems: "flex-end" }]}>
                <View style={{ paddingBottom: 5 }}>
                    <GroupSelector />
                </View>
            </View>
            <Table />

        </View >
    )
}

export default Index