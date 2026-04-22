import { Card, Group, Text, Stack, Badge } from '@mantine/core';
import type { Booking } from '../types/api';
import { toLocalDateLabel, toLocalTimeLabel } from '../lib/time';

interface BookingCardProps {
  booking: Booking;
}

export function BookingCard({ booking }: BookingCardProps) {
  return (
    <Card
      withBorder
      radius="lg"
      p="md"
      data-testid="admin-booking-card"
      data-booking-id={booking.id}
    >
      <Stack gap="xs">
        <Group justify="space-between">
          <Text fw={600} size="md">
            {booking.eventTypeName}
          </Text>
          <Badge color="orange" variant="light">
            {toLocalTimeLabel(booking.startUtc)} - {toLocalTimeLabel(booking.endUtc)}
          </Badge>
        </Group>

        <Text c="dimmed" size="sm">
          {toLocalDateLabel(booking.startUtc)}
        </Text>

        <Group gap="xs">
          <Text size="sm" fw={500}>
            {booking.guestName}
          </Text>
          <Text size="sm" c="dimmed">
            {booking.guestEmail}
          </Text>
        </Group>

        {booking.notes && (
          <Text size="sm" c="dimmed" lineClamp={2}>
            {booking.notes}
          </Text>
        )}
      </Stack>
    </Card>
  );
}
