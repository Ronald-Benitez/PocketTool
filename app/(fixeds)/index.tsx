import { View } from 'react-native'
import Table from '@/src/components/fixed/FixedsTable'

import { useThemedStyles } from '@/src/styles/useThemedStyles'

const Index = () => {
    const styles = useThemedStyles()

    return (
        <View style={styles.container}>
            <Table />
        </View >
    )
}

export default Index