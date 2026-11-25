import type { MessageShape } from './types';

export const headersEn = {
    "headers": {
        "financialsIndex": "Summary",
        "records": "Records",
        "paymentTypes": "Payment Types",
        "recordTypes": "Record Types",
        "categories": "Categories",
        "byCategory": "By category",
        "byPaymentMethod": "By payment method",
        "byPaymentType": "By payment type",
        "byRecordType": "By record type",
        "payments": "Payment Methods",
        "savings": "Savings",
        "budget": "Budgets",
        "home": "Home",
        "financials": "Financials",
        "settings": "Settings",
        "credits": "Credits",
        "closing": "Closing",
        "help": "Help",
        "vehicle": "Vehicle",
        "shopping": "Shopping",
        "fixeds": "Fixed transactions",
        "commitments": "Commitments",
        "people": "People",
        "financings": "Financings"
    }
} as const;

export const headersEs: MessageShape<typeof headersEn> = {
    "headers": {
        "financialsIndex": "Resumen",
        "records": "Registros",
        "paymentTypes": "Tipos de pago",
        "recordTypes": "Tipos de registro",
        "categories": "Categorías",
        "byCategory": "Por categoría",
        "byPaymentMethod": "Por método de pago",
        "byPaymentType": "Por tipo de pago",
        "byRecordType": "Por tipo de registro",
        "payments": "Métodos de pago",
        "savings": "Ahorros",
        "budget": "Presupuestos",
        "home": "Inicio",
        "financials": "Finanzas",
        "settings": "Configuraciones",
        "credits": "Créditos",
        "closing": "Cierre",
        "help": "Ayuda",
        "vehicle": "Vehículo",
        "shopping": "Compras",
        "fixeds": "Transacciones fijas",
        "commitments": "Compromisos",
        "people": "Personas",
        "financings": "Financiamientos"
    }
};
