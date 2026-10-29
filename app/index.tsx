import { View, Pressable } from 'react-native';
import React, { useEffect, useState } from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { useLanguage } from '@/src/lang/LanguageContext';
import useColorStore from '@/src/stores/ColorsStore';
import GroupSelector from '@/src/components/groups/group-selector';
import useRecordsStore from '@/src/stores/RecordsStore';
import AddItem from '@/src/components/records/add-record';
import useResumesStore from '@/src/stores/ResumesStore';
import { useDataStore } from '@/src/stores';
import type { FixedView, RecordFormEntry } from '@/src/interfaces/schema';
import { useConfigs } from '@/src/hooks/useConfigs';
import { AppText } from '@/src/ui/primitives/AppText';
import { Row, Stack } from '@/src/ui/primitives/Stack';
import { Screen } from '@/src/ui/primitives/Screen';
import { Surface } from '@/src/ui/primitives/Surface';
import { SummaryBlock } from '@/src/ui/data-display/SummaryBlock';
import { FinanceValue } from '@/src/ui/data-display/FinanceValue';
import { useTheme } from '@/src/ui/theme/ThemeProvider';

const Index = () => {
    const { t } = useLanguage();
    const { initializeColors } = useColorStore()
    const { colors } = useTheme()
    const { group } = useRecordsStore()
    const [todayFixeds, setTodayFixeds] = useState<FixedView[]>()
    const { balance, todayBalanceByRecordType } = useResumesStore()
    const [fixedToSave, setFixedToSave] = useState<RecordFormEntry>()
    const { loadConfigs } = useConfigs()
    const [open, setOpen] = useState(false)
    const { records } = useRecordsStore()
    const { Fixeds } = useDataStore()

    useEffect(() => {
        initializeColors()
        loadConfigs()
    }, [])

    const verifyFixedsForToday = () => {
        const today = new Date()
        const day = today.getDate()
        const list: FixedView[] = []
        const todayFixeds = Fixeds.filter(fixed => fixed.fixed_day === day)
        todayFixeds.forEach((fixed) => {
            const record = records.find(record => record.fixed_id === fixed.id)
            if (!record) {
                list.push(fixed)
            }
        })
        setTodayFixeds(list)
    }

    useEffect(verifyFixedsForToday, [records, Fixeds])

    const decideText = () => {
        const hour = new Date().getHours()
        let message = ""
        let icon = <></>
        if (hour >= 5 && hour < 12) {
            message = t("greeting.morning")
            icon = <MaterialCommunityIcons name="weather-partly-cloudy" size={28} color={colors.info} />
        } else if (hour >= 12 && hour < 18) {
            icon = <MaterialCommunityIcons name="weather-sunny" size={28} color={colors.warning} />
            message = t("greeting.afternoon")
        } else {
            message = t("greeting.night")
            icon = <MaterialCommunityIcons name="weather-night" size={28} color={colors.transfer} />
        }

        return [message, icon]
    }

    const onFixedPress = (item: FixedView) => {
        const today = new Date()
        today.setDate(item.fixed_day)
        setFixedToSave({
            amount: item.fixed_amount,
            date: today.getTime(),
            group_id: group?.id ?? null,
            record_name: item.fixed_name,
            record_type_id: item.record_type_id,
            category_id: item.category_id,
            payment_method_id: item.payment_method_id,
            fixed_id: item.id,
        })
        setOpen(!open)
    }

    const [message, Icon] = decideText()

    return (
        <Screen scroll edges={['left', 'right']}>
            <Stack gap='lg'>
                <Row justify='space-between' align='center'>
                    <Row gap='sm' align='center'>
                        <AppText variant='title'>{message}</AppText>
                        {Icon}
                    </Row>
                </Row>

                <Row justify='center'>
                    <GroupSelector />
                </Row>

                {todayFixeds && todayFixeds.length > 0 ? (
                    <Surface variant='outlined' padding='md'>
                        <Stack gap='sm'>
                            <AppText variant='label'>{t("index.fixedsMessage")}</AppText>
                            {todayFixeds.map((item) => (
                                <Pressable key={item.id} onPress={() => onFixedPress(item)}>
                                    <Row justify='space-between' align='center' style={{ minHeight: 40, gap: 12 }}>
                                        <Row gap='sm' align='center' style={{ flex: 1 }}>
                                            <View
                                                style={{
                                                    width: 8,
                                                    height: 8,
                                                    borderRadius: 4,
                                                    backgroundColor: item.RecordTypes?.record_color ?? colors.primary,
                                                }}
                                            />
                                            <AppText variant='body' numberOfLines={1} style={{ flex: 1 }}>
                                                {item.fixed_name}
                                            </AppText>
                                        </Row>
                                        <FinanceValue cents={item.fixed_amount} size='md' color={colors.text} />
                                    </Row>
                                </Pressable>
                            ))}
                        </Stack>
                    </Surface>
                ) : null}

                <Surface variant='raised' padding='lg'>
                    <SummaryBlock
                        label={t("resume.balance")}
                        cents={balance}
                        size='xl'
                        labelVariant='subtitle'
                        valueColorOverride={colors.text}
                        accentColor={colors.primary}
                    />
                </Surface>

                <Surface variant='outlined' padding='md'>
                    <SummaryBlock
                        label={t("resume.goal")}
                        cents={group?.goal}
                        size='lg'
                        valueColorOverride={colors.text}
                        accentColor={colors.goal}
                    />
                </Surface>

                <Surface variant='muted' padding='md'>
                    <Stack gap='md'>
                        <Row justify='space-between' align='center'>
                            <AppText variant='subtitle'>{t("resume.today")}</AppText>
                            {group ? (
                                <AddItem>
                                    <View style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}>
                                        <MaterialCommunityIcons name='plus' size={26} color={colors.primary} />
                                    </View>
                                </AddItem>
                            ) : null}
                        </Row>

                        {todayBalanceByRecordType && todayBalanceByRecordType.length > 0 ? (
                            todayBalanceByRecordType.map((item) => (
                                <Row key={item.id} justify='space-between' align='center' style={{ minHeight: 36, gap: 12 }}>
                                    <Row gap='sm' align='center' style={{ flex: 1 }}>
                                        <View
                                            style={{
                                                width: 8,
                                                height: 8,
                                                borderRadius: 4,
                                                backgroundColor: item.record_color ?? colors.primary,
                                            }}
                                        />
                                        <AppText variant='body' numberOfLines={1} style={{ flex: 1 }}>
                                            {item.type_name}
                                        </AppText>
                                    </Row>
                                    <FinanceValue cents={item.total} size='lg' color={colors.text} />
                                </Row>
                            ))
                        ) : (
                            <AppText color='muted'>{t("resume.noData")}</AppText>
                        )}
                    </Stack>
                </Surface>
            </Stack>

            {group && <AddItem open={open} item={fixedToSave} />}
        </Screen>
    );
};

export default Index;
