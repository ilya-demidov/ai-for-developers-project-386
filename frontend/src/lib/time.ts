import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { WORK_START_HOUR, WORK_END_HOUR, HOST_TIMEZONE } from './env';

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

function dateToHostDay(date: Date): dayjs.Dayjs {
  const y = date.getFullYear();
  const m = date.getMonth() + 1;
  const d = date.getDate();
  return dayjs.tz(`${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`, HOST_TIMEZONE);
}

export function generateDayGrid(
  date: Date,
  durationMinutes: number,
  workStartHour: number = WORK_START_HOUR,
  workEndHour: number = WORK_END_HOUR,
): { startUtc: string; endUtc: string }[] {
  const slots: { startUtc: string; endUtc: string }[] = [];
  const localDayStart = dateToHostDay(date);

  const workStartUtc = localDayStart.add(workStartHour, 'hour').utc();
  const workEndUtc = localDayStart.add(workEndHour, 'hour').utc();

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

export function mergeWithFreeSlots(
  grid: { startUtc: string; endUtc: string }[],
  freeSlots: { startUtc: string; endUtc: string }[],
): SlotWithStatus[] {
  const freeTimestamps = new Set(freeSlots.map((s) => toTimestamp(s.startUtc)));

  return grid.map((slot) => ({
    ...slot,
    status: freeTimestamps.has(toTimestamp(slot.startUtc)) ? 'free' : 'busy',
  }));
}

export function toLocalTimeLabel(utcIso: string): string {
  return dayjs.utc(utcIso).tz(HOST_TIMEZONE).format('HH:mm');
}

export function toLocalDateLabel(utcIsoOrDate: string | Date): string {
  if (typeof utcIsoOrDate === 'string') {
    return dayjs.utc(utcIsoOrDate).tz(HOST_TIMEZONE).format('dddd, D MMMM');
  }
  return dateToHostDay(utcIsoOrDate).format('dddd, D MMMM');
}

export function getUtcRangeForLocalDate(date: Date): { from: string; to: string } {
  const localDay = dateToHostDay(date);
  const startOfDay = localDay.startOf('day');
  const endOfDay = localDay.endOf('day');

  return {
    from: startOfDay.utc().format('YYYY-MM-DDTHH:mm:ss[Z]'),
    to: endOfDay.utc().format('YYYY-MM-DDTHH:mm:ss[Z]'),
  };
}

export function getBookingWindowRange(days: number = 14): { from: string; to: string } {
  const now = dayjs().utc();
  return {
    from: now.format('YYYY-MM-DDTHH:mm:ss[Z]'),
    to: now.add(days, 'day').format('YYYY-MM-DDTHH:mm:ss[Z]'),
  };
}

export function isWithinBookingWindow(date: Date, days: number = 14): boolean {
  const now = dayjs().tz(HOST_TIMEZONE).startOf('day');
  const target = dateToHostDay(date).startOf('day');
  const maxDate = now.add(days, 'day');

  return !target.isBefore(now) && !target.isAfter(maxDate);
}

export function formatSlotRange(startUtc: string, endUtc: string): string {
  const start = toLocalTimeLabel(startUtc);
  const end = toLocalTimeLabel(endUtc);
  return `${start} – ${end}`;
}
