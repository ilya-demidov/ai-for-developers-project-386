import { API_BASE_URL } from '../lib/env';
import type { components } from './generated';

export type ProblemDetails = components['schemas']['ProblemDetails'];

export class ApiError extends Error {
  status: number;
  details?: ProblemDetails;

  constructor(status: number, message: string, details?: ProblemDetails) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

export function getProblemDetails(error: unknown): ProblemDetails | undefined {
  if (error instanceof ApiError) {
    return error.details;
  }

  return undefined;
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let details: ProblemDetails | undefined;
    try {
      const data = await response.json();
      details = data as ProblemDetails;
    } catch {
      // Ignore parsing errors
    }

    const message =
      details?.detail || details?.title || `HTTP ${response.status}: ${response.statusText}`;
    throw new ApiError(response.status, message, details);
  }

  // Handle empty responses (e.g., DELETE)
  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export async function apiFetch<T>(
  path: string,
  init?: RequestInit
): Promise<T> {
  const url = `${API_BASE_URL}${path}`;

  const response = await fetch(url, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  });

  return handleResponse<T>(response);
}

// Public API endpoints
export const publicApi = {
  listEventTypes: () => apiFetch<components['schemas']['EventType'][]>(`/event-types`),

  getEventType: (id: string) =>
    apiFetch<components['schemas']['EventType']>(`/event-types/${id}`),

  getSlots: (id: string, from?: string, to?: string) => {
    const params = new URLSearchParams();
    if (from) params.append('from', from);
    if (to) params.append('to', to);
    const query = params.toString() ? `?${params.toString()}` : '';
    return apiFetch<components['schemas']['Slot'][]>(`/event-types/${id}/slots${query}`);
  },

  createBooking: (body: components['schemas']['BookingCreate']) =>
    apiFetch<components['schemas']['Booking']>(`/bookings`, {
      method: 'POST',
      body: JSON.stringify(body),
    }),
};

// Admin API endpoints
export const adminApi = {
  listEventTypes: () =>
    apiFetch<components['schemas']['EventType'][]>(`/admin/event-types`),

  createEventType: (body: components['schemas']['EventTypeCreate']) =>
    apiFetch<components['schemas']['EventType']>(`/admin/event-types`, {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  getEventType: (id: string) =>
    apiFetch<components['schemas']['EventType']>(`/admin/event-types/${id}`),

  updateEventType: (id: string, body: components['schemas']['EventTypeUpdate']) =>
    apiFetch<components['schemas']['EventType']>(`/admin/event-types/${id}`, {
      method: 'PUT',
      body: JSON.stringify(body),
    }),

  deleteEventType: (id: string) =>
    apiFetch<void>(`/admin/event-types/${id}`, {
      method: 'DELETE',
    }),

  listBookings: (from?: string, to?: string) => {
    const params = new URLSearchParams();
    if (from) params.append('from', from);
    if (to) params.append('to', to);
    const query = params.toString() ? `?${params.toString()}` : '';
    return apiFetch<components['schemas']['Booking'][]>(`/admin/bookings${query}`);
  },
};
