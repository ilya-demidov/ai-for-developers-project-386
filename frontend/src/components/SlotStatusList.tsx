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
    <Paper
      withBorder
      radius="md"
      p="lg"
      styles={{
        root: {
          borderColor: 'var(--mantine-color-default-border)',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
        },
      }}
    >
      <Text fw={600} size="lg" mb="md">
        Статус слотов
      </Text>

      <ScrollArea
        scrollbarSize={6}
        style={{ flex: 1, minHeight: 0 }}>
        <Stack gap="xs" pr={4}>
          {isLoading ? (
            <Text c="dimmed" ta="center" py="xl">
              Загрузка...
            </Text>
          ) : slots.length === 0 ? (
            <Text c="dimmed" ta="center" py="xl">
              Нет доступных слотов
            </Text>
          ) : (
            slots.map((slot) => {
              const isSelected = selectedSlot === slot.startUtc;
              const isFree = slot.status === 'free';

              return (
                <Group
                  key={slot.startUtc}
                  data-testid="slot-row"
                  data-start-utc={slot.startUtc}
                  data-status={slot.status}
                  justify="space-between"
                  px="sm"
                  py={8}
                  styles={{
                    root: {
                      borderRadius: '6px',
                      backgroundColor: isSelected
                        ? 'var(--mantine-primary-color-light)'
                        : isFree
                          ? 'transparent'
                          : 'var(--mantine-color-default)',
                      cursor: isFree ? 'pointer' : 'not-allowed',
                      border: `1px solid ${
                        isSelected
                          ? 'var(--mantine-primary-color-filled)'
                          : 'var(--mantine-color-default-border)'
                      }`,
                      opacity: isFree ? 1 : 0.7,
                      transition: 'all 0.15s ease',
                      '&:hover': isFree
                        ? {
                            backgroundColor: isSelected
                              ? 'var(--mantine-primary-color-light)'
                              : 'var(--mantine-color-default-hover)',
                            borderColor: 'var(--mantine-primary-color-filled)',
                          }
                        : undefined,
                    },
                  }}
                  onClick={() => isFree && onSelectSlot(slot.startUtc)}
                >
                  <Text
                    size="sm"
                    fw={isSelected ? 500 : 400}
                    c={isFree ? 'var(--mantine-color-text)' : 'dimmed'}
                    style={{ fontFamily: 'monospace' }}
                  >
                    {formatSlotRange(slot.startUtc, slot.endUtc)}
                  </Text>
                  <Text size="sm" c={isFree ? 'green.6' : 'red.6'} fw={500}>
                    {isFree ? 'Свободно' : 'Занято'}
                  </Text>
                </Group>
              );
            })
          )}
        </Stack>
      </ScrollArea>

      <Group justify="space-between" pt="lg" style={{ marginTop: 'auto' }}>
        <Button
          variant="default"
          size="sm"
          radius="md"
          data-testid="slot-back-button"
          onClick={onBack}
          styles={{
            root: {
              borderColor: 'var(--mantine-color-default-border)',
              fontWeight: 500,
            },
          }}
        >
          Назад
        </Button>
        <Button
          color="orange"
          size="sm"
          radius="md"
          data-testid="slot-continue-button"
          onClick={onContinue}
          disabled={!selectedSlot}
          styles={{
            root: {
              fontWeight: 500,
            },
          }}
        >
          Продолжить
        </Button>
      </Group>
    </Paper>
  );
}
