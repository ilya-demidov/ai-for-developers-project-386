import { Paper, Stack, Group, Text, Button, ScrollArea } from '@mantine/core';
import type { SlotWithStatus } from '../lib/time';
import { formatSlotRange } from '../lib/time';

interface SlotStatusListProps {
  slots: SlotWithStatus[];
  selectedSlot: string | null;
  onSelectSlot: (startUtc: string) => void;
  onBack: () => void;
  onContinue: () => void;
  isLoading?: boolean;
}

export function SlotStatusList({
  slots,
  selectedSlot,
  onSelectSlot,
  onBack,
  onContinue,
  isLoading = false,
}: SlotStatusListProps) {
  return (
    <Paper withBorder radius="lg" p="md" style={{ height: '100%' }}>
      <Text fw={600} size="lg" mb="md">
        Статус слотов
      </Text>

      <ScrollArea style={{ height: 'calc(100% - 140px)' }}>
        <Stack gap="xs">
          {isLoading ? (
            <Text c="dimmed" ta="center">
              Загрузка...
            </Text>
          ) : slots.length === 0 ? (
            <Text c="dimmed" ta="center">
              Нет доступных слотов
            </Text>
          ) : (
            slots.map((slot) => {
              const isSelected = selectedSlot === slot.startUtc;
              const isFree = slot.status === 'free';

              return (
                <Group
                  key={slot.startUtc}
                  justify="space-between"
                  p="sm"
                  style={{
                    borderRadius: '8px',
                    backgroundColor: isSelected
                      ? 'var(--mantine-color-orange-1)'
                      : 'transparent',
                    cursor: isFree ? 'pointer' : 'not-allowed',
                    border: isSelected
                      ? '1px solid var(--mantine-color-orange-6)'
                      : '1px solid var(--mantine-color-gray-2)',
                  }}
                  onClick={() => isFree && onSelectSlot(slot.startUtc)}
                >
                  <Text size="sm" fw={isSelected ? 500 : 400}>
                    {formatSlotRange(slot.startUtc, slot.endUtc)}
                  </Text>
                  <Text
                    size="sm"
                    c={isFree ? 'teal.6' : 'red.6'}
                    fw={500}
                  >
                    {isFree ? 'Свободно' : 'Занято'}
                  </Text>
                </Group>
              );
            })
          )}
        </Stack>
      </ScrollArea>

      <Group justify="space-between" mt="md">
        <Button variant="default" onClick={onBack}>
          Назад
        </Button>
        <Button
          color="orange"
          onClick={onContinue}
          disabled={!selectedSlot}
        >
          Продолжить
        </Button>
      </Group>
    </Paper>
  );
}
