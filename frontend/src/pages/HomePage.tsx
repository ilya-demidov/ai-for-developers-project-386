import {
  Container,
  Grid,
  Title,
  Text,
  Button,
  Card,
  Stack,
  Badge,
  Group,
  useComputedColorScheme,
} from '@mantine/core';
import { IconArrowRight, IconCalendarEvent, IconClock, IconSettings } from '@tabler/icons-react';
import { Link } from 'react-router-dom';

export function HomePage() {
  const colorScheme = useComputedColorScheme('light');

  return (
    <div
      style={{
        minHeight: 'calc(100dvh - 62px)',
        background:
          colorScheme === 'dark'
            ? 'linear-gradient(135deg, var(--mantine-color-dark-8) 0%, var(--mantine-color-dark-7) 100%)'
            : 'linear-gradient(135deg, var(--mantine-color-blue-0) 0%, var(--mantine-color-orange-0) 100%)',
        padding: '60px 0',
      }}
    >
      <Container size="xl">
        <Grid gap={{ base: 20, md: 40 }} align="flex-start">
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Stack gap="lg" align="flex-start">
              <Badge size="lg" radius="xl" variant="light" color="gray">
                БЫСТРАЯ ЗАПИСЬ НА ВСТРЕЧУ
              </Badge>

              <Title order={1} size="48px" fw={700}>
                Calendar
              </Title>

              <Text size="lg" c="dimmed" maw={500}>
                Забронируйте встречу за минуту: выберите тип события и удобное время.
              </Text>

              <Button
                component={Link}
                to="/event-types"
                color="orange"
                size="lg"
                radius="md"
                rightSection={<IconArrowRight size={20} />}
              >
                Записаться
              </Button>
            </Stack>
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 6 }}>
            <Card withBorder radius="lg" p="xl" shadow="sm">
              <Stack gap="md">
                <Title order={3} size="h4">
                  Возможности
                </Title>

                <Group gap="sm" align="flex-start">
                  <IconCalendarEvent size={20} color="var(--mantine-color-orange-6)" />
                  <Text size="sm">
                    Выбор типа события и удобного времени для встречи.
                  </Text>
                </Group>

                <Group gap="sm" align="flex-start">
                  <IconClock size={20} color="var(--mantine-color-orange-6)" />
                  <Text size="sm">
                    Быстрое бронирование с подтверждением и дополнительными заметками.
                  </Text>
                </Group>

                <Group gap="sm" align="flex-start">
                  <IconSettings size={20} color="var(--mantine-color-orange-6)" />
                  <Text size="sm">
                    Управление типами встреч и просмотр предстоящих записей в админке.
                  </Text>
                </Group>
              </Stack>
            </Card>
          </Grid.Col>
        </Grid>
      </Container>
    </div>
  );
}
