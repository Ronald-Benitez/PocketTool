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
            "summary": "Plan the month, compare it with real records and detect deviations early.",
            "what": {
                "title": "What it is",
                "body": "A budget is a monthly plan with category envelopes and fixed commitments. Each line stores a planned amount, but the actual amount always comes from the records of the same group."
            },
            "how": {
                "title": "How it works",
                "body": "PocketTool compares planned and actual amounts by category and record type. It shows used percentage, variation, pending fixed transactions, unplanned spending and a projection at the current pace. The comparison chart shows planned vs. actual; health groups lines by status; distribution shows the planned share of each category; and projection compares planned vs. projected at the current pace. The legend identifies each color, and those colors can be edited in Settings → Colors. Projection is calculated per line: in the current month, a category uses actual spending ÷ elapsed days × days in the month; on the last day it equals the actual; in a future month it uses the planned amount; and in a past month it uses the actual. A fixed line uses its actual amount plus the pending fixed amount, not a daily rate. The result is an estimate, not a commitment."
            },
            "steps": {
                "title": "Step by step",
                "step1": "Select the group and create a plan from scratch, from a template, from last month, from fixed transactions or from the average of selected groups.",
                "step2": "Add category envelopes with amount, priority and notes. Open a line to view its records or edit it.",
                "step3": "Review signals, switch between chart modes and adjust lines. If you want a different approach, delete the plan and create another."
            },
            "example": {
                "title": "Example",
                "body": "Food envelope 2,000 and 1,250 spent shows 62.5% used and 750 remaining. If the selected groups averaged 1,800 in food, the group average creates a 1,800 envelope. Rent is a separate fixed line, so its confirmed record is not counted twice."
            },
            "tips": {
                "title": "Tips",
                "body": "Keep categories and record types consistent between records and budgets. Use the group average when spending is stable, and templates when you want a fixed structure."
            },
            "warning": {
                "title": "Common mistake",
                "body": "Deleting a plan also deletes its lines. You can create another plan afterward. A fixed transaction is a commitment, not an expense: it only affects the actual amount after you confirm it and a record is created."
            }
        },
        "budgetTemplates": {
            "title": "Budget templates",
            "summary": "Reuse a monthly plan without starting from zero.",
            "what": {
                "title": "What it is",
                "body": "A budget template is a reusable list of category envelopes and fixed commitments. It stores suggested amounts, priorities and notes, but it is not linked to a specific month."
            },
            "how": {
                "title": "How it works",
                "body": "When you apply a template, PocketTool copies its lines into the current plan. Merge adds missing lines, replace deletes the current lines, and reset keeps them but overwrites their amounts."
            },
            "steps": {
                "title": "Step by step",
                "step1": "Open Manage templates and create a template.",
                "step2": "Add category or fixed lines with their suggested amounts.",
                "step3": "Apply it to a month and choose merge, replace or reset."
            },
            "example": {
                "title": "Example",
                "body": "The Regular month template has rent 3,000 and food 2,000. Applying it with merge adds both lines if they do not exist and keeps any amount you already edited."
            },
            "tips": {
                "title": "Tips",
                "body": "Mark one template as default and save a good month as a template to reuse it later."
            },
            "warning": {
                "title": "Common mistake",
                "body": "Replace deletes every current line. Check the preview before applying it to a plan with manual changes."
            }
        },
        "vehicle": {
            "title": "Vehicle",
            "summary": "Track fuel, maintenance and real running costs for one or more vehicles.",
            "what": {
                "title": "What it is",
                "body": "The Vehicle section groups fuel entries, maintenance, parts and reminders for each vehicle. It is separate from the monthly financial groups but can create or link an expense in Records."
            },
            "how": {
                "title": "How it works",
                "body": "Each vehicle has default distance and volume units and a preferred consumption format. Fuel and maintenance entries use explicit units, and the odometer or distance can be entered or inferred. A default vehicle is used when you open the section."
            },
            "steps": {
                "title": "Step by step",
                "step1": "Add a vehicle and choose its default units.",
                "step2": "Register fuel and maintenance from their tabs.",
                "step3": "Review the dashboard, reminders and histories."
            },
            "example": {
                "title": "Example",
                "body": "A car uses miles and gallons. Its default format is mi/gal. A fuel entry with 8.5 gallons and 300 miles shows about 35.3 mi/gal."
            },
            "tips": {
                "title": "Tips",
                "body": "Use the real odometer whenever possible. It gives better consumption and oil-change estimates than a trip meter."
            },
            "warning": {
                "title": "Common mistake",
                "body": "A vehicle entry does not affect your finances until you create or link an expense in Records."
            }
        },
        "vehicleFuel": {
            "title": "Fuel entries",
            "summary": "Record fill-ups with real units and calculate consumption from distance and volume.",
            "what": {
                "title": "What it is",
                "body": "A fuel entry stores date, odometer or distance, volume, price per unit, total, station and whether the tank was full. Volume can be in gallons or liters and distance in miles or kilometers."
            },
            "how": {
                "title": "How it works",
                "body": "Enter any two of volume, price per unit and total; the third is calculated. Consumption can be shown as mi/gal, km/gal, mi/L, km/L, L/100 km, gal/100 km, L/60 mi or gal/60 mi. Full-tank segments are the most accurate method; partial fills accumulate until the next full tank."
            },
            "steps": {
                "title": "Step by step",
                "step1": "Choose the vehicle, date and units.",
                "step2": "Enter odometer or distance and two of volume, price and total.",
                "step3": "Mark full tank, choose whether to create or link an expense, and save."
            },
            "example": {
                "title": "Example",
                "body": "8.5399 gallons and 300 miles give about 35.1 mi/gal. If the tank was partial, the entry is shown as accumulating until the next full fill."
            },
            "tips": {
                "title": "Tips",
                "body": "Changing the volume unit converts the displayed price so the total stays consistent."
            },
            "warning": {
                "title": "Common mistake",
                "body": "A partial fill is not an error, but its consumption is not final until the next full tank."
            }
        },
        "vehicleMaintenance": {
            "title": "Maintenance and parts",
            "summary": "Track services, repairs, parts and their cost.",
            "what": {
                "title": "What it is",
                "body": "A maintenance entry stores date, odometer, service type, description, cost, vendor, notes and optional parts. Parts can include a name, notes, optional quantity, unit and cost."
            },
            "how": {
                "title": "How it works",
                "body": "The total cost belongs to the maintenance entry. Parts are a flexible breakdown: quantity is not required, so you can record a tire change without deciding whether it was one or four. Oil changes update the oil reminder when saved."
            },
            "steps": {
                "title": "Step by step",
                "step1": "Choose the vehicle, date, service type and odometer.",
                "step2": "Add the cost, notes and any parts.",
                "step3": "Create or link the expense and save."
            },
            "example": {
                "title": "Example",
                "body": "A tire service can have one part named Tires with the note “4 tires, brand X” and no quantity, plus the total cost of the service."
            },
            "tips": {
                "title": "Tips",
                "body": "Use notes for sizes, brands and details that do not fit a fixed number."
            },
            "warning": {
                "title": "Common mistake",
                "body": "Part costs are optional and do not automatically replace the maintenance total."
            }
        },
        "vehicleReminders": {
            "title": "Vehicle reminders",
            "summary": "Know how much distance or time is left before the next service.",
            "what": {
                "title": "What it is",
                "body": "A reminder defines a service interval in distance, months or both. Examples are oil changes, tire rotation, filters, brakes, inspection and insurance."
            },
            "how": {
                "title": "How it works",
                "body": "PocketTool takes the latest odometer from fuel and maintenance entries. It compares it with the last service odometer and adds the interval. It also calculates the remaining days from the last service date. Status is on track, due soon or overdue."
            },
            "steps": {
                "title": "Step by step",
                "step1": "Add a reminder and choose the service type.",
                "step2": "Set the distance interval, month interval or both.",
                "step3": "Register the service later; the reminder updates automatically."
            },
            "example": {
                "title": "Example",
                "body": "Oil interval 5,000 miles and 6 months. If the last change was at 20,000 miles and the current odometer is 24,800, 200 miles remain."
            },
            "tips": {
                "title": "Tips",
                "body": "Keep fuel entries up to date so the current odometer and remaining distance stay accurate."
            },
            "warning": {
                "title": "Common mistake",
                "body": "If there is no odometer data, the reminder shows “not enough data” instead of inventing a value."
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
            "summary": "Planifica el mes, compáralo con los registros reales y detecta desviaciones a tiempo.",
            "what": {
                "title": "Qué es",
                "body": "Un presupuesto es un plan mensual con sobres de categoría y compromisos fijos. Cada línea guarda un monto planificado, pero el real siempre sale de los registros del mismo grupo."
            },
            "how": {
                "title": "Cómo funciona",
                "body": "PocketTool compara lo planificado y lo real por categoría y tipo de registro. Muestra porcentaje usado, variación, fijos pendientes, gasto sin planificar y una proyección al ritmo actual. El gráfico de comparación muestra planificado vs. real; salud agrupa las líneas por estado; distribución muestra el peso planificado de cada categoría; y proyección compara lo planificado con la proyección al ritmo actual. La leyenda identifica cada color y esos colores se pueden editar en Ajustes → Colores. La proyección se calcula por línea: en el mes actual, una categoría usa gasto real ÷ días transcurridos × días del mes; el último día coincide con el real; en un mes futuro usa el monto planificado; y en un mes pasado usa el real. Una línea fija usa su monto real más el fijo pendiente, no una tasa diaria. El resultado es una estimación, no un compromiso."
            },
            "steps": {
                "title": "Paso a paso",
                "step1": "Selecciona el grupo y crea un plan desde cero, desde una plantilla, desde el mes anterior, desde los fijos o desde la media de grupos seleccionados.",
                "step2": "Agrega sobres de categoría con monto, prioridad y notas. Abre una línea para ver sus registros o editarla.",
                "step3": "Revisa las señales, cambia entre los modos de gráfico y ajusta las líneas. Si quieres otro enfoque, elimina el plan y crea otro."
            },
            "example": {
                "title": "Ejemplo",
                "body": "Sobre de comida 2,000 y 1,250 gastados muestran 62.5% usado y 750 restantes. Si los grupos seleccionados promediaron 1,800 en comida, la media de grupos crea un sobre de 1,800. La renta es una línea fija separada, así que su registro confirmado no se cuenta dos veces."
            },
            "tips": {
                "title": "Consejos",
                "body": "Mantén las mismas categorías y tipos entre registros y presupuestos. Usa la media de grupos cuando el gasto sea estable y plantillas cuando quieras una estructura fija."
            },
            "warning": {
                "title": "Error común",
                "body": "Eliminar un plan también elimina sus líneas. Después puedes crear otro plan. Una transacción fija es un compromiso, no un gasto: solo afecta el real después de confirmarla y crear un registro."
            }
        },
        "budgetTemplates": {
            "title": "Plantillas de presupuesto",
            "summary": "Reutiliza un plan mensual sin empezar de cero.",
            "what": {
                "title": "Qué es",
                "body": "Una plantilla de presupuesto es una lista reutilizable de sobres de categoría y compromisos fijos. Guarda montos sugeridos, prioridades y notas, pero no pertenece a un mes específico."
            },
            "how": {
                "title": "Cómo funciona",
                "body": "Al aplicar una plantilla, PocketTool copia sus líneas al plan actual. Combinar agrega las que faltan, Reemplazar elimina las actuales y Reiniciar las conserva pero sobrescribe sus montos."
            },
            "steps": {
                "title": "Paso a paso",
                "step1": "Abre Gestionar plantillas y crea una plantilla.",
                "step2": "Agrega líneas de categoría o fijas con sus montos sugeridos.",
                "step3": "Aplícala a un mes y elige combinar, reemplazar o reiniciar."
            },
            "example": {
                "title": "Ejemplo",
                "body": "La plantilla Mes normal tiene renta 3,000 y comida 2,000. Al aplicarla con combinar agrega ambas líneas si no existen y conserva los montos que ya editaste."
            },
            "tips": {
                "title": "Consejos",
                "body": "Marca una plantilla como predeterminada y guarda un buen mes como plantilla para reutilizarlo después."
            },
            "warning": {
                "title": "Error común",
                "body": "Reemplazar elimina todas las líneas actuales. Revisa la vista previa antes de aplicarla a un plan con cambios manuales."
            }
        },
        "vehicle": {
            "title": "Vehículo",
            "summary": "Controla combustible, mantenimiento y costo real de uso de uno o varios vehículos.",
            "what": {
                "title": "Qué es",
                "body": "La sección Vehículo agrupa cargas de combustible, mantenimiento, piezas y recordatorios de cada vehículo. Es independiente de los grupos financieros mensuales, pero puede crear o vincular un gasto en Registros."
            },
            "how": {
                "title": "Cómo funciona",
                "body": "Cada vehículo tiene unidades por defecto de distancia y volumen y un formato de consumo preferido. Las entradas de combustible y mantenimiento usan unidades explícitas, y el odómetro o la distancia se pueden ingresar o inferir. Al abrir la sección se usa el vehículo predeterminado."
            },
            "steps": {
                "title": "Paso a paso",
                "step1": "Agrega un vehículo y elige sus unidades por defecto.",
                "step2": "Registra combustible y mantenimiento desde sus pestañas.",
                "step3": "Revisa el resumen, los recordatorios y los históricos."
            },
            "example": {
                "title": "Ejemplo",
                "body": "Un carro usa millas y galones. Su formato por defecto es mi/gal. Una carga de 8.5 galones y 300 millas muestra aproximadamente 35.3 mi/gal."
            },
            "tips": {
                "title": "Consejos",
                "body": "Usa el odómetro real siempre que puedas. Da mejores estimaciones de consumo y de cambio de aceite que el marcador de viaje."
            },
            "warning": {
                "title": "Error común",
                "body": "Una entrada de vehículo no afecta tus finanzas hasta que creas o vinculas un gasto en Registros."
            }
        },
        "vehicleFuel": {
            "title": "Cargas de combustible",
            "summary": "Registra cargas con unidades reales y calcula el consumo desde distancia y volumen.",
            "what": {
                "title": "Qué es",
                "body": "Una carga guarda fecha, odómetro o distancia, volumen, precio por unidad, total, estación y si el tanque quedó lleno. El volumen puede ser galones o litros y la distancia millas o kilómetros."
            },
            "how": {
                "title": "Cómo funciona",
                "body": "Ingresa dos de tres valores entre volumen, precio por unidad y total; el tercero se calcula. El consumo se puede mostrar como mi/gal, km/gal, mi/L, km/L, L/100 km, gal/100 km, L/60 mi o gal/60 mi. Los segmentos de tanque lleno son el método más preciso; las cargas parciales se acumulan hasta el siguiente tanque lleno."
            },
            "steps": {
                "title": "Paso a paso",
                "step1": "Elige el vehículo, la fecha y las unidades.",
                "step2": "Ingresa odómetro o distancia y dos de volumen, precio y total.",
                "step3": "Marca tanque lleno, elige crear o vincular un gasto y guarda."
            },
            "example": {
                "title": "Ejemplo",
                "body": "8.5399 galones y 300 millas dan aproximadamente 35.1 mi/gal. Si el tanque fue parcial, la entrada se muestra acumulando hasta la siguiente carga completa."
            },
            "tips": {
                "title": "Consejos",
                "body": "Al cambiar la unidad de volumen se convierte el precio mostrado para que el total siga siendo coherente."
            },
            "warning": {
                "title": "Error común",
                "body": "Una carga parcial no es un error, pero su consumo no es definitivo hasta el siguiente tanque lleno."
            }
        },
        "vehicleMaintenance": {
            "title": "Mantenimiento y piezas",
            "summary": "Registra servicios, reparaciones, piezas y su costo.",
            "what": {
                "title": "Qué es",
                "body": "Un mantenimiento guarda fecha, odómetro, tipo de servicio, descripción, costo, proveedor, notas y piezas opcionales. Las piezas pueden tener nombre, notas, cantidad, unidad y costo opcionales."
            },
            "how": {
                "title": "Cómo funciona",
                "body": "El costo total pertenece al mantenimiento. Las piezas son un desglose flexible: la cantidad no es obligatoria, así que puedes registrar un cambio de llantas sin decidir si fue una o cuatro. Los cambios de aceite actualizan el recordatorio de aceite al guardar."
            },
            "steps": {
                "title": "Paso a paso",
                "step1": "Elige el vehículo, la fecha, el tipo de servicio y el odómetro.",
                "step2": "Agrega el costo, las notas y las piezas que quieras.",
                "step3": "Crea o vincula el gasto y guarda."
            },
            "example": {
                "title": "Ejemplo",
                "body": "Un servicio de llantas puede tener una pieza llamada Llantas con la nota “4 llantas, marca X” y sin cantidad, además del costo total del servicio."
            },
            "tips": {
                "title": "Consejos",
                "body": "Usa las notas para medidas, marcas y detalles que no encajan en un número fijo."
            },
            "warning": {
                "title": "Error común",
                "body": "El costo de las piezas es opcional y no reemplaza automáticamente el total del mantenimiento."
            }
        },
        "vehicleReminders": {
            "title": "Recordatorios del vehículo",
            "summary": "Consulta cuánta distancia o tiempo falta para el próximo servicio.",
            "what": {
                "title": "Qué es",
                "body": "Un recordatorio define un intervalo de servicio en distancia, meses o ambos. Ejemplos: cambio de aceite, rotación de llantas, filtros, frenos, inspección y seguro."
            },
            "how": {
                "title": "Cómo funciona",
                "body": "PocketTool toma el último odómetro de combustible y mantenimiento. Lo compara con el odómetro del último servicio y suma el intervalo. También calcula los días restantes desde la fecha del último servicio. El estado puede ser en orden, próximo o vencido."
            },
            "steps": {
                "title": "Paso a paso",
                "step1": "Agrega un recordatorio y elige el tipo de servicio.",
                "step2": "Define el intervalo de distancia, el de meses o ambos.",
                "step3": "Registra el servicio después; el recordatorio se actualiza solo."
            },
            "example": {
                "title": "Ejemplo",
                "body": "Intervalo de aceite 5,000 millas y 6 meses. Si el último cambio fue a las 20,000 millas y el odómetro actual es 24,800, faltan 200 millas."
            },
            "tips": {
                "title": "Consejos",
                "body": "Mantén actualizadas las cargas de combustible para que el odómetro actual y la distancia restante sean precisos."
            },
            "warning": {
                "title": "Error común",
                "body": "Si no hay datos de odómetro, el recordatorio muestra “faltan datos” en lugar de inventar un valor."
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
