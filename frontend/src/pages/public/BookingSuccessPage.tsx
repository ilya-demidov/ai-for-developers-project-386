import {
  Box,
  Button,
  Card,
  Container,
  Divider,
  Group,
  Paper,
  SimpleGrid,
  Stack,
  Text,
  ThemeIcon,
  Title,
} from '@mantine/core';
import { IconCheck } from '@tabler/icons-react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { HostBadge } from '../../components/HostBadge';
import { formatSlotRange, toLocalDateLabel } from '../../lib/time';
import type { Booking } from '../../types/api';

interface BookingSuccessLocationState {
  booking?: Booking;
}

export function BookingSuccessPage() {
  const location = useLocation();
  const booking = (location.state as BookingSuccessLocationState | null)?.booking;

  if (!booking) {
    return <Navigate to="/" replace />;
  }

  return (
    <Container size={720} px={{ base: 'xs', sm: 0 }} py={{ base: 'xs', sm: 'sm' }} h="calc(100dvh - 62px)">
      <Card
        withBorder
        radius="lg"
        p={{ base: 'md', sm: 'lg' }}
        h="100%"
        styles={{
          root: {
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          },
        }}
      >
        <Stack gap="sm" align="center">
          <ThemeIcon size={56} radius="xl" color="green" variant="light">
            <IconCheck size={28} />
          </ThemeIcon>

          <div style={{ textAlign: 'center' }}>
            <Title order={2} size="h3" mb={4}>
              Время забронировано
            </Title>
            <Text c="dimmed" size="sm">
              Ниже детали встречи.
            </Text>
          </div>
        </Stack>

        <Divider my="sm" />

        <Box
          style={{
            flex: 1,
            minHeight: 0,
            overflowY: 'auto',
            paddingRight: '2px',
          }}
        >
          <Stack gap="sm">
            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm">
              <Paper p="sm" radius="md" bg="gray.0">
                <Text size="sm" c="dimmed" mb={2}>
                  Что
                </Text>
                <Text fw={600}>{booking.eventTypeName}</Text>
              </Paper>

              <Paper p="sm" radius="md" bg="gray.0">
                <Text size="sm" c="dimmed" mb={2}>
                  Когда
                </Text>
                <Text fw={600}>{toLocalDateLabel(booking.startUtc)}</Text>
                <Text>{formatSlotRange(booking.startUtc, booking.endUtc)}</Text>
              </Paper>

              <Paper p="sm" radius="md" bg="gray.0" style={{ gridColumn: '1 / -1' }}>
                <Text size="sm" c="dimmed" mb={2}>
                  Кто
                </Text>
                <Text fw={600}>{booking.guestName}</Text>
                <Text c="dimmed">{booking.guestEmail}</Text>
              </Paper>
            </SimpleGrid>

            {booking.notes && (
              <Paper p="sm" radius="md" bg="gray.0">
                <Text size="sm" c="dimmed" mb={2}>
                  Дополнительные заметки
                </Text>
                <Text
                  style={{
                    whiteSpace: 'pre-wrap',
                    maxHeight: '88px',
                    overflowY: 'auto',
                  }}
                >
                  {booking.notes}
                </Text>
              </Paper>
            )}

            <Paper withBorder radius="md" p="sm">
              <HostBadge size="sm" />
            </Paper>
          </Stack>
        </Box>

        <Group justify="center" pt="sm" mt="sm">
          <Button component={Link} to="/" color="orange" size="md">
            На главную
          </Button>
        </Group>
      </Card>
    </Container>
  );
}
