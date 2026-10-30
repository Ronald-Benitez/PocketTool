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
        "paidDate": "Fecha de pago"
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
