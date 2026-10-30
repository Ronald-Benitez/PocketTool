import type { MessageShape } from './types';

export const commonEn = {
    "confirm": "Accept",
    "cancel": "Cancel",
    "close": "Close",
    "confirmDelete": "Are you sure you want to delete this?",
    "delete": "Delete",
    "edit": {
        "group": "Edit group",
        "paymentType": "Edit payment type",
        "category": "Edit category",
        "recordType": "Edit record type",
        "paymentMethod": "Edit payment method",
        "record": "Edit record",
        "savings": "Edit savings",
        "budget": "Edit budget"
    },
    "add": {
        "group": "Add group",
        "paymentType": "Add payment type",
        "paymentMethod": "Add payment method",
        "category": "Add category",
        "recordType": "Add record type",
        "record": "Add record",
        "savings": "Add savings",
        "budget": "Add budget"
    },
    "year-error": "Invalid year",
    "toast": {
        "empty": "Please fill in all the inputs.",
        "added": "Successfully added!",
        "edited": "Changes saved!",
        "deleted": "Successfully removed!",
        "error": "The action could not be completed"
    },
    "vehicle": "Vehicle",
    "year": "Year"
} as const;

export const commonEs: MessageShape<typeof commonEn> = {
    "confirm": "Aceptar",
    "cancel": "Cancelar",
    "close": "Cerrar",
    "confirmDelete": "¿Estás seguro de que quieres eliminar esto?",
    "delete": "Eliminar",
    "edit": {
        "group": "Editar grupo",
        "paymentType": "Editar tipo de pago",
        "category": "Editar categoría",
        "recordType": "Editar tipo de registro",
        "paymentMethod": "Editar método de pago",
        "record": "Editar registro",
        "savings": "Editar ahorro",
        "budget": "Editar presupuesto"
    },
    "add": {
        "group": "Agregar grupo",
        "paymentType": "Agregar tipo de pago",
        "paymentMethod": "Agregar método de pago",
        "category": "Agregar categoría",
        "recordType": "Agregar tipo de registro",
        "record": "Agregar registro",
        "savings": "Agregar ahorro",
        "budget": "Agregar presupuesto"
    },
    "year-error": "Año no válido",
    "toast": {
        "empty": "Por favor, completa todos los campos.",
        "added": "¡Agregado con éxito!",
        "edited": "¡Cambios guardados!",
        "deleted": "¡Eliminado con éxito!",
        "error": "No se pudo completar la acción"
    },
    "vehicle": "Vehículo",
    "year": "Año"
};
