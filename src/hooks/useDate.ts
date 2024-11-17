import { useLanguage } from '@/src/lang/LanguageContext';

export interface DateHandler {
  date: string;
  create: (d?: string) => string;
  months: string[];
  days: string[];
  getStringDay: (d: string) => string;
  getMonth: (d: string) => number;
  getMonthComplete: (d: string) => string;
  getYear: (d: string) => number;
  getDay: (d: string) => number;
  getStringMonthAndYear: (d: string) => string;
  getDaysInMonth: (d: string) => number;
  getStringDate: (d: string) => string;
  subtract: (days: number, d?: string) => void;
  add: (days: number, d: string) => void;
  getStringMonth: (d: string) => string;
  changeMonth: (month: number, d: string) => void;
  changeYear: (year: number, d: string) => void;
  changeDay: (day: number, d: string) => void;
  firtsDayOfMonth: (d: string) => number;
  lastDayOfMonth: (d: string) => number;
}

export default function useDate() {
  const { t } = useLanguage();

  const create = (dateValue?: string) => {
    const base = dateValue ? new Date(dateValue) : new Date();
    const value = base.toLocaleDateString();
    const newDate = value.split("/");
    if (newDate[0].length === 1) newDate[0] = `0${newDate[0]}`;
    if (newDate[1].length === 1) newDate[1] = `0${newDate[1]}`;
    const val = `${newDate[2]}/${newDate[0]}/${newDate[1]}`;
    return val;
  };

  const months = [
    t("months.0"),
    t("months.1"),
    t("months.2"),
    t("months.3"),
    t("months.4"),
    t("months.5"),
    t("months.6"),
    t("months.7"),
    t("months.8"),
    t("months.9"),
    t("months.10"),
    t("months.11"),
  ];
  const days = [
    t("daysLong.0"),
    t("daysLong.1"),
    t("daysLong.2"),
    t("daysLong.3"),
    t("daysLong.4"),
    t("daysLong.5"),
    t("daysLong.6"),
  ];

  const verify = (d: string) => {
    const base = new Date(d);
    return base;
  };

  const getStringDay = (d: string) => {
    const day = verify(d).getDay();
    return days[day];
  };

  const getStringMonth = (d: string) => {
    const month = verify(d).getMonth();
    return months[month];
  };

  const getStringMonthAndYear = (d: string) => {
    const base = verify(d);
    const month = base.getMonth();
    const year = base.getFullYear();
    return `${months[month]} ${year}`;
  };

  const getStringDate = (d: string) => {
    const base = verify(d);
    const dayIndex = base.getDay();
    const day = base.getDate();
    const month = base.getMonth();
    const year = base.getFullYear();
    return `${days[dayIndex]} ${day} ${months[month]} ${year}`;
  };

  const getDaysInMonth = (d: string) => {
    const base = new Date(d);
    const start = new Date(base.getFullYear(), base.getMonth(), 1);
    const end = new Date(base.getFullYear(), base.getMonth() + 1, 0);
    const days = (end.getTime() - start.getTime()) / (1000 * 3600 * 24);
    return days;
  };

  const subtract = (days: number, dateValue: string) => {
    const base = verify(dateValue);
    const day = base.getDate();
    const month = base.getMonth();
    const year = base.getFullYear();
    const newDate = new Date(year, month, day - days);
    return create(newDate.toISOString());
  };

  const add = (days: number, dateValue: string) => {
    const base = verify(dateValue);
    const day = base.getDate();
    const month = base.getMonth();
    const year = base.getFullYear();
    console.log(dateValue, year, month, day, days, days + day);
    const newDate = new Date(year, month, day + days);
    return create(newDate.toISOString());
  };

  const getMonth = (d: string) => {
    return verify(d).getMonth();
  };

  const getMonthComplete = (d: string) => {
    const month = verify(d).getMonth();
    if (month < 10) {
      return `0${month}`;
    }
    return month;
  };

  const getYear = (d: string) => {
    return verify(d).getFullYear();
  };

  const getDay = (d: string) => {
    return verify(d).getDate();
  };

  const changeMonth = (month: number, d: string) => {
    const base = verify(d);
    const day = base.getDate();
    const year = base.getFullYear();
    const newDate = new Date(year, month, day);
    return create(newDate.toISOString());
  };

  const changeYear = (year: number, d: string) => {
    const base = verify(d);
    const day = base.getDate();
    const month = base.getMonth();
    const newDate = new Date(year, month, day);
    return create(newDate.toISOString());
  };

  const changeDay = (day: number, d: string) => {
    const base = verify(d);
    const month = base.getMonth();
    const year = base.getFullYear();
    const newDate = new Date(year, month, day);
    return create(newDate.toISOString());
  };

  const firtsDayOfMonth = (d: string) => {
    const base = verify(d);
    const month = base.getMonth();
    const year = base.getFullYear();
    const newDate = new Date(year, month, 1);
    return newDate.getDay();
  };

  const lastDayOfMonth = (d: string) => {
    const base = verify(d);
    const month = base.getMonth();
    const year = base.getFullYear();
    const newDate = new Date(year, month + 1, 0);
    return newDate.getDate();
  };

  return {
    create,
    subtract,
    add,
    months,
    days,
    getStringDay,
    getMonth,
    getMonthComplete,
    getStringMonthAndYear,
    getDaysInMonth,
    getStringDate,
    getYear,
    getDay,
    getStringMonth,
    changeMonth,
    changeYear,
    changeDay,
    firtsDayOfMonth,
    lastDayOfMonth,
  };
}
