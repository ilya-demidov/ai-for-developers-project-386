import { Container, Stack, Title, Text, SimpleGrid, Card, Group, Loader } from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import { usePublicEventTypes } from '../../api/hooks';
import { getProblemDetails } from '../../api/client';
import { HostBadge } from '../../components/HostBadge';
import { EventTypeCard } from '../../components/EventTypeCard';
import { ProblemAlert } from '../../components/ProblemAlert';
import type { EventType } from '../../types/api';

export function EventTypesListPage() {
  const navigate = useNavigate();
  const { data: eventTypes, isLoading, error } = usePublicEventTypes();

  const handleEventTypeClick = (id: string) => {
    navigate(`/book/${id}`);
  };

  return (
    <Container size="md" py="xl">
      <Stack gap="xl">
        {/* Host Info Card */}
        <Card withBorder radius="lg" p="xl">
          <Stack gap="md">
            <HostBadge size="lg" />

            <div>
              <Title order={2} size="h3">
                Выберите тип события
              </Title>
              <Text c="dimmed" size="sm" mt={4}>
                Нажмите на карточку, чтобы открыть календарь и выбрать удобный слот.
              </Text>
            </div>
          </Stack>
        </Card>

        {/* Error Display */}
        {error && (
          <ProblemAlert
            problem={getProblemDetails(error)}
            title="Не удалось загрузить типы событий"
          />
        )}

        {/* Event Types Grid */}
        {isLoading ? (
          <Group justify="center" py="xl">
            <Loader color="orange" />
          </Group>
        ) : (
          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
            {eventTypes?.map((eventType: EventType) => (
              <EventTypeCard
                key={eventType.id}
                eventType={eventType}
                onClick={() => handleEventTypeClick(eventType.id)}
              />
            ))}
          </SimpleGrid>
        )}
      </Stack>
    </Container>
  );
}
