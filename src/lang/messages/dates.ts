import type { MessageShape } from './types';

export const datesEn = {
    "months": {
        "0": "January",
        "1": "February",
        "2": "March",
        "3": "April",
        "4": "May",
        "5": "June",
        "6": "July",
        "7": "August",
        "8": "September",
        "9": "October",
        "10": "November",
        "11": "December"
    },
    "daysShort": {
        "0": "Sun",
        "1": "Mon",
        "2": "Tue",
        "3": "Wed",
        "4": "Thu",
        "5": "Fri",
        "6": "Sat"
    },
    "daysLong": {
        "0": "Sunday",
        "1": "Monday",
        "2": "Tuesday",
        "3": "Wednesday",
        "4": "Thursday",
        "5": "Friday",
        "6": "Saturday"
    },
    "datePicker": {
        "today": "Today",
        "cancel": "Close",
        "previousMonth": "Previous month",
        "nextMonth": "Next month",
        "previousYear": "Previous year",
        "nextYear": "Next year",
        "openCalendar": "Open calendar"
    }
} as const;

export const datesEs: MessageShape<typeof datesEn> = {
    "months": {
        "0": "Enero",
        "1": "Febrero",
        "2": "Marzo",
        "3": "Abril",
        "4": "Mayo",
        "5": "Junio",
        "6": "Julio",
        "7": "Agosto",
        "8": "Septiembre",
        "9": "Octubre",
        "10": "Noviembre",
        "11": "Diciembre"
    },
    "daysShort": {
        "0": "Dom",
        "1": "Lun",
        "2": "Mar",
        "3": "Mié",
        "4": "Jue",
        "5": "Vie",
        "6": "Sáb"
    },
    "daysLong": {
        "0": "Domingo",
        "1": "Lunes",
        "2": "Martes",
        "3": "Miércoles",
        "4": "Jueves",
        "5": "Viernes",
        "6": "Sábado"
    },
    "datePicker": {
        "today": "Hoy",
        "cancel": "Cerrar",
        "previousMonth": "Mes anterior",
        "nextMonth": "Mes siguiente",
        "previousYear": "Año anterior",
        "nextYear": "Año siguiente",
        "openCalendar": "Abrir calendario"
    }
};
