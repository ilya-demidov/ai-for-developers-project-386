import { useMemo } from 'react';
import { Container, Stack, Title, Text, Group, Loader, Button } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';
import { Link } from 'react-router-dom';
import { useAdminBookings } from '../../api/hooks';
import { getProblemDetails } from '../../api/client';
import { BookingCard } from '../../components/BookingCard';
import { ProblemAlert } from '../../components/ProblemAlert';
import { getBookingWindowRange } from '../../lib/time';

export function AdminBookingsPage() {
  const { from } = useMemo(() => getBookingWindowRange(), []);

  const { data: bookings, isLoading, error } = useAdminBookings(from, undefined);

  // Sort bookings by start time
  const sortedBookings = useMemo(() => {
    if (!bookings) return [];
    return [...bookings].sort(
      (a, b) => new Date(a.startUtc).getTime() - new Date(b.startUtc).getTime()
    );
  }, [bookings]);

  return (
    <Container size="md" py="xl">
      <Stack gap="xl">
        <Group justify="space-between" align="center">
          <div>
            <Title order={2}>Предстоящие встречи</Title>
            <Text c="dimmed" size="sm" mt={4}>
              Список всех забронированных встреч
            </Text>
          </div>

          <Button
            component={Link}
            to="/admin/event-types"
            variant="light"
            leftSection={<IconPlus size={16} />}
          >
            Типы событий
          </Button>
        </Group>

        {error && (
          <ProblemAlert
            problem={getProblemDetails(error)}
            title="Не удалось загрузить бронирования"
          />
        )}

        {isLoading ? (
          <Group justify="center" py="xl">
            <Loader color="orange" />
          </Group>
        ) : sortedBookings.length === 0 ? (
          <Text c="dimmed" ta="center" py="xl">
            Нет предстоящих встреч
          </Text>
        ) : (
          <Stack gap="md">
            {sortedBookings.map((booking) => (
              <BookingCard key={booking.id} booking={booking} />
            ))}
          </Stack>
        )}
      </Stack>
    </Container>
  );
}
