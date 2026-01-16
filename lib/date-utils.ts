/**
 * Date utility functions
 * Centralized date formatting and manipulation using date-fns
 */

import {
  format,
  formatDistance,
  formatDistanceToNow,
  parseISO,
  isValid,
  isBefore,
  isAfter,
  addDays,
  addHours,
  addMinutes,
  subDays,
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  differenceInDays,
  differenceInHours,
  differenceInMinutes,
} from "date-fns";

/**
 * Format date to YYYY-MM-DD for input[type="date"]
 */
export function formatDateForInput(date: Date | string | undefined | null): string {
  if (!date) return "";

  const d = typeof date === "string" ? parseISO(date) : date;

  if (!isValid(d)) return "";

  return format(d, "yyyy-MM-dd");
}

/**
 * Format date to DD/MM/YYYY for display
 */
export function formatDateDisplay(date: Date | string | undefined | null): string {
  if (!date) return "";

  const d = typeof date === "string" ? parseISO(date) : date;

  if (!isValid(d)) return "";

  return format(d, "dd/MM/yyyy");
}

/**
 * Format date to "Month DD, YYYY" (e.g., "January 15, 2024")
 */
export function formatDateLong(date: Date | string | undefined | null): string {
  if (!date) return "";

  const d = typeof date === "string" ? parseISO(date) : date;

  if (!isValid(d)) return "";

  return format(d, "MMMM dd, yyyy");
}

/**
 * Format date to "Mon DD" (e.g., "Jan 15")
 */
export function formatDateShort(date: Date | string | undefined | null): string {
  if (!date) return "";

  const d = typeof date === "string" ? parseISO(date) : date;

  if (!isValid(d)) return "";

  return format(d, "MMM dd");
}

/**
 * Format date and time to "DD/MM/YYYY HH:MM"
 */
export function formatDateTime(date: Date | string | undefined | null): string {
  if (!date) return "";

  const d = typeof date === "string" ? parseISO(date) : date;

  if (!isValid(d)) return "";

  return format(d, "dd/MM/yyyy HH:mm");
}

/**
 * Format date and time to "Month DD, YYYY at HH:MM AM/PM"
 */
export function formatDateTimeLong(date: Date | string | undefined | null): string {
  if (!date) return "";

  const d = typeof date === "string" ? parseISO(date) : date;

  if (!isValid(d)) return "";

  return format(d, "MMMM dd, yyyy 'at' hh:mm a");
}

/**
 * Format time to "HH:MM AM/PM"
 */
export function formatTime(date: Date | string | undefined | null): string {
  if (!date) return "";

  const d = typeof date === "string" ? parseISO(date) : date;

  if (!isValid(d)) return "";

  return format(d, "hh:mm a");
}

/**
 * Format time to 24-hour format "HH:MM"
 */
export function formatTime24(date: Date | string | undefined | null): string {
  if (!date) return "";

  const d = typeof date === "string" ? parseISO(date) : date;

  if (!isValid(d)) return "";

  return format(d, "HH:mm");
}

/**
 * Format relative time (e.g., "2 hours ago", "in 3 days")
 */
export function formatRelativeTime(date: Date | string | undefined | null): string {
  if (!date) return "";

  const d = typeof date === "string" ? parseISO(date) : date;

  if (!isValid(d)) return "";

  return formatDistanceToNow(d, { addSuffix: true });
}

/**
 * Format distance between two dates (e.g., "2 days", "3 hours")
 */
export function formatDateDistance(
  dateLeft: Date | string,
  dateRight: Date | string
): string {
  const left = typeof dateLeft === "string" ? parseISO(dateLeft) : dateLeft;
  const right = typeof dateRight === "string" ? parseISO(dateRight) : dateRight;

  if (!isValid(left) || !isValid(right)) return "";

  return formatDistance(left, right);
}

/**
 * Parse date string to Date object
 */
export function parseDate(dateString: string | undefined | null): Date | null {
  if (!dateString) return null;

  const parsed = parseISO(dateString);

  return isValid(parsed) ? parsed : null;
}

/**
 * Check if date is in the past
 */
export function isPastDate(date: Date | string): boolean {
  const d = typeof date === "string" ? parseISO(date) : date;

  if (!isValid(d)) return false;

  return isBefore(d, new Date());
}

/**
 * Check if date is in the future
 */
export function isFutureDate(date: Date | string): boolean {
  const d = typeof date === "string" ? parseISO(date) : date;

  if (!isValid(d)) return false;

  return isAfter(d, new Date());
}

