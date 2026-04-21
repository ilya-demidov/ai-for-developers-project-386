import { useState, useMemo } from 'react';
import { Paper, Text, Group, ActionIcon, SimpleGrid, Box } from '@mantine/core';
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react';
import dayjs from 'dayjs';
import 'dayjs/locale/ru';
import { isWithinBookingWindow } from '../lib/time';
import classes from './MonthCalendar.module.css';

interface MonthCalendarProps {
  selectedDate: Date | null;
  onSelectDate: (date: Date) => void;
  eventTypeId: string;
  durationMinutes: number;
}

const WEEKDAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

export function MonthCalendar({
  selectedDate,
  onSelectDate,
}: MonthCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(dayjs());

  const handleDateSelect = (date: Date) => {
    if (isWithinBookingWindow(date)) {
      onSelectDate(date);
    }
  };

  const handlePrevMonth = () => {
    setCurrentMonth((prev) => prev.subtract(1, 'month'));
  };

  const handleNextMonth = () => {
    setCurrentMonth((prev) => prev.add(1, 'month'));
  };

  const days = useMemo(() => {
    const startOfMonth = currentMonth.startOf('month');
    const endOfMonth = currentMonth.endOf('month');
    const startOfFirstWeek = startOfMonth.startOf('week');
    const endOfLastWeek = endOfMonth.endOf('week');

    const daysArray: {
      date: dayjs.Dayjs;
      isCurrentMonth: boolean;
      isToday: boolean;
      isSelected: boolean;
      isDisabled: boolean;
    }[] = [];

    let current = startOfFirstWeek;
    while (current.isBefore(endOfLastWeek) || current.isSame(endOfLastWeek, 'day')) {
      const date = current.toDate();
      daysArray.push({
        date: current,
        isCurrentMonth: current.month() === currentMonth.month(),
        isToday: current.isSame(dayjs(), 'day'),
        isSelected: selectedDate ? current.isSame(selectedDate, 'day') : false,
        isDisabled: !isWithinBookingWindow(date),
      });
      current = current.add(1, 'day');
    }

    return daysArray;
  }, [currentMonth, selectedDate]);

  return (
    <Paper
      withBorder
      radius="md"
      p="lg"
      style={{
        borderColor: '#e9ecef',
        height: '100%',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      <Group justify="space-between" mb="md">
        <Text fw={600} size="lg">
          Календарь
        </Text>
        <Group gap={4}>
          <ActionIcon
            variant="default"
            size="sm"
            radius="md"
            onClick={handlePrevMonth}
          >
            <IconChevronLeft size={16} />
          </ActionIcon>
          <ActionIcon
            variant="default"
            size="sm"
            radius="md"
            onClick={handleNextMonth}
          >
            <IconChevronRight size={16} />
          </ActionIcon>
        </Group>
      </Group>

      <Text size="sm" c="dimmed" mb="md">
        {currentMonth.locale('ru').format('MMMM YYYY г.')}
      </Text>

      {/* Weekday headers */}
      <SimpleGrid cols={7} mb={8}>
        {WEEKDAYS.map((day) => (
          <Text key={day} size="xs" c="dimmed" ta="center" fw={500}>
            {day}
          </Text>
        ))}
      </SimpleGrid>

      {/* Calendar days */}
      <Box style={{ flex: 1 }}>
        <SimpleGrid cols={7} spacing={4}>
        {days.map((day, index) => (
          <Box
            key={index}
            className={classes.calendarDay}
            data-selected={day.isSelected || undefined}
            data-disabled={day.isDisabled || undefined}
            data-current-month={day.isCurrentMonth || undefined}
            onClick={() => handleDateSelect(day.date.toDate())}
          >
            <Text
              size="sm"
              fw={day.isSelected ? 600 : 400}
              ta="center"
              c={
                day.isSelected
                  ? 'white'
                  : day.isDisabled || !day.isCurrentMonth
                    ? 'gray.4'
                    : 'dark'
              }
            >
              {day.date.format('D')}
            </Text>
            {day.isCurrentMonth && !day.isDisabled && (
              <Text size="xs" c="gray.5" ta="center" mt={2}>
                св.
              </Text>
            )}
          </Box>
        ))}
      </SimpleGrid>
      </Box>
    </Paper>
  );
}
