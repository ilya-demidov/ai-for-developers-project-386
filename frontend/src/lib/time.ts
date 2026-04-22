import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { BOOKING_WINDOW_DAYS, WORK_START_HOUR, WORK_END_HOUR } from './env';
import {
  displayDayFromDayKey,
  formatDisplayDayKey,
  formatUtcInDisplayDate,
  formatUtcInDisplayTime,
  getHostTimezone,
} from './timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

export interface SlotWithStatus {
  startUtc: string;
  endUtc: string;
  status: 'free' | 'busy';
}

function toTimestamp(iso: string): number {
  return new Date(iso).getTime();
}

function buildHostDaySlots(
  hostDayStart: dayjs.Dayjs,
  durationMinutes: number,
  workStartHour: number,
  workEndHour: number
): { startUtc: string; endUtc: string }[] {
  const slots: { startUtc: string; endUtc: string }[] = [];
  const workStartUtc = hostDayStart.add(workStartHour, 'hour').utc();
  const workEndUtc = hostDayStart.add(workEndHour, 'hour').utc();

  let current = workStartUtc;
  while (current.add(durationMinutes, 'minute').valueOf() <= workEndUtc.valueOf()) {
    const slotEnd = current.add(durationMinutes, 'minute');
    slots.push({
      startUtc: current.format('YYYY-MM-DDTHH:mm:ss[Z]'),
      endUtc: slotEnd.format('YYYY-MM-DDTHH:mm:ss[Z]'),
    });
    current = slotEnd;
  }

  return slots;
}

function getUtcRangeForDisplayDay(dayKey: string): {
  fromUtc: dayjs.Dayjs;
  toUtc: dayjs.Dayjs;
} {
  const displayStart = displayDayFromDayKey(dayKey).startOf('day');
  const displayEndExclusive = displayStart.add(1, 'day');

  return {
    fromUtc: displayStart.utc(),
    toUtc: displayEndExclusive.utc(),
  };
}

function getBookingWindowUtcRange(days: number = BOOKING_WINDOW_DAYS): {
  fromUtc: dayjs.Dayjs;
  toUtc: dayjs.Dayjs;
} {
  const fromUtc = dayjs().utc();
  const hostDayStart = fromUtc.tz(getHostTimezone()).startOf('day');
  const toUtc = hostDayStart.add(days, 'day').utc();
  return { fromUtc, toUtc };
}

export function generateDayGrid(
  dayKey: string,
  durationMinutes: number,
  workStartHour: number = WORK_START_HOUR,
  workEndHour: number = WORK_END_HOUR
): { startUtc: string; endUtc: string }[] {
  const { fromUtc, toUtc } = getUtcRangeForDisplayDay(dayKey);
  const hostTimezone = getHostTimezone();

  const hostRangeStart = fromUtc.tz(hostTimezone).startOf('day');
  const hostRangeEnd = toUtc.subtract(1, 'millisecond').tz(hostTimezone).startOf('day');

  const slots: { startUtc: string; endUtc: string }[] = [];
  let hostDay = hostRangeStart;

  while (hostDay.valueOf() <= hostRangeEnd.valueOf()) {
    const hostDaySlots = buildHostDaySlots(
      hostDay,
      durationMinutes,
      workStartHour,
      workEndHour
    );

    for (const slot of hostDaySlots) {
      const slotStartUtc = dayjs.utc(slot.startUtc);
      const slotEndUtc = dayjs.utc(slot.endUtc);

      if (slotStartUtc.valueOf() >= fromUtc.valueOf() && slotEndUtc.valueOf() <= toUtc.valueOf()) {
        slots.push(slot);
      }
    }

    hostDay = hostDay.add(1, 'day');
  }

  return slots;
}

