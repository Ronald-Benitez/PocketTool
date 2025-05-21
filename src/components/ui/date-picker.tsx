import { View, Text, TouchableOpacity, StyleSheet, Pressable, TextInput } from 'react-native'
import React, { useState, useEffect } from 'react'
import { Ionicons } from '@expo/vector-icons'

import { useLanguage } from '@/src/lang/LanguageContext'
import useBaseModal from './base-modal'
import styles from '@/src/styles/styles'
import useDate from '@/src/hooks/useDate'

interface DatePickerProps {
    value: number
    onChange: React.Dispatch<React.SetStateAction<number>>
    buttonText: string
    extras?: boolean
}

const DatePicker: React.FC<DatePickerProps> = ({ value = new Date().toISOString(), buttonText, extras, onChange }) => {
    const { t } = useLanguage()
    const { CustomModal, hideModal } = useBaseModal(true)
    const [monthsRendered, setMonthsRendered] = useState<boolean>(false)
    const [yearsRendered, setYearsRendered] = useState<boolean>(false)
    const dateH = useDate()
    const newDate = dateH.verify(value)


    const handleChangeMonth = (val: number) => {
        const date = newDate.setMonth(val)
        onChange(new Date(date).getTime())
        setMonthsRendered(false)
        setYearsRendered(false)
    }

    const handleNavigateMonths = (val: number) => {
        const month = newDate.getMonth() + val
        handleChangeMonth(month)
    }
    const handleChangeYear = (val: number) => {
        const date = newDate.setFullYear(val)
        onChange(new Date(date).getTime())
        setMonthsRendered(false)
        setYearsRendered(false)
    }

    const handleDayChange = (val: number) => {
        const date = newDate.setDate(val)
        onChange(new Date(date).getTime())
        setMonthsRendered(false)
        setYearsRendered(false)
    }

    const RenderMonths = () => {
        const months = []
        const month = newDate.getMonth()
        for (let i = 0; i < 12; i++) {
            months.push(
                <TouchableOpacity
                    key={i}
                    onPress={() => handleChangeMonth(i)}
                    style={[styles.button, i === month && { backgroundColor: "black" }, { minWidth: "40%" }]}
                >
                    <Text style={[styles.middleText, i === month && { color: "#ffffff" }]}>{t('months.' + String(i))}</Text>
                </TouchableOpacity >
            )
        }
        return months
    }

    const RenderYears = () => {
        const years = []
        const year = newDate.getFullYear()
        for (let i = year - 5; i < year + 5; i++) {
            years.push(
                <TouchableOpacity
                    key={i}
                    onPress={() => handleChangeYear(i)}
                    style={[styles.button, i === year && { backgroundColor: "black" }, { minWidth: "40%" }]}
                >
                    <Text style={[styles.middleText, i === year && { color: "#ffffff" }]}>{String(i)}</Text>
                </TouchableOpacity >
            )
        }
        return years
    }

    const RenderDays = () => {
        const days = []
        const firstDay = dateH.firtsDayOfMonth(value)
        const lastDay = dateH.lastDayOfMonth(value)
        const day = newDate.getDate()
        for (let i = 0; i < firstDay; i++) {
            days.push(
                <View key={i + "void"} style={styles2.dayCellVoid} />
            )
        }

        for (let i = 1; i <= lastDay; i++) {
            days.push(
                <TouchableOpacity
                    key={i}
                    onPress={() => handleDayChange(i)}
                    style={[styles2.dayCell, i === day && { backgroundColor: "#000" }]}
                >
                    <Text style={[styles.middleText, i === day && { color: "#fff" }]}>{i}</Text>
                </TouchableOpacity >
            )
        }

        return days
    }


    const RenderDaysHeader = () => {
        const daysHeader = []
        for (let i = 0; i < 7; i++) {
            daysHeader.push(
                <Text style={styles2.dayText} key={i}>{t('daysShort.' + String(i))}</Text>
            )
        }
        return daysHeader
    }

    const ConditionalRendering = () => {
        if (monthsRendered) {
            return (
                <View style={[styles2.calendarGrid, { justifyContent: "space-around" }]}>
                    <RenderMonths />
                </View>
            )
        } else if (yearsRendered) {
            return (
                <View style={[styles2.calendarGrid, { justifyContent: "space-around" }]}>
                    <RenderYears />
                </View>
            )
        } else {
            return (
                <View style={{ width: "100%", gap: 10, marginTop: 10 }}>
                    <View style={styles2.calendarGrid}>
                        <RenderDaysHeader />
                    </View>
                    <View style={styles2.calendarGrid}>
                        <RenderDays />
                    </View>
                </View>
            )
        }
    }

    enum RenderOptions {
        "months" = "months",
        "days" = "days",
        "years" = "years"
    }


    const handleSetRender = (option: RenderOptions, value: boolean) => {
        switch (option) {
            case RenderOptions.months:
                setMonthsRendered(value)
                setYearsRendered(false)
                break
            case RenderOptions.days:
                setMonthsRendered(false)
                setYearsRendered(false)
                break
            case RenderOptions.years:
                setMonthsRendered(false)
                setYearsRendered(value)
                break
        }
    }

    const onTodayPress = () => {
        const newDate = new Date().getTime()
        onChange(newDate)
    }

    const handleArrowPress = (value: number) => {
        const newDay = newDate.getDate() + value
        handleDayChange(newDay)
    }



    return (
        <View style={[styles.row, !extras && { justifyContent: "center" }]}>
            {
                extras &&
                <Pressable
                    onPress={() => handleArrowPress(-1)}
                >
                    <Ionicons name="chevron-back" size={24} color="black" />
                </Pressable>
            }
            <CustomModal
                button={<Text style={[styles.middleText]}>{buttonText}</Text>}
            >
                <View style={[styles.row, { justifyContent: "space-between" }]}>
                    <TouchableOpacity onPress={() => handleNavigateMonths(-1)} style={styles.button}>
                        <Ionicons name="caret-back" size={24} color={"black"} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleSetRender(RenderOptions.months, !monthsRendered)} style={styles.button}>
                        <Text style={styles.text}>
                            {t('months.' + String(newDate.getMonth()))}
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleSetRender(RenderOptions.years, !yearsRendered)} style={styles.button}>
                        <Text style={styles.text}>
                            {" " + newDate.getFullYear() + " "}
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleNavigateMonths(1)} style={styles.button}>
                        <Ionicons name="caret-forward" size={24} color={"black"} />
                    </TouchableOpacity>
                </View>
                <ConditionalRendering />
                <View style={styles.row}>
                    <TouchableOpacity onPress={hideModal} style={styles.button}><Text style={styles.text}>
                        {t("datePicker.cancel")}
                    </Text></TouchableOpacity>
                    <TouchableOpacity onPress={onTodayPress} style={styles.enfasizedButton}><Text style={styles.enfasizedText}>
                        {t("datePicker.today")}
                    </Text></TouchableOpacity>
                </View>
            </CustomModal>
            {
                extras &&
                <Pressable
                    onPress={() => handleArrowPress(1)}
                >
                    <Ionicons name="chevron-forward" size={24} color="black" />
                </Pressable>
            }

        </View>
    )
}

const styles2 = StyleSheet.create({
    calendarGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        width: '100%',
        gap: 5,
    },
    dayCell: {
        minWidth: 40,
        minHeight: 40,
        maxHeight: 40,
        maxWidth: 40,
        elevation: 5,
        backgroundColor: 'white',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 5,
        flexDirection: 'row',
        overflow: 'hidden',
    },
    dayCellVoid: {
        minWidth: 40,
        minHeight: 40,
    },
    dayText: {
        textAlign: 'center',
        minWidth: 40,
    },
    // Add other styles as needed
})

export default DatePicker
