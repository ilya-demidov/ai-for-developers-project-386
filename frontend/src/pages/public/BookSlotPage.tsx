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
import { getProblemDetails } from '../../api/client';
import { HostBadge } from '../../components/HostBadge';
import { MonthCalendar } from '../../components/MonthCalendar';
import { ProblemAlert } from '../../components/ProblemAlert';
import { SlotStatusList } from '../../components/SlotStatusList';
import {
  formatSelectedDayLabel,
  generateDayGrid,
  mergeWithFreeSlots,
  toLocalTimeLabel,
} from '../../lib/time';
import type { SlotWithStatus } from '../../lib/time';
import { toDisplayDayKey } from '../../lib/timezone';

const CALENDAR_HEIGHT = 520;

export function BookSlotPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [selectedDayKey, setSelectedDayKey] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

  const { data: eventType, isLoading: isLoadingEventType } = usePublicEventType(id || '');
  const {
    data: windowFreeSlots,
    isLoading: isLoadingWindowSlots,
    error: windowSlotsError,
  } = useSlots(id || '', undefined, undefined, {
    enabled: !!id,
  });

  const availableDayKeys = useMemo(() => {
    const dayKeys = new Set<string>();
    for (const slot of windowFreeSlots ?? []) {
      dayKeys.add(toDisplayDayKey(slot.startUtc));
    }
    return dayKeys;
  }, [windowFreeSlots]);

  const activeSelectedDayKey =
    selectedDayKey && availableDayKeys.has(selectedDayKey) ? selectedDayKey : null;
  const activeSelectedSlot = activeSelectedDayKey ? selectedSlot : null;

  const dayFreeSlots = useMemo(() => {
    if (!activeSelectedDayKey) return [];
    return (windowFreeSlots ?? []).filter(
      (slot) => toDisplayDayKey(slot.startUtc) === activeSelectedDayKey
    );
  }, [activeSelectedDayKey, windowFreeSlots]);

  const slotsError = windowSlotsError;

  const slotsWithStatus: SlotWithStatus[] = useMemo(() => {
    if (!activeSelectedDayKey || !eventType) return [];
    if (slotsError) return [];
    const grid = generateDayGrid(activeSelectedDayKey, eventType.durationMinutes);
    return mergeWithFreeSlots(grid, dayFreeSlots || []);
  }, [activeSelectedDayKey, eventType, dayFreeSlots, slotsError]);

  const handleSelectDayKey = (dayKey: string) => {
    setSelectedDayKey(dayKey);
    setSelectedSlot(null);
  };

  const handleSelectSlot = (startUtc: string) => {
    setSelectedSlot(startUtc);
  };

  const handleBack = () => {
    navigate('/event-types');
  };

  const handleContinue = () => {
    if (activeSelectedSlot && id) {
      navigate(`/book/${id}/confirm?start=${encodeURIComponent(activeSelectedSlot)}`);
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

        {slotsError && (
          <ProblemAlert
            problem={getProblemDetails(slotsError)}
            title="Не удалось загрузить слоты"
          />
        )}

        <Grid gap={{ base: 16, md: 24 }}>
          <Grid.Col span={{ base: 12, md: 3 }}>
            <Card
              withBorder
              radius="md"
              p="lg"
              h={{ base: 'auto', md: CALENDAR_HEIGHT }}
              style={{
                borderColor: 'var(--mantine-color-default-border)',
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
                    styles={{ root: { backgroundColor: 'var(--mantine-color-default)' } }}
                  >
                    <Text size="xs" c="dimmed" mb={4}>
                      Выбранная дата
                    </Text>
                    <Text size="sm" fw={500}>
                      {activeSelectedDayKey
                        ? formatSelectedDayLabel(activeSelectedDayKey)
                        : 'Дата не выбрана'}
                    </Text>
                  </Paper>

                  <Paper
                    p="sm"
                    radius="sm"
                    styles={{ root: { backgroundColor: 'var(--mantine-color-default)' } }}
                  >
                    <Text size="xs" c="dimmed" mb={4}>
                      Выбранное время
                    </Text>
                    <Text size="sm" fw={500}>
                      {activeSelectedSlot
                        ? toLocalTimeLabel(activeSelectedSlot)
                        : 'Время не выбрано'}
                    </Text>
                  </Paper>
                </Stack>
              </Stack>
            </Card>
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 5 }}>
            <Box h={{ base: 'auto', md: CALENDAR_HEIGHT }}>
              <MonthCalendar
                selectedDayKey={activeSelectedDayKey}
                onSelectDayKey={handleSelectDayKey}
                availableDayKeys={availableDayKeys}
              />
            </Box>
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 4 }}>
            <Box h={{ base: 'auto', md: CALENDAR_HEIGHT }}>
              <SlotStatusList
                slots={slotsWithStatus}
                selectedSlot={activeSelectedSlot}
                onSelectSlot={handleSelectSlot}
                onBack={handleBack}
                onContinue={handleContinue}
                isLoading={isLoadingWindowSlots}
              />
            </Box>
          </Grid.Col>
        </Grid>
      </Stack>
    </Container>
  );
}