export function mergeWithFreeSlots(
  grid: { startUtc: string; endUtc: string }[],
  freeSlots: { startUtc: string; endUtc: string }[]
): SlotWithStatus[] {
  const freeTimestamps = new Set(freeSlots.map((s) => toTimestamp(s.startUtc)));

  return grid.map((slot) => ({
    ...slot,
    status: freeTimestamps.has(toTimestamp(slot.startUtc)) ? 'free' : 'busy',
  }));
}

export function toLocalTimeLabel(utcIso: string): string {
  return formatUtcInDisplayTime(utcIso);
}

export function toLocalDateLabel(utcIso: string): string {
  return formatUtcInDisplayDate(utcIso);
}

export function formatSelectedDayLabel(dayKey: string): string {
  return formatDisplayDayKey(dayKey);
}

export function getUtcRangeForDisplayDate(
  dayKey: string
): { from: string; to: string } {
  const dayRange = getUtcRangeForDisplayDay(dayKey);

  return {
    from: dayRange.fromUtc.format('YYYY-MM-DDTHH:mm:ss[Z]'),
    to: dayRange.toUtc.format('YYYY-MM-DDTHH:mm:ss[Z]'),
  };
}

export function getBookingWindowRange(
  days: number = BOOKING_WINDOW_DAYS
): { from: string; to: string } {
  const { fromUtc, toUtc } = getBookingWindowUtcRange(days);
  return {
    from: fromUtc.format('YYYY-MM-DDTHH:mm:ss[Z]'),
    to: toUtc.format('YYYY-MM-DDTHH:mm:ss[Z]'),
  };
}

export function hasAvailableSlots(
  dayKey: string,
  workEndHour: number = WORK_END_HOUR,
  days: number = BOOKING_WINDOW_DAYS
): boolean {
  const dayRange = getUtcRangeForDisplayDay(dayKey);
  const bookingWindow = getBookingWindowUtcRange(days);

  const fromUtc = dayRange.fromUtc.isAfter(bookingWindow.fromUtc)
    ? dayRange.fromUtc
    : bookingWindow.fromUtc;
  const toUtc = dayRange.toUtc.isBefore(bookingWindow.toUtc)
    ? dayRange.toUtc
    : bookingWindow.toUtc;

  if (!toUtc.isAfter(fromUtc)) {
    return false;
  }

  const hostTimezone = getHostTimezone();

  const hostRangeStart = fromUtc.tz(hostTimezone).startOf('day');
  const hostRangeEnd = toUtc.subtract(1, 'millisecond').tz(hostTimezone).startOf('day');

  const nowUtc = dayjs().utc();
  const effectiveStart = nowUtc.isAfter(fromUtc) ? nowUtc : fromUtc;

  let hostDay = hostRangeStart;
  while (hostDay.valueOf() <= hostRangeEnd.valueOf()) {
    const hostDayWorkStartUtc = hostDay.add(WORK_START_HOUR, 'hour').utc();
    const hostDayWorkEndUtc = hostDay.add(workEndHour, 'hour').utc();

    const windowStart = hostDayWorkStartUtc.isAfter(effectiveStart)
      ? hostDayWorkStartUtc
      : effectiveStart;
    const windowEnd = hostDayWorkEndUtc.isBefore(toUtc) ? hostDayWorkEndUtc : toUtc;

    if (windowEnd.isAfter(windowStart)) {
      return true;
    }

    hostDay = hostDay.add(1, 'day');
  }

  return false;
}

export function isWithinBookingWindow(
  dayKey: string,
  days: number = BOOKING_WINDOW_DAYS
): boolean {
  const dayRange = getUtcRangeForDisplayDay(dayKey);
  const bookingWindow = getBookingWindowUtcRange(days);

  return (
    dayRange.toUtc.isAfter(bookingWindow.fromUtc) &&
    dayRange.fromUtc.isBefore(bookingWindow.toUtc)
  );
}

export function formatSlotRange(startUtc: string, endUtc: string): string {
  const start = toLocalTimeLabel(startUtc);
  const end = toLocalTimeLabel(endUtc);
  return `${start} – ${end}`;
}
