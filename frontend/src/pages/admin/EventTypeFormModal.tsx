import { useEffect } from 'react';
import { Modal, Stack, TextInput, Textarea, NumberInput, Group, Button } from '@mantine/core';
import { useForm } from '@mantine/form';
import { zodResolver } from 'mantine-form-zod-resolver';
import { notifications } from '@mantine/notifications';
import { z } from 'zod';
import { IconCheck } from '@tabler/icons-react';
import { useCreateEventType, useUpdateEventType } from '../../api/hooks';
import type { EventType, EventTypeCreate, EventTypeUpdate } from '../../types/api';

const eventTypeSchema = z.object({
  name: z.string().min(1, 'Название обязательно').max(100, 'Максимум 100 символов'),
  description: z.string().max(1000, 'Максимум 1000 символов').optional(),
  durationMinutes: z
    .number()
    .min(5, 'Минимум 5 минут')
    .max(480, 'Максимум 480 минут'),
});

type EventTypeFormData = z.infer<typeof eventTypeSchema>;

interface EventTypeFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventType: EventType | null;
}

export function EventTypeFormModal({ isOpen, onClose, eventType }: EventTypeFormModalProps) {
  const createMutation = useCreateEventType();
  const updateMutation = useUpdateEventType();

  const form = useForm<EventTypeFormData>({
    initialValues: {
      name: '',
      description: '',
      durationMinutes: 30,
    },
    validate: zodResolver(eventTypeSchema),
  });

  // Populate form when editing
  useEffect(() => {
    if (eventType) {
      form.setValues({
        name: eventType.name,
        description: eventType.description || '',
        durationMinutes: eventType.durationMinutes,
      });
    } else {
      form.reset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventType, isOpen]);

  const handleSubmit = async (values: EventTypeFormData) => {
    try {
      if (eventType) {
        // Update existing
        await updateMutation.mutateAsync({
          id: eventType.id,
          body: values as EventTypeUpdate,
        });
        notifications.show({
          title: 'Успешно',
          message: 'Тип события обновлен',
          color: 'green',
          icon: <IconCheck size={16} />,
        });
      } else {
        // Create new
        await createMutation.mutateAsync(values as EventTypeCreate);
        notifications.show({
          title: 'Успешно',
          message: 'Тип события создан',
          color: 'green',
          icon: <IconCheck size={16} />,
        });
      }
      onClose();
    } catch {
      notifications.show({
        title: 'Ошибка',
        message: 'Не удалось сохранить тип события',
        color: 'red',
      });
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <Modal opened={isOpen} onClose={onClose} title={eventType ? 'Редактировать тип' : 'Создать тип'} centered>
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md">
          <TextInput
            label="Название"
            placeholder="Например, Консультация"
            required
            data-testid="event-type-name-input"
            {...form.getInputProps('name')}
          />

          <Textarea
            label="Описание"
            placeholder="Описание типа события..."
            minRows={3}
            data-testid="event-type-description-input"
            {...form.getInputProps('description')}
          />

          <NumberInput
            label="Длительность (минуты)"
            placeholder="30"
            required
            min={5}
            max={480}
            data-testid="event-type-duration-input"
            {...form.getInputProps('durationMinutes')}
          />

          <Group justify="flex-end" mt="md">
            <Button variant="default" onClick={onClose} data-testid="event-type-form-cancel-button">
              Отмена
            </Button>
            <Button
              type="submit"
              color="orange"
              loading={isLoading}
              data-testid="event-type-form-submit-button"
            >
              {eventType ? 'Сохранить' : 'Создать'}
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
