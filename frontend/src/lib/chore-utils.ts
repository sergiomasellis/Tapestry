import { Chore } from "@/types";
import { parseISO, isSameDay, getDay, differenceInDays, differenceInWeeks, differenceInMonths, isBefore, isAfter } from "date-fns";

/**
 * Determines if a chore should be displayed on a given day.
 * Handles both one-time and recurring chores.
 */
export function isChoreOnDay(chore: Chore, date: Date): boolean {
  const choreDate = parseISO(chore.week_start);
  
  // Normalize dates to start of day for comparison
  const normalizedDate = new Date(date);
  normalizedDate.setHours(0, 0, 0, 0);
  const normalizedChoreDate = new Date(choreDate);
  normalizedChoreDate.setHours(0, 0, 0, 0);

  // If date is before the chore start date, don't show
  if (isBefore(normalizedDate, normalizedChoreDate)) {
    return false;
  }

  // Check end date for recurring chores
  if (chore.is_recurring && chore.recurrence_end_date) {
    const endDate = parseISO(chore.recurrence_end_date);
    if (isAfter(normalizedDate, endDate)) {
      return false;
    }
  }

  // Non-recurring chores: only show on the exact date
  if (!chore.is_recurring) {
    return isSameDay(normalizedDate, normalizedChoreDate);
  }

  // Recurring chores
  const daysDiff = differenceInDays(normalizedDate, normalizedChoreDate);
  const interval = chore.recurrence_interval || 1;

  switch (chore.recurrence_type) {
    case "daily":
      // Show every `interval` days
      return daysDiff % interval === 0;

    case "weekly": {
      // Check if the day of week matches one of the recurrence_days
      // recurrence_days is comma-separated day numbers (0=Sun, 1=Mon, etc.)
      const weeksDiff = differenceInWeeks(normalizedDate, normalizedChoreDate);
      
      // Check if we're on the right interval week
      if (weeksDiff % interval !== 0) {
        return false;
      }

      // Check if the day of week matches
      const dayOfWeek = getDay(normalizedDate); // 0=Sunday, 6=Saturday
      
      if (chore.recurrence_days) {
        const allowedDays = chore.recurrence_days.split(",").map(Number);
        return allowedDays.includes(dayOfWeek);
      }
      
      // If no specific days set, use the same day of week as the start date
      return getDay(normalizedChoreDate) === dayOfWeek;
    }

    case "monthly": {
      // Show on the same day of month, every `interval` months
      const monthsDiff = differenceInMonths(normalizedDate, normalizedChoreDate);
      
      if (monthsDiff % interval !== 0) {
        return false;
      }
      
      // Check if it's the same day of month
      return normalizedDate.getDate() === normalizedChoreDate.getDate();
    }

    default:
      // Unknown recurrence type, just show on the start date
      return isSameDay(normalizedDate, normalizedChoreDate);
  }
}

