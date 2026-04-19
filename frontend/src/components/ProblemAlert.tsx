import { Alert, List, Text } from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';
import type { ProblemDetails } from '../api/client';

interface ProblemAlertProps {
  problem?: ProblemDetails;
  title?: string;
}

export function ProblemAlert({ problem, title }: ProblemAlertProps) {
  if (!problem) return null;

  const hasErrors = problem.errors && Object.keys(problem.errors).length > 0;

  return (
    <Alert icon={<IconAlertCircle size={16} />} color="red" mb="md">
      <Text fw={600} mb={hasErrors ? 'xs' : 0}>
        {title || problem.title || 'Ошибка'}
      </Text>
      {problem.detail && <Text size="sm">{problem.detail}</Text>}
      {hasErrors && (
        <List size="sm" mt="xs">
          {Object.entries(problem.errors!).map(([field, messages]) =>
            messages.map((message, idx) => (
              <List.Item key={`${field}-${idx}`}>
                {field}: {message}
              </List.Item>
            ))
          )}
        </List>
      )}
    </Alert>
  );
}
