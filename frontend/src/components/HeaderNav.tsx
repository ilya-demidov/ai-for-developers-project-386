import {
  ActionIcon,
  Group,
  Text,
  Tooltip,
  UnstyledButton,
  useComputedColorScheme,
  useMantineColorScheme,
} from '@mantine/core';
import { IconCalendarTime, IconMoon, IconSun } from '@tabler/icons-react';
import { Link, useLocation } from 'react-router-dom';

interface NavLinkProps {
  to: string;
  label: string;
}

function NavLink({ to, label }: NavLinkProps) {
  const location = useLocation();
  const isActive = location.pathname === to || location.pathname.startsWith(`${to}/`);

  return (
    <UnstyledButton
      component={Link}
      to={to}
      py={8}
      px={16}
      style={{
        borderRadius: '8px',
        backgroundColor: isActive ? 'var(--mantine-primary-color-light)' : 'transparent',
        color: isActive
          ? 'var(--mantine-primary-color-light-color)'
          : 'var(--mantine-color-text)',
        fontWeight: 500,
        textDecoration: 'none',
      }}
    >
      {label}
    </UnstyledButton>
  );
}

export function HeaderNav() {
  const { setColorScheme } = useMantineColorScheme();
  const computedColorScheme = useComputedColorScheme('light');
  const nextColorScheme = computedColorScheme === 'dark' ? 'light' : 'dark';

  return (
    <Group justify="space-between" h="100%" px="md" py="xs" wrap="wrap">
      <UnstyledButton component={Link} to="/" style={{ textDecoration: 'none' }}>
        <Group gap="xs">
          <IconCalendarTime size={28} color="var(--mantine-primary-color-filled)" />
          <Text fw={700} size="lg" c="var(--mantine-color-text)">
            Calendar
          </Text>
        </Group>
      </UnstyledButton>

      <Group gap="xs">
        <Group gap={4}>
          <NavLink to="/event-types" label="Записаться" />
          <NavLink to="/admin" label="Админка" />
        </Group>

        <Tooltip label="Переключить тему">
          <ActionIcon
            variant="default"
            radius="md"
            aria-label="Переключить тему"
            data-testid="theme-toggle-button"
            onClick={() => setColorScheme(nextColorScheme)}
          >
            {computedColorScheme === 'dark' ? <IconSun size={18} /> : <IconMoon size={18} />}
          </ActionIcon>
        </Tooltip>
      </Group>
    </Group>
  );
}
