import { useState } from 'react';
import {
  Container,
  Stack,
  Title,
  Text,
  Group,
  Loader,
  Button,
  Card,
  Badge,
  ActionIcon,
  Menu,
  Modal,
} from '@mantine/core';
import {
  IconPlus,
  IconEdit,
  IconTrash,
  IconDotsVertical,
  IconCheck,
} from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { useAdminEventTypes, useDeleteEventType } from '../../api/hooks';
import { getProblemDetails } from '../../api/client';
import { ProblemAlert } from '../../components/ProblemAlert';
import { EventTypeFormModal } from './EventTypeFormModal';
import type { EventType } from '../../types/api';

export function AdminEventTypesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEventType, setEditingEventType] = useState<EventType | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const { data: eventTypes, isLoading, error } = useAdminEventTypes();
  const deleteMutation = useDeleteEventType();

  const handleEdit = (eventType: EventType) => {
    setEditingEventType(eventType);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setEditingEventType(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingEventType(null);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
      notifications.show({
        title: 'Успешно',
        message: 'Тип события удален',
        color: 'green',
        icon: <IconCheck size={16} />,
      });
    } catch {
      notifications.show({
        title: 'Ошибка',
        message: 'Не удалось удалить тип события',
        color: 'red',
      });
    }
    setDeleteConfirmId(null);
  };

  return (
    <Container size="md" py="xl">
      <Stack gap="xl">
        <Group justify="space-between" align="center">
          <div>
            <Title order={2}>Типы событий</Title>
            <Text c="dimmed" size="sm" mt={4}>
              Управление доступными типами встреч
            </Text>
          </div>

          <Button color="orange" leftSection={<IconPlus size={16} />} onClick={handleCreate}>
            Создать тип
          </Button>
        </Group>

        {error && (
          <ProblemAlert
            problem={getProblemDetails(error)}
            title="Не удалось загрузить типы событий"
          />
        )}

        {isLoading ? (
          <Group justify="center" py="xl">
            <Loader color="orange" />
          </Group>
        ) : eventTypes?.length === 0 ? (
          <Text c="dimmed" ta="center" py="xl">
            Нет созданных типов событий
          </Text>
        ) : (
          <Stack gap="md">
            {eventTypes?.map((eventType) => (
              <Card key={eventType.id} withBorder radius="lg" p="md">
                <Group justify="space-between" align="flex-start">
                  <Stack gap="xs" style={{ flex: 1 }}>
                    <Group gap="xs">
                      <Text fw={600}>{eventType.name}</Text>
                      <Badge variant="light" color="gray" size="sm">
                        {eventType.durationMinutes} мин
                      </Badge>
                    </Group>
                    {eventType.description && (
                      <Text size="sm" c="dimmed">
                        {eventType.description}
                      </Text>
                    )}
                  </Stack>

                  <Menu position="bottom-end">
                    <Menu.Target>
                      <ActionIcon variant="subtle" color="gray">
                        <IconDotsVertical size={18} />
                      </ActionIcon>
                    </Menu.Target>
                    <Menu.Dropdown>
                      <Menu.Item leftSection={<IconEdit size={14} />} onClick={() => handleEdit(eventType)}>
                        Редактировать
                      </Menu.Item>
                      <Menu.Item
                        leftSection={<IconTrash size={14} />}
                        color="red"
                        onClick={() => setDeleteConfirmId(eventType.id)}
                      >
                        Удалить
                      </Menu.Item>
                    </Menu.Dropdown>
                  </Menu>
                </Group>
              </Card>
            ))}
          </Stack>
        )}
      </Stack>

      <EventTypeFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        eventType={editingEventType}
      />

      <Modal
        opened={!!deleteConfirmId}
        onClose={() => setDeleteConfirmId(null)}
        title="Подтверждение удаления"
        centered
      >
        <Text>Вы уверены, что хотите удалить этот тип события?</Text>
        <Group justify="flex-end" mt="md">
          <Button variant="default" onClick={() => setDeleteConfirmId(null)}>
            Отмена
          </Button>
          <Button color="red" onClick={() => deleteConfirmId && handleDelete(deleteConfirmId)}>
            Удалить
          </Button>
        </Group>
      </Modal>
    </Container>
  );
}
