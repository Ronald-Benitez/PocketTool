import type { MessageShape } from './types';

export const homeEn = {
    "index": {
        "fixedsMessage": "Remember to confirm your fixed transactions",
        "obligations": "Due today"
    },
    "greeting": {
        "morning": "Good morning!",
        "afternoon": "Good afternoon!",
        "night": "Good night!"
    },
    "dashboard": {
        "title": "Your dashboard",
        "customize": "Customize",
        "done": "Done",
        "reset": "Reset",
        "resetConfirm": "Restore the default dashboard?",
        "hidden": "Hidden blocks",
        "visible": "Visible blocks",
        "empty": "All blocks are hidden.",
        "emptyAction": "Restore default dashboard",
        "quickActions": "Quick actions",
        "quickActionsHint": "Choose up to four actions for the capture button.",
        "dragHint": "Drag to reorder",
        "moveUp": "Move up",
        "moveDown": "Move down",
        "hide": "Hide block",
        "show": "Show block",
        "saveError": "The dashboard could not be saved.",
        "disabledModule": "Module disabled",
        "openSettings": "Open experience settings",
        "seeAll": "See all",
        "noPending": "Nothing pending right now.",
        "noPlan": "No budget for this group yet.",
        "noPeople": "No shared balances yet.",
        "noRecords": "No records in this group yet.",
        "noCredits": "No credit cards yet.",
        "noVehicle": "No upcoming reminders.",
        "nextReminder": "Next reminder",
        "chooseSavings": "Choose savings",
        "chooseSavingsHint": "Only the selected savings count toward this total.",
        "selectAllSavings": "Select all",
        "noSelectedSavings": "No savings selected.",
        "blocks": {
            "summary": {
                "label": "Balance",
                "description": "Consumption, cash and goal progress."
            },
            "obligations": {
                "label": "Pending",
                "description": "Due and upcoming commitments, cards and reminders."
            },
            "budget": {
                "label": "Budget",
                "description": "Planned versus actual and expected balance."
            },
            "savings": {
                "label": "Savings",
                "description": "Total saved and goal progress."
            },
            "people": {
                "label": "People",
                "description": "Who owes you and whom you owe."
            },
            "recentRecords": {
                "label": "Recent records",
                "description": "The latest movements in this group."
            },
            "credits": {
                "label": "Credits",
                "description": "Card usage and next payment."
            },
            "vehicle": {
                "label": "Vehicle",
                "description": "Next reminder and recent cost."
            },
            "closing": {
                "label": "Closing",
                "description": "Period status and closing balance."
            }
        },
        "actions": {
            "record": {
                "label": "Add record",
                "description": "Create an income or expense."
            },
            "fixed": {
                "label": "Add fixed",
                "description": "Create a recurring commitment."
            },
            "saving": {
                "label": "Add saving",
                "description": "Create a savings goal."
            },
            "group": {
                "label": "Add group",
                "description": "Start a new monthly group."
            }
        }
    }
} as const;

export const homeEs: MessageShape<typeof homeEn> = {
    "index": {
        "fixedsMessage": "Recuerda confirmar tus transacciones fijas",
        "obligations": "Pendientes de hoy"
    },
    "greeting": {
        "morning": "¡Buenos días!",
        "afternoon": "¡Buenas tardes!",
        "night": "¡Buenas noches!"
    },
    "dashboard": {
        "title": "Tu panel",
        "customize": "Personalizar",
        "done": "Listo",
        "reset": "Restablecer",
        "resetConfirm": "¿Restaurar el panel predeterminado?",
        "hidden": "Bloques ocultos",
        "visible": "Bloques visibles",
        "empty": "Todos los bloques están ocultos.",
        "emptyAction": "Restaurar panel predeterminado",
        "quickActions": "Acciones rápidas",
        "quickActionsHint": "Elige hasta cuatro acciones para el botón de captura.",
        "dragHint": "Arrastra para reordenar",
        "moveUp": "Mover arriba",
        "moveDown": "Mover abajo",
        "hide": "Ocultar bloque",
        "show": "Mostrar bloque",
        "saveError": "No se pudo guardar el panel.",
        "disabledModule": "Módulo desactivado",
        "openSettings": "Abrir ajustes de experiencia",
        "seeAll": "Ver todo",
        "noPending": "No hay nada pendiente ahora.",
        "noPlan": "Aún no hay presupuesto para este grupo.",
        "noPeople": "Aún no hay saldos compartidos.",
        "noRecords": "Aún no hay registros en este grupo.",
        "noCredits": "Aún no hay tarjetas de crédito.",
        "noVehicle": "No hay recordatorios próximos.",
        "nextReminder": "Próximo recordatorio",
        "chooseSavings": "Elegir ahorros",
        "chooseSavingsHint": "Solo los ahorros seleccionados cuentan para este total.",
        "selectAllSavings": "Seleccionar todos",
        "noSelectedSavings": "No hay ahorros seleccionados.",
        "blocks": {
            "summary": {
                "label": "Saldo",
                "description": "Consumo, caja y progreso de la meta."
            },
            "obligations": {
                "label": "Pendientes",
                "description": "Compromisos, tarjetas y recordatorios próximos."
            },
            "budget": {
                "label": "Presupuesto",
                "description": "Plan versus real y saldo esperado."
            },
            "savings": {
                "label": "Ahorros",
                "description": "Total ahorrado y progreso de metas."
            },
            "people": {
                "label": "Personas",
                "description": "Quién te debe y a quién le debes."
            },
            "recentRecords": {
                "label": "Últimos movimientos",
                "description": "Los movimientos más recientes del grupo."
            },
            "credits": {
                "label": "Créditos",
                "description": "Uso de tarjetas y próximo pago."
            },
            "vehicle": {
                "label": "Vehículo",
                "description": "Próximo recordatorio y costo reciente."
            },
            "closing": {
                "label": "Cierre",
                "description": "Estado del periodo y saldo de cierre."
            }
        },
        "actions": {
            "record": {
                "label": "Agregar registro",
                "description": "Crea un ingreso o gasto."
            },
            "fixed": {
                "label": "Agregar fijo",
                "description": "Crea un compromiso recurrente."
            },
            "saving": {
                "label": "Agregar ahorro",
                "description": "Crea una meta de ahorro."
            },
            "group": {
                "label": "Agregar grupo",
                "description": "Inicia un nuevo grupo mensual."
            }
        }
    }
};
