import React from 'react'

import Table from '@/src/components/fixed/FixedsTable'
import { Screen } from '@/src/ui/primitives/Screen'

const Index = () => {
    return (
        <Screen edges={['left', 'right']} padded={false}>
            <Table />
        </Screen>
    )
}

export default Index
