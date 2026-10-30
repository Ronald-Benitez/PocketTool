import type { MessageShape } from './types';

export const recordsEn = {
    "records": {
        "header": "Manage Records",
        "amount": "Amount",
        "date": "Date (YYYY-MM-DD)",
        "selectGroup": "Select Group:",
        "selectCategory": "Select Category:",
        "selectPaymentMethod": "Select Payment Method:",
        "addRecord": "Add Record",
        "updateRecord": "Update Record",
        "delete": "Delete",
        "edit": "Edit",
        "creditPayments": "List of pending credit payments",
        "fixeds": "List of pending fixed transactions",
        "all": "All",
        "records": "Records",
        "error": {
            "emptyFields": "Please enter all fields and select the necessary options."
        }
    },
    "item": {
        "name": "Name",
        "value": "Amount",
        "date": "Date",
        "type": "Type",
        "error": "You must complete all fields",
        "cancel": "Cancel",
        "save": "Save",
        "add": "Add item",
        "edit": "Edit item",
        "added": "Added item",
        "edited": "Edited item",
        "deleted": "Deleted item",
        "income": "Income",
        "expense": "Expense",
        "transfer": "Transfer",
        "payment": "Payment Method",
        "toPay": "Payment method (card) to pay",
        "category": "Category",
        "selectCategory": "Select a category",
        "selectPayment": "Select a payment method",
        "selectToPay": "Select the payment method to pay",
        "dayHint": "Day of month (1-31)"
    },
    "totals": {
        "incomeCredit": "Total Income (Credit)",
        "incomeDebit": "Total Income (Debit)",
        "expenseCredit": "Total Expenses (Credit)",
        "expenseDebit": "Total Expenses (Debit)",
        "income": "Total income",
        "expense": "Total expense",
        "balance": "Balance",
        "byCategory": "Total by Category",
        "noData": "No data available",
        "byPaymentMethod": "Total by Payment Method",
        "balanceNet": "Balance without credit"
    },
    "credit": "Credit",
    "debit": "Debit"
} as const;

export const recordsEs: MessageShape<typeof recordsEn> = {
    "records": {
        "header": "Gestionar Registros",
        "amount": "Monto",
        "date": "Fecha (YYYY-MM-DD)",
        "selectGroup": "Seleccionar Grupo:",
        "selectCategory": "Seleccionar Categoría:",
        "selectPaymentMethod": "Seleccionar Método de Pago:",
        "addRecord": "Añadir Registro",
        "updateRecord": "Actualizar Registro",
        "delete": "Eliminar",
        "edit": "Editar",
        "creditPayments": "Lista de pagos a crédito pendientes",
        "fixeds": "Lista de transacciones fijas pendientes",
        "all": "Todos",
        "records": "Registros",
        "error": {
            "emptyFields": "Por favor, ingresa todos los campos y selecciona las opciones necesarias."
        }
    },
    "item": {
        "name": "Nombre",
        "value": "Monto",
        "date": "Fecha",
        "type": "Tipo",
        "error": "Debes rellenar todos los campos",
        "cancel": "Cancelar",
        "save": "Guardar",
        "add": "Crear item",
        "edit": "Editar item",
        "added": "Item creado",
        "edited": "Item editado",
        "deleted": "Item eliminado",
        "income": "Ingreso",
        "expense": "Gasto",
        "transfer": "Transferencia",
        "payment": "Método de pago",
        "toPay": "Método de pago (tarjeta) a pagar",
        "category": "Categoria",
        "selectCategory": "Seleccione una categoria",
        "selectPayment": "Seleccione un método de pago",
        "selectToPay": "Seleccione el método de pago a pagar",
        "dayHint": "Día del mes (1-31)"
    },
    "totals": {
        "incomeCredit": "Total de Ingresos (Crédito)",
        "incomeDebit": "Total de Ingresos (Débito)",
        "income": "Total de Ingresos",
        "expense": "Total de Gastos",
        "balance": "Balance",
        "expenseCredit": "Total de Gastos (Crédito)",
        "expenseDebit": "Total de Gastos (Débito)",
        "byCategory": "Total por Categoría",
        "noData": "Sin datos disponibles",
        "byPaymentMethod": "Total por método de pago",
        "balanceNet": "Balance sin crédito"
    },
    "credit": "Crédito",
    "debit": "Débito"
};
