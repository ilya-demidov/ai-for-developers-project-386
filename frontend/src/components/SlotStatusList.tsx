import { Paper, Stack, Group, Text, Button, Box, ScrollArea } from '@mantine/core';
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
          borderColor: '#e9ecef',
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
                  justify="space-between"
                  px="sm"
                  py={8}
                  styles={{
                    root: {
                      borderRadius: '6px',
                      backgroundColor: isSelected
                        ? '#fff5e6'
                        : isFree
                          ? 'white'
                          : '#f8f9fa',
                      cursor: isFree ? 'pointer' : 'not-allowed',
                      border: `1px solid ${
                        isSelected ? '#fd7e14' : isFree ? '#e9ecef' : '#f1f3f5'
                      }`,
                      opacity: isFree ? 1 : 0.7,
                      transition: 'all 0.15s ease',
                      '&:hover': isFree
                        ? {
                            backgroundColor: isSelected ? '#fff5e6' : '#f8f9fa',
                            borderColor: '#fd7e14',
                          }
                        : undefined,
                    },
                  }}
                  onClick={() => isFree && onSelectSlot(slot.startUtc)}
                >
                  <Text
                    size="sm"
                    fw={isSelected ? 500 : 400}
                    c={isFree ? 'dark' : 'dimmed'}
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
          onClick={onBack}
          styles={{
            root: {
              borderColor: '#e9ecef',
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
          onClick={onContinue}
          disabled={!selectedSlot}
          styles={{
            root: {
              backgroundColor: selectedSlot ? '#fd7e14' : '#e9ecef',
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
