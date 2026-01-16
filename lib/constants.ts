/**
 * Application-wide constants
 * Centralized location for magic numbers and configuration values
 */

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_PAGE_SIZE: 25,
  MAX_PAGE_SIZE: 100,
  ACTIVITY_LIMIT: 10,
  SEARCH_RESULTS_LIMIT: 20,
  DASHBOARD_UPCOMING_DEADLINES: 5,
  DASHBOARD_RECENT_ACTIVITY: 10,
} as const;

// Date ranges
export const DATE_RANGES = {
  UPCOMING_DEADLINES_DAYS: 30,
  RECENT_ACTIVITY_DAYS: 7,
  OVERDUE_GRACE_PERIOD_HOURS: 24,
} as const;

// File upload limits
export const FILE_UPLOAD = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB in bytes
  MAX_FILES_PER_UPLOAD: 5,
  ALLOWED_DOCUMENT_TYPES: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
  ],
  ALLOWED_IMAGE_TYPES: [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
  ],
} as const;

// Validation limits
export const VALIDATION = {
  MIN_PASSWORD_LENGTH: 8,
  MAX_PASSWORD_LENGTH: 128,
  MIN_PROJECT_NAME_LENGTH: 1,
  MAX_PROJECT_NAME_LENGTH: 255,
  MIN_COMPANY_NAME_LENGTH: 1,
  MAX_COMPANY_NAME_LENGTH: 255,
  MAX_DESCRIPTION_LENGTH: 5000,
  MAX_NOTES_LENGTH: 10000,
  MIN_HOURLY_RATE: 0,
  MAX_HOURLY_RATE: 10000,
  MIN_BUDGET: 0,
  MAX_BUDGET: 10000000,
} as const;

// Time intervals (in milliseconds)
export const TIME_INTERVALS = {
  AUTO_SAVE_DELAY: 2000, // 2 seconds
  DEBOUNCE_SEARCH: 300, // 300ms
  SESSION_TIMEOUT: 30 * 60 * 1000, // 30 minutes
  TOAST_DURATION: 3000, // 3 seconds
  LONG_TOAST_DURATION: 5000, // 5 seconds
  POLLING_INTERVAL: 60000, // 1 minute
} as const;

// Project settings
export const PROJECT = {
  DEFAULT_PROGRESS_PERCENTAGE: 0,
  DEFAULT_CURRENCY: 'USD',
  PROJECT_CODE_LENGTH: 8,
  DEFAULT_ESTIMATED_HOURS: 40,
} as const;

// Meeting settings
export const MEETING = {
  DEFAULT_DURATION_MINUTES: 60,
  MIN_DURATION_MINUTES: 15,
  MAX_DURATION_MINUTES: 480, // 8 hours
  REMINDER_DAYS_BEFORE: 1,
} as const;

// Activity log settings
export const ACTIVITY_LOG = {
  MAX_CHANGES_STORED: 100,
  RETENTION_DAYS: 90,
} as const;

// Search settings
export const SEARCH = {
  MIN_QUERY_LENGTH: 2,
  MAX_QUERY_LENGTH: 100,
  DEBOUNCE_MS: 300,
} as const;

// Rate limiting
export const RATE_LIMIT = {
  WINDOW_MS: 15 * 60 * 1000, // 15 minutes
  MAX_REQUESTS: 100,
  MAX_LOGIN_ATTEMPTS: 5,
  LOGIN_LOCKOUT_MINUTES: 15,
} as const;

// Cache settings (for future use)
export const CACHE = {
  STATS_TTL: 5 * 60, // 5 minutes
  PROJECTS_TTL: 60, // 1 minute
  CLIENTS_TTL: 60, // 1 minute
  TEAM_TTL: 5 * 60, // 5 minutes
} as const;

// Export types for type safety
export type PaginationConfig = typeof PAGINATION;
export type DateRangeConfig = typeof DATE_RANGES;
export type FileUploadConfig = typeof FILE_UPLOAD;
export type ValidationConfig = typeof VALIDATION;
export type TimeIntervalConfig = typeof TIME_INTERVALS;
export type ProjectConfig = typeof PROJECT;
export type MeetingConfig = typeof MEETING;
export type ActivityLogConfig = typeof ACTIVITY_LOG;
export type SearchConfig = typeof SEARCH;
export type RateLimitConfig = typeof RATE_LIMIT;
export type CacheConfig = typeof CACHE;
