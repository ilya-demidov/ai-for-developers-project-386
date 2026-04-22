import { useState, useMemo } from 'react';
import { Paper, Text, Group, ActionIcon, SimpleGrid, Box } from '@mantine/core';
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react';
import dayjs from 'dayjs';
import 'dayjs/locale/ru';
import { nowInDisplayTimezone } from '../lib/timezone';
import classes from './MonthCalendar.module.css';

interface MonthCalendarProps {
  selectedDayKey: string | null;
  onSelectDayKey: (dayKey: string) => void;
  availableDayKeys: Set<string>;
}

const WEEKDAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

export function MonthCalendar({
  selectedDayKey,
  onSelectDayKey,
  availableDayKeys,
}: MonthCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(
    nowInDisplayTimezone().startOf('month')
  );

  const handleDateSelect = (dayKey: string) => {
    if (availableDayKeys.has(dayKey)) {
      onSelectDayKey(dayKey);
    }
  };

  const handlePrevMonth = () => {
    setCurrentMonth((prev) => prev.subtract(1, 'month'));
  };

  const handleNextMonth = () => {
    setCurrentMonth((prev) => prev.add(1, 'month'));
  };

  const days = useMemo(() => {
    const month = currentMonth.locale('ru');
    const startOfMonth = month.startOf('month');
    const endOfMonth = month.endOf('month');
    const startOfFirstWeek = startOfMonth.startOf('week');
    const endOfLastWeek = endOfMonth.endOf('week');

    const daysArray: {
      date: dayjs.Dayjs;
      dayKey: string;
      isCurrentMonth: boolean;
      isToday: boolean;
      isSelected: boolean;
      isDisabled: boolean;
    }[] = [];

    const todayDayKey = nowInDisplayTimezone().format('YYYY-MM-DD');

    let current = startOfFirstWeek;
    while (current.isBefore(endOfLastWeek) || current.isSame(endOfLastWeek, 'day')) {
      const dayKey = current.format('YYYY-MM-DD');
      daysArray.push({
        date: current,
        dayKey,
        isCurrentMonth: current.month() === currentMonth.month(),
        isToday: dayKey === todayDayKey,
        isSelected: selectedDayKey === dayKey,
        isDisabled: !availableDayKeys.has(dayKey),
      });
      current = current.add(1, 'day');
    }

    return daysArray;
  }, [availableDayKeys, currentMonth, selectedDayKey]);

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

      <SimpleGrid cols={7} mb={8}>
        {WEEKDAYS.map((day) => (
          <Text key={day} size="xs" c="dimmed" ta="center" fw={500}>
            {day}
          </Text>
        ))}
      </SimpleGrid>

      <Box style={{ flex: 1 }}>
        <SimpleGrid cols={7} spacing={4}>
          {days.map((day, index) => (
            <Box
              key={index}
              className={classes.calendarDay}
              data-selected={day.isSelected || undefined}
              data-disabled={day.isDisabled || undefined}
              data-current-month={day.isCurrentMonth || undefined}
              data-today={day.isToday || undefined}
              onClick={() => handleDateSelect(day.dayKey)}
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
            </Box>
          ))}
        </SimpleGrid>
      </Box>
    </Paper>
  );
}
