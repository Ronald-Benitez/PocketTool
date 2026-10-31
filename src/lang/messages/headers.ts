import type { MessageShape } from './types';

export const headersEn = {
    "headers": {
        "financialsIndex": "Summary",
        "records": "Records",
        "paymentTypes": "Payment Types",
        "recordTypes": "Record Types",
        "categories": "Categories",
        "payments": "Payment Methods",
        "savings": "Savings",
        "budget": "Budgets",
        "home": "Home",
        "financials": "Financials",
        "settings": "Settings",
        "credits": "Credits",
        "help": "Help",
        "vehicle": "Vehicle",
        "fixeds": "Fixed transactions"
    }
} as const;

export const headersEs: MessageShape<typeof headersEn> = {
    "headers": {
        "financialsIndex": "Resumen",
        "records": "Registros",
        "paymentTypes": "Métodos de pago",
        "recordTypes": "Tipos de registro",
        "categories": "Categorías",
        "payments": "Métodos de pago",
        "savings": "Ahorros",
        "budget": "Presupuestos",
        "home": "Inicio",
        "financials": "Finanzas",
        "settings": "Configuraciones",
        "credits": "Créditos",
        "help": "Ayuda",
        "vehicle": "Vehículo",
        "fixeds": "Transacciones fijas"
    }
};
