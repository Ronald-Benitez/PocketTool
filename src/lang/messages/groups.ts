import type { MessageShape } from './types';

export const groupsEn = {
    "group": {
        "name": "Name",
        "expenses": "Expenses",
        "incomes": "Incomes",
        "goal": "Goal",
        "balance": "Balance",
        "year": "Year",
        "month": "Month",
        "cancel": "Cancel",
        "save": "Save",
        "add": "Create group",
        "edit": "Edit group",
        "error": "You must complete all fields",
        "select-group": "Select group",
        "added": "Added group",
        "edited": "Edited group",
        "deleted": "Deleted group",
        "autoCreated": "Group {name} was created automatically",
        "createdNow": "Group {name} was created",
        "currentExists": "The current period already has a group",
        "periodPreview": "Period: {range}",
        "periodChangeWarning": "Changing the period does not move existing records. Review this group's records after saving."
    }
} as const;

export const groupsEs: MessageShape<typeof groupsEn> = {
    "group": {
        "name": "Nombre",
        "expenses": "Gastos",
        "incomes": "Ingresos",
        "goal": "Objetivo",
        "balance": "Balance",
        "year": "Año",
        "month": "Mes",
        "cancel": "Cancelar",
        "save": "Guardar",
        "add": "Crear grupo",
        "edit": "Editar grupo",
        "error": "Debes rellenar todos los campos",
        "select-group": "Selecciona un grupo",
        "added": "Grupo agregado",
        "edited": "Grupo editado",
        "deleted": "Grupo eliminado",
        "autoCreated": "El grupo {name} se creó automáticamente",
        "createdNow": "El grupo {name} se creó",
        "currentExists": "El periodo actual ya tiene un grupo",
        "periodPreview": "Periodo: {range}",
        "periodChangeWarning": "Cambiar el periodo no mueve los registros existentes. Revisa los registros de este grupo al guardar."
    }
};
