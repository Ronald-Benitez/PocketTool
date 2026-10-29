import { View, Text, ViewStyle, TextStyle } from "react-native"
import React, { SetStateAction, useEffect, useState, useTransition } from "react"

import { Group, RecordView } from "@/src/interfaces/schema"
import { formatMoney } from "@/src/utils"
import styles from "@/src/styles/styles"
import Dropdown from "../ui/dropdown"
import { SwipeAction } from '@/src/ui/actions/SwipeAction'
import AddGroup from "./add-group"
import { useRecords, useGroups } from "@/src/db"
import { useLanguage } from "@/src/lang/LanguageContext"
import { useToast } from "@/src/ui/feedback/ToastProvider"

interface GroupViewerProps {
    group: Group | null
    recordsI: RecordView[]
    setGroup: React.Dispatch<SetStateAction<Group | null>>
}

const GroupViewer = ({ group, setGroup, recordsI }: GroupViewerProps) => {
    const { t } = useLanguage()
    const [openUpdate, setOpenUpdate] = React.useState<boolean>(false)
    const [totalIncomes, setTotalIncomes] = useState(0)
    const [totalExpenses, setTotalExpenses] = useState(0)
    const groups = useGroups()
    const records = useRecords()
    const { showToast } = useToast()

    const ec = "#FF7B54"
    const ic = "#798645"
    const gc = "blue"

    useEffect(() => {
        const load = async () => {
            if (group?.id) {
                setTotalIncomes(await records.fetchTotalIncomes(group.id) as number)
                setTotalExpenses(await records.fetchTotalExpenses(group.id) as number)
            }
        }
        load()
    }, [recordsI, group])

    if (!group) return

    const color = (type: "i" | "e" | "g"): TextStyle => {
        switch (type) {
            case "i":
                return {
                    borderColor: ic,
                    borderWidth: 2,
                    borderTopWidth: 0,
                    borderBottomWidth: 0,
                    color: ic,
                }
            case "e":
                return {
                    borderColor: ec,
                    borderWidth: 2,
                    borderTopWidth: 0,
                    borderBottomWidth: 0,
                    color: ec,
                }
            case "g": {
                return {
                    borderBottomColor: gc,
                    borderBottomWidth: 2,
                    color: gc
                }
            }
        }
    }

    const balanceColor = (): TextStyle => {
        const balance = totalIncomes - totalExpenses

        if (balance < 0) return color("e")
        if (balance > 0) return color("i")
        return color("g")

    }

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

    const Block = ({ type }: { type: "i" | "e" | "g" | "b" }) => {

        const baseColors = type === "b" ? balanceColor() : color(type);
        const names = {
            "i": "incomes",
            "e": "expenses",
            "g": "goal",
            "b": "balance"
        }
        //@ts-ignore
        let value = 0
        if (type === "i") value = totalIncomes
        if (type === "e") value = totalExpenses
        if (type === "b") value = totalIncomes - totalExpenses
        if (type === "g") value = group.goal

        return (
            <>
                <View
                    style={[{ flex: 1, flexDirection: "row", justifyContent: "space-around", gap: 5, padding: 2, width: "100%" }]}
                >
                    {/* <Text style={[styles.textCenter, { paddingLeft: 5, fontWeight: 600, fontSize: 16 }]}>
                    {t(`group.${names[type]}`).substring(0,3)}
                    </Text> */}
                    <Text style={[styles.textCenter, styles.text, baseColors, { borderRadius: 8, minWidth: 200, padding: 5 }]}>
                        $ {formatMoney(Math.abs(value))}
                    </Text>
                </View>
            </>
        )
    }

    return (
        <>
            <View style={[{ marginHorizontal: 30 }]}>
                <SwipeAction
                    handleDelete={onDelete}
                    handleUpdate={onUpdate}
                >
                    <View style={[{ width: "100%", gap: 10 }]}>
                        <View style={[styles.row, { paddingHorizontal: 10, paddingBottom: 5, justifyContent: "center", gap: 10 }]}>
                            <Block type="b" />
                            {/* <Block type="g" /> */}
                        </View>
                        {/* <View style={[styles.row, { paddingHorizontal: 10, paddingTop: 5, justifyContent: "center", gap: 10 }]}>
                            <Block type="i" />
                            <Block type="e" />
                        </View> */}
                    </View>
                </SwipeAction>
            </View>
            <AddGroup
                openUpdate={openUpdate}
            />
        </>
    )

}

export default GroupViewer