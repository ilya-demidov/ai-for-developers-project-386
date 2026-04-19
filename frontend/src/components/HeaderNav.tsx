import { Group, Text, UnstyledButton } from '@mantine/core';
import { IconCalendarTime } from '@tabler/icons-react';
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
        backgroundColor: isActive ? '#f1f3f5' : 'transparent',
        color: '#495057',
        fontWeight: 500,
        textDecoration: 'none',
      }}
    >
      {label}
    </UnstyledButton>
  );
}

export function HeaderNav() {
  return (
    <Group justify="space-between" h="100%" px="md">
      <Group gap="xs">
        <IconCalendarTime size={28} color="#fd7e14" />
        <Text fw={700} size="lg">
          Calendar
        </Text>
      </Group>

      <Group gap={4}>
        <NavLink to="/event-types" label="Записаться" />
        <NavLink to="/admin" label="Админка" />
      </Group>
    </Group>
  );
}
