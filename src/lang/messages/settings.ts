import type { MessageShape } from './types';

export const settingsEn = {
    "settings": {
        "header": "Settings",
        "search": "Search settings",
        "sections": {
            "general": "General",
            "generalDescription": "Language and general preferences",
            "records": "Summaries and records",
            "recordsDescription": "Record types used by summaries and credits",
            "closing": "Closing rules",
            "closingDescription": "Edit deadlines for closings",
            "groups": "Groups and periods",
            "groupsDescription": "Automatic creation and the period shared with closings",
            "backup": "Backup",
            "backupDescription": "Export or import the database",
            "savings": "Savings defaults",
            "savingsDescription": "Default record data and goal trophy color",
            "vehicle": "Vehicle defaults",
            "vehicleDescription": "Default categories, payments and record types",
            "colors": "Colors and theme",
            "colorsDescription": "Appearance, palettes and contrast"
        },
        "selectLanguage": "Language",
        "selectRecordType": "Resume record types",
        "selectCreditExpenseType": "Credit expenses type",
        "selectCreditPaymentType": "Credit payments type",
        "pendingPaymentDate": "Pending card payment date",
        "pendingPaymentDateToday": "Today",
        "pendingPaymentDateCard": "Card payment day inside the group period",
        "pendingPaymentDateNext": "Next card payment day",
        "pendingPaymentDateHint":
            "Date used when pending card payments appear in Records. The next payment day is calculated from today, like in Credits.",
        "pendingFixedDate": "Pending fixed transaction date",
        "pendingFixedDateGroupMonth": "Fixed day inside the group period",
        "pendingFixedDateNext": "Next occurrence from today",
        "pendingFixedDateHint":
            "Date proposed for pending fixed transactions in Records and Home.",
        "pendingFixedDedupe": "Fixed transaction payment detection",
        "pendingFixedDedupeGroup": "Only in the selected group",
        "pendingFixedDedupePeriod": "By period (group period)",
        "pendingFixedDedupeHint":
            "Choose whether a fixed is considered paid when it has a record in the group or in the same period.",
        "groupAutoCreate": "Create groups automatically",
        "groupAutoCreateHint":
            "Creates the group for the current period when the app opens, only if no group already covers today.",
        "groupPeriod": "Group and closing period",
        "groupPeriodCalendar": "Calendar month",
        "groupPeriodStartDay": "Start day of the month",
        "groupPeriodHint":
            "Defines when each group and closing period starts and ends. Existing groups keep the period they already have.",
        "groupStartDay": "Period start day",
        "groupStartDayHint":
            "Each period starts on this day and ends the day before the same day of the next month.",
        "groupPeriodExample":
            "Example: with start day 18, the October group runs from October 18 to November 17.",
        "groupCreateNow": "Create the current group now",
        "closingGraceDays": "Grace days",
        "closingGraceDaysHint":
            "Extra days after the period ends to edit the closing.",
        "closingAllowPeriodOverride": "Allow adjusting the period per closing",
        "closingAllowPeriodOverrideHint":
            "Lets you change the start, end and deadline before saving a closing.",
        "closingPeriodExample":
            "Grace days are counted from the group period end. With 5 grace days you can edit the closing until 5 days after the period ends.",
        "export": "Export database",
        "import": "Import database",
        "languages": {
            "english": "English",
            "spanish": "Español"
        }
    },
    "colors": {
        "set": "Set a color",
        "copy": "Copy color",
        "paste": "Paste color",
        "reset": "Reset colors",
        "confirmMessage": "Do you confirm to reset the colors?",
        "invalid": "Invalid color",
        "copied": "Color copied to clipboard",
        "IconsColor": "Icons color",
        "InputStroke": "Input border color",
        "BGPicker": "Background picker color",
        "ModalHeaderColor": "Modal header color",
        "ConfirmColor": "Confirm color",
        "BGSimple": "Background simple",
        "ExpenseColor": "Negative balance",
        "IncomeColor": "Positive balance",
        "TransferColor": "Transfer color",
        "GoalColor": "Goal color",
        "Credit": "Credit color",
        "Debit": "Debit color"
    },
    "theme": {
        "title": "Theme",
        "appearance": "Appearance",
        "mode": {
            "system": "System",
            "light": "Light",
            "dark": "Dark"
        },
        "palette": {
            "bright": "Bright",
            "dark": "Dark",
            "base": "Base",
            "custom": "Custom"
        },
        "paletteHint": "What you edit here is saved only for this palette.",
        "useBase": "Use base palette",
        "resetColor": "Reset color",
        "resetPalette": "Reset palette",
        "resetAll": "Reset all",
        "confirmResetPalette": "Do you want to restore the base {palette} palette? Your custom colors for this palette will be lost.",
        "confirmResetAll": "Do you want to restore both base palettes? All custom colors will be lost.",
        "colorsEdited": "Custom colors are saved automatically.",
        "preview": {
            "title": "Preview",
            "primary": "Primary action",
            "income": "Income",
            "expense": "Expense",
            "surface": "Surface",
            "text": "Sample text"
        },
        "contrast": {
            "title": "Contrast warnings",
            "ok": "All checked pairs meet WCAG AA.",
            "textBackground": "Text on background",
            "textSurface": "Text on surface",
            "mutedSurface": "Muted text on surface",
            "onPrimary": "Text on primary",
            "onDanger": "Text on danger",
            "onSuccess": "Text on success",
            "onWarning": "Text on warning",
            "onInfo": "Text on info"
        }
    },
    "db": {
        "importCancel": "Import canceled!",
        "importSuccess": "Import successful, please reload the app!",
        "noSharing": "Sharing feature is not available on this platform",
        "exportSucces": "Export completed successfully",
        "exportError": "Error exporting the database"
    }
} as const;

