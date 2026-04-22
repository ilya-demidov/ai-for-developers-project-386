import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { DISPLAY_TIMEZONE_SETTING, HOST_TIMEZONE } from './env';

dayjs.extend(utc);
dayjs.extend(timezone);

const MOSCOW_ALIASES = new Set(['+3', '+03:00', 'utc+3', 'utc+03:00']);
const FALLBACK_LOCAL = dayjs.tz.guess();

function toCanonicalTimezone(raw: string, hostTimezone: string): string {
  const normalized = raw.trim();
  const lowered = normalized.toLowerCase();

  if (!normalized || lowered === 'local') {
    return FALLBACK_LOCAL;
  }

  if (lowered === 'host') {
    return hostTimezone;
  }

  if (MOSCOW_ALIASES.has(lowered)) {
    return 'Europe/Moscow';
  }

  return normalized;
}

function isValidTimeZone(timezoneName: string): boolean {
  try {
    dayjs.tz('2026-01-01T12:00:00', timezoneName);
    return true;
  } catch {
    return false;
  }
}

export function resolveDisplayTimezone(raw: string, hostTimezone: string): string {
  const candidate = toCanonicalTimezone(raw, hostTimezone);

  if (isValidTimeZone(candidate)) {
    return candidate;
  }

  console.warn(
    `Invalid VITE_DISPLAY_TIMEZONE value '${raw}'. Falling back to local timezone '${FALLBACK_LOCAL}'.`
  );
  return FALLBACK_LOCAL;
}

export const DISPLAY_TIMEZONE = resolveDisplayTimezone(
  DISPLAY_TIMEZONE_SETTING,
  HOST_TIMEZONE
);

export function nowInDisplayTimezone(): dayjs.Dayjs {
  return dayjs().tz(DISPLAY_TIMEZONE);
}

export function getDisplayTimezone(): string {
  return DISPLAY_TIMEZONE;
}

export function getHostTimezone(): string {
  return HOST_TIMEZONE;
}

export function displayDayFromDayKey(dayKey: string): dayjs.Dayjs {
  return dayjs.tz(`${dayKey}T00:00:00`, DISPLAY_TIMEZONE);
}

export function toDisplayDayKey(dateLike: string | Date): string {
  if (typeof dateLike === 'string') {
    return dayjs.utc(dateLike).tz(DISPLAY_TIMEZONE).format('YYYY-MM-DD');
  }

  return dayjs(dateLike).tz(DISPLAY_TIMEZONE).format('YYYY-MM-DD');
}

export function formatUtcInDisplayTime(utcIso: string): string {
  return dayjs.utc(utcIso).tz(DISPLAY_TIMEZONE).format('HH:mm');
}

export function formatUtcInDisplayDate(utcIso: string): string {
  return dayjs.utc(utcIso).tz(DISPLAY_TIMEZONE).format('dddd, D MMMM');
}

export function formatDisplayDayKey(dayKey: string): string {
  return displayDayFromDayKey(dayKey).format('dddd, D MMMM');
}
