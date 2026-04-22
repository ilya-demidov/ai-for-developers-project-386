import { useState } from 'react';
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom';
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
  TextInput,
  Textarea,
  Button,
  Loader,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { zodResolver } from 'mantine-form-zod-resolver';
import { notifications } from '@mantine/notifications';
import { IconArrowLeft, IconCheck } from '@tabler/icons-react';
import { z } from 'zod';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
dayjs.extend(utc);
import { usePublicEventType, useCreateBooking } from '../../api/hooks';
import { HostBadge } from '../../components/HostBadge';
import { ProblemAlert } from '../../components/ProblemAlert';
import { toLocalDateLabel, toLocalTimeLabel } from '../../lib/time';
import type { ApiError } from '../../api/client';

const bookingSchema = z.object({
  guestName: z.string().min(1, 'Имя обязательно').max(100, 'Максимум 100 символов'),
  guestEmail: z.string().email('Введите корректный email'),
  notes: z.string().max(1000, 'Максимум 1000 символов').optional(),
});

type BookingFormData = z.infer<typeof bookingSchema>;

export function BookConfirmPage() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [apiError, setApiError] = useState<ApiError | null>(null);

  const startUtc = searchParams.get('start');

  const { data: eventType, isLoading: isLoadingEventType } = usePublicEventType(id || '');
  const createBooking = useCreateBooking();

  const form = useForm<BookingFormData>({
    initialValues: {
      guestName: '',
      guestEmail: '',
      notes: '',
    },
    validate: zodResolver(bookingSchema),
  });

  const handleSubmit = async (values: BookingFormData) => {
    if (!id || !startUtc) return;

    setApiError(null);

    try {
      await createBooking.mutateAsync({
        eventTypeId: id,
        startUtc,
        guestName: values.guestName,
        guestEmail: values.guestEmail,
        notes: values.notes || undefined,
      });

      notifications.show({
        title: 'Успешно!',
        message: 'Ваша встреча забронирована.',
        color: 'green',
        icon: <IconCheck size={16} />,
      });

      navigate('/event-types');
    } catch (error) {
      const apiErr = error as ApiError;
      setApiError(apiErr);

      if (apiErr.status === 409) {
        notifications.show({
          title: 'Ошибка',
          message: 'Этот слот уже занят. Пожалуйста, выберите другое время.',
          color: 'red',
        });
      } else if (apiErr.status === 400) {
        // Map API validation errors to form fields, but tolerate malformed payloads.
        const validationErrors = apiErr.details?.errors;
        const errors: Record<string, string> = {};

        if (validationErrors && typeof validationErrors === 'object') {
          for (const [field, messages] of Object.entries(validationErrors)) {
            if (Array.isArray(messages) && messages.length > 0 && typeof messages[0] === 'string') {
              errors[field.toLowerCase()] = messages[0];
            }
          }
        }

        if (Object.keys(errors).length > 0) {
          form.setErrors(errors);
        }
      }
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

  if (!eventType || !startUtc) {
    return (
      <Container size="xl" py="xl">
        <Text>Некорректные параметры бронирования</Text>
        <Button component={Link} to="/event-types" mt="md">
          Вернуться к выбору
        </Button>
      </Container>
    );
  }

  return (
    <Container size="md" py="xl">
      <Stack gap="xl">
        <Group>
          <Button
            component={Link}
            to={`/book/${id}`}
            variant="subtle"
            leftSection={<IconArrowLeft size={16} />}
          >
            Назад
          </Button>
        </Group>

        {apiError && <ProblemAlert problem={apiError.details} />}

        <Grid gap={{ base: 20, md: 40 }}>
          {/* Left Column - Event Info */}
          <Grid.Col span={{ base: 12, md: 4 }}>
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
                      Дата
                    </Text>
                    <Text size="sm" fw={500}>
                      {toLocalDateLabel(startUtc)}
                    </Text>
                  </Paper>

                  <Paper p="sm" radius="md" bg="gray.0">
                    <Text size="xs" c="dimmed" mb={2}>
                      Время
                    </Text>
                    <Text size="sm" fw={500}>
                      {`${toLocalTimeLabel(startUtc)} – ${toLocalTimeLabel(dayjs.utc(startUtc).add(eventType.durationMinutes, 'minute').toISOString())}`}
                    </Text>
                  </Paper>
                </Stack>
              </Stack>
            </Card>
          </Grid.Col>

          {/* Right Column - Form */}
          <Grid.Col span={{ base: 12, md: 8 }}>
            <Card withBorder radius="lg" p="xl">
              <form onSubmit={form.onSubmit(handleSubmit)}>
                <Stack gap="md">
                  <Title order={3} size="h4">
                    Введите данные
                  </Title>

                  <TextInput
                    label="Ваше имя"
                    placeholder="Иван Иванов"
                    required
                    {...form.getInputProps('guestName')}
                  />

                  <TextInput
                    label="Email"
                    placeholder="ivan@example.com"
                    required
                    type="email"
                    {...form.getInputProps('guestEmail')}
                  />

                  <Textarea
                    label="Заметки (опционально)"
                    placeholder="Дополнительная информация о встрече..."
                    minRows={3}
                    {...form.getInputProps('notes')}
                  />

                  <Group justify="flex-end" mt="md">
                    <Button
                      type="submit"
                      color="orange"
                      size="lg"
                      loading={createBooking.isPending}
                    >
                      Подтвердить запись
                    </Button>
                  </Group>
                </Stack>
              </form>
            </Card>
          </Grid.Col>
        </Grid>
      </Stack>
    </Container>
  );
}
