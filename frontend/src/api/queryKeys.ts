export const queryKeys = {
  public: {
    eventTypes: ['public', 'event-types'] as const,
    eventType: (id: string) => ['public', 'event-types', id] as const,
    slots: (id: string, from?: string, to?: string) =>
      ['public', 'slots', id, from, to] as const,
  },
  admin: {
    eventTypes: ['admin', 'event-types'] as const,
    eventType: (id: string) => ['admin', 'event-types', id] as const,
    bookings: (from?: string, to?: string) =>
      ['admin', 'bookings', from, to] as const,
  },
};
