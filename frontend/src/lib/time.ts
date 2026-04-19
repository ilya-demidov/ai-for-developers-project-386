import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { WORK_START_HOUR, WORK_END_HOUR } from './env';

// Extend dayjs with UTC plugin
dayjs.extend(utc);

export interface SlotWithStatus {
  startUtc: string;
  endUtc: string;
  status: 'free' | 'busy';
}

/**
 * Generate all potential slots for a day based on work hours and event duration
 */
export function generateDayGrid(
  date: Date,
  durationMinutes: number,
  workStartHour: number = WORK_START_HOUR,
  workEndHour: number = WORK_END_HOUR
): { startUtc: string; endUtc: string }[] {
  const slots: { startUtc: string; endUtc: string }[] = [];
  const startOfDay = dayjs(date).startOf('day');

  for (let hour = workStartHour; hour < workEndHour; hour++) {
    for (let minute = 0; minute < 60; minute += durationMinutes) {
      const slotStart = startOfDay.add(hour, 'hour').add(minute, 'minute');
      const slotEnd = slotStart.add(durationMinutes, 'minute');

      // Don't exceed work end
      if (slotEnd.hour() > workEndHour || (slotEnd.hour() === workEndHour && slotEnd.minute() > 0)) {
        break;
      }

      slots.push({
        startUtc: slotStart.utc().toISOString(),
        endUtc: slotEnd.utc().toISOString(),
      });
    }
  }

  return slots;
}

/**
 * Merge generated grid with free slots from API to mark busy slots
 */
export function mergeWithFreeSlots(
  grid: { startUtc: string; endUtc: string }[],
  freeSlots: { startUtc: string; endUtc: string }[]
): SlotWithStatus[] {
  const freeSlotSet = new Set(freeSlots.map((s) => s.startUtc));

  return grid.map((slot) => ({
    ...slot,
    status: freeSlotSet.has(slot.startUtc) ? 'free' : 'busy',
  }));
}

/**
 * Format UTC ISO string to local time label (HH:mm)
 */
export function toLocalTimeLabel(utcIso: string): string {
  return dayjs(utcIso).local().format('HH:mm');
}

/**
 * Format UTC ISO string to local date label (dddd, D MMMM)
 */
export function toLocalDateLabel(utcIso: string): string {
  return dayjs(utcIso).local().format('dddd, D MMMM');
}

/**
 * Get UTC start and end for a local date (for API queries)
 */
export function getUtcRangeForLocalDate(date: Date): { from: string; to: string } {
  const startOfDay = dayjs(date).startOf('day').utc();
  const endOfDay = dayjs(date).endOf('day').utc();

  return {
    from: startOfDay.toISOString(),
    to: endOfDay.toISOString(),
  };
}

/**
 * Get UTC range for the booking window (next N days)
 */
export function getBookingWindowRange(days: number = 14): { from: string; to: string } {
  const now = dayjs().utc();
  return {
    from: now.toISOString(),
    to: now.add(days, 'day').toISOString(),
  };
}

/**
 * Check if a date is within the booking window
 */
export function isWithinBookingWindow(date: Date, days: number = 14): boolean {
  const now = dayjs().startOf('day');
  const target = dayjs(date).startOf('day');
  const maxDate = now.add(days, 'day');

  return !target.isBefore(now) && !target.isAfter(maxDate);
}

/**
 * Format slot time range for display
 */
export function formatSlotRange(startUtc: string, endUtc: string): string {
  const start = toLocalTimeLabel(startUtc);
  const end = toLocalTimeLabel(endUtc);
  return `${start} – ${end}`;
}
