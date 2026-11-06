import type { MessageShape } from './types';

export const catalogsEn = {
    "paymentMethods": {
        "header": "Manage Payment Methods",
        "methodName": "Name",
        "addMethod": "Add a payment method",
        "updateMethod": "Update a payment method",
        "delete": "Delete",
        "edit": "Edit",
        "closingDate": "Closing date",
        "paidDate": "Payment date",
        "error": {
            "emptyFields": "Please enter all fields."
        },
        "type": {
            "label": "Type",
            "credit": "Credit",
            "debit": "Debit"
        },
        "creditCard": "Credit card",
        "creditCardToggle": "Is this a credit card?",
        "creditLimit": "Credit limit",
        "cardBrand": "Card network",
        "cardStyle": "Card finish",
        "cardColor": "Card color",
        "cardLast4": "Last 4 digits",
        "cardHolder": "Card holder",
        "cardIssuer": "Issuer / bank",
        "limitShort": "Limit",
        "availableShort": "Avail.",
        "closingShort": "Close",
        "paymentShort": "Due",
        "visualKind": "Representation",
        "visual": {
            "credit_card": "Credit card",
            "debit_card": "Debit card",
            "cash": "Cash",
            "piggy_bank": "Piggy bank",
            "transfer": "Bank transfer",
            "wallet": "Wallet",
            "gift_card": "Gift card",
            "other": "Other"
        },
        "brands": {
            "visa": "Visa",
            "mastercard": "Mastercard",
            "amex": "American Express",
            "discover": "Discover",
            "diners": "Diners Club",
            "jcb": "JCB",
            "unionpay": "UnionPay",
            "other": "Other"
        },
        "styles": {
            "matte": "Matte",
            "metallic": "Metallic",
            "gradient": "Gradient",
            "transparent": "Transparent"
        }
    },
    "categories": {
        "header": "Manage Categories",
        "categoryName": "Name",
        "addCategory": "Add Category",
        "updateCategory": "Update Category",
        "delete": "Delete",
        "edit": "Edit",
        "error": {
            "emptyFields": "Please enter all fields."
        }
    },
    "recordTypes": {
        "name": "Name",
        "effect": "Effect",
        "color": "Color"
    },
    "paymentTypes": {
        "name": "Name",
        "color": "Color"
    },
    "pickers": {
        "month": "Select month"
    }
} as const;

export const catalogsEs: MessageShape<typeof catalogsEn> = {
    "paymentMethods": {
        "header": "Administrar Métodos de Pago",
        "methodName": "Nombre",
        "addMethod": "Agregar Método de Pago",
        "updateMethod": "Actualizar Método de Pago",
        "delete": "Eliminar",
        "edit": "Editar",
        "closingDate": "Día de corte",
        "error": {
            "emptyFields": "Por favor, completa todos los campos."
        },
        "type": {
            "label": "Tipo",
            "credit": "Crédito",
            "debit": "Débito"
        },
        "paidDate": "Fecha de pago",
        "creditCard": "Tarjeta de crédito",
        "creditCardToggle": "¿Es tarjeta de crédito?",
        "creditLimit": "Límite de crédito",
        "cardBrand": "Red de la tarjeta",
        "cardStyle": "Acabado",
        "cardColor": "Color de la tarjeta",
        "cardLast4": "Últimos 4 dígitos",
        "cardHolder": "Titular",
        "cardIssuer": "Emisor / banco",
        "limitShort": "Límite",
        "availableShort": "Disp.",
        "closingShort": "Corte",
        "paymentShort": "Pago",
        "visualKind": "Representación",
        "visual": {
            "credit_card": "Tarjeta de crédito",
            "debit_card": "Tarjeta de débito",
            "cash": "Efectivo",
            "piggy_bank": "Cerdito de ahorros",
            "transfer": "Transferencia",
            "wallet": "Billetera",
            "gift_card": "Tarjeta de regalo",
            "other": "Otro"
        },
        "brands": {
            "visa": "Visa",
            "mastercard": "Mastercard",
            "amex": "American Express",
            "discover": "Discover",
            "diners": "Diners Club",
            "jcb": "JCB",
            "unionpay": "UnionPay",
            "other": "Otra"
        },
        "styles": {
            "matte": "Mate",
            "metallic": "Metálico",
            "gradient": "Degradado",
            "transparent": "Transparente"
        }
    },
    "categories": {
        "header": "Administrar Categorías",
        "categoryName": "Nombre",
        "addCategory": "Agregar Categoría",
        "updateCategory": "Actualizar Categoría",
        "delete": "Eliminar",
        "edit": "Editar",
        "error": {
            "emptyFields": "Por favor, completa todos los campos."
        }
    },
    "recordTypes": {
        "name": "Nombre",
        "effect": "Efecto",
        "color": "Color"
    },
    "paymentTypes": {
        "name": "Nombre",
        "color": "Color"
    },
    "pickers": {
        "month": "Selecciona un mes"
    }
};
