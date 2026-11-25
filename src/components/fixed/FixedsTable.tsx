import { View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { MaterialIcons } from '@expo/vector-icons'

import { useLanguage } from '@/src/lang/LanguageContext'
import { SwipeAction } from '@/src/ui/actions/SwipeAction'
import { ScrollView } from 'react-native-gesture-handler'
import { useToast } from '@/src/ui/feedback/ToastProvider'
import AddItem from './AddFixed'
import { RecordRow } from '@/src/components/records/RecordRow'
import { SectionCard } from '@/src/ui/data-display/SectionCard'
import type { FixedRecord, FixedView } from '@/src/interfaces/schema'
import { useDataStore } from '@/src/stores'
import { useFixeds } from '@/src/db'
import { mapDatabaseError } from '@/src/db/errors'
import { AppText } from '@/src/ui/primitives/AppText'
import { useTheme } from '@/src/ui/theme/ThemeProvider'

const FixedsTable = () => {
    const [selected, setSelected] = useState<FixedView | FixedRecord | undefined>()
    const [openUpdate, setOpenUpdate] = useState<boolean>(false)
    const { showToast } = useToast()
    const { t } = useLanguage()
    const { colors } = useTheme()
    const { Fixeds, setFixeds } = useDataStore()
    const { fetchFixeds, handler: fixedsHandler } = useFixeds()

    useEffect(() => {
        let active = true
        fetchFixeds()
            .then((data) => {
                if (active) setFixeds(data)
            })
            .catch((cause) => {
                if (!active) return
                if (__DEV__) console.warn('[fixeds] load failed', cause)
                const mapped = mapDatabaseError(cause, t('toast.error'))
                showToast({
                    message: t(`dbErrors.${mapped.code}` as never),
                    type: 'error',
                })
            })
        return () => { active = false }
    }, [])

    const handleDelete = async (index: number) => {
        const toDelete = Fixeds[index]
        if (!toDelete.id) return
        await fixedsHandler.deleteById(toDelete.id)
        const data = await fetchFixeds()
        setFixeds(data)
        showToast({ message: t("item.deleted"), type: "success" })
    }

    const handleUpdate = (index: number) => {
        const select = Fixeds[index]
        setSelected(select)
        setOpenUpdate(true)
    }

    return (
        <>
            <ScrollView style={{ flex: 1 }}>
                <SectionCard
                    title={t('headers.fixeds')}
                    action={
                        <AddItem>
                            <View
                                accessible
                                accessibilityRole='button'
                                accessibilityLabel={t('add.fixed')}
                                style={{
                                    width: 44,
                                    height: 44,
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                <MaterialIcons name='add' size={24} color={colors.primary} />
                            </View>
                        </AddItem>
                    }
                    padded={false}
                    style={{ margin: 16 }}
                >
                    {Fixeds?.length ? (
                        <View style={{ paddingHorizontal: 16 }}>
                            {Fixeds.map((item, index) => (
                                <SwipeAction
                                    handleDelete={() => handleDelete(index)}
                                    handleUpdate={() => handleUpdate(index)}
                                    key={item.id}
                                >
                                    <RecordRow
                                        dayLabel={String(item.fixed_day)}
                                        title={item.fixed_name}
                                        ownCents={item.fixed_amount}
                                        accentColor={item.PaymentMethods?.PaymentTypes?.payment_color}
                                        bottomColor={item.RecordTypes?.record_color}
                                    />
                                </SwipeAction>
                            ))}
                        </View>
                    ) : (
                        <AppText color='muted' style={{ padding: 16 }}>
                            {t('budget.fixed.empty')}
                        </AppText>
                    )}
                </SectionCard>

                <AddItem
                    openUpdate={openUpdate}
                    open={openUpdate}
                    item={selected}
                    onClose={() => setOpenUpdate(false)}
                />
            </ScrollView>
        </>
    )
}

export default FixedsTable
