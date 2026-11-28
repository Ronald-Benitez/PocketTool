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
        "open": "Open topic",
        "whatsNewTitle": "What's new",
        "whatsNewSubtitle": "Review everything added in recent updates."
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
        "dashboard": {
            "title": "Home dashboard",
            "summary": "See your group at a glance and jump to what matters.",
            "what": {
                "title": "What it is",
                "body": "Home is a dashboard with blocks for balance, pending items, budget, savings, people, recent records, credits, vehicle and closing. Each block is a shortcut to its module."
            },
            "how": {
                "title": "How it works",
                "body": "Only blocks whose module is enabled are shown. The capture button opens a new record and can also offer fixed expenses, savings or groups. Order and visibility are saved on this device."
            },
            "steps": {
                "title": "Step by step",
                "step1": "Select the group you want to review.",
                "step2": "Read a block or tap See all to open its module.",
                "step3": "Use the capture button to add a record or a configured action."
            },
            "example": {
                "title": "Example",
                "body": "Your dashboard shows a 2,500 balance, a card payment due in two days and 500 in savings. Tap the card row to open Credits or the savings block to open Savings."
            },
            "tips": {
                "title": "Tips",
                "body": "Hide blocks you do not use and keep the ones you check every day. The savings block lets you choose which savings count toward its total. The layout is stored with your backup."
            },
            "warning": {
                "title": "Common mistake",
                "body": "If a module is disabled in Experience, its block is hidden even if it was visible before. Enable the module to use it again."
            }
        },
        "whatsNew": {
            "title": "What's new",
            "summary": "See everything that changed after each update.",
            "what": {
                "title": "What it is",
                "body": "A summary of the new features, improvements and fixes included in PocketTool updates."
            },
            "how": {
                "title": "How it works",
                "body": "PocketTool compares the installed version with the last version you saw. If there are pending updates, it shows one summary with all of them when you open the app."
            },
            "steps": {
                "title": "Step by step",
                "step1": "Update PocketTool from the store.",
                "step2": "Open the app and read the accumulated summary.",
                "step3": "Tap Got it to mark the version as seen."
            },
            "example": {
                "title": "Example",
                "body": "You had not opened version 4.0.5 and now update to 4.0.6. The summary shows the changes of both versions together."
            },
            "tips": {
                "title": "Tips",
                "body": "You can reopen the summary at any time from Help center, in the What's new section."
            },
            "warning": {
                "title": "Common mistake",
                "body": "Closing the summary marks the version as seen. If you want to read it again, open it from Help center."
            }
        },
        "groups": {
            "title": "Groups",
            "summary": "Understand the period container that holds all your data.",
            "what": {
                "title": "What it is",
                "body": "A group represents a period. It stores the goal, the balance, and the data used by records, budgets, and summaries. By default the period is a calendar month, but it can start on a specific day, such as the 18th."
            },
            "how": {
                "title": "How it works",
                "body": "The selected group drives the whole app. Switching groups changes the visible records and totals. In Settings → Groups you can enable automatic creation: when the app opens it creates the group for the current period, but only if no group already covers today. Groups and closings share the same period. Pending fixed and card dates use the group period, not a fixed calendar month."
            },
            "steps": {
                "title": "Step by step",
                "step1": "Open Settings → Groups and choose the period.",
                "step2": "Turn on automatic creation or create a group from Records.",
                "step3": "Select or pin the group you want to use."
            },
            "example": {
                "title": "Example",
                "body": "With start day 18, the October group runs from October 18 to November 17. November 18 starts the next group."
            },
            "tips": {
                "title": "Tips",
                "body": "Use automatic creation so a new period never starts without a group."
            },
            "warning": {
                "title": "Common mistake",
                "body": "Deleting a group also deletes its associated records. Changing the period does not move existing records; review them after saving."
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
                "body": "Income adds to the balance, expense subtracts, and transfer moves money between payment methods. Amounts are stored as integer cents. A shared record keeps your own amount in the record and the shared portion separately, so personal balances only use what you really pay. Pending card payments can use today's date, the card payment day inside the group month, or the next card payment day calculated from today; choose it in Settings. When you open an existing record, its source is shown with a preview (saving, fuel, maintenance, financing, shopping list or credit) and a shortcut to open that module."
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
                "body": "On the configured day, PocketTool reminds you to confirm it. Confirming creates the corresponding record for the selected group. The proposed date can follow the group month or the next occurrence of the fixed day from today; Settings also decides whether a fixed is considered paid by the selected group or by the period of the proposed date. Home uses the same settings and shows the reminder when the resolved date is today. Pending credit and loan payments also appear in Records; opening one loads the payment form with its amount, date and expense data. A fixed expense can be split among several people registered in the People section. When it is shared, the record stores your own amount and the shared portion separately, and each person's share appears in their payment history."
            },
            "steps": {
                "title": "Step by step",
                "step1": "Create a fixed transaction and choose its day.",
                "step2": "Set type, category, payment method, and amount.",
                "step3": "When it appears in Records, confirm it or register a pending credit/loan payment."
            },
            "example": {
                "title": "Example",
                "body": "Rent of 3,000 on day 5. On October 5 it appears as a reminder; confirming it creates the October expense. If today is October 25 and the next occurrence mode is active, the proposed date is November 5."
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
        "closing": {
            "title": "Period closing",
            "summary": "Compare cards, available money and payments without changing real data.",
            "what": {
                "title": "What it is",
                "body": "A closing is an informational calculation for a period. It compares the money you have, your card statements and your pending payments, then shows a shortfall or surplus. It never changes records, debts, savings or balances."
            },
            "how": {
                "title": "How it works",
                "body": "You can autofill the balance, cards, fixed payments and financings, or add manual lines with add and subtract. When adding a line, attach a registered card, account, fixed payment or financing, or leave it manual; items already added are hidden to avoid duplicates. Choose which balance to use (consumption, total, cash, paid or payment methods) before autofilling. Cards store an expected amount and an editable statement amount, so discounts, cashback and returns can explain the difference. The period comes from the group and is shared with closings; you can adjust it per closing when allowed, with grace days. Closings are usually created when the period ends, but you can create one earlier. Expired closings become read-only. You can keep several drafts but only one final closing per group. Savings are not included automatically; add them as manual lines only if you use them in the calculation."
            },
            "steps": {
                "title": "Step by step",
                "step1": "Select a group and create a closing, or open a draft.",
                "step2": "Autofill data, adjust card statement amounts and add manual lines.",
                "step3": "Cover a shortfall or assign a surplus, then save a draft or finalize."
            },
            "example": {
                "title": "Example",
                "body": "You have 3,500 available. Visa expects 4,000 but the statement says 3,800, plus a 1,000 fixed payment and an 800 financing payment. Obligations are 5,600 and the shortfall is 2,100. You cover 1,500 from other available money and leave 600 for the next period."
            },
            "tips": {
                "title": "Tips",
                "body": "Use grace days if you close after the month ends. Duplicate a closing to reuse its structure next period."
            },
            "warning": {
                "title": "Common mistake",
                "body": "A closing is only a calculation. Finalizing it does not pay cards, move savings or create records. Once its deadline passes, neither drafts nor finals can be edited."
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
                "body": "The app groups records and calculates totals. Use Consumption to see your share of every expense and Cash to see what you actually paid and received, including settlements. Credit and debit movements are separated so you can see the difference between consumption and credit usage. The amount selector changes the consumption view; cash is a single amount."
            },
            "steps": {
                "title": "Step by step",
                "step1": "Select a group.",
                "step2": "Open Summary or a specific summary tab.",
                "step3": "Tap a row to see its records and refine with filters."
            },
            "example": {
                "title": "Example",
                "body": "If income is 5,000 and expenses are 1,250, the consumption balance is 3,750. If a 1,000 purchase was paid by another person, your consumption still includes your 500 share, but your cash balance does not subtract it. The category summary shows where the expenses came from."
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
        "charts": {
            "title": "Charts",
            "summary": "Read the native charts and keep them out of the way.",
            "what": {
                "title": "What it is",
                "body": "A chart turns the selected period into lines, bars, pies or areas. It only reads data; it never changes records, balances or goals."
            },
            "how": {
                "title": "How it works",
                "body": "Each chart has a visible legend, axes and a tap detail. You can hide series, limit points, zoom, or open the data table for exact values. Some charts let you switch between an indexed comparison and raw values. Charts can be collapsed and the choice is remembered. In Fuel, charts start collapsed so records stay close."
            },
            "steps": {
                "title": "Step by step",
                "step1": "Open a section with charts.",
                "step2": "Expand the chart you need and tap a point, bar or slice.",
                "step3": "Use View data for exact values or collapse it again."
            },
            "example": {
                "title": "Example",
                "body": "In Budget, the comparison chart shows planned vs actual by category. Tap a bar to see its value; open View data to read all numbers."
            },
            "tips": {
                "title": "Tips",
                "body": "Collapse charts you do not need; the app remembers it. Use the data table for exact amounts."
            },
            "warning": {
                "title": "Common mistake",
                "body": "A projection is an estimate, not a commitment. Charts never modify your data."
            }
        },
        "budgets": {
            "title": "Budgets",
            "summary": "Plan the group period, compare it with real records and project the expected end balance.",
            "what": {
                "title": "What it is",
                "body": "A budget is a plan for the group period with income lines, expense lines and fixed commitments. Each line stores a planned amount, but the actual amount always comes from the records of the same group."
            },
            "how": {
                "title": "How it works",
                "body": "The app compares planned and actual amounts by category and record type using the group period, not a fixed calendar month. It shows the current net, expected end balance for consumption and cash, remaining income and expenses, days left and a daily allowance. Consumption follows the selected amount mode. Cash adds pending fixed commitments, active financings, vehicle reminders that will fall due, own savings contributions and pending card payments, avoiding duplicates with plan lines and records. Expenses paid from a savings account do not count as monthly consumption. Drag the handle on a line to change its order. Savings linked to Records appear as suggestions to include in the plan. Projection is an estimate, not a commitment."
            },
            "steps": {
                "title": "Step by step",
                "step1": "Select the group and create a plan from scratch, a template, the previous period, fixed transactions or the average of selected groups.",
                "step2": "Add income and expense lines with amount, priority and notes. Open a line to view its records or edit it.",
                "step3": "Review the expected consumption and cash balances, the obligations breakdown and the signals, then adjust lines before the period ends."
            },
            "example": {
                "title": "Example",
                "body": "A period plans 3,000 income and 2,000 expenses. With 1,200 income and 900 expenses recorded, the expected consumption balance is 1,300. If 300 of fixed expenses are still pending and a 200 financing payment is due, the cash projection subtracts them. A savings-paid purchase is shown as excluded from monthly consumption."
            },
            "tips": {
                "title": "Tips",
                "body": "Add income lines when you want to project future income. Review the obligations breakdown to understand the cash number. The expected end balance is compared with the current balance, so you can see the projected gap. Use the group average when spending is stable and templates when you want a fixed structure."
            },
            "warning": {
                "title": "Common mistake",
                "body": "The modes Shared and Paid are not a consumption balance. The cash projection is the reference for available money. A fixed transaction is a commitment, not an expense: it only affects the actual amount after a record is created. Vehicle reminders with no cost history show zero until you add a line."
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
                "body": "Enter any two of volume, price per unit and total; the third is calculated. Consumption can be shown as mi/gal, km/gal, mi/L, km/L, L/100 km, gal/100 km, L/60 mi or gal/60 mi. Full-tank segments are the most accurate method; partial fills accumulate until the next full tank. Any fill recorded with distance instead of odometer is inferred from the previous reading, including full tanks, and mixed entries keep their creation order when they share the same date. Each segment shows its total distance traveled. The fuel screen shows performance, volume, price and total spend charts grouped by full-tank segment, plus a normalized comparison of volume, distance and total cost."
            },
            "steps": {
                "title": "Step by step",
                "step1": "Choose the vehicle, date and units. The form remembers the last volume and odometer units and the last odometer/distance mode for that vehicle. If it is the first entry, you can record only the odometer as a baseline.",
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
                "body": "People is the shared registry used by fixed expenses, financings and savings. Each person has a name, optional notes and an active state."
            },
            "how": {
                "title": "How it works",
                "body": "When you assign a person to a fixed expense, financing, savings goal or a shared purchase, you also set their share percentage. Each shared payment creates an allocation or statement entry for every participant, and savings movements record who contributed or withdrew. The statement shows the total paid by you, the total paid by the person, the purchases and payments, and the net balance with its direction. Financing shares are informational and do not affect the new balance; savings stay separate."
            },
            "steps": {
                "title": "Step by step",
                "step1": "Open the People section and create the people you share expenses with.",
                "step2": "Add them as participants in a fixed expense, financing or saving and set their percentage or fixed amount (savings use percentage only).",
                "step3": "Open a person's payment history to review their accumulated shared amount and savings contributions."
            },
            "example": {
                "title": "Example",
                "body": "A 1,000 rent is shared 50% with Ana. If you paid the total, the record keeps 500 as your own amount and 500 as shared, and Ana's statement shows that she owes you 500. If Ana paid, your statement shows that you owe her 500. In a saving shared 50%, Ana's deposits appear separately and count toward her share of the balance."
            },
            "tips": {
                "title": "Tips",
                "body": "Keep the assigned sum within the total. Percentages are calculated over the total and fixed amounts cannot exceed the remainder. Archive a person instead of deleting them when you want to keep their history."
            },
            "warning": {
                "title": "Common mistake",
                "body": "Deleting a person removes their shared links and payment history. If they are only temporarily inactive, archive them."
            }
        },
        "sharedPurchases": {
            "title": "Shared purchases",
            "summary": "Share a purchase with people you already track and record who paid.",
            "what": {
                "title": "What it is",
                "body": "A shared purchase is a single record whose total is split between your share and the shares of the people you select. It also records whether you or one of those people paid the total."
            },
            "how": {
                "title": "How it works",
                "body": "Set the total purchase, add participants with a percentage or a fixed amount, and choose who paid. A new participant inherits the previous participant's share type. Both percentages and amounts are calculated over the total, and the app blocks the save if the assigned sum exceeds it. If you paid the total, each participant owes you their share. If another participant paid the total, your share becomes a debt with that person. The person statement shows the total paid by each side, the net balance and a movement history. Fixed expenses also ask whether you paid the total, only your share, or another person paid. Financing shares stay informational and savings stay separate."
            },
            "steps": {
                "title": "Step by step",
                "step1": "Create or open an expense record and enter the total purchase.",
                "step2": "Add the people with a percentage or a fixed amount, then choose who paid.",
                "step3": "Open the person's statement to review the total paid by each side and the balance."
            },
            "example": {
                "title": "Example",
                "body": "A 1,000 purchase is shared 50% with Ana. If you paid, Ana owes you 500. If Ana paid, you owe her 500. The statement shows 1,000 paid by you or by Ana and the 500 balance."
            },
            "tips": {
                "title": "Tips",
                "body": "Keep the assigned sum within the total. Percentages are calculated over the total and fixed amounts cannot exceed the remainder. Enter the total purchase, not only your share, so the statement knows what each side actually paid."
            },
            "warning": {
                "title": "Common mistake",
                "body": "Do not record the same purchase twice. If Ana paid, record it once, mark her as the payer and let the debt appear in the statement."
            }
        },
        "settlements": {
            "title": "Settlements",
            "summary": "Register payments between you and a person and carry pending balances into a new group.",
            "what": {
                "title": "What it is",
                "body": "A settlement is a payment that reduces the balance between you and a person. It can be partial and can be assigned to the previous group or to the new one."
            },
            "how": {
                "title": "How it works",
                "body": "From a person's statement use Register payment, choose the direction, amount, date and group. Settlements affect the cash balance but not the consumption balance because the purchase was already recorded. When you create a group, PocketTool warns about pending balances and lets you settle them in the previous group, in the new group or carry them over."
            },
            "steps": {
                "title": "Step by step",
                "step1": "Open a person's statement and tap Register payment.",
                "step2": "Choose whether you paid or the person paid, enter the amount and select the group.",
                "step3": "When you create a new group, decide whether to settle pending balances or carry them over."
            },
            "example": {
                "title": "Example",
                "body": "Ana owes you 500. You register that she paid you 200; her balance becomes 300. When the next group is created, PocketTool shows the pending 300 and lets you settle it or carry it over."
            },
            "tips": {
                "title": "Tips",
                "body": "Settlements can be partial. Assign them to the group where the money moved so the cash balance stays accurate."
            },
            "warning": {
                "title": "Common mistake",
                "body": "Do not create a purchase record for a settlement; it would double count your consumption. Use Register payment."
            }
        },
        "amountModes": {
            "title": "Your share, shared, total and gross paid",
            "summary": "Choose how summaries, budgets and credits display amounts.",
            "what": {
                "title": "What it is",
                "body": "The amount mode has four options: your share, shared, total and gross paid. Your share is your part of every purchase. Shared is what other people owe you for purchases you paid, before settlements. Total is the full purchase regardless of who paid. Gross paid is income minus what you actually paid for purchases; settlements are not included."
            },
            "how": {
                "title": "How it works",
                "body": "The selector is available in Summaries, Commitments, Budgets and Credits. It changes the amounts shown in totals and in each category, payment method, payment type and record type bucket. It never changes the saved records. The selected mode is remembered the next time you open the app."
            },
            "steps": {
                "title": "Step by step",
                "step1": "Open a summary, budget or credit screen.",
                "step2": "Tap Your share, Shared, Total or Gross paid above the figures.",
                "step3": "Review the totals and buckets with the selected view."
            },
            "example": {
                "title": "Example",
                "body": "A 1,000 purchase shared 50% shows 500 as your share, 500 as shared and 1,000 as total. If you paid it, gross paid subtracts 1,000 from your income. If the other person paid it, gross paid does not subtract it, but total is still 1,000."
            },
            "tips": {
                "title": "Tips",
                "body": "Use Shared to see what other people owe you, Total to see the full purchase and Gross paid to see your income minus purchases paid, before settlements."
            },
            "warning": {
                "title": "Common mistake",
                "body": "Shared is not money you paid. Total is the full purchase (your share plus the shared amount), not your cash. Gross paid includes income and purchases paid but not settlements; cash balance adds settlements."
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
                "step1": "Create a saving with its name, initial amount (it can be 0) and optional goal, participants and contribution rule.",
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
        "shopping": {
            "title": "Shopping lists",
            "summary": "Plan purchases, check items and record the purchase.",
            "what": {
                "title": "What it is",
                "body": "A shopping list is a global to-do list with items that may have a price. A price of zero means the item has no price. Lists are not tied to a group; the group is chosen only when you create or link the purchase record. Checking an item marks progress and adds its price to the total."
            },
            "how": {
                "title": "How it works",
                "body": "Open lists can be renamed and their items added, edited, checked, reordered or deleted. Use the list selector to switch lists without growing the page or losing the item view. The total only sums checked items that have a price; if a checked item has no price, the total is marked as partial. Closing a list makes it read-only. From a closed list you can create a record with the calculated or manual amount, link an existing compatible record, or skip registration. The record link is unique per list and cannot be created twice. On Android you can scan a receipt: take a photo, review and correct the detected items, then create a closed list that opens the purchase form with the receipt total and date."
            },
            "steps": {
                "title": "Step by step",
                "step1": "Create a list and add items with an optional price, or scan a receipt on Android and review the detected items.",
                "step2": "Check the items you plan to buy and review the calculated or partial total.",
                "step3": "Close the list and choose create, link or skip to finish."
            },
            "example": {
                "title": "Example",
                "body": "A list with milk at 3.50, bread at 2.00 and a checked item without price shows 5.50 as a partial total. When you close it, you can create a 5.50 expense, type a different amount, link an existing expense on the same date, or close without a record."
            },
            "tips": {
                "title": "Tips",
                "body": "Use the calculated total as a starting point and adjust the amount for discounts or extra items. Linking requires the same amount and day and excludes records already used by vehicle, financings, savings, credits or another shopping list. When scanning, the receipt total is used for the record; the app only warns if the item sum differs."
            },
            "warning": {
                "title": "Common mistake",
                "body": "A closed list cannot be edited again. Check the items and prices before closing. Deleting a list keeps its record; deleting the record leaves the list closed and shows the link as missing."
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
        },
        "experience": {
            "title": "Experience levels",
            "summary": "Choose how many sections and options you see, and hide modules without deleting data.",
            "what": {
                "title": "What it is",
                "body": "The experience level controls which sections appear in the drawer and which advanced blocks are visible. It never changes calculations, records, or balances."
            },
            "how": {
                "title": "How it works",
                "body": "Essential shows the day-to-day basics. Balanced adds commitments, budget, and credits. Complete shows every module. You can also turn each module on or off, and the app adjusts dependencies automatically."
            },
            "steps": {
                "title": "Step by step",
                "step1": "Open Settings → Experience and choose Essential, Balanced, or Complete.",
                "step2": "Expand the modules to turn individual sections or capture improvements on or off.",
                "step3": "Use Restore complete experience to show everything again."
            },
            "example": {
                "title": "Example",
                "body": "A user who only logs income and expenses chooses Essential. Later they enable Credits and Budget without losing any data."
            },
            "tips": {
                "title": "Tips",
                "body": "Start simple. Enable a module when you need it; hidden modules keep their records."
            },
            "warning": {
                "title": "Common mistake",
                "body": "Hiding a module does not delete data. If you import a backup, the saved experience is applied automatically."
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
        "open": "Abrir tema",
        "whatsNewTitle": "Qué hay de nuevo",
        "whatsNewSubtitle": "Revisa todo lo agregado en las actualizaciones recientes."
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
        "dashboard": {
            "title": "Panel de Inicio",
            "summary": "Consulta tu grupo de un vistazo y salta a lo importante.",
            "what": {
                "title": "Qué es",
                "body": "Inicio es un panel con bloques de saldo, pendientes, presupuesto, ahorros, personas, movimientos recientes, créditos, vehículo y cierre. Cada bloque es un acceso directo a su módulo."
            },
            "how": {
                "title": "Cómo funciona",
                "body": "Solo se muestran los bloques cuyo módulo está activo. El botón de captura abre un registro nuevo y también puede ofrecer fijos, ahorros o grupos. El orden y la visibilidad se guardan en este dispositivo."
            },
            "steps": {
                "title": "Paso a paso",
                "step1": "Selecciona el grupo que quieres revisar.",
                "step2": "Lee un bloque o toca Ver todo para abrir su módulo.",
                "step3": "Usa el botón de captura para agregar un registro o una acción configurada."
            },
            "example": {
                "title": "Ejemplo",
                "body": "Tu panel muestra un saldo de 2,500, un pago de tarjeta dentro de dos días y 500 en ahorros. Toca la fila de la tarjeta para abrir Créditos o el bloque de ahorros para abrir Ahorros."
            },
            "tips": {
                "title": "Consejos",
                "body": "Oculta los bloques que no uses y conserva los que revisas a diario. El bloque de ahorros permite elegir qué ahorros cuentan para su total. El diseño se guarda con tu respaldo."
            },
            "warning": {
                "title": "Error común",
                "body": "Si un módulo está desactivado en Experiencia, su bloque se oculta aunque antes estuviera visible. Activa el módulo para volver a usarlo."
            }
        },
        "whatsNew": {
            "title": "Qué hay de nuevo",
            "summary": "Consulta todo lo que cambió después de cada actualización.",
            "what": {
                "title": "Qué es",
                "body": "Un resumen de las funciones nuevas, mejoras y correcciones incluidas en las actualizaciones de PocketTool."
            },
            "how": {
                "title": "Cómo funciona",
                "body": "PocketTool compara la versión instalada con la última versión que viste. Si hay actualizaciones pendientes, muestra un solo resumen con todas al abrir la app."
            },
            "steps": {
                "title": "Paso a paso",
                "step1": "Actualiza PocketTool desde la tienda.",
                "step2": "Abre la app y lee el resumen acumulado.",
                "step3": "Toca Entendido para marcar la versión como vista."
            },
            "example": {
                "title": "Ejemplo",
                "body": "No habías abierto la versión 4.0.5 y ahora actualizas a 4.0.6. El resumen muestra juntos los cambios de ambas versiones."
            },
            "tips": {
                "title": "Consejos",
                "body": "Puedes volver a abrir el resumen cuando quieras desde el Centro de ayuda, en la sección Qué hay de nuevo."
            },
            "warning": {
                "title": "Error común",
                "body": "Cerrar el resumen marca la versión como vista. Si quieres leerlo otra vez, ábrelo desde el Centro de ayuda."
            }
        },
        "groups": {
            "title": "Grupos",
            "summary": "Entiende el contenedor de periodo que guarda todos tus datos.",
            "what": {
                "title": "Qué es",
                "body": "Un grupo representa un periodo. Guarda la meta, el balance y los datos que usan registros, presupuestos y resúmenes. Por defecto el periodo es un mes calendario, pero puede empezar en un día específico, por ejemplo el 18."
            },
            "how": {
                "title": "Cómo funciona",
                "body": "El grupo seleccionado controla toda la app. Cambiar de grupo cambia los registros y totales visibles. En Ajustes → Grupos puedes activar la creación automática: al abrir la app se crea el grupo del periodo actual, pero solo si ningún grupo cubre hoy. Los grupos y los cierres comparten el mismo periodo. Las fechas de fijos y tarjetas pendientes usan el periodo del grupo, no un mes calendario fijo."
            },
            "steps": {
                "title": "Paso a paso",
                "step1": "Abre Ajustes → Grupos y elige el periodo.",
                "step2": "Activa la creación automática o crea un grupo desde Registros.",
                "step3": "Selecciona o fija el grupo que quieres usar."
            },
            "example": {
                "title": "Ejemplo",
                "body": "Con día de inicio 18, el grupo de octubre va del 18 de octubre al 17 de noviembre. El 18 de noviembre empieza el siguiente grupo."
            },
            "tips": {
                "title": "Consejos",
                "body": "Usa la creación automática para que un periodo nuevo nunca empiece sin grupo."
            },
            "warning": {
                "title": "Error común",
                "body": "Eliminar un grupo también elimina sus registros asociados. Cambiar el periodo no mueve los registros existentes; revísalos al guardar."
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
                "body": "El ingreso suma al balance, el gasto resta y la transferencia mueve dinero entre métodos de pago. Los montos se guardan en centavos enteros. Un registro compartido guarda tu monto propio y separa la parte compartida, para que los balances personales solo usen lo que realmente pagas. Los pagos pendientes de tarjeta pueden usar la fecha de hoy, el día de pago dentro del mes del grupo o el próximo día de pago calculado desde hoy; se elige en Configuraciones. Al abrir un registro existente se muestra su origen con una previsualización (ahorro, combustible, mantenimiento, financiamiento, lista de compras o crédito) y un acceso para abrir ese módulo."
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
                "body": "En el día configurado, PocketTool te recuerda confirmarla. Al confirmar se crea el registro correspondiente en el grupo seleccionado. La fecha propuesta puede seguir el mes del grupo o la próxima ocurrencia del día del fijo desde hoy; Configuraciones también decide si un fijo se considera pagado por el grupo seleccionado o por el periodo de la fecha propuesta. Inicio usa las mismas configuraciones y muestra el recordatorio cuando la fecha resuelta es hoy. Los pagos pendientes de créditos y préstamos también aparecen en Registros; al abrirlos se carga el formulario de pago con su monto, fecha y datos del gasto. Un gasto fijo puede dividirse entre varias personas registradas en la sección Personas. Cuando es compartido, el registro guarda tu monto propio y la parte compartida por separado, y la parte de cada persona aparece en su historial de pagos."
            },
            "steps": {
                "title": "Paso a paso",
                "step1": "Crea una transacción fija y elige su día.",
                "step2": "Define tipo, categoría, método de pago y monto.",
                "step3": "Cuando aparezca en Registros, confírmala o registra un pago pendiente de crédito/préstamo."
            },
            "example": {
                "title": "Ejemplo",
                "body": "Renta de 3,000 el día 5. El 5 de octubre aparece como recordatorio; al confirmar se crea el gasto de octubre. Si hoy es 25 de octubre y el modo de próxima ocurrencia está activo, la fecha propuesta es el 5 de noviembre."
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
        "closing": {
            "title": "Cierre de periodo",
            "summary": "Compara tarjetas, dinero disponible y pagos sin cambiar datos reales.",
            "what": {
                "title": "Qué es",
                "body": "Un cierre es un cálculo informativo de un periodo. Compara el dinero que tienes, los estados de cuenta de tus tarjetas y tus pagos pendientes, y muestra un faltante o un sobrante. Nunca modifica registros, deudas, ahorros ni saldos."
            },
            "how": {
                "title": "Cómo funciona",
                "body": "Puedes autocompletar el balance, tarjetas, pagos fijos y financiamientos, o agregar líneas manuales con suma y resta. Al agregar una línea, puedes vincular una tarjeta, cuenta, pago fijo o financiamiento registrado, o dejarla manual; los datos ya agregados se ocultan para evitar repetirlos. Elige qué balance usar (consumo, total, caja, pagado o métodos de pago) antes de autocompletar. Las tarjetas guardan un monto esperado y un monto real editable, para explicar diferencias por descuentos, cashback o devoluciones. El periodo viene del grupo y se comparte con los cierres; puedes ajustarlo por cierre si está permitido, con días de gracia. Lo normal es crear el cierre cuando el periodo termina, pero también puedes crearlo antes. Los cierres vencidos pasan a solo lectura. Puedes tener varios borradores, pero solo un cierre final por grupo. Los ahorros no se incluyen automáticamente; agrégalos como líneas manuales solo si los usas en el cálculo."
            },
            "steps": {
                "title": "Paso a paso",
                "step1": "Selecciona un grupo y crea un cierre, o abre un borrador.",
                "step2": "Autocompleta datos, ajusta los estados de cuenta y agrega líneas manuales.",
                "step3": "Cubre el faltante o asigna el sobrante, y guarda un borrador o finaliza."
            },
            "example": {
                "title": "Ejemplo",
                "body": "Tienes 3,500 disponibles. Visa espera 4,000 pero el estado de cuenta dice 3,800, más un fijo de 1,000 y un financiamiento de 800. Las obligaciones son 5,600 y el faltante es 2,100. Cubres 1,500 con otro dinero disponible y dejas 600 para el próximo periodo."
            },
            "tips": {
                "title": "Consejos",
                "body": "Usa días de gracia si cierras después de que termina el mes. Duplica un cierre para reutilizar su estructura en el siguiente periodo."
            },
            "warning": {
                "title": "Error común",
                "body": "Un cierre es solo un cálculo. Finalizarlo no paga tarjetas, no mueve ahorros y no crea registros. Cuando pasa su fecha límite, ni los borradores ni los finales se pueden editar."
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
                "body": "La app agrupa los registros y calcula totales. Usa Consumo para ver tu parte de cada gasto y Caja para ver lo que realmente pagaste y recibiste, incluidas las liquidaciones. Los movimientos de crédito y débito se separan para ver la diferencia entre consumo y uso de crédito. El selector de importe cambia la vista de consumo; caja es un solo monto."
            },
            "steps": {
                "title": "Paso a paso",
                "step1": "Selecciona un grupo.",
                "step2": "Abre Resumen o una pestaña de resumen específica.",
                "step3": "Toca una fila para ver sus registros y refinar con filtros."
            },
            "example": {
                "title": "Ejemplo",
                "body": "Si los ingresos son 5,000 y los gastos 1,250, el balance de consumo es 3,750. Si otra persona pagó una compra de 1,000, tu consumo sigue incluyendo tu parte de 500, pero tu balance de caja no la resta. El resumen por categoría muestra de dónde vienen los gastos."
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
        "charts": {
            "title": "Gráficos",
            "summary": "Lee los gráficos nativos y mantenlos fuera del camino.",
            "what": {
                "title": "Qué es",
                "body": "Un gráfico convierte el periodo seleccionado en líneas, barras, porciones o áreas. Solo lee datos; nunca cambia registros, saldos ni metas."
            },
            "how": {
                "title": "Cómo funciona",
                "body": "Cada gráfico tiene leyenda visible, ejes y detalle al tocar. Puedes ocultar series, limitar puntos, hacer zoom o abrir la tabla de datos para ver valores exactos. Algunos gráficos permiten cambiar entre comparación indexada y datos reales. Los gráficos se pueden colapsar y la elección se recuerda. En Combustible empiezan colapsados para dejar los registros a la vista."
            },
            "steps": {
                "title": "Paso a paso",
                "step1": "Abre una sección con gráficos.",
                "step2": "Expande el gráfico que necesites y toca un punto, barra o porción.",
                "step3": "Usa Ver datos para valores exactos o vuelve a colapsarlo."
            },
            "example": {
                "title": "Ejemplo",
                "body": "En Presupuesto, el gráfico de comparación muestra planificado vs real por categoría. Toca una barra para ver su valor; abre Ver datos para leer todos los números."
            },
            "tips": {
                "title": "Consejos",
                "body": "Colapsa los gráficos que no necesites; la app lo recuerda. Usa la tabla de datos para montos exactos."
            },
            "warning": {
                "title": "Error común",
                "body": "Una proyección es una estimación, no un compromiso. Los gráficos nunca modifican tus datos."
            }
        },
        "budgets": {
            "title": "Presupuestos",
            "summary": "Planifica el periodo del grupo, compáralo con los registros reales y proyecta el saldo esperado al cierre.",
            "what": {
                "title": "Qué es",
                "body": "Un presupuesto es un plan del periodo del grupo con líneas de ingreso, líneas de gasto y compromisos fijos. Cada línea guarda un monto planificado, pero el real siempre sale de los registros del mismo grupo."
            },
            "how": {
                "title": "Cómo funciona",
                "body": "La app compara lo planificado y lo real por categoría y tipo de registro usando el periodo del grupo, no un mes calendario fijo. Muestra el neto actual, el saldo esperado de consumo y de caja, los ingresos y gastos restantes, los días que quedan y el disponible por día. El consumo sigue el modo de importe elegido. La caja suma fijos pendientes, financiamientos activos, recordatorios de vehículo que caerán en el periodo, aportes propios a ahorros y pagos pendientes de tarjeta, evitando duplicados con las líneas del plan y los registros. Los gastos pagados desde un ahorro no cuentan como consumo del mes. Arrastra el asa de una línea para cambiar su orden. Los ahorros vinculados a Registros aparecen como sugerencias para incluir en el plan. La proyección es una estimación, no un compromiso."
            },
            "steps": {
                "title": "Paso a paso",
                "step1": "Selecciona el grupo y crea un plan desde cero, una plantilla, el periodo anterior, los fijos o la media de grupos seleccionados.",
                "step2": "Agrega líneas de ingreso y gasto con monto, prioridad y notas. Abre una línea para ver sus registros o editarla.",
                "step3": "Revisa el saldo esperado de consumo y caja, el desglose de obligaciones y las señales, y ajusta las líneas antes de que termine el periodo."
            },
            "example": {
                "title": "Ejemplo",
                "body": "Un periodo planifica 3,000 de ingreso y 2,000 de gasto. Con 1,200 de ingreso y 900 de gasto registrados, el saldo esperado de consumo es 1,300. Si quedan 300 de fijos pendientes y vence una cuota de financiamiento de 200, la proyección de caja los resta. Una compra pagada con ahorro se muestra excluida del consumo del mes."
            },
            "tips": {
                "title": "Consejos",
                "body": "Agrega líneas de ingreso cuando quieras proyectar ingresos futuros. Revisa el desglose de obligaciones para entender el número de caja. El saldo esperado al cierre se compara con el saldo actual para ver la diferencia proyectada. Usa la media de grupos cuando el gasto sea estable y plantillas cuando quieras una estructura fija."
            },
            "warning": {
                "title": "Error común",
                "body": "Los modos Compartido y Pagado no son un saldo de consumo. La proyección de caja es la referencia para el dinero disponible. Una transacción fija es un compromiso, no un gasto: solo afecta el real después de crear un registro. Los recordatorios de vehículo sin historial de costo muestran cero hasta que agregues una línea."
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
                "body": "Ingresa dos de tres valores entre volumen, precio por unidad y total; el tercero se calcula. El consumo se puede mostrar como mi/gal, km/gal, mi/L, km/L, L/100 km, gal/100 km, L/60 mi o gal/60 mi. Los segmentos de tanque lleno son el método más preciso; las cargas parciales se acumulan hasta el siguiente tanque lleno. Cualquier carga registrada con distancia en lugar de odómetro se infiere desde la lectura anterior, incluidos los tanques llenos, y las entradas mixtas conservan su orden de creación cuando comparten la misma fecha. Cada segmento muestra su distancia total recorrida. La pantalla de combustible muestra gráficos de rendimiento, volumen, precio y total gastado agrupados por segmento de tanque lleno, además de una comparativa normalizada de volumen, distancia y costo total."
            },
            "steps": {
                "title": "Paso a paso",
                "step1": "Elige el vehículo, la fecha y las unidades. El formulario recuerda las últimas unidades de volumen y odómetro y el último modo odómetro/distancia para ese vehículo. Si es el primer registro, puedes anotar solo el odómetro como base.",
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
                "body": "Personas es el registro compartido que usan los gastos fijos, los financiamientos y los ahorros. Cada persona tiene nombre, notas opcionales y un estado activo o inactivo."
            },
            "how": {
                "title": "Cómo funciona",
                "body": "Cuando asignas una persona a un gasto fijo, financiamiento, meta de ahorro o compra compartida también defines su porcentaje. Cada pago compartido genera una asignación o un movimiento en su estado de cuenta, y los movimientos del ahorro registran quién aportó o retiró. El estado de cuenta muestra el total pagado por ti, el total pagado por la persona, las compras y los pagos, y el saldo neto con su dirección. Los financiamientos son informativos y no afectan el nuevo saldo; los ahorros se mantienen aparte."
            },
            "steps": {
                "title": "Paso a paso",
                "step1": "Abre la sección Personas y crea las personas con las que compartes gastos.",
                "step2": "Agrégalas como participantes en un gasto fijo, financiamiento o ahorro y define su porcentaje o monto fijo (los ahorros usan solo porcentaje).",
                "step3": "Abre el historial de pagos de una persona para revisar su monto compartido acumulado y sus aportes a ahorros."
            },
            "example": {
                "title": "Ejemplo",
                "body": "Una renta de 1,000 se comparte al 50% con Ana. Si pagaste el total, el registro guarda 500 como tu parte y 500 como compartido, y el estado de cuenta de Ana muestra que te debe 500. Si pagó Ana, tu estado de cuenta muestra que le debes 500. En un ahorro compartido al 50%, los aportes de Ana aparecen aparte y cuentan para su parte del saldo."
            },
            "tips": {
                "title": "Consejos",
                "body": "Mantén la suma asignada dentro del total. Los porcentajes se calculan sobre el total y los montos fijos no pueden superar el resto. Archiva a una persona en lugar de eliminarla cuando quieras conservar su historial."
            },
            "warning": {
                "title": "Error común",
                "body": "Eliminar a una persona quita sus vínculos compartidos y su historial de pagos. Si solo está inactiva temporalmente, archívala."
            }
        },
        "sharedPurchases": {
            "title": "Compras compartidas",
            "summary": "Comparte una compra con personas que ya tienes registradas y guarda quién pagó.",
            "what": {
                "title": "Qué es",
                "body": "Una compra compartida es un solo registro cuyo total se reparte entre tu parte y las partes de las personas que elijas. También guarda si pagaste tú o una de esas personas."
            },
            "how": {
                "title": "Cómo funciona",
                "body": "Ingresa el total de la compra, agrega participantes con porcentaje o monto fijo y elige quién pagó. Un participante nuevo hereda el tipo de parte del anterior. Los porcentajes y los montos se calculan sobre el total y la app bloquea el guardado si la suma asignada lo supera. Si pagaste el total, cada participante te debe su parte. Si pagó otra persona el total, tu parte queda como deuda con ella. El estado de cuenta muestra el total pagado por cada lado, el saldo neto y el historial de movimientos. En los gastos fijos también se pregunta si pagaste el total, solo tu parte, o si pagó otra persona. Los financiamientos quedan como informativos y los ahorros se mantienen aparte."
            },
            "steps": {
                "title": "Paso a paso",
                "step1": "Crea o abre un registro de gasto e ingresa el total de la compra.",
                "step2": "Agrega las personas con porcentaje o monto fijo, y elige quién pagó.",
                "step3": "Abre el estado de cuenta de la persona para revisar el total pagado por cada lado y el saldo."
            },
            "example": {
                "title": "Ejemplo",
                "body": "Una compra de 1,000 se comparte al 50% con Ana. Si pagaste tú, Ana te debe 500. Si pagó Ana, tú le debes 500. El estado de cuenta muestra 1,000 pagados por ti o por Ana y el saldo de 500."
            },
            "tips": {
                "title": "Consejos",
                "body": "Mantén la suma asignada dentro del total. Los porcentajes se calculan sobre el total y los montos fijos no pueden superar el resto. Ingresa el total de la compra, no solo tu parte, para que el estado de cuenta sepa cuánto pagó cada lado."
            },
            "warning": {
                "title": "Error común",
                "body": "No registres la misma compra dos veces. Si pagó Ana, regístrala una vez, márcala como pagada por ella y deja que la deuda aparezca en el estado de cuenta."
            }
        },
        "settlements": {
            "title": "Liquidaciones",
            "summary": "Registra pagos entre tú y una persona y arrastra saldos pendientes al nuevo grupo.",
            "what": {
                "title": "Qué es",
                "body": "Una liquidación es un pago que reduce el saldo entre tú y una persona. Puede ser parcial y se puede asignar al grupo anterior o al nuevo."
            },
            "how": {
                "title": "Cómo funciona",
                "body": "Desde el estado de cuenta de una persona usa Registrar pago, elige la dirección, el monto, la fecha y el grupo. Las liquidaciones afectan el balance de caja pero no el de consumo, porque la compra ya está registrada. Al crear un grupo, PocketTool avisa de los saldos pendientes y permite liquidarlos en el grupo anterior, en el nuevo o darles seguimiento."
            },
            "steps": {
                "title": "Paso a paso",
                "step1": "Abre el estado de cuenta de una persona y toca Registrar pago.",
                "step2": "Elige si pagaste tú o si pagó la persona, ingresa el monto y selecciona el grupo.",
                "step3": "Al crear un grupo nuevo, decide si liquidar los saldos pendientes o darles seguimiento."
            },
            "example": {
                "title": "Ejemplo",
                "body": "Ana te debe 500. Registras que te pagó 200; su saldo queda en 300. Al crear el siguiente grupo, PocketTool muestra los 300 pendientes y permite liquidarlos o darles seguimiento."
            },
            "tips": {
                "title": "Consejos",
                "body": "Las liquidaciones pueden ser parciales. Asígnalas al grupo donde se movió el dinero para que el balance de caja sea exacto."
            },
            "warning": {
                "title": "Error común",
                "body": "No crees un registro de compra para una liquidación; duplicaría tu consumo. Usa Registrar pago."
            }
        },
        "amountModes": {
            "title": "Tu parte, compartido, total y propio bruto",
            "summary": "Elige cómo muestran los importes los resúmenes, presupuestos y créditos.",
            "what": {
                "title": "Qué es",
                "body": "El modo de importe tiene cuatro opciones: tu parte, compartido, total y propio bruto. Tu parte es lo que te corresponde de cada compra. Compartido es lo que otras personas te deben por las compras que pagaste, antes de liquidar. Total es la compra completa sin importar quién pagó. Propio bruto es el ingreso menos lo que realmente pagaste por compras; las liquidaciones no se incluyen."
            },
            "how": {
                "title": "Cómo funciona",
                "body": "El selector está disponible en Resúmenes, Compromisos, Presupuestos y Créditos. Cambia los importes de los totales y de cada bucket de categoría, método de pago, tipo de pago y tipo de registro. Nunca modifica los registros guardados. El modo elegido se recuerda la próxima vez que abras la app."
            },
            "steps": {
                "title": "Paso a paso",
                "step1": "Abre una pantalla de resumen, presupuesto o créditos.",
                "step2": "Toca Tu parte, Compartido, Total o Propio bruto encima de las cifras.",
                "step3": "Revisa los totales y los buckets con la vista seleccionada."
            },
            "example": {
                "title": "Ejemplo",
                "body": "Una compra de 1,000 compartida al 50% muestra 500 como tu parte, 500 como compartido y 1,000 como total. Si la pagaste tú, el propio bruto resta 1,000 de tus ingresos. Si la pagó la otra persona, el propio bruto no la resta, pero el total sigue siendo 1,000."
            },
            "tips": {
                "title": "Consejos",
                "body": "Usa Compartido para ver lo que te deben, Total para ver la compra completa y Propio bruto para ver tus ingresos menos las compras pagadas, antes de liquidaciones."
            },
            "warning": {
                "title": "Error común",
                "body": "Compartido no es dinero que pagaste. Total es la compra completa (tu parte más la parte compartida), no tu caja. Propio bruto incluye ingresos y compras pagadas, pero no liquidaciones; el balance de caja sí incluye las liquidaciones."
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
                "step1": "Crea un ahorro con nombre, monto inicial (puede ser 0) y, si quieres, meta, participantes y regla de aporte.",
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
        "shopping": {
            "title": "Listas de compras",
            "summary": "Planifica compras, marca artículos y registra la compra.",
            "what": {
                "title": "Qué es",
                "body": "Una lista de compras es una lista global tipo to-do con artículos que pueden tener precio. Un precio de cero significa que el artículo no tiene precio. Las listas no pertenecen a un grupo; el grupo se elige solo al crear o vincular el registro de compra. Marcar un artículo indica progreso y suma su precio al total."
            },
            "how": {
                "title": "Cómo funciona",
                "body": "Las listas abiertas se pueden renombrar y sus artículos se pueden agregar, editar, marcar, reordenar o eliminar. Usa el selector de listas para cambiar sin que la página crezca ni perder la vista de los artículos. El total suma solo los artículos marcados que tienen precio; si un artículo marcado no tiene precio, el total se muestra como parcial. Cerrar la lista la deja de solo lectura. Desde una lista cerrada puedes crear un registro con el monto calculado o manual, vincular un registro compatible existente u omitir el registro. El vínculo es único por lista y no se puede registrar dos veces. En Android puedes escanear una factura: toma una foto, revisa y corrige los artículos detectados, y crea una lista cerrada que abre el formulario de compra con el total y la fecha de la factura."
            },
            "steps": {
                "title": "Paso a paso",
                "step1": "Crea una lista y agrega artículos con precio opcional, o escanea una factura en Android y revisa los artículos detectados.",
                "step2": "Marca los artículos que vas a comprar y revisa el total calculado o parcial.",
                "step3": "Cierra la lista y elige crear, vincular u omitir para terminar."
            },
            "example": {
                "title": "Ejemplo",
                "body": "Una lista con leche a 3.50, pan a 2.00 y un artículo marcado sin precio muestra 5.50 como total parcial. Al cerrarla puedes crear un gasto de 5.50, escribir otro monto, vincular un gasto existente del mismo día o cerrar sin registro."
            },
            "tips": {
                "title": "Consejos",
                "body": "Usa el total calculado como punto de partida y ajusta el monto por descuentos o artículos extra. Vincular exige el mismo monto y día, y excluye registros ya usados por vehículo, financiamientos, ahorros, créditos u otra lista de compras. Al escanear, el total de la factura se usa para el registro; la app solo avisa si la suma de artículos no coincide."
            },
            "warning": {
                "title": "Error común",
                "body": "Una lista cerrada ya no se puede editar. Revisa artículos y precios antes de cerrar. Eliminar la lista conserva su registro; eliminar el registro deja la lista cerrada y muestra el vínculo como faltante."
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
        },
        "experience": {
            "title": "Niveles de experiencia",
            "summary": "Elige cuántas secciones y opciones ves, y oculta módulos sin borrar datos.",
            "what": {
                "title": "Qué es",
                "body": "El nivel de experiencia controla qué secciones aparecen en el menú y qué bloques avanzados se muestran. Nunca cambia cálculos, registros ni saldos."
            },
            "how": {
                "title": "Cómo funciona",
                "body": "Esencial muestra lo básico del día a día. Equilibrado añade compromisos, presupuestos y créditos. Completo muestra todos los módulos. También puedes activar o desactivar cada módulo, y la app ajusta las dependencias automáticamente."
            },
            "steps": {
                "title": "Paso a paso",
                "step1": "Abre Ajustes → Experiencia y elige Esencial, Equilibrado o Completo.",
                "step2": "Despliega los módulos para activar o desactivar secciones o mejoras de captura.",
                "step3": "Usa Restaurar experiencia completa para volver a mostrar todo."
            },
            "example": {
                "title": "Ejemplo",
                "body": "Un usuario que solo registra ingresos y gastos elige Esencial. Más adelante activa Créditos y Presupuestos sin perder ningún dato."
            },
            "tips": {
                "title": "Consejos",
                "body": "Empieza simple. Activa un módulo cuando lo necesites; los módulos ocultos conservan sus registros."
            },
            "warning": {
                "title": "Error común",
                "body": "Ocultar un módulo no borra datos. Si importas un backup, la experiencia guardada se aplica automáticamente."
            }
        }
    }
};
