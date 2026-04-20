import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Grid,
  Stack,
  Title,
  Text,
  Card,
  Badge,
  Group,
  Paper,
  Loader,
  Box,
} from '@mantine/core';
import { usePublicEventType, useSlots } from '../../api/hooks';
import { HostBadge } from '../../components/HostBadge';
import { MonthCalendar } from '../../components/MonthCalendar';
import { SlotStatusList } from '../../components/SlotStatusList';
import {
  generateDayGrid,
  mergeWithFreeSlots,
  getUtcRangeForLocalDate,
  toLocalDateLabel,
} from '../../lib/time';
import type { SlotWithStatus } from '../../lib/time';

// Фиксированная высота для календаря на десктопе
const CALENDAR_HEIGHT = 520;

export function BookSlotPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

  const { data: eventType, isLoading: isLoadingEventType } = usePublicEventType(id || '');

  const { from, to } = useMemo(() => {
    if (!selectedDate) return { from: undefined, to: undefined };
    return getUtcRangeForLocalDate(selectedDate);
  }, [selectedDate]);

  const { data: freeSlots, isLoading: isLoadingSlots } = useSlots(id || '', from, to, {
    enabled: !!id && !!selectedDate,
  });

  const slotsWithStatus: SlotWithStatus[] = useMemo(() => {
    if (!selectedDate || !eventType) return [];
    const grid = generateDayGrid(selectedDate, eventType.durationMinutes);
    return mergeWithFreeSlots(grid, freeSlots || []);
  }, [selectedDate, eventType, freeSlots]);

  const handleSelectDate = (date: Date) => {
    setSelectedDate(date);
    setSelectedSlot(null);
  };

  const handleSelectSlot = (startUtc: string) => {
    setSelectedSlot(startUtc);
  };

  const handleBack = () => {
    navigate('/event-types');
  };

  const handleContinue = () => {
    if (selectedSlot && id) {
      navigate(`/book/${id}/confirm?start=${encodeURIComponent(selectedSlot)}`);
    }
  };

  if (isLoadingEventType) {
    return (
      <Container size="xl" py="xl">
        <Group justify="center">
          <Loader color="orange" />
        </Group>
      </Container>
    );
  }

  if (!eventType) {
    return (
      <Container size="xl" py="xl">
        <Text>Тип события не найден</Text>
      </Container>
    );
  }

  return (
    <Container size="xl" py="xl">
      <Stack gap="lg">
        <Title order={2}>
          {eventType.name} {eventType.durationMinutes} минут
        </Title>

        <Grid gutter={{ base: 16, md: 24 }}>
          {/* Left Column - Event Info */}
          <Grid.Col span={{ base: 12, md: 3 }}>
            <Card
              withBorder
              radius="md"
              p="lg"
              h={{ base: 'auto', md: CALENDAR_HEIGHT }}
              style={{
                borderColor: '#e9ecef',
              }}
            >
              <Stack gap="lg">
                <HostBadge size="sm" />

                <div>
                  <Group gap="xs" mb={8}>
                    <Text fw={600} size="md">
                      {eventType.name}
                    </Text>
                    <Badge size="sm" variant="light" color="gray" radius="sm">
                      {eventType.durationMinutes} мин
                    </Badge>
                  </Group>
                  {eventType.description && (
                    <Text size="sm" c="dimmed" lh={1.5}>
                      {eventType.description}
                    </Text>
                  )}
                </div>

                <Stack gap="sm">
                  <Paper
                    p="sm"
                    radius="sm"
                    styles={{ root: { backgroundColor: '#f1f3f5' } }}
                  >
                    <Text size="xs" c="dimmed" mb={4}>
                      Выбранная дата
                    </Text>
                    <Text size="sm" fw={500}>
                      {selectedDate
                        ? toLocalDateLabel(selectedDate.toISOString())
                        : 'Дата не выбрана'}
                    </Text>
                  </Paper>

                  <Paper
                    p="sm"
                    radius="sm"
                    styles={{ root: { backgroundColor: '#f1f3f5' } }}
                  >
                    <Text size="xs" c="dimmed" mb={4}>
                      Выбранное время
                    </Text>
                    <Text size="sm" fw={500}>
                      {selectedSlot
                        ? toLocalDateLabel(selectedSlot)
                        : 'Время не выбрано'}
                    </Text>
                  </Paper>
                </Stack>
              </Stack>
            </Card>
          </Grid.Col>

          {/* Middle Column - Calendar */}
          <Grid.Col span={{ base: 12, md: 5 }}>
            <Box h={{ base: 'auto', md: CALENDAR_HEIGHT }}>
              <MonthCalendar
                selectedDate={selectedDate}
                onSelectDate={handleSelectDate}
                eventTypeId={id || ''}
                durationMinutes={eventType.durationMinutes}
              />
            </Box>
          </Grid.Col>

          {/* Right Column - Slot Status */}
          <Grid.Col span={{ base: 12, md: 4 }}>
            <Box h={{ base: 'auto', md: CALENDAR_HEIGHT }}>
              <SlotStatusList
                slots={slotsWithStatus}
                selectedSlot={selectedSlot}
                onSelectSlot={handleSelectSlot}
                onBack={handleBack}
                onContinue={handleContinue}
                isLoading={isLoadingSlots}
              />
            </Box>
          </Grid.Col>
        </Grid>
      </Stack>
    </Container>
  );
}
