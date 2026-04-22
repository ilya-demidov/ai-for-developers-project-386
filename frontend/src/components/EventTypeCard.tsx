import { Card, Group, Text, Badge, Stack, UnstyledButton } from '@mantine/core';
import type { EventType } from '../types/api';

interface EventTypeCardProps {
  eventType: EventType;
  onClick?: () => void;
}

export function EventTypeCard({ eventType, onClick }: EventTypeCardProps) {
  return (
    <Card withBorder radius="lg" p="lg">
      <UnstyledButton
        onClick={onClick}
        style={{ width: '100%' }}
        data-testid={`event-type-card-${eventType.id}`}
      >
        <Stack gap="xs">
          <Group justify="space-between" align="flex-start">
            <Text fw={600} size="lg" style={{ flex: 1 }}>
              {eventType.name}
            </Text>
            <Badge variant="light" color="gray" size="sm">
              {eventType.durationMinutes} мин
            </Badge>
          </Group>
          {eventType.description && (
            <Text c="dimmed" size="sm" lineClamp={2}>
              {eventType.description}
            </Text>
          )}
        </Stack>
      </UnstyledButton>
    </Card>
  );
}
