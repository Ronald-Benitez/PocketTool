import { View, Text, Pressable } from 'react-native'
import React from 'react'
import { Feather } from "@expo/vector-icons";

import styles from '@/src/styles/styles'

interface DropdownProps {
    children: React.ReactNode
    title?: string
    col?: boolean
    defaulActive?: boolean
}

const Dropdown: React.FC<DropdownProps> = ({ children, title, col, defaulActive }) => {
    const [active, setActive] = React.useState(defaulActive)

    return (
        <View style={styles.dropdowmContainer}>
            <Pressable style={[styles.col, { alignItems: "center", gap: 0 }]} onPress={() => setActive(!active)}>
                {title && <Text style={active ? styles.title : styles.text}>{title}</Text>}
                <Feather name={active ? "chevron-up" : "chevron-down"} size={30} color="black" />
            </Pressable>
            {active && <View style={col ? styles.col : styles.row}>
                {children}
            </View>}
        </View>
    )
}

export default Dropdown