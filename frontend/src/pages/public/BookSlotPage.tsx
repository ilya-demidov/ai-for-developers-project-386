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
      <Stack gap="xl">
        <Title order={2}>
          {eventType.name}
        </Title>

        <Grid gap={{ base: 20, md: 40 }}>
          {/* Left Column - Event Info */}
          <Grid.Col span={{ base: 12, md: 3 }}>
            <Card withBorder radius="lg" p="md">
              <Stack gap="md">
                <HostBadge size="sm" />

                <div>
                  <Group gap="xs" mb={4}>
                    <Text fw={600}>{eventType.name}</Text>
                    <Badge size="sm" variant="light" color="gray">
                      {eventType.durationMinutes} мин
                    </Badge>
                  </Group>
                  {eventType.description && (
                    <Text size="sm" c="dimmed">
                      {eventType.description}
                    </Text>
                  )}
                </div>

                <Stack gap="xs">
                  <Paper p="sm" radius="md" bg="gray.0">
                    <Text size="xs" c="dimmed" mb={2}>
                      Выбранная дата
                    </Text>
                    <Text size="sm" fw={500}>
                      {selectedDate
                        ? toLocalDateLabel(selectedDate.toISOString())
                        : 'Дата не выбрана'}
                    </Text>
                  </Paper>

                  <Paper p="sm" radius="md" bg="gray.0">
                    <Text size="xs" c="dimmed" mb={2}>
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
            <MonthCalendar
              selectedDate={selectedDate}
              onSelectDate={handleSelectDate}
            />
          </Grid.Col>

          {/* Right Column - Slot Status */}
          <Grid.Col span={{ base: 12, md: 4 }}>
            <SlotStatusList
              slots={slotsWithStatus}
              selectedSlot={selectedSlot}
              onSelectSlot={handleSelectSlot}
              onBack={handleBack}
              onContinue={handleContinue}
              isLoading={isLoadingSlots}
            />
          </Grid.Col>
        </Grid>
      </Stack>
    </Container>
  );
}
