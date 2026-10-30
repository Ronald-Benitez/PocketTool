import type { MessageShape } from './types';

export const helpEn = {
    "hub": {
        "title": "Help center",
        "subtitle": "Learn how PocketTool works, understand the logic behind each section, and see practical examples.",
        "searchPlaceholder": "Search topics",
        "noResults": "No topics match your search.",
        "readTime": "{minutes} min read",
        "related": "Related topics",
        "back": "Back to help",
        "open": "Open topic"
    },
    "categories": {
        "start": "Getting started",
        "records": "Records and groups",
        "planning": "Planning",
        "money": "Money and credit",
        "tools": "Tools"
    },
    "topics": {
        "gettingStarted": {
            "title": "Getting started",
            "summary": "Create your first group and add your first record.",
            "what": {
                "title": "What it is",
                "body": "PocketTool organizes your finances by monthly groups. Each group contains records, a goal, budgets, and summaries for one month."
            },
            "how": {
                "title": "How it works",
                "body": "A record belongs to a group and affects its balance according to its type: income adds, expense subtracts, and transfer moves money between accounts."
            },
            "steps": {
                "title": "Step by step",
                "step1": "Create a group with its month, year, and goal.",
                "step2": "Create the categories and payment methods you use.",
                "step3": "Open Records and add your first income or expense."
            },
            "example": {
                "title": "Example",
                "body": "Group October 2026 with a 10,000 goal. You add income 5,000 and expense 1,250. The group balance is 3,750."
            },
            "tips": {
                "title": "Tips",
                "body": "Create categories and payment methods before adding records so every movement is organized from the start."
            },
            "warning": {
                "title": "Common mistake",
                "body": "Records need a selected group. If you change groups, the lists and summaries change too."
            }
        },
        "groups": {
            "title": "Groups",
            "summary": "Understand the monthly container that holds all your data.",
            "what": {
                "title": "What it is",
                "body": "A group represents one month and year. It stores the goal, the balance, and the data used by records, budgets, and summaries."
            },
            "how": {
                "title": "How it works",
                "body": "The selected group drives the whole app. Switching groups changes the visible records and totals. The pin action remembers your favorite group."
            },
            "steps": {
                "title": "Step by step",
                "step1": "Open the group selector.",
                "step2": "Create a group with month, year, and goal.",
                "step3": "Select it or pin it for quick access."
            },
            "example": {
                "title": "Example",
                "body": "October 2026 is one group and November 2026 is another. Each has its own goal and balance."
            },
            "tips": {
                "title": "Tips",
                "body": "Use one group per month to keep summaries and budgets comparable."
            },
            "warning": {
                "title": "Common mistake",
                "body": "Deleting a group also deletes its associated records. Review the confirmation before deleting."
            }
        },
        "records": {
            "title": "Records",
            "summary": "Learn how income, expenses, and transfers change your balance.",
            "what": {
                "title": "What it is",
                "body": "A record is a movement: income, expense, or transfer. Each record has an amount, date, category, payment method, and type."
            },
            "how": {
                "title": "How it works",
                "body": "Income adds to the balance, expense subtracts, and transfer moves money between payment methods. Amounts are stored as integer cents."
            },
            "steps": {
                "title": "Step by step",
                "step1": "Select the group where you want to record the movement.",
                "step2": "Choose the type, category, payment method, amount, and date.",
                "step3": "Save and review the updated balance."
            },
            "example": {
                "title": "Example",
                "body": "You pay 1,250 for food with a debit card. The expense reduces the group balance and appears in the food category summary."
            },
            "tips": {
                "title": "Tips",
                "body": "If you leave the name empty, the category name is used as the record name."
            },
            "warning": {
                "title": "Common mistake",
                "body": "Credit expenses are tracked in the credit summary and may not behave like an immediate cash expense."
            }
        },
        "fixeds": {
            "title": "Fixed transactions",
            "summary": "Automate recurring monthly movements and avoid forgetting them.",
            "what": {
                "title": "What it is",
                "body": "A fixed transaction is a recurring movement with a day of the month, such as rent, subscriptions, or salary."
            },
            "how": {
                "title": "How it works",
                "body": "On the configured day, PocketTool reminds you to confirm it. Confirming creates the corresponding record for the selected group."
            },
            "steps": {
                "title": "Step by step",
                "step1": "Create a fixed transaction and choose its day.",
                "step2": "Set type, category, payment method, and amount.",
                "step3": "When it appears on Home, confirm it."
            },
            "example": {
                "title": "Example",
                "body": "Rent of 3,000 on day 5. On October 5 it appears as a reminder; confirming it creates the October expense."
            },
            "tips": {
                "title": "Tips",
                "body": "Edit the fixed transaction instead of creating a new one if the amount changes permanently."
            },
            "warning": {
                "title": "Common mistake",
                "body": "A fixed transaction is a template. It only affects the balance after you confirm it as a record."
            }
        },
        "summaries": {
            "title": "Summaries",
            "summary": "Read balances, totals by type, category, and payment method.",
            "what": {
                "title": "What it is",
                "body": "Summaries aggregate the selected group by record type, category, payment method, and payment type."
            },
            "how": {
                "title": "How it works",
                "body": "The app groups records and calculates totals. Credit and debit movements are separated so you can see the difference between actual balance and credit usage."
            },
            "steps": {
                "title": "Step by step",
                "step1": "Select a group.",
                "step2": "Open Summary or a specific summary tab.",
                "step3": "Tap a row to see its records and refine with filters."
            },
            "example": {
                "title": "Example",
                "body": "If income is 5,000 and expenses are 1,250, the balance is 3,750. The category summary shows where the expenses came from."
            },
            "tips": {
                "title": "Tips",
                "body": "Use the record detail filters to inspect a specific range or category."
            },
            "warning": {
                "title": "Common mistake",
                "body": "A credit balance is not the same as available cash. Check the credit summary before making decisions."
            }
        },
        "budgets": {
            "title": "Budgets",
            "summary": "Plan spending by category and compare it with real records.",
            "what": {
                "title": "What it is",
                "body": "A budget defines how much you plan to spend in a category for a group."
            },
            "how": {
                "title": "How it works",
                "body": "Budgets compare the planned amount with recorded expenses. The percentage shows how much of the budget has been used."
            },
            "steps": {
                "title": "Step by step",
                "step1": "Select the group.",
                "step2": "Create a budget or use a template item.",
                "step3": "Review the budget progress in the budgets section."
            },
            "example": {
                "title": "Example",
                "body": "Food budget 2,000 and 1,250 spent shows 62.5% used and 750 remaining."
            },
            "tips": {
                "title": "Tips",
                "body": "Keep categories consistent between records and budgets for accurate comparisons."
            },
            "warning": {
                "title": "Common mistake",
                "body": "Budgets do not block expenses. They only show how much you planned versus how much you spent."
            }
        },
        "credits": {
            "title": "Credits",
            "summary": "Understand credit payments, closing dates, and pending balances.",
            "what": {
                "title": "What it is",
                "body": "Credit tracking groups expenses made with credit payment methods and payments made toward them."
            },
            "how": {
                "title": "How it works",
                "body": "Payment methods can have a closing date and a payment date. Credit movements are organized by month and method so you can review current and previous totals."
            },
            "steps": {
                "title": "Step by step",
                "step1": "Create a credit payment method with closing and payment dates.",
                "step2": "Add expenses and credit payments using that method.",
                "step3": "Open Credits to review current, previous, and pending amounts."
            },
            "example": {
                "title": "Example",
                "body": "A card closes on day 20 and pays on day 28. An 800 credit expense appears in the credit summary for that period."
            },
            "tips": {
                "title": "Tips",
                "body": "Keep closing and payment dates accurate so the month grouping matches your bank statement."
            },
            "warning": {
                "title": "Common mistake",
                "body": "Credit expenses and credit payments are different movements. Review both before assuming a balance is settled."
            }
        },
        "savings": {
            "title": "Savings",
            "summary": "Track savings accounts, amounts, and changes over time.",
            "what": {
                "title": "What it is",
                "body": "A saving represents an account or goal with an amount and a history of changes."
            },
            "how": {
                "title": "How it works",
                "body": "Each edit stores the previous amount, the new amount, and the date, so you can see increases and decreases over time."
            },
            "steps": {
                "title": "Step by step",
                "step1": "Create a saving with its name and amount.",
                "step2": "Edit the amount when it changes.",
                "step3": "Review the history and chart."
            },
            "example": {
                "title": "Example",
                "body": "A saving grows from 1,000 to 1,500. The history shows a +500 change for that date."
            },
            "tips": {
                "title": "Tips",
                "body": "Pin the saving you check most often for faster access."
            },
            "warning": {
                "title": "Common mistake",
                "body": "Editing a saving creates a history entry; it does not create an income or expense record."
            }
        },
        "filters": {
            "title": "Filters",
            "summary": "Find records by date, amount, relation, and range.",
            "what": {
                "title": "What it is",
                "body": "Filters narrow the records shown in a list without deleting or changing the data."
            },
            "how": {
                "title": "How it works",
                "body": "Each filter has a field, an operator, and a value. Dates use a calendar, amounts use money fields, and relations use searchable selects."
            },
            "steps": {
                "title": "Step by step",
                "step1": "Open the filter modal.",
                "step2": "Choose field, operator, and value. Use Between for ranges.",
                "step3": "Apply the filters or enable Advanced columns for more fields."
            },
            "example": {
                "title": "Example",
                "body": "Date between October 1 and October 31 plus amount greater than 1,000 shows only high expenses from that month."
            },
            "tips": {
                "title": "Tips",
                "body": "Use In for one of several relations, and Between for dates or amounts."
            },
            "warning": {
                "title": "Common mistake",
                "body": "A filter with an empty value is ignored. Complete both values when using Between."
            }
        },
        "theme": {
            "title": "Theme and colors",
            "summary": "Customize light, dark, system, and palette colors.",
            "what": {
                "title": "What it is",
                "body": "The theme controls backgrounds, text, controls, and finance colors across the app."
            },
            "how": {
                "title": "How it works",
                "body": "You can use the base bright and dark palettes or customize each one. The selected mode can follow the system or force light or dark."
            },
            "steps": {
                "title": "Step by step",
                "step1": "Open Settings and choose System, Light, or Dark.",
                "step2": "Select the bright or dark palette tab.",
                "step3": "Edit colors by group or restore the base palette."
            },
            "example": {
                "title": "Example",
                "body": "You can keep the bright palette for day use and personalize the dark palette with a different surface and primary color."
            },
            "tips": {
                "title": "Tips",
                "body": "Check contrast warnings after changing text or background colors."
            },
            "warning": {
                "title": "Common mistake",
                "body": "Very low contrast can make labels unreadable. Use Reset or the base palette if that happens."
            }
        }
    }
} as const;

