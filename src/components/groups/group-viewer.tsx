import { View } from 'react-native'
import React, { SetStateAction, useEffect, useState } from 'react'

import { Group, RecordView } from '@/src/interfaces/schema'
import { useTheme } from '@/src/ui/theme/ThemeProvider'
import { SwipeAction } from '@/src/ui/actions/SwipeAction'
import { FinanceValue } from '@/src/ui/data-display/FinanceValue'
import AddGroup from './add-group'
import { useRecords, useGroups } from '@/src/db'
import { useLanguage } from '@/src/lang/LanguageContext'
import { useToast } from '@/src/ui/feedback/ToastProvider'

interface GroupViewerProps {
    group: Group | null
    recordsI: RecordView[]
    setGroup: React.Dispatch<SetStateAction<Group | null>>
}

const GroupViewer = ({ group, setGroup, recordsI }: GroupViewerProps) => {
    const { colors } = useTheme()
    const { t } = useLanguage()
    const [openUpdate, setOpenUpdate] = useState(false)
    const [totalIncomes, setTotalIncomes] = useState(0)
    const [totalExpenses, setTotalExpenses] = useState(0)
    const groups = useGroups()
    const records = useRecords()
    const { showToast } = useToast()

    useEffect(() => {
        const load = async () => {
            if (group?.id) {
                setTotalIncomes(await records.fetchTotalIncomes(group.id) as number)
                setTotalExpenses(await records.fetchTotalExpenses(group.id) as number)
            }
        }
        load()
    }, [recordsI, group])

    if (!group) return null

    const balance = totalIncomes - totalExpenses
    const balanceColor = balance < 0 ? colors.expense : balance > 0 ? colors.income : colors.goal

    const onDelete = async () => {
        if (!group.id) return
        await groups.deleteGroup(group.id)
        setGroup(null)
        await records.deleteRecordByGroup(group.id)
        showToast({ message: t("group.deleted"), type: "success" })
    }

    const onUpdate = () => {
        setOpenUpdate(true)
    }

    const Block = ({ type }: { type: 'i' | 'e' | 'g' | 'b' }) => {
        let value = 0
        if (type === 'i') value = totalIncomes
        if (type === 'e') value = totalExpenses
        if (type === 'b') value = balance
        if (type === 'g') value = group.goal
        const color = type === 'i' ? colors.income : type === 'e' ? colors.expense : balanceColor

        return (
            <View
                style={{
                    flex: 1,
                    flexDirection: 'row',
                    justifyContent: 'space-around',
                    gap: 5,
                    padding: 2,
                    width: '100%',
                }}
            >
                <View
                    style={{
                        borderColor: color,
                        borderWidth: 2,
                        borderTopWidth: 0,
                        borderBottomWidth: 0,
                        borderRadius: 8,
                        minWidth: 200,
                        padding: 5,
                        alignItems: 'center',
                    }}
                >
                    <FinanceValue cents={Math.abs(value)} size='lg' />
                </View>
            </View>
        )
    }

    return (
        <>
            <View style={{ marginHorizontal: 30 }}>
                <SwipeAction handleDelete={onDelete} handleUpdate={onUpdate}>
                    <View style={{ width: '100%', gap: 10 }}>
                        <View
                            style={{
                                flexDirection: 'row',
                                paddingHorizontal: 10,
                                paddingBottom: 5,
                                justifyContent: 'center',
                                gap: 10,
                            }}
                        >
                            <Block type='b' />
                        </View>
                    </View>
                </SwipeAction>
            </View>
            <AddGroup
                openUpdate={openUpdate}
                mode='edit'
                onClose={() => setOpenUpdate(false)}
            />
        </>
    )
}

export default GroupViewer
