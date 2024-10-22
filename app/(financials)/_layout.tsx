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
                    title: t("headers.financialsIndex"),
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="home-outline" size={size} color={color} />
                    ),
                    headerStyle: {
                        backgroundColor: '#fff'
                    }
                }} />
            <Tabs.Screen
                name="RecordsScreen"
                options={{
                    title: t("headers.records"),
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="wallet-outline" size={size} color={color} />
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
            {/* <Tabs.Screen
                name="expense-adder"
                options={{
                    title: t('pages.expense-adder'),
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="trending-down" size={size} color={color} />
                    ),
                    headerStyle: {
                        backgroundColor: colors?.headers.financials || '#fff'
                    }
                }} /> */}
            {/* <Tabs.Screen
                name="savings"
                options={{
                    title: t('pages.savings'),
                    tabBarIcon: ({ color, size }) => (
                        <MaterialCommunityIcons name="piggy-bank-outline" size={size} color={color} />
                    ),
                    headerStyle: {
                        backgroundColor: colors?.headers.financials || '#fff'
                    }
                }} /> */}
        </StackBase>
    );
}