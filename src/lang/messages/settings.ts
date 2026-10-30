import type { MessageShape } from './types';

export const settingsEn = {
    "settings": {
        "header": "Settings",
        "selectLanguage": "Language",
        "selectRecordType": "Resume record types",
        "selectCreditExpenseType": "Credit expenses type",
        "selectCreditPaymentType": "Credit payments type",
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
        "selectLanguage": "Idioma",
        "selectRecordType": "Tipos de registro del resumen",
        "selectCreditExpenseType": "Tipo de gastos a crédito",
        "selectCreditPaymentType": "Tipo de pagos a crédito",
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
