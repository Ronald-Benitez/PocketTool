import { View } from 'react-native'
import React, { useCallback, useState, useEffect } from 'react'
import { AntDesign, Ionicons } from '@expo/vector-icons'
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from 'expo-router';

import AddGroup from '@/src/components/groups/add-group'
import Table from '@/src/components/records/records-table'
import GroupSelector from '@/src/components/groups/group-selector'
import { useLanguage } from '@/src/lang/LanguageContext';

import { useTheme } from '@/src/ui/theme/ThemeProvider'
import { IconButton } from '@/src/ui/actions/IconButton'
import { Row } from '@/src/ui/primitives/Stack'
import { Surface } from '@/src/ui/primitives/Surface'
import useRecordsStore from '@/src/stores/RecordsStore';
import { useGroupRefresh } from '@/src/hooks/useGroupRefresh';

const Index = () => {
    const { colors } = useTheme()
    const { t } = useLanguage()
    const [pinned, setPinned] = useState<number>(0)
    const { group } = useRecordsStore()
    const { refreshGroupData } = useGroupRefresh()
    const groupId = group?.id

    useFocusEffect(
        useCallback(() => {
            if (!groupId) return
            refreshGroupData(groupId).catch((cause) => {
                if (__DEV__) console.warn('[records] group refresh failed', cause)
            })
        }, [groupId, refreshGroupData])
    )

    useEffect(() => {
        getPinned()
    }, [])

    const pinUp = async () => {
        if (!group?.id) return
        if (pinned != 0 && pinned === group?.id) {
            await AsyncStorage.removeItem("group")
            setPinned(0)
        } else {
            await AsyncStorage.setItem("group", String(group.id))
            setPinned(group.id)
        }
    }

    const getPinned = async () => {
        const pinned = await AsyncStorage.getItem('group');
        const p = Number(pinned)
        setPinned(p)
    }

    const isPinned = pinned !== 0 && pinned === group?.id

    return (
        <View style={{ flex: 1 }}>
            <Surface
                variant='glass'
                padding='sm'
                style={{ marginHorizontal: 16, marginTop: 8 }}
            >
                <Row justify='space-between' align='center' gap='sm'>
                    <View style={{ flex: 1 }}>
                        <GroupSelector />
                    </View>
                    <Row gap='sm' align='center'>
                        <AddGroup mode='create'>
                            <View
                                accessible
                                accessibilityRole='button'
                                accessibilityLabel={t('add.group')}
                                style={{
                                    width: 44,
                                    height: 44,
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                <AntDesign name="folder-add" size={20} color={colors.text} />
                            </View>
                        </AddGroup>
                        <IconButton
                            label={isPinned ? t('records.unpinGroup') : t('records.pinGroup')}
                            size='sm'
                            icon={
                                <Ionicons
                                    name={isPinned ? "pin" : "pin-outline"}
                                    size={22}
                                    color={colors.text}
                                />
                            }
                            onPress={pinUp}
                        />
                    </Row>
                </Row>
            </Surface>
            <Table />
        </View>
    )
}

export default Index;