export const helpEs: MessageShape<typeof helpEn> = {
    "hub": {
        "title": "Centro de ayuda",
        "subtitle": "Aprende cómo funciona PocketTool, entiende la lógica de cada sección y consulta ejemplos prácticos.",
        "searchPlaceholder": "Buscar temas",
        "noResults": "Ningún tema coincide con tu búsqueda.",
        "readTime": "{minutes} min de lectura",
        "related": "Temas relacionados",
        "back": "Volver a la ayuda",
        "open": "Abrir tema"
    },
    "categories": {
        "start": "Primeros pasos",
        "records": "Registros y grupos",
        "planning": "Planificación",
        "money": "Dinero y crédito",
        "tools": "Herramientas"
    },
    "topics": {
        "gettingStarted": {
            "title": "Primeros pasos",
            "summary": "Crea tu primer grupo y agrega tu primer registro.",
            "what": {
                "title": "Qué es",
                "body": "PocketTool organiza tus finanzas por grupos mensuales. Cada grupo contiene registros, una meta, presupuestos y resúmenes de un mes."
            },
            "how": {
                "title": "Cómo funciona",
                "body": "Un registro pertenece a un grupo y afecta su balance según su tipo: ingreso suma, gasto resta y transferencia mueve dinero entre cuentas."
            },
            "steps": {
                "title": "Paso a paso",
                "step1": "Crea un grupo con su mes, año y meta.",
                "step2": "Crea las categorías y métodos de pago que uses.",
                "step3": "Abre Registros y agrega tu primer ingreso o gasto."
            },
            "example": {
                "title": "Ejemplo",
                "body": "Grupo Octubre 2026 con meta 10,000. Agregas ingreso 5,000 y gasto 1,250. El balance del grupo es 3,750."
            },
            "tips": {
                "title": "Consejos",
                "body": "Crea categorías y métodos de pago antes de agregar registros para organizar cada movimiento desde el inicio."
            },
            "warning": {
                "title": "Error común",
                "body": "Los registros necesitan un grupo seleccionado. Si cambias de grupo, también cambian las listas y los resúmenes."
            }
        },
        "groups": {
            "title": "Grupos",
            "summary": "Entiende el contenedor mensual que guarda todos tus datos.",
            "what": {
                "title": "Qué es",
                "body": "Un grupo representa un mes y un año. Guarda la meta, el balance y los datos que usan registros, presupuestos y resúmenes."
            },
            "how": {
                "title": "Cómo funciona",
                "body": "El grupo seleccionado controla toda la app. Cambiar de grupo cambia los registros y totales visibles. La acción de fijar recuerda tu grupo favorito."
            },
            "steps": {
                "title": "Paso a paso",
                "step1": "Abre el selector de grupos.",
                "step2": "Crea un grupo con mes, año y meta.",
                "step3": "Selecciónalo o fíjalo para acceder rápido."
            },
            "example": {
                "title": "Ejemplo",
                "body": "Octubre 2026 es un grupo y Noviembre 2026 es otro. Cada uno tiene su propia meta y balance."
            },
            "tips": {
                "title": "Consejos",
                "body": "Usa un grupo por mes para comparar resúmenes y presupuestos de forma consistente."
            },
            "warning": {
                "title": "Error común",
                "body": "Eliminar un grupo también elimina sus registros asociados. Revisa la confirmación antes de borrar."
            }
        },
        "records": {
            "title": "Registros",
            "summary": "Aprende cómo los ingresos, gastos y transferencias cambian tu balance.",
            "what": {
                "title": "Qué es",
                "body": "Un registro es un movimiento: ingreso, gasto o transferencia. Tiene monto, fecha, categoría, método de pago y tipo."
            },
            "how": {
                "title": "Cómo funciona",
                "body": "El ingreso suma al balance, el gasto resta y la transferencia mueve dinero entre métodos de pago. Los montos se guardan en centavos enteros."
            },
            "steps": {
                "title": "Paso a paso",
                "step1": "Selecciona el grupo donde quieres registrar el movimiento.",
                "step2": "Elige tipo, categoría, método de pago, monto y fecha.",
                "step3": "Guarda y revisa el balance actualizado."
            },
            "example": {
                "title": "Ejemplo",
                "body": "Pagas 1,250 en comida con tarjeta de débito. El gasto reduce el balance del grupo y aparece en el resumen de la categoría comida."
            },
            "tips": {
                "title": "Consejos",
                "body": "Si dejas el nombre vacío, se usa el nombre de la categoría como nombre del registro."
            },
            "warning": {
                "title": "Error común",
                "body": "Los gastos a crédito se siguen en el resumen de créditos y pueden no comportarse como un gasto de efectivo inmediato."
            }
        },
        "fixeds": {
            "title": "Transacciones fijas",
            "summary": "Automatiza movimientos mensuales recurrentes y evita olvidarlos.",
            "what": {
                "title": "Qué es",
                "body": "Una transacción fija es un movimiento recurrente con un día del mes, como renta, suscripciones o salario."
            },
            "how": {
                "title": "Cómo funciona",
                "body": "En el día configurado, PocketTool te recuerda confirmarla. Al confirmar se crea el registro correspondiente en el grupo seleccionado."
            },
            "steps": {
                "title": "Paso a paso",
                "step1": "Crea una transacción fija y elige su día.",
                "step2": "Define tipo, categoría, método de pago y monto.",
                "step3": "Cuando aparezca en Inicio, confírmala."
            },
            "example": {
                "title": "Ejemplo",
                "body": "Renta de 3,000 el día 5. El 5 de octubre aparece como recordatorio; al confirmar se crea el gasto de octubre."
            },
            "tips": {
                "title": "Consejos",
                "body": "Edita la transacción fija en lugar de crear otra si el monto cambia de forma permanente."
            },
            "warning": {
                "title": "Error común",
                "body": "La transacción fija es una plantilla. Solo afecta el balance después de confirmarla como registro."
            }
        },
        "summaries": {
            "title": "Resúmenes",
            "summary": "Consulta balances y totales por tipo, categoría y método de pago.",
            "what": {
                "title": "Qué es",
                "body": "Los resúmenes agrupan el grupo seleccionado por tipo de registro, categoría, método de pago y tipo de pago."
            },
            "how": {
                "title": "Cómo funciona",
                "body": "La app agrupa los registros y calcula totales. Los movimientos de crédito y débito se separan para ver la diferencia entre balance real y uso de crédito."
            },
            "steps": {
                "title": "Paso a paso",
                "step1": "Selecciona un grupo.",
                "step2": "Abre Resumen o una pestaña de resumen específica.",
                "step3": "Toca una fila para ver sus registros y refinar con filtros."
            },
            "example": {
                "title": "Ejemplo",
                "body": "Si los ingresos son 5,000 y los gastos 1,250, el balance es 3,750. El resumen por categoría muestra de dónde vienen los gastos."
            },
            "tips": {
                "title": "Consejos",
                "body": "Usa los filtros del detalle de registros para revisar un rango o una categoría específica."
            },
            "warning": {
                "title": "Error común",
                "body": "El balance de crédito no es lo mismo que el efectivo disponible. Revisa el resumen de créditos antes de decidir."
            }
        },
        "budgets": {
            "title": "Presupuestos",
            "summary": "Planifica el gasto por categoría y compáralo con los registros reales.",
            "what": {
                "title": "Qué es",
                "body": "Un presupuesto define cuánto planeas gastar en una categoría para un grupo."
            },
            "how": {
                "title": "Cómo funciona",
                "body": "Los presupuestos comparan el monto planificado con los gastos registrados. El porcentaje muestra cuánto del presupuesto se ha usado."
            },
            "steps": {
                "title": "Paso a paso",
                "step1": "Selecciona el grupo.",
                "step2": "Crea un presupuesto o usa un elemento de plantilla.",
                "step3": "Revisa el avance en la sección de presupuestos."
            },
            "example": {
                "title": "Ejemplo",
                "body": "Presupuesto de comida 2,000 y 1,250 gastados muestran 62.5% usado y 750 restantes."
            },
            "tips": {
                "title": "Consejos",
                "body": "Mantén las mismas categorías entre registros y presupuestos para comparar con precisión."
            },
            "warning": {
                "title": "Error común",
                "body": "Los presupuestos no bloquean gastos. Solo muestran lo planificado frente a lo gastado."
            }
        },
        "credits": {
            "title": "Créditos",
            "summary": "Entiende pagos de crédito, fechas de corte y saldos pendientes.",
            "what": {
                "title": "Qué es",
                "body": "El seguimiento de crédito agrupa gastos hechos con métodos de pago de crédito y los pagos realizados hacia ellos."
            },
            "how": {
                "title": "Cómo funciona",
                "body": "Los métodos de pago pueden tener fecha de corte y fecha de pago. Los movimientos de crédito se organizan por mes y método para revisar totales actuales y anteriores."
            },
            "steps": {
                "title": "Paso a paso",
                "step1": "Crea un método de pago de crédito con fechas de corte y pago.",
                "step2": "Agrega gastos y pagos de crédito con ese método.",
                "step3": "Abre Créditos para revisar montos actuales, anteriores y pendientes."
            },
            "example": {
                "title": "Ejemplo",
                "body": "Una tarjeta corta el día 20 y paga el día 28. Un gasto a crédito de 800 aparece en el resumen de crédito de ese periodo."
            },
            "tips": {
                "title": "Consejos",
                "body": "Mantén las fechas de corte y pago correctas para que el agrupamiento mensual coincida con tu estado de cuenta."
            },
            "warning": {
                "title": "Error común",
                "body": "Los gastos a crédito y los pagos de crédito son movimientos distintos. Revisa ambos antes de asumir que un saldo está liquidado."
            }
        },
        "savings": {
            "title": "Ahorros",
            "summary": "Sigue cuentas de ahorro, montos y cambios a lo largo del tiempo.",
            "what": {
                "title": "Qué es",
                "body": "Un ahorro representa una cuenta o meta con un monto y un historial de cambios."
            },
            "how": {
                "title": "Cómo funciona",
                "body": "Cada edición guarda el monto anterior, el nuevo monto y la fecha, para ver aumentos y disminuciones con el tiempo."
            },
            "steps": {
                "title": "Paso a paso",
                "step1": "Crea un ahorro con su nombre y monto.",
                "step2": "Edita el monto cuando cambie.",
                "step3": "Revisa el historial y el gráfico."
            },
            "example": {
                "title": "Ejemplo",
                "body": "Un ahorro pasa de 1,000 a 1,500. El historial muestra un cambio de +500 en esa fecha."
            },
            "tips": {
                "title": "Consejos",
                "body": "Fija el ahorro que consultas más seguido para acceder rápido."
            },
            "warning": {
                "title": "Error común",
                "body": "Editar un ahorro crea una entrada de historial; no crea un registro de ingreso o gasto."
            }
        },
        "filters": {
            "title": "Filtros",
            "summary": "Encuentra registros por fecha, monto, relación y rango.",
            "what": {
                "title": "Qué es",
                "body": "Los filtros reducen los registros visibles en una lista sin borrar ni cambiar los datos."
            },
            "how": {
                "title": "Cómo funciona",
                "body": "Cada filtro tiene campo, operador y valor. Las fechas usan calendario, los montos usan campos de dinero y las relaciones usan selects con búsqueda."
            },
            "steps": {
                "title": "Paso a paso",
                "step1": "Abre el modal de filtros.",
                "step2": "Elige campo, operador y valor. Usa Entre para rangos.",
                "step3": "Aplica los filtros o activa Columnas avanzadas para más campos."
            },
            "example": {
                "title": "Ejemplo",
                "body": "Fecha entre el 1 y el 31 de octubre más monto mayor a 1,000 muestra solo los gastos altos de ese mes."
            },
            "tips": {
                "title": "Consejos",
                "body": "Usa Es uno de para varias relaciones y Entre para fechas o montos."
            },
            "warning": {
                "title": "Error común",
                "body": "Un filtro con valor vacío se ignora. Completa ambos valores cuando uses Entre."
            }
        },
        "theme": {
            "title": "Tema y colores",
            "summary": "Personaliza claro, oscuro, sistema y colores de paleta.",
            "what": {
                "title": "Qué es",
                "body": "El tema controla fondos, texto, controles y colores financieros en toda la app."
            },
            "how": {
                "title": "Cómo funciona",
                "body": "Puedes usar las paletas base bright y dark o personalizar cada una. El modo puede seguir al sistema o forzar claro u oscuro."
            },
            "steps": {
                "title": "Paso a paso",
                "step1": "Abre Ajustes y elige Sistema, Claro u Oscuro.",
                "step2": "Selecciona la pestaña de paleta bright o dark.",
                "step3": "Edita colores por grupo o restaura la paleta base."
            },
            "example": {
                "title": "Ejemplo",
                "body": "Puedes mantener la paleta bright para el día y personalizar la dark con otro fondo y color primario."
            },
            "tips": {
                "title": "Consejos",
                "body": "Revisa las advertencias de contraste después de cambiar colores de texto o fondo."
            },
            "warning": {
                "title": "Error común",
                "body": "Un contraste muy bajo puede volver ilegibles las etiquetas. Usa Restablecer o la paleta base si ocurre."
            }
        }
    }
};
