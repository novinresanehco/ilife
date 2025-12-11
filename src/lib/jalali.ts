import moment from 'moment-jalaali';

moment.loadPersian({ usePersianDigits: true, dialect: 'persian-modern' });

export const toJalali = (date: Date) => {
  return moment(date).format('jYYYY/jMM/jDD');
};

export const toJalaliWithDay = (date: Date) => {
  return moment(date).format('dddd jD jMMMM jYYYY');
};

export const getJalaliMonth = (date: Date) => {
  return moment(date).format('jMMMM jYYYY');
};

export const getJalaliDay = (date: Date) => {
  return moment(date).format('jD');
};

export const getJalaliWeekday = (date: Date) => {
  return moment(date).format('dddd');
};

export const persianNumbers = (num: number | string): string => {
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return num.toString().replace(/\d/g, (d) => persianDigits[parseInt(d)]);
};

export const getJalaliMonthDays = (year: number, month: number) => {
  const daysInMonth = moment.jDaysInMonth(year, month - 1); // month is 0-indexed
  const m = moment(`${year}/${month}/1`, 'jYYYY/jM/jD');
  const firstDayOfWeek = m.day(); // 0 = Sunday, 6 = Saturday
  
  return { daysInMonth, firstDayOfWeek };
};

export const getCurrentJalaliDate = () => {
  const m = moment();
  return {
    year: m.jYear(),
    month: m.jMonth() + 1,
    day: m.jDate(),
  };
};

export const jalaliMonthNames = [
  'فروردین', 'اردیبهشت', 'خرداد',
  'تیر', 'مرداد', 'شهریور',
  'مهر', 'آبان', 'آذر',
  'دی', 'بهمن', 'اسفند'
];

export const jalaliWeekDays = ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'];
export const jalaliWeekDaysFull = ['شنبه', 'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنج‌شنبه', 'جمعه'];
