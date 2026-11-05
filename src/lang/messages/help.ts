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
                "body": "Income adds to the balance, expense subtracts, and transfer moves money between payment methods. Amounts are stored as integer cents. A shared record keeps your own amount in the record and the shared portion separately, so personal balances only use what you really pay."
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
                "body": "On the configured day, PocketTool reminds you to confirm it. Confirming creates the corresponding record for the selected group. Pending credit and loan payments also appear in Records; opening one loads the payment form with its amount, date and expense data. A fixed expense can be split among several people registered in the People section. When it is shared, the record stores your own amount and the shared portion separately, and each person's share appears in their payment history."
            },
            "steps": {
                "title": "Step by step",
                "step1": "Create a fixed transaction and choose its day.",
                "step2": "Set type, category, payment method, and amount.",
                "step3": "When it appears in Records, confirm it or register a pending credit/loan payment."
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
                "body": "The app groups records and calculates totals. Credit and debit movements are separated so you can see the difference between actual balance and credit usage. The main balance uses your own amount by default; the total and shared amounts are shown separately so shared expenses do not inflate your personal balance."
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
                "body": "Each vehicle has default distance and volume units and a preferred consumption format. Fuel and maintenance entries use explicit units, and the odometer or distance can be entered or inferred. The effective odometer is carried through distance-only entries, so later odometer readings and reminders use the full history. A default vehicle is used when you open the section."
            },
            "steps": {
                "title": "Step by step",
                "step1": "Add a vehicle and choose its default units.",
                "step2": "Register fuel and maintenance from their tabs.",
                "step3": "Review the dashboard, reminders and histories. When creating an expense, choose its record type; the default comes from Vehicle settings."
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
                "body": "A fuel entry stores date, odometer or distance, volume, price per unit, total, station and whether the tank was full. Volume can be in gallons or liters and distance in miles or kilometers. The first record can be an odometer-only baseline."
            },
            "how": {
                "title": "How it works",
                "body": "Enter any two of volume, price per unit and total; the third is calculated. Consumption can be shown as mi/gal, km/gal, mi/L, km/L, L/100 km, gal/100 km, L/60 mi or gal/60 mi. Full-tank segments are the most accurate method; partial fills accumulate until the next full tank. Any fill recorded with distance instead of odometer is inferred from the previous reading, including full tanks, and mixed entries keep their creation order when they share the same date. The fuel screen shows performance, volume, price and total spend charts grouped by full-tank segment, plus a normalized comparison of volume, distance and total cost."
            },
            "steps": {
                "title": "Step by step",
                "step1": "Choose the vehicle, date and units. The form remembers the last volume and odometer units saved for that vehicle. If it is the first entry, you can record only the odometer as a baseline.",
                "step2": "Enter odometer or distance and two of volume, price and total. A partial fill may leave odometer/distance empty or at 0.",
                "step3": "Mark full tank, choose whether to create or link an expense, and save."
            },
            "example": {
                "title": "Example",
                "body": "8.5399 gallons and 300 miles give about 35.1 mi/gal. A baseline of 1,000 miles followed by a full tank at 1,300 miles starts the first segment. A partial fill with no odometer reuses the previous reading and adds only its volume."
            },
            "tips": {
                "title": "Tips",
                "body": "Use the odometer baseline only once, when the vehicle has no fuel history. Changing the volume unit converts the displayed price so the total stays consistent. Use the volume and price unit selector to view average price per liter or per gallon."
            },
            "warning": {
                "title": "Common mistake",
                "body": "A partial fill is not an error, but its consumption is not final until the next full tank. A baseline is not an expense and does not add fuel volume."
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
                "body": "Payment methods can have a closing date, a payment date and a credit limit. Credit movements are organized by month and method, while active 0% installment purchases reduce available credit by their pending balance."
            },
            "steps": {
                "title": "Step by step",
                "step1": "Create a credit payment method with closing and payment dates.",
                "step2": "Add expenses and credit payments using that method, or link a 0% installment purchase to the card.",
                "step3": "Open Credits to review current, previous and pending amounts, used credit and available credit."
            },
            "example": {
                "title": "Example",
                "body": "A card with a 2,000 limit has 800 in card expenses and a 600 pending installment plan. Used credit is 1,400 and available credit is 600."
            },
            "tips": {
                "title": "Tips",
                "body": "Keep closing and payment dates accurate and link 0% installment purchases to the card that financed them."
            },
            "warning": {
                "title": "Common mistake",
                "body": "Credit expenses and credit payments are different movements. Review both, plus pending installment plans, before assuming a balance is settled."
            }
        },
        "financings": {
            "title": "Financings",
            "summary": "Track installment purchases, loans, payments, refinancing and simulations.",
            "what": {
                "title": "What it is",
                "body": "A financing stores the original amount, financed amount, rate, term and payment schedule. It can represent a store installment purchase, a bank loan, a mortgage, an auto loan or a shared debt."
            },
            "how": {
                "title": "How it works",
                "body": "The balance is derived from the financed amount, prior installments, prior capital payments, registered payments and extra principal. You can enter the term in months or years. You can use the calculated payment or enter the agreed one; if a payment is higher, the difference is recorded as insurance or other charges, not as principal or interest. A 0% installment purchase linked to a credit card also reduces that card's available credit by its pending balance. Shared loans can be split among several people registered in the People section. Payments and extra capital reductions keep the full debt movement for the financing but record only your own part in Records, with the shared portion tracked per person."
            },
            "steps": {
                "title": "Step by step",
                "step1": "Create the financing with its amount, rate, term in months or years, first payment date and payment method.",
                "step2": "Register each payment, including extra principal or an extra amount to reduce the payment. You can create, link or skip a Record for that payment.",
                "step3": "Review the payment history, balance and payment-composition charts, then use Refinance or Simulate to compare changes."
            },
            "example": {
                "title": "Example",
                "body": "A 1,200 purchase at 0% over 12 months starts with a 100 payment. After 4 payments the balance is 800 and, if the card financed it, that pending balance reduces the card's available credit."
            },
            "tips": {
                "title": "Tips",
                "body": "Record payments close to their real date so the balance, interest and payoff date stay accurate. Save important simulation scenarios to compare them later."
            },
            "warning": {
                "title": "Common mistake",
                "body": "An extra payment can reduce the term or the payment. Choose the strategy before saving, and do not record the same purchase twice as a card expense and as a financing."
            }
        },
        "people": {
            "title": "People",
            "summary": "Manage the people you share expenses with and review their payment history.",
            "what": {
                "title": "What it is",
                "body": "People is the shared registry used by fixed expenses and financings. Each person has a name, optional notes and an active state."
            },
            "how": {
                "title": "How it works",
                "body": "When you assign a person to a fixed expense or financing, you also set their share percentage. Each shared payment creates an allocation for every participant. The history shows the date, concept, percentage and amount of that person's share, including capital reductions and payments that reduce the installment."
            },
            "steps": {
                "title": "Step by step",
                "step1": "Open the People section and create the people you share expenses with.",
                "step2": "Add them as participants in a fixed expense or financing and set their percentages.",
                "step3": "Open a person's payment history to review their accumulated shared amount."
            },
            "example": {
                "title": "Example",
                "body": "A 1,000 rent is shared 50% with Ana. The record keeps 500 as your own amount and 500 as shared. Ana's history shows a 500 entry with the date and the rent concept."
            },
            "tips": {
                "title": "Tips",
                "body": "Keep the sum of participant percentages at 100% or less. Archive a person instead of deleting them when you want to keep their history."
            },
            "warning": {
                "title": "Common mistake",
                "body": "Deleting a person removes their shared links and payment history. If they are only temporarily inactive, archive them."
            }
        },
        "amountModes": {
            "title": "Your share, total and shared",
            "summary": "Choose how summaries, budgets and credits display amounts.",
            "what": {
                "title": "What it is",
                "body": "The amount mode has three options: your share, total and shared. Your share is what you really pay, shared is the part covered by other people and total is the sum of both."
            },
            "how": {
                "title": "How it works",
                "body": "The selector is available in Summaries, Commitments, Budgets and Credits. It changes the amounts shown in totals and in each category, payment method, payment type and record type bucket. It never changes the saved records. The selected mode is remembered the next time you open the app."
            },
            "steps": {
                "title": "Step by step",
                "step1": "Open a summary, budget or credit screen.",
                "step2": "Tap Your share, Total or Shared above the figures.",
                "step3": "Review the totals and buckets with the selected view."
            },
            "example": {
                "title": "Example",
                "body": "A 1,000 expense shared 50% shows 500 as your share, 500 as shared and 1,000 as total. On a budget, Your share compares 500 against the planned amount."
            },
            "tips": {
                "title": "Tips",
                "body": "Use Your share for your personal balance, Total to see the full commitment and Shared to review what others cover."
            },
            "warning": {
                "title": "Common mistake",
                "body": "Shared is not money you paid. Do not use it as your personal expense when reviewing your balance."
            }
        },
        "savings": {
            "title": "Savings",
            "summary": "Track shared accounts, goals, contributions and interest over time.",
            "what": {
                "title": "What it is",
                "body": "A saving is an account or goal with a global balance, an optional target amount, a monthly contribution rule and a history of movements. It can be shared with people from the global People registry. The global balance is split into your share and the other participants' share."
            },
            "how": {
                "title": "How it works",
                "body": "Every movement is typed: initial balance, deposit, withdrawal, interest or adjustment. You can assign a movement to a person or to your own share. Interest is distributed by participant percentage and the remainder stays in your share. When the saving has a goal, the app shows progress and projects the date with your actual contributions or with the expected contribution. The goal-reached alert appears inside the saving; the general list uses a metallic trophy. Archiving is manual and keeps the history. Tap a movement to open a read-only detail with its date, person, note, previous and new balance, and the linked record; movements cannot be edited."
            },
            "steps": {
                "title": "Step by step",
                "step1": "Create a saving with its name, initial amount and optional goal, participants and contribution rule.",
                "step2": "Register deposits, withdrawals, interest or adjustments. Choose a person when the movement belongs to a shared part.",
                "step3": "Review the global, own and shared progress, the goal projection and the movement history. Archive it when you no longer need it active."
            },
            "example": {
                "title": "Example",
                "body": "A 1,000 saving shared 50% with Ana shows 500 as your share and 500 as shared. If you register 100 of interest, 50 goes to Ana and 50 to your share. A goal of 2,000 with 200 monthly contributions projects ten months."
            },
            "tips": {
                "title": "Tips",
                "body": "Use a percentage of monthly income or a fixed amount as a suggested contribution; you can always edit the real amount. Keep the saving separate from Records if you only want to track the balance, or link a movement when you need the record to affect your monthly accounts."
            },
            "warning": {
                "title": "Common mistake",
                "body": "Interest is not a new deposit. Register it as interest so it is distributed correctly. Deleting a saving removes its movements and history; archive it instead when you want to keep the data."
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
                "body": "El ingreso suma al balance, el gasto resta y la transferencia mueve dinero entre métodos de pago. Los montos se guardan en centavos enteros. Un registro compartido guarda tu monto propio y separa la parte compartida, para que los balances personales solo usen lo que realmente pagas."
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
                "body": "En el día configurado, PocketTool te recuerda confirmarla. Al confirmar se crea el registro correspondiente en el grupo seleccionado. Los pagos pendientes de créditos y préstamos también aparecen en Registros; al abrirlos se carga el formulario de pago con su monto, fecha y datos del gasto. Un gasto fijo puede dividirse entre varias personas registradas en la sección Personas. Cuando es compartido, el registro guarda tu monto propio y la parte compartida por separado, y la parte de cada persona aparece en su historial de pagos."
            },
            "steps": {
                "title": "Paso a paso",
                "step1": "Crea una transacción fija y elige su día.",
                "step2": "Define tipo, categoría, método de pago y monto.",
                "step3": "Cuando aparezca en Registros, confírmala o registra un pago pendiente de crédito/préstamo."
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
                "body": "La app agrupa los registros y calcula totales. Los movimientos de crédito y débito se separan para ver la diferencia entre balance real y uso de crédito. El balance principal usa tu monto propio por defecto; el total y lo compartido se muestran por separado para que los gastos compartidos no inflen tu balance personal."
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
                "body": "Cada vehículo tiene unidades por defecto de distancia y volumen y un formato de consumo preferido. Las entradas de combustible y mantenimiento usan unidades explícitas, y el odómetro o la distancia se pueden ingresar o inferir. El odómetro efectivo se conserva a través de entradas con solo distancia, por lo que las lecturas posteriores y los recordatorios usan el historial completo. Al abrir la sección se usa el vehículo predeterminado."
            },
            "steps": {
                "title": "Paso a paso",
                "step1": "Agrega un vehículo y elige sus unidades por defecto.",
                "step2": "Registra combustible y mantenimiento desde sus pestañas.",
                "step3": "Revisa el resumen, los recordatorios y los históricos. Al crear un gasto, elige su tipo de registro; el valor por defecto viene de los ajustes de Vehículo."
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
                "body": "Una carga guarda fecha, odómetro o distancia, volumen, precio por unidad, total, estación y si el tanque quedó lleno. El volumen puede ser galones o litros y la distancia millas o kilómetros. El primer registro puede ser solo el odómetro como base."
            },
            "how": {
                "title": "Cómo funciona",
                "body": "Ingresa dos de tres valores entre volumen, precio por unidad y total; el tercero se calcula. El consumo se puede mostrar como mi/gal, km/gal, mi/L, km/L, L/100 km, gal/100 km, L/60 mi o gal/60 mi. Los segmentos de tanque lleno son el método más preciso; las cargas parciales se acumulan hasta el siguiente tanque lleno. Cualquier carga registrada con distancia en lugar de odómetro se infiere desde la lectura anterior, incluidos los tanques llenos, y las entradas mixtas conservan su orden de creación cuando comparten la misma fecha. La pantalla de combustible muestra gráficos de rendimiento, volumen, precio y total gastado agrupados por segmento de tanque lleno, además de una comparativa normalizada de volumen, distancia y costo total."
            },
            "steps": {
                "title": "Paso a paso",
                "step1": "Elige el vehículo, la fecha y las unidades. El formulario recuerda las últimas unidades de volumen y odómetro guardadas para ese vehículo. Si es el primer registro, puedes anotar solo el odómetro como base.",
                "step2": "Ingresa odómetro o distancia y dos de volumen, precio y total. Una carga parcial puede dejar el odómetro/distancia vacío o en 0.",
                "step3": "Marca tanque lleno, elige crear o vincular un gasto y guarda."
            },
            "example": {
                "title": "Ejemplo",
                "body": "8.5399 galones y 300 millas dan aproximadamente 35.1 mi/gal. Una base de 1,000 millas y un tanque lleno a 1,300 millas inician el primer segmento. Una carga parcial sin odómetro reutiliza la lectura anterior y solo suma su volumen."
            },
            "tips": {
                "title": "Consejos",
                "body": "Usa el odómetro base solo una vez, cuando el vehículo no tenga historial de combustible. Al cambiar la unidad de volumen se convierte el precio mostrado para que el total siga siendo coherente. Usa el selector de unidad de volumen y precio para ver el precio medio por litro o por galón."
            },
            "warning": {
                "title": "Error común",
                "body": "Una carga parcial no es un error, pero su consumo no es definitivo hasta el siguiente tanque lleno. La base no es un gasto ni suma volumen de combustible."
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
                "body": "Los métodos de pago pueden tener fecha de corte, fecha de pago y límite de crédito. Los movimientos de crédito se organizan por mes y método, y las compras a plazo al 0% activas reducen el crédito disponible por su saldo pendiente."
            },
            "steps": {
                "title": "Paso a paso",
                "step1": "Crea un método de pago de crédito con fechas de corte y pago.",
                "step2": "Agrega gastos y pagos de crédito con ese método, o vincula una compra a plazo al 0% con la tarjeta.",
                "step3": "Abre Créditos para revisar montos actuales, anteriores, pendientes, crédito en uso y disponible."
            },
            "example": {
                "title": "Ejemplo",
                "body": "Una tarjeta con límite de 2,000 tiene 800 en gastos y una compra a plazo pendiente de 600. El crédito en uso es 1,400 y el disponible es 600."
            },
            "tips": {
                "title": "Consejos",
                "body": "Mantén las fechas de corte y pago correctas y vincula las compras a plazo al 0% con la tarjeta que las financió."
            },
            "warning": {
                "title": "Error común",
                "body": "Los gastos a crédito y los pagos de crédito son movimientos distintos. Revisa ambos, y también las compras a plazo pendientes, antes de asumir que un saldo está liquidado."
            }
        },
        "financings": {
            "title": "Financiamientos",
            "summary": "Controla compras a plazo, préstamos, pagos, refinanciamientos y simulaciones.",
            "what": {
                "title": "Qué es",
                "body": "Un financiamiento guarda el monto original, el monto financiado, la tasa, el plazo y el calendario de cuotas. Puede representar una compra a plazo, un préstamo bancario, hipotecario, automotriz o una deuda compartida."
            },
            "how": {
                "title": "Cómo funciona",
                "body": "El saldo se deriva del monto financiado, las cuotas ya pagadas, el capital abonado antes de usar la app, los pagos registrados y los abonos a capital. Puedes ingresar el plazo en meses o años. Puedes usar la cuota calculada o ingresar la pactada; si un pago es mayor, la diferencia se registra como seguro u otros cargos, no como capital ni interés. Una compra a plazo al 0% vinculada a una tarjeta también reduce el crédito disponible de esa tarjeta por su saldo pendiente. Los préstamos compartidos pueden dividirse entre varias personas registradas en la sección Personas. Los pagos y abonos a capital mantienen el movimiento completo de la deuda en el financiamiento, pero en Registros guardan solo tu parte propia y rastrean la parte compartida por persona."
            },
            "steps": {
                "title": "Paso a paso",
                "step1": "Crea el financiamiento con monto, tasa, plazo en meses o años, primera cuota y método de pago.",
                "step2": "Registra cada pago, incluyendo abonos a capital o un extra para reducir la cuota. Puedes crear, vincular u omitir un Registro para ese pago.",
                "step3": "Revisa el historial de pagos y los gráficos de saldo y composición, y usa Refinanciar o Simular para comparar cambios."
            },
            "example": {
                "title": "Ejemplo",
                "body": "Una compra de 1,200 al 0% a 12 meses empieza con cuota de 100. Después de 4 pagos el saldo es 800 y, si la tarjeta la financió, ese saldo pendiente reduce el crédito disponible de la tarjeta."
            },
            "tips": {
                "title": "Consejos",
                "body": "Registra los pagos cerca de su fecha real para que el saldo, los intereses y la fecha de término se mantengan correctos. Guarda los escenarios de simulación importantes para compararlos después."
            },
            "warning": {
                "title": "Error común",
                "body": "Un pago extra puede reducir el plazo o la cuota. Elige la estrategia antes de guardar y no registres la misma compra dos veces como gasto de tarjeta y como financiamiento."
            }
        },
        "people": {
            "title": "Personas",
            "summary": "Gestiona las personas con las que compartes gastos y revisa su historial de pagos.",
            "what": {
                "title": "Qué es",
                "body": "Personas es el registro compartido que usan los gastos fijos y los financiamientos. Cada persona tiene nombre, notas opcionales y un estado activo o inactivo."
            },
            "how": {
                "title": "Cómo funciona",
                "body": "Cuando asignas una persona a un gasto fijo o financiamiento también defines su porcentaje. Cada pago compartido genera una asignación por participante. El historial muestra la fecha, el concepto, el porcentaje y el monto de la parte de esa persona, incluidos los abonos a capital y los pagos que reducen la cuota."
            },
            "steps": {
                "title": "Paso a paso",
                "step1": "Abre la sección Personas y crea las personas con las que compartes gastos.",
                "step2": "Agrégalas como participantes en un gasto fijo o financiamiento y define sus porcentajes.",
                "step3": "Abre el historial de pagos de una persona para revisar su monto compartido acumulado."
            },
            "example": {
                "title": "Ejemplo",
                "body": "Una renta de 1,000 se comparte al 50% con Ana. El registro guarda 500 como tu parte y 500 como compartido. El historial de Ana muestra un movimiento de 500 con la fecha y el concepto de la renta."
            },
            "tips": {
                "title": "Consejos",
                "body": "Mantén la suma de porcentajes en 100% o menos. Archiva a una persona en lugar de eliminarla cuando quieras conservar su historial."
            },
            "warning": {
                "title": "Error común",
                "body": "Eliminar a una persona quita sus vínculos compartidos y su historial de pagos. Si solo está inactiva temporalmente, archívala."
            }
        },
        "amountModes": {
            "title": "Tu parte, total y compartido",
            "summary": "Elige cómo muestran los importes los resúmenes, presupuestos y créditos.",
            "what": {
                "title": "Qué es",
                "body": "El modo de importe tiene tres opciones: tu parte, total y compartido. Tu parte es lo que realmente pagas, compartido es lo que cubren otras personas y total es la suma de ambos."
            },
            "how": {
                "title": "Cómo funciona",
                "body": "El selector está disponible en Resúmenes, Compromisos, Presupuestos y Créditos. Cambia los importes de los totales y de cada bucket de categoría, método de pago, tipo de pago y tipo de registro. Nunca modifica los registros guardados. El modo elegido se recuerda la próxima vez que abras la app."
            },
            "steps": {
                "title": "Paso a paso",
                "step1": "Abre una pantalla de resumen, presupuesto o créditos.",
                "step2": "Toca Tu parte, Total o Compartido encima de las cifras.",
                "step3": "Revisa los totales y los buckets con la vista seleccionada."
            },
            "example": {
                "title": "Ejemplo",
                "body": "Un gasto de 1,000 compartido al 50% muestra 500 como tu parte, 500 como compartido y 1,000 como total. En un presupuesto, Tu parte compara 500 contra el monto planificado."
            },
            "tips": {
                "title": "Consejos",
                "body": "Usa Tu parte para tu balance personal, Total para ver el compromiso completo y Compartido para revisar lo que cubren otras personas."
            },
            "warning": {
                "title": "Error común",
                "body": "Compartido no es dinero que pagaste. No lo uses como tu gasto personal al revisar tu balance."
            }
        },
        "savings": {
            "title": "Ahorros",
            "summary": "Sigue cuentas compartidas, metas, aportes e intereses a lo largo del tiempo.",
            "what": {
                "title": "Qué es",
                "body": "Un ahorro es una cuenta o meta con un saldo global, una meta opcional, una regla de aporte mensual y un historial de movimientos. Puede compartirse con personas del registro global de Personas. El saldo global se separa en tu parte y la de las otras personas."
            },
            "how": {
                "title": "Cómo funciona",
                "body": "Cada movimiento tiene tipo: saldo inicial, aporte, retiro, interés o ajuste. Puedes asignar un movimiento a una persona o a tu propia parte. Los intereses se reparten por porcentaje de participantes y el remanente queda en tu parte. Cuando el ahorro tiene meta, la app muestra el progreso y proyecta la fecha con tus aportes reales o con el aporte esperado. La alerta de meta alcanzada aparece dentro del ahorro; la lista general usa un trofeo metálico. El archivo es manual y conserva el historial. Toca un movimiento para abrir un detalle de solo lectura con fecha, persona, nota, saldo anterior y nuevo, y el registro vinculado; los movimientos no se pueden editar."
            },
            "steps": {
                "title": "Paso a paso",
                "step1": "Crea un ahorro con nombre, monto inicial y, si quieres, meta, participantes y regla de aporte.",
                "step2": "Registra aportes, retiros, intereses o ajustes. Elige una persona cuando el movimiento corresponda a una parte compartida.",
                "step3": "Revisa el progreso global, propio y compartido, la proyección de la meta y el historial. Archívalo cuando ya no necesites mantenerlo activo."
            },
            "example": {
                "title": "Ejemplo",
                "body": "Un ahorro de 1,000 compartido al 50% con Ana muestra 500 como tu parte y 500 como compartido. Si registras 100 de interés, 50 van a Ana y 50 a tu parte. Una meta de 2,000 con aportes de 200 al mes proyecta diez meses."
            },
            "tips": {
                "title": "Consejos",
                "body": "Usa un porcentaje de los ingresos del mes o un monto fijo como aporte sugerido; siempre puedes editar el monto real. Mantén el ahorro separado de Registros si solo quieres seguir el saldo, o vincula un movimiento cuando necesites que el registro afecte tus cuentas del mes."
            },
            "warning": {
                "title": "Error común",
                "body": "El interés no es un aporte nuevo. Regístralo como interés para que se reparta correctamente. Eliminar un ahorro borra sus movimientos e historial; archívalo si quieres conservar los datos."
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
