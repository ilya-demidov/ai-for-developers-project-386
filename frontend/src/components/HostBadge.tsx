import { Group, Avatar, Text, Stack } from '@mantine/core';
import { HOST_NAME, HOST_ROLE } from '../lib/env';

interface HostBadgeProps {
  size?: 'sm' | 'md' | 'lg';
}

export function HostBadge({ size = 'md' }: HostBadgeProps) {
  const avatarSize = size === 'lg' ? 72 : size === 'md' ? 56 : 40;
  const nameSize = size === 'lg' ? 'xl' : size === 'md' ? 'lg' : 'md';
  const roleSize = size === 'lg' ? 'sm' : size === 'md' ? 'xs' : 'xs';

  return (
    <Group gap="sm" align="center">
      <Avatar size={avatarSize} radius="xl" color="orange">
        {HOST_NAME.slice(0, 2).toUpperCase()}
      </Avatar>
      <Stack gap={0}>
        <Text fw={600} size={nameSize}>
          {HOST_NAME}
        </Text>
        <Text c="dimmed" size={roleSize}>
          {HOST_ROLE}
        </Text>
      </Stack>
    </Group>
  );
}