export const settingsEs: MessageShape<typeof settingsEn> = {
    "settings": {
        "header": "Configuraciones",
        "search": "Buscar configuración",
        "sections": {
            "general": "General",
            "generalDescription": "Idioma y preferencias generales",
            "records": "Resúmenes y registros",
            "recordsDescription": "Tipos de registro usados por resúmenes y créditos",
            "closing": "Reglas de cierre",
            "closingDescription": "Fechas límite de edición de los cierres",
            "groups": "Grupos y periodos",
            "groupsDescription": "Creación automática y periodo compartido con los cierres",
            "backup": "Respaldo",
            "backupDescription": "Exportar o importar la base de datos",
            "savings": "Datos de ahorros",
            "savingsDescription": "Datos por defecto de registros y color del trofeo",
            "vehicle": "Datos de vehículo",
            "vehicleDescription": "Categorías, pagos y tipos de registro por defecto",
            "colors": "Colores y tema",
            "colorsDescription": "Apariencia, paletas y contraste"
        },
        "selectLanguage": "Idioma",
        "selectRecordType": "Tipos de registro del resumen",
        "selectCreditExpenseType": "Tipo de gastos a crédito",
        "selectCreditPaymentType": "Tipo de pagos a crédito",
        "pendingPaymentDate": "Fecha de pagos pendientes de tarjeta",
        "pendingPaymentDateToday": "Hoy",
        "pendingPaymentDateCard": "Día de pago dentro del periodo del grupo",
        "pendingPaymentDateNext": "Próximo día de pago de la tarjeta",
        "pendingPaymentDateHint":
            "Fecha que se usa cuando aparecen pagos pendientes de tarjeta en Registros. El próximo día de pago se calcula desde hoy, como en Créditos.",
        "pendingFixedDate": "Fecha de gastos fijos pendientes",
        "pendingFixedDateGroupMonth": "Día del fijo dentro del periodo del grupo",
        "pendingFixedDateNext": "Próxima ocurrencia desde hoy",
        "pendingFixedDateHint":
            "Fecha propuesta para los gastos fijos pendientes en Registros e Inicio.",
        "pendingFixedDedupe": "Detección de gastos fijos pagados",
        "pendingFixedDedupeGroup": "Solo en el grupo seleccionado",
        "pendingFixedDedupePeriod": "Por periodo (periodo del grupo)",
        "pendingFixedDedupeHint":
            "Elige si un fijo se considera pagado cuando tiene un registro en el grupo o en el mismo periodo.",
        "groupAutoCreate": "Crear grupos automáticamente",
        "groupAutoCreateHint":
            "Crea el grupo del periodo actual al abrir la app, solo si ningún grupo cubre hoy.",
        "groupPeriod": "Periodo de grupos y cierres",
        "groupPeriodCalendar": "Mes calendario",
        "groupPeriodStartDay": "Día de inicio del mes",
        "groupPeriodHint":
            "Define cuándo empieza y termina cada grupo y cierre. Los grupos existentes conservan el periodo que ya tienen.",
        "groupStartDay": "Día de inicio del periodo",
        "groupStartDayHint":
            "Cada periodo empieza este día y termina el día anterior al mismo día del mes siguiente.",
        "groupPeriodExample":
            "Ejemplo: con día de inicio 18, el grupo de octubre va del 18 de octubre al 17 de noviembre.",
        "groupCreateNow": "Crear el grupo actual ahora",
        "closingGraceDays": "Días de gracia",
        "closingGraceDaysHint":
            "Días extra después del fin del periodo para editar el cierre.",
        "closingAllowPeriodOverride": "Permitir ajustar el periodo por cierre",
        "closingAllowPeriodOverrideHint":
            "Permite cambiar inicio, fin y fecha límite antes de guardar un cierre.",
        "closingPeriodExample":
            "Los días de gracia se cuentan desde el fin del periodo del grupo. Con 5 días de gracia puedes editar el cierre hasta 5 días después de que termine.",
        "export": "Exportar base de datos",
        "import": "Importar base de datos",
        "languages": {
            "english": "Inglés",
            "spanish": "Español"
        }
    },
    "colors": {
        "set": "Establecer un color",
        "copy": "Copiar color",
        "paste": "Pegar color",
        "reset": "Restablecer colores",
        "confirmMessage": "¿Confirmas restablecer los colores?",
        "invalid": "Color inválido",
        "copied": "Color copiado al portapapeles",
        "IconsColor": "Color de íconos",
        "InputStroke": "Color del borde de entrada",
        "BGPicker": "Color de fondo del selector",
        "ModalHeaderColor": "Color del encabezado del modal",
        "ConfirmColor": "Color de confirmación",
        "BGSimple": "Fondo simple",
        "ExpenseColor": "Balance negativo",
        "IncomeColor": "Balance positivo",
        "TransferColor": "Color de tranferencia",
        "GoalColor": "Color de objetivo",
        "Credit": "Color de crédito",
        "Debit": "Color de débito"
    },
    "theme": {
        "title": "Tema",
        "appearance": "Apariencia",
        "mode": {
            "system": "Sistema",
            "light": "Claro",
            "dark": "Oscuro"
        },
        "palette": {
            "bright": "Brillante",
            "dark": "Oscura",
            "base": "Base",
            "custom": "Personalizada"
        },
        "paletteHint": "Lo que edites aquí se guarda solo para esta paleta.",
        "useBase": "Usar paleta base",
        "resetColor": "Restablecer color",
        "resetPalette": "Restablecer paleta",
        "resetAll": "Restablecer todo",
        "confirmResetPalette": "¿Quieres restaurar la paleta base {palette}? Se perderán tus colores personalizados de esta paleta.",
        "confirmResetAll": "¿Quieres restaurar ambas paletas base? Se perderán todos los colores personalizados.",
        "colorsEdited": "Los colores personalizados se guardan automáticamente.",
        "preview": {
            "title": "Vista previa",
            "primary": "Acción principal",
            "income": "Ingreso",
            "expense": "Gasto",
            "surface": "Superficie",
            "text": "Texto de ejemplo"
        },
        "contrast": {
            "title": "Advertencias de contraste",
            "ok": "Todos los pares verificados cumplen WCAG AA.",
            "textBackground": "Texto sobre fondo",
            "textSurface": "Texto sobre superficie",
            "mutedSurface": "Texto secundario sobre superficie",
            "onPrimary": "Texto sobre primario",
            "onDanger": "Texto sobre peligro",
            "onSuccess": "Texto sobre éxito",
            "onWarning": "Texto sobre advertencia",
            "onInfo": "Texto sobre información"
        }
    },
    "db": {
        "importCancel": "¡Importación cancelada!",
        "importSuccess": "¡Importación éxitosa, por favor recarga la app!",
        "noSharing": "La función de compartir no está disponible en esta plataforma",
        "exportSucces": "Exportación completada con éxito",
        "exportError": "Error al exportar la base de datos"
    }
};
