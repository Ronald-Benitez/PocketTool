import { Tabs } from "expo-router";
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

import StackBase from "@/src/components/navigation/stack-base";
import { useFeatures } from "@/src/features";
import { useLanguage } from "@/src/lang/LanguageContext";

export default function Layout() {
    const { t } = useLanguage()
    const enabled = useFeatures((state) => state.enabled)

    return (
        <StackBase>
            <Tabs.Screen
                name="index"
                options={{
                    title: t("headers.fixeds"),
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="repeat" size={size} color={color as string | undefined} />
                    )
                }} />
            <Tabs.Screen
                name="FinancingsScreen"
                options={{
                    title: t("headers.financings"),
                    href: enabled.financings ? undefined : null,
                    tabBarIcon: ({ color, size }) => (
                        <MaterialCommunityIcons name="bank-outline" size={size} color={color as string | undefined} />
                    )
                }} />
            <Tabs.Screen
                name="RecordTypeScreen"
                options={{
                    title: t("headers.byRecordType"),
                    tabBarIcon: ({ color, size }) => (
                        <MaterialCommunityIcons name="format-list-bulleted" size={size} color={color as string | undefined} />
                    )
                }} />
            <Tabs.Screen
                name="PaymentMethodsScreen"
                options={{
                    title: t("headers.byPaymentMethod"),
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="cash-outline" size={size} color={color as string | undefined} />
                    )
                }} />
            <Tabs.Screen
                name="CategoriesScreen"
                options={{
                    title: t("headers.byCategory"),
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="options" size={size} color={color as string | undefined} />
                    )
                }} />
            <Tabs.Screen
                name="PaymentTypesScreen"
                options={{
                    title: t("headers.byPaymentType"),
                    tabBarIcon: ({ color, size }) => (
                        <MaterialCommunityIcons name="cash-multiple" size={size} color={color as string | undefined} />
                    )
                }} />
        </StackBase>
    );
}