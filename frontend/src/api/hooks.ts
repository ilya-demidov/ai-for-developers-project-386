import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryOptions,
} from '@tanstack/react-query';
import { publicApi, adminApi } from './client';
import { queryKeys } from './queryKeys';
import type { components } from './generated';

// Public hooks

export function usePublicEventTypes(
  options?: Omit<UseQueryOptions<components['schemas']['EventType'][]>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: queryKeys.public.eventTypes,
    queryFn: () => publicApi.listEventTypes(),
    ...options,
  });
}

export function usePublicEventType(
  id: string,
  options?: Omit<UseQueryOptions<components['schemas']['EventType']>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: queryKeys.public.eventType(id),
    queryFn: () => publicApi.getEventType(id),
    enabled: !!id,
    ...options,
  });
}

export function useSlots(
  id: string,
  from?: string,
  to?: string,
  options?: Omit<UseQueryOptions<components['schemas']['Slot'][]>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: queryKeys.public.slots(id, from, to),
    queryFn: () => publicApi.getSlots(id, from, to),
    enabled: !!id && !!from && !!to,
    ...options,
  });
}

export function useCreateBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: components['schemas']['BookingCreate']) =>
      publicApi.createBooking(body),
    onSuccess: () => {
      // Invalidate slots and bookings after creating a booking
      queryClient.invalidateQueries({ queryKey: ['public', 'slots'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'bookings'] });
    },
  });
}

// Admin hooks

export function useAdminEventTypes(
  options?: Omit<UseQueryOptions<components['schemas']['EventType'][]>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: queryKeys.admin.eventTypes,
    queryFn: () => adminApi.listEventTypes(),
    ...options,
  });
}

export function useCreateEventType() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: components['schemas']['EventTypeCreate']) =>
      adminApi.createEventType(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.eventTypes });
      queryClient.invalidateQueries({ queryKey: queryKeys.public.eventTypes });
    },
  });
}

export function useUpdateEventType() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      body,
    }: {
      id: string;
      body: components['schemas']['EventTypeUpdate'];
    }) => adminApi.updateEventType(id, body),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.eventTypes });
      queryClient.invalidateQueries({ queryKey: queryKeys.public.eventTypes });
      queryClient.invalidateQueries({
        queryKey: queryKeys.admin.eventType(variables.id),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.public.eventType(variables.id),
      });
    },
  });
}

export function useDeleteEventType() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => adminApi.deleteEventType(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.eventTypes });
      queryClient.invalidateQueries({ queryKey: queryKeys.public.eventTypes });
    },
  });
}

export function useAdminBookings(
  from?: string,
  to?: string,
  options?: Omit<UseQueryOptions<components['schemas']['Booking'][]>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: queryKeys.admin.bookings(from, to),
    queryFn: () => adminApi.listBookings(from, to),
    ...options,
  });
}
