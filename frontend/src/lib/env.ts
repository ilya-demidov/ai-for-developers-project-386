/**
 * Environment configuration for the application
 */

// Host configuration (hardcoded as per requirements)
export const HOST_NAME = import.meta.env.VITE_HOST_NAME || 'Tota';
export const HOST_ROLE = import.meta.env.VITE_HOST_ROLE || 'Host';
export const HOST_TIMEZONE = import.meta.env.VITE_HOST_TIMEZONE || 'Europe/Moscow';

// Controls which timezone is used for displaying dates and calendar day logic.
// Supported values: local | host | IANA timezone (e.g. Europe/Moscow) | +3 / +03:00 / UTC+3.
export const DISPLAY_TIMEZONE_SETTING = import.meta.env.VITE_DISPLAY_TIMEZONE || 'local';

// API configuration
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

// Work hours configuration
export const WORK_START_HOUR = parseInt(
  import.meta.env.VITE_WORK_START_HOUR || '9',
  10
);
export const WORK_END_HOUR = parseInt(
  import.meta.env.VITE_WORK_END_HOUR || '18',
  10
);

// Booking window in days
export const BOOKING_WINDOW_DAYS = 14;
