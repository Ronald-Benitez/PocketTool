import type { MessageShape } from './types';

export const featuresEn = {
    features: {
        sectionTitle: 'Experience',
        sectionDescription:
            'Choose how much of PocketTool you want to see. You can change it anytime.',
        presets: {
            title: 'Level',
            essential: {
                label: 'Essential',
                description:
                    'Records, summaries and settings. The simplest way to start.',
            },
            balanced: {
                label: 'Balanced',
                description: 'Adds commitments, budget and credits.',
            },
            complete: {
                label: 'Complete',
                description:
                    'Every module, including savings, vehicle, people and closing.',
            },
            custom: {
                label: 'Custom',
                description: 'Your own selection of modules.',
            },
        },
        modules: {
            title: 'Modules',
            groups: {
                modules: 'Day to day',
                advanced: 'Advanced options',
                capture: 'Capture',
            },
            summaries: {
                label: 'Summaries',
                description: 'Breakdown by category, payment method and type.',
            },
            fixeds: {
                label: 'Commitments',
                description: 'Recurring fixed transactions and pending payments.',
            },
            financings: {
                label: 'Financings',
                description: 'Installments, loans and payment schedules.',
            },
            credits: {
                label: 'Credits',
                description: 'Credit cards and pending card payments.',
            },
            budget: {
                label: 'Budgets',
                description: 'Monthly plans, templates and projections.',
            },
            charts: {
                label: 'Charts',
                description: 'Charts and their preferences inside each module.',
            },
            filters: {
                label: 'Filters and columns',
                description: 'Advanced filters, columns and saved order in Records.',
            },
            savings: {
                label: 'Savings',
                description: 'Savings accounts, goals and movements.',
            },
            vehicle: {
                label: 'Vehicle',
                description: 'Fuel, maintenance, reminders and vehicle expenses.',
            },
            closing: {
                label: 'Closing',
                description: 'Informational period closing and coverage.',
            },
            people: {
                label: 'People',
                description: 'People, shared balances and settlements.',
            },
            shared: {
                label: 'Shared purchases',
                description: 'Participants, payer and shared amounts.',
            },
            advancedCatalogs: {
                label: 'Advanced catalogs',
                description: 'Payment types and record types management.',
            },
            quickAdd: {
                label: 'Quick add',
                description: 'A shorter form with only the essential fields.',
                more: 'More options',
                less: 'Fewer options',
            },
            smartDefaults: {
                label: 'Remember last values',
                description:
                    'Prefill the last type, category and payment method.',
            },
        },
        dataSafe: 'Hiding a module never deletes your data.',
        dependencies: {
            enabled:
                '“{feature}” was enabled because it depends on “{dependency}”.',
            disabled:
                '“{feature}” was hidden because “{dependency}” is off.',
        },
        reset: 'Restore complete experience',
        resetConfirmTitle: 'Restore complete experience?',
        resetConfirmMessage:
            'All modules will be visible again. Your data stays the same.',
        onboarding: {
            title: 'Make PocketTool yours',
            body: 'Choose how much you want to see. You can change it anytime in Settings. Your data is never deleted.',
            start: 'Start',
            later: 'Not now',
        },
        disabled: {
            redirected:
                'That section is hidden. You can enable it in Settings → Experience.',
        },
    },
} as const;

export const featuresEs: MessageShape<typeof featuresEn> = {
    features: {
        sectionTitle: 'Experiencia',
        sectionDescription:
            'Elige cuánto de PocketTool quieres ver. Puedes cambiarlo cuando quieras.',
        presets: {
            title: 'Nivel',
            essential: {
                label: 'Esencial',
                description:
                    'Registros, resúmenes y ajustes. La forma más simple de empezar.',
            },
            balanced: {
                label: 'Equilibrado',
                description: 'Añade compromisos, presupuestos y créditos.',
            },
            complete: {
                label: 'Completo',
                description:
                    'Todos los módulos, incluidos ahorros, vehículo, personas y cierre.',
            },
            custom: {
                label: 'Personalizado',
                description: 'Tu propia selección de módulos.',
            },
        },
        modules: {
            title: 'Módulos',
            groups: {
                modules: 'Día a día',
                advanced: 'Opciones avanzadas',
                capture: 'Captura',
            },
            summaries: {
                label: 'Resúmenes',
                description: 'Desglose por categoría, método de pago y tipo.',
            },
            fixeds: {
                label: 'Compromisos',
                description:
                    'Transacciones fijas recurrentes y pagos pendientes.',
            },
            financings: {
                label: 'Financiamientos',
                description: 'Cuotas, préstamos y calendarios de pago.',
            },
            credits: {
                label: 'Créditos',
                description: 'Tarjetas de crédito y pagos pendientes.',
            },
            budget: {
                label: 'Presupuestos',
                description: 'Planes mensuales, plantillas y proyecciones.',
            },
            charts: {
                label: 'Gráficos',
                description: 'Gráficos y sus preferencias dentro de cada módulo.',
            },
            filters: {
                label: 'Filtros y columnas',
                description:
                    'Filtros avanzados, columnas y orden guardado en Registros.',
            },
            savings: {
                label: 'Ahorros',
                description: 'Cuentas de ahorro, metas y movimientos.',
            },
            vehicle: {
                label: 'Vehículo',
                description:
                    'Combustible, mantenimiento, recordatorios y gastos del vehículo.',
            },
            closing: {
                label: 'Cierre',
                description: 'Cierre informativo del periodo y cobertura.',
            },
            people: {
                label: 'Personas',
                description: 'Personas, saldos compartidos y liquidaciones.',
            },
            shared: {
                label: 'Compras compartidas',
                description: 'Participantes, pagador y montos compartidos.',
            },
            advancedCatalogs: {
                label: 'Catálogos avanzados',
                description:
                    'Gestión de tipos de pago y tipos de registro.',
            },
            quickAdd: {
                label: 'Alta rápida',
                description:
                    'Un formulario más corto, solo con los campos esenciales.',
                more: 'Más opciones',
                less: 'Menos opciones',
            },
            smartDefaults: {
                label: 'Recordar últimos valores',
                description:
                    'Rellena el último tipo, categoría y método de pago.',
            },
        },
        dataSafe: 'Ocultar un módulo nunca borra tus datos.',
        dependencies: {
            enabled:
                'Se activó “{feature}” porque depende de “{dependency}”.',
            disabled:
                'Se ocultó “{feature}” porque “{dependency}” está apagado.',
        },
        reset: 'Restaurar experiencia completa',
        resetConfirmTitle: '¿Restaurar la experiencia completa?',
        resetConfirmMessage:
            'Todos los módulos volverán a mostrarse. Tus datos no cambian.',
        onboarding: {
            title: 'Haz PocketTool a tu medida',
            body: 'Elige cuánto quieres ver. Puedes cambiarlo cuando quieras en Ajustes. Tus datos no se borran.',
            start: 'Empezar',
            later: 'Ahora no',
        },
        disabled: {
            redirected:
                'Esa sección está oculta. Puedes activarla en Ajustes → Experiencia.',
        },
    },
};
