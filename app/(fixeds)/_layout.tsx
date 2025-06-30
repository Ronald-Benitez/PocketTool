import { Tabs } from "expo-router";
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

import StackBase from "@/src/components/navigation/stack-base";
import { useLanguage } from "@/src/lang/LanguageContext";

export default function Layout() {
    const { t } = useLanguage()

    return (
        <StackBase>
            <Tabs.Screen
                name="index"
                options={{
                    title: t("headers.fixeds"),
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="repeat" size={size} color={color} />
                    ),
                    headerStyle: {
                        backgroundColor: '#fff'
                    }
                }} />
            <Tabs.Screen
                name="RecordTypeScreen"
                options={{
                    title: t("headers.financialsIndex"),
                    tabBarIcon: ({ color, size }) => (
                        <MaterialCommunityIcons name="format-list-bulleted" size={size} color={color} />
                    ),
                    headerStyle: {
                        backgroundColor: '#fff'
                    }
                }} />
            <Tabs.Screen
                name="PaymentMethodsScreen"
                options={{
                    title: t("headers.payments"),
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="cash-outline" size={size} color={color} />
                    ),
                    headerStyle: {
                        backgroundColor: '#fff'
                    }
                }} />
            <Tabs.Screen
                name="CategoriesScreen"
                options={{
                    title: t("headers.categories"),
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="options" size={size} color={color} />
                    ),
                    headerStyle: {
                        backgroundColor: '#fff'
                    }
                }} />
            <Tabs.Screen
                name="PaymentTypesScreen"
                options={{
                    title: t("headers.paymentTypes"),
                    tabBarIcon: ({ color, size }) => (
                        <MaterialCommunityIcons name="cash-multiple" size={size} color={color} />
                    ),
                    headerStyle: {
                        backgroundColor: '#fff'
                    }
                }} />
        </StackBase>
    );
}