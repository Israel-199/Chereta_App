/**
 * Utility to convert Gregorian dates to Ethiopian dates.
 * Algorithm based on common JDN (Julian Day Number) conversion.
 */

export interface EthiopianDate {
  year: number;
  month: number;
  day: number;
}

/**
 * Converts a Gregorian Date object to an Ethiopian Date object.
 */
export function toEthiopian(date: Date): EthiopianDate {
  const gYear = date.getFullYear();
  const gMonth = date.getMonth() + 1;
  const gDay = date.getDate();

  const a = Math.floor((14 - gMonth) / 12);
  const y = gYear + 4800 - a;
  const m = gMonth + 12 * a - 3;
  const jdn = gDay + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;

  const r = (jdn - 1723856) % 1461;
  const n = (r % 365) + 365 * Math.floor(r / 1460);
  const ethYear = 4 * Math.floor((jdn - 1723856) / 1461) + Math.floor(r / 365) - Math.floor(r / 1460);
  const ethMonth = Math.floor(n / 30) + 1;
  const ethDay = (n % 30) + 1;

  return { year: ethYear, month: ethMonth, day: ethDay };
}

/**
 * Formats a date for the application based on the selected language.
 * Uses Gregorian for English and Ethiopian for other languages.
 */
export function formatAppDate(dateInput: string | Date | undefined, language: string, t: any): string {
  if (!dateInput) return "";
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  if (isNaN(date.getTime())) return String(dateInput);

  if (language === "English" || language === "en") {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
  } else {
    const ethDate = toEthiopian(date);
    const monthKeys = ["september", "october", "november", "december", "january", "february", "march", "april", "may", "june", "july", "august", "extra"];
    const translatedMonth = t.months?.[monthKeys[ethDate.month - 1]] || ethDate.month;
    return `${translatedMonth} ${ethDate.day}, ${ethDate.year}`;
  }
}

/**
 * Returns the next Sunday at 7:00 Ethiopian Local Time (1:00 PM International/13:00)
 */
export function getNextSundayLotteryDate(): Date {
  const now = new Date();
  const nextSunday = new Date(now);
  const day = now.getDay();
  const hours = now.getHours();
  let daysToAdd = (7 - day) % 7;
  if (day === 0 && hours >= 1) {
    daysToAdd = 7;
  }
  nextSunday.setDate(now.getDate() + daysToAdd);
  nextSunday.setHours(1, 0, 0, 0); 
  return nextSunday;
}

/**
 * Formats a date in the specific professional format requested:
 * Feb 21 2026 07:00:00 PM LT
 */
export function formatProfessionalDate(date: Date, language: string, t: any): string {
  const isEn = language === "English" || language === "en";
  const timeStr = "07:00:00 AM LT"; 

  if (isEn) {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return `${months[date.getMonth()]} ${date.getDate()} ${date.getFullYear()} ${timeStr}`;
  } else {
    const ethDate = toEthiopian(date);
    const monthKeys = ["september", "october", "november", "december", "january", "february", "march", "april", "may", "june", "july", "august", "extra"];
    const translatedMonth = t.months?.[monthKeys[ethDate.month - 1]] || ethDate.month;
    return `${translatedMonth} ${ethDate.day} ${ethDate.year} ${timeStr}`;
  }
}

/**
 * Formats the CURRENT real-time date in professional format:
 * May 17 2026 11:41:21 AM
 */
export function formatProfessionalCurrentDate(date: Date, language: string, t: any): string {
  const isEn = language === "English" || language === "en";
  const pad = (n: number) => n.toString().padStart(2, '0');
  let hours = date.getHours();
  const mins = pad(date.getMinutes());
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; 
  const timeStr = `${pad(hours)}:${mins} ${ampm}`;

  if (isEn) {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return `${months[date.getMonth()]} ${date.getDate()} ${date.getFullYear()} ${timeStr}`;
  } else {
    const ethDate = toEthiopian(date);
    const monthKeys = ["september", "october", "november", "december", "january", "february", "march", "april", "may", "june", "july", "august", "extra"];
    const translatedMonth = t.months?.[monthKeys[ethDate.month - 1]] || ethDate.month;
    return `${translatedMonth} ${ethDate.day} ${ethDate.year} ${timeStr}`;
  }
}
