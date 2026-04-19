/**
 * Environment configuration for the application
 */

// Host configuration (hardcoded as per requirements)
export const HOST_NAME = import.meta.env.VITE_HOST_NAME || 'Tota';
export const HOST_ROLE = import.meta.env.VITE_HOST_ROLE || 'Host';
export const HOST_TIMEZONE = import.meta.env.VITE_HOST_TIMEZONE || 'Europe/Moscow';

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
