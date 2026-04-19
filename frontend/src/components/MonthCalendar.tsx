import { Calendar } from '@mantine/dates';
import { Paper, Text } from '@mantine/core';
import dayjs from 'dayjs';
import { isWithinBookingWindow } from '../lib/time';

interface MonthCalendarProps {
  selectedDate: Date | null;
  onSelectDate: (date: Date) => void;
}

export function MonthCalendar({ selectedDate, onSelectDate }: MonthCalendarProps) {
  const handleDateSelect = (dateStr: string) => {
    const date = new Date(dateStr);
    if (isWithinBookingWindow(date)) {
      onSelectDate(date);
    }
  };

  return (
    <Paper withBorder radius="lg" p="md">
      <Text fw={600} size="lg" mb="md">
        Календарь
      </Text>

      <Text size="sm" c="dimmed" mb="sm" style={{ textTransform: 'capitalize' }}>
        {dayjs().locale('ru').format('MMMM YYYY')}
      </Text>

      <Calendar
        getDayProps={(dateStr) => {
          const date = new Date(dateStr);
          const isSelected = selectedDate ? dayjs(date).isSame(selectedDate, 'day') : false;
          const isDisabled = !isWithinBookingWindow(date);

          return {
            selected: isSelected,
            disabled: isDisabled,
            onClick: () => handleDateSelect(dateStr),
          };
        }}
        styles={{
          day: {
            '&[data-selected]': {
              backgroundColor: 'var(--mantine-color-orange-6)',
              color: 'white',
            },
            '&[data-disabled]': {
              color: 'var(--mantine-color-gray-4)',
            },
          },
        }}
      />
    </Paper>
  );
}
