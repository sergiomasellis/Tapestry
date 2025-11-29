import { format } from "date-fns";

/**
 * Get the start of the week (Sunday) for a given date
 */
export function getWeekStart(d = new Date()): Date {
  const day = d.getDay();
  const diff = d.getDate() - day;
  const start = new Date(d);
  start.setDate(diff);
  start.setHours(0, 0, 0, 0);
  return start;
}

/**
 * Add days to a date
 */
export function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

/**
 * Get minutes from midnight for a given date
 */
export function minutesFromMidnight(d: Date): number {
  return d.getHours() * 60 + d.getMinutes();
}

/**
 * Format a date as YYYY-MM-DD
 */
export function dayKey(d: Date): string {
  return format(d, "yyyy-MM-dd");
}

/**
 * Navigate to the next month (returns week-aligned anchor)
 */
export function nextMonth(d: Date): Date {
  const nd = new Date(d);
  nd.setMonth(nd.getMonth() + 1);
  return getWeekStart(nd);
}

/**
 * Navigate to the previous month (returns week-aligned anchor)
 */
export function prevMonth(d: Date): Date {
  const nd = new Date(d);
  nd.setMonth(nd.getMonth() - 1);
  return getWeekStart(nd);
}

/**
 * Get month grid for calendar view
 */
export function getMonthGrid(startDate: Date) {
  const firstOfMonth = new Date(startDate);
  firstOfMonth.setDate(1);
  firstOfMonth.setHours(0, 0, 0, 0);

  const startDay = firstOfMonth.getDay(); // 0..6
  const gridStart = new Date(firstOfMonth);
  gridStart.setDate(firstOfMonth.getDate() - startDay); // back to Sunday before/at 1st

  const cells = Array.from({ length: 42 }, (_, i) => {
    const d = addDays(gridStart, i);
    const inCurrentMonth = d.getMonth() === firstOfMonth.getMonth();
    return { date: d, inCurrentMonth };
  });

  return { firstOfMonth, gridStart, cells };
}