/**
 * Check if date is overdue (past current date/time)
 */
export function isOverdue(date: Date | string): boolean {
  return isPastDate(date);
}

/**
 * Check if date is coming soon (within next N days)
 */
export function isComingSoon(date: Date | string, days: number = 7): boolean {
  const d = typeof date === "string" ? parseISO(date) : date;

  if (!isValid(d)) return false;

  const now = new Date();
  const threshold = addDays(now, days);

  return isAfter(d, now) && isBefore(d, threshold);
}

/**
 * Get number of days between two dates
 */
export function getDaysDifference(
  dateLeft: Date | string,
  dateRight: Date | string
): number {
  const left = typeof dateLeft === "string" ? parseISO(dateLeft) : dateLeft;
  const right = typeof dateRight === "string" ? parseISO(dateRight) : dateRight;

  if (!isValid(left) || !isValid(right)) return 0;

  return differenceInDays(left, right);
}

/**
 * Get number of hours between two dates
 */
export function getHoursDifference(
  dateLeft: Date | string,
  dateRight: Date | string
): number {
  const left = typeof dateLeft === "string" ? parseISO(dateLeft) : dateLeft;
  const right = typeof dateRight === "string" ? parseISO(dateRight) : dateRight;

  if (!isValid(left) || !isValid(right)) return 0;

  return differenceInHours(left, right);
}

/**
 * Get number of minutes between two dates
 */
export function getMinutesDifference(
  dateLeft: Date | string,
  dateRight: Date | string
): number {
  const left = typeof dateLeft === "string" ? parseISO(dateLeft) : dateLeft;
  const right = typeof dateRight === "string" ? parseISO(dateRight) : dateRight;

  if (!isValid(left) || !isValid(right)) return 0;

  return differenceInMinutes(left, right);
}

/**
 * Get date range for a specific period
 */
export function getDateRange(period: "today" | "week" | "month"): {
  start: Date;
  end: Date;
} {
  const now = new Date();

  switch (period) {
    case "today":
      return {
        start: startOfDay(now),
        end: endOfDay(now),
      };
    case "week":
      return {
        start: startOfWeek(now),
        end: endOfWeek(now),
      };
    case "month":
      return {
        start: startOfMonth(now),
        end: endOfMonth(now),
      };
    default:
      return {
        start: now,
        end: now,
      };
  }
}

/**
 * Add days to a date
 */
export function addDaysToDate(date: Date | string, days: number): Date {
  const d = typeof date === "string" ? parseISO(date) : date;

  if (!isValid(d)) return new Date();

  return addDays(d, days);
}

/**
 * Subtract days from a date
 */
export function subtractDaysFromDate(date: Date | string, days: number): Date {
  const d = typeof date === "string" ? parseISO(date) : date;

  if (!isValid(d)) return new Date();

  return subDays(d, days);
}

/**
 * Add hours to a date
 */
export function addHoursToDate(date: Date | string, hours: number): Date {
  const d = typeof date === "string" ? parseISO(date) : date;

  if (!isValid(d)) return new Date();

  return addHours(d, hours);
}

/**
 * Add minutes to a date
 */
export function addMinutesToDate(date: Date | string, minutes: number): Date {
  const d = typeof date === "string" ? parseISO(date) : date;

  if (!isValid(d)) return new Date();

  return addMinutes(d, minutes);
}

/**
 * Get the start of day for a date
 */
export function getStartOfDay(date: Date | string): Date {
  const d = typeof date === "string" ? parseISO(date) : date;

  if (!isValid(d)) return new Date();

  return startOfDay(d);
}

/**
 * Get the end of day for a date
 */
export function getEndOfDay(date: Date | string): Date {
  const d = typeof date === "string" ? parseISO(date) : date;

  if (!isValid(d)) return new Date();

  return endOfDay(d);
}

/**
 * Format date for API (ISO 8601 format)
 */
export function formatDateForAPI(date: Date | string | undefined | null): string | null {
  if (!date) return null;

  const d = typeof date === "string" ? parseISO(date) : date;

  if (!isValid(d)) return null;

  return d.toISOString();
}

/**
 * Get current timestamp as ISO string
 */
export function getCurrentTimestamp(): string {
  return new Date().toISOString();
}

/**
 * Validate if date string is valid
 */
export function isValidDateString(dateString: string | undefined | null): boolean {
  if (!dateString) return false;

  const parsed = parseISO(dateString);

  return isValid(parsed);
}
