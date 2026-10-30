import type { MessageShape } from './types';

export const summariesEn = {
    "resume": {
        "incomes": "Incomes",
        "expenses": "Expenses",
        "goal": "Goal",
        "incomesDebit": "Incomes debit",
        "expensesDebit": "Expenses debit",
        "incomesCredit": "Incomes credit",
        "expensesCredit": "Expenes credit",
        "balance": "Balance",
        "credit": "Credit",
        "balanceWithout": "Balance without credit",
        "summaryByCategories": "Summary by categories",
        "summaryByPayments": "Summary by payment methods",
        "summaryByTypes": "Summary by payment types",
        "summaryByRecordType": "Summary by record type",
        "today": "Today",
        "transfers": "Tranfers",
        "recordsDetail": "Records Detail",
        "noData": "No data"
    },
    "credits": {
        "previous": "Previous",
        "current": "Current",
        "closingDate": "Closing Date",
        "paidDate": "Payment date",
        "paid": "Paid",
        "pending": "Pending",
        "previousTotal": "Previous Total",
        "currentTotal": "Current Total",
        "nextPaymentDate": "Next payment date"
    },
    "savings": {
        "select": "Select a saving",
        "add": "Add a saving",
        "edit": "Edit a saving",
        "pin": "Pin saving",
        "unpin": "Unpin saving",
        "delete": "Delete saving"
    },
    "budget": {
        "budget": "Budget",
        "current": "Current"
    }
} as const;

export const summariesEs: MessageShape<typeof summariesEn> = {
    "resume": {
        "incomes": "Ingresos",
        "expenses": "Gastos",
        "goal": "Meta",
        "incomesDebit": "Ingresos débito",
        "expensesDebit": "Gastos débito",
        "incomesCredit": "Ingresos crédito",
        "expensesCredit": "Gastos crédito",
        "balance": "Balance",
        "credit": "Credito",
        "balanceWithout": "Balance sin crédito",
        "summaryByCategories": "Resumen por categorias",
        "summaryByPayments": "Resumen por método de pago",
        "summaryByTypes": "Resumen por tipo de pago",
        "summaryByRecordType": "Resumen por tipo de registro",
        "today": "Hoy",
        "transfers": "Tranferencias",
        "recordsDetail": "Detalle de registros",
        "noData": "Sin datos"
    },
    "credits": {
        "previous": "Previo",
        "current": "Actual",
        "closingDate": "Fecha de corte",
        "paidDate": "Fecha de pago",
        "paid": "Pagado",
        "pending": "Pendiente",
        "previousTotal": "Total Anterior",
        "currentTotal": "Total Actual",
        "nextPaymentDate": "Fecha del próximo pago"
    },
    "savings": {
        "select": "Selecciona un ahorro",
        "add": "Agrega un ahorro",
        "edit": "Edita un ahorro",
        "pin": "Fijar ahorro",
        "unpin": "Quitar fijado",
        "delete": "Eliminar ahorro"
    },
    "budget": {
        "budget": "Prespuesto",
        "current": "Actual"
    }
};
