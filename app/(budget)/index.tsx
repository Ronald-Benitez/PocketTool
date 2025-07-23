import { View, TouchableOpacity } from 'react-native'

import Table from '@/src/components/budgets/budgets-table'
import GroupSelector from '@/src/components/groups/group-selector'
import styles from '@/src/styles/styles'

const Index = () => {

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