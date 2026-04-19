import "@typespec/http";
import "@typespec/rest";

using TypeSpec.Http;
using TypeSpec.Rest;
using TypeSpec.Reflection;

@service(#{
  title: "Mini Cal API",
})
@server("http://localhost:8080", "Local development server")
namespace MiniCal;

model Owner {
  @visibility(Lifecycle.Read)
  id: string;

  @minLength(1)
  @maxLength(100)
  name: string;

  timeZone: string;
}

@example(#{id: "et-1", name: "Consultation", durationMinutes: 30})
model EventType {
  @visibility(Lifecycle.Read)
  id: string;

  @minLength(1)
  @maxLength(100)
  name: string;

  @maxLength(1000)
  description?: string;

  @minValue(5)
  @maxValue(480)
  durationMinutes: int32;
}

model EventTypeCreate {
  @minLength(1)
  @maxLength(100)
  name: string;

  @maxLength(1000)
  description?: string;

  @minValue(5)
  @maxValue(480)
  durationMinutes: int32;
}

model EventTypeUpdate {
  @minLength(1)
  @maxLength(100)
  name: string;

  @maxLength(1000)
  description?: string;

  @minValue(5)
  @maxValue(480)
  durationMinutes: int32;
}

@example(#{startUtc: utcDateTime.fromISO("2025-06-01T09:00:00Z"), endUtc: utcDateTime.fromISO("2025-06-01T09:30:00Z"), eventTypeId: "et-1"})
model Slot {
  @doc("Start of the slot in UTC")
  startUtc: utcDateTime;

  @doc("End of the slot in UTC, calculated as startUtc + EventType.durationMinutes")
  endUtc: utcDateTime;

  eventTypeId: string;
}

@example(#{id: "bk-1", eventTypeId: "et-1", eventTypeName: "Consultation", startUtc: utcDateTime.fromISO("2025-06-01T09:00:00Z"), endUtc: utcDateTime.fromISO("2025-06-01T09:30:00Z"), guestName: "Alice Johnson", guestEmail: "alice@example.com", createdAtUtc: utcDateTime.fromISO("2025-05-20T08:00:00Z")})
model Booking {
  @visibility(Lifecycle.Read)
  id: string;

  eventTypeId: string;

  @minLength(1)
  @maxLength(100)
  eventTypeName: string;

  @doc("Start of the booking in UTC")
  startUtc: utcDateTime;

  @doc("End of the booking in UTC, calculated as startUtc + EventType.durationMinutes")
  endUtc: utcDateTime;

  @minLength(1)
  @maxLength(100)
  guestName: string;

  @doc("Guest email address")
  guestEmail: string;

  @maxLength(1000)
  notes?: string;

  @visibility(Lifecycle.Read)
  @doc("Creation timestamp in UTC")
  createdAtUtc: utcDateTime;
}

model BookingCreate {
  eventTypeId: string;

  @doc("Start of the booking in UTC. Must fall within a valid free slot.")
  startUtc: utcDateTime;

  @minLength(1)
  @maxLength(100)
  guestName: string;

  @doc("Guest email address")
  guestEmail: string;

  @maxLength(1000)
  notes?: string;
}

model ProblemDetails {
  type?: string;
  title?: string;
  status?: int32;
  detail?: string;
  errors?: Record<string[]>;
}

namespace Admin {
  @route("/api/admin")
  namespace AdminRoutes {
    @doc("List all event types")
    @get
    @route("/event-types")
    @opExample(#{returnType: #[#{id: "et-1", name: "Consultation", durationMinutes: 30}]})
    op listEventTypes(): EventType[];

    @doc("Create a new event type")
    @post
    @route("/event-types")
    @opExample(#{parameters: #{body: #{name: "Consultation", durationMinutes: 30}}, returnType: #{id: "et-1", name: "Consultation", durationMinutes: 30}})
    op createEventType(@body body: EventTypeCreate): EventType | { @statusCode status: 400, @body body: ProblemDetails };

    @doc("Get a single event type by ID")
    @get
    @route("/event-types/{id}")
    @opExample(#{parameters: #{id: "et-1"}, returnType: #{id: "et-1", name: "Consultation", durationMinutes: 30}})
    op getEventType(@path id: string): EventType | { @statusCode status: 404, @body body: ProblemDetails };

    @doc("Update an existing event type")
    @put
    @route("/event-types/{id}")
    @opExample(#{parameters: #{id: "et-1", body: #{name: "Consultation", durationMinutes: 60}}, returnType: #{id: "et-1", name: "Consultation", durationMinutes: 60}})
    op updateEventType(@path id: string, @body body: EventTypeUpdate): EventType | { @statusCode status: 400 | 404, @body body: ProblemDetails };

    @doc("Delete an event type")
    @delete
    @route("/event-types/{id}")
    op deleteEventType(@path id: string): void | { @statusCode status: 404, @body body: ProblemDetails };

    @doc("List all upcoming bookings across all event types. Sorted by startUtc ascending. Optional query parameters from and to filter the date range.")
    @get
    @route("/bookings")
    @opExample(#{returnType: #[#{id: "bk-1", eventTypeId: "et-1", eventTypeName: "Consultation", startUtc: utcDateTime.fromISO("2025-06-01T09:00:00Z"), endUtc: utcDateTime.fromISO("2025-06-01T09:30:00Z"), guestName: "Alice Johnson", guestEmail: "alice@example.com", createdAtUtc: utcDateTime.fromISO("2025-05-20T08:00:00Z")}]})
    op listBookings(
      @query from?: utcDateTime,
      @query to?: utcDateTime
    ): Booking[];
  }
}

namespace Public {
  @route("/api")
  namespace PublicRoutes {
    @doc("List all event types available for booking (name, description, durationMinutes)")
    @get
    @route("/event-types")
    @opExample(#{returnType: #[#{id: "et-1", name: "Consultation", durationMinutes: 30}]})
    op listEventTypes(): EventType[];

    @doc("Get details of a single event type")
    @get
    @route("/event-types/{id}")
    op getEventType(@path id: string): EventType | { @statusCode status: 404, @body body: ProblemDetails };

    @doc("Get free booking slots for a given event type within the next 14 days. Slots are computed based on the event type duration, owner working hours (server config), and exclude any slots that overlap with existing bookings of any event type. All returned slots have duration equal to EventType.durationMinutes. Slots are sorted by startUtc ascending. If from or to are not provided, defaults to [now, now + 14 days). Returns 400 if from >= to or values are outside the 14-day window. Returns 404 if eventTypeId does not exist.")
    @get
    @route("/event-types/{id}/slots")
    @opExample(#{returnType: #[#{startUtc: utcDateTime.fromISO("2025-06-01T09:00:00Z"), endUtc: utcDateTime.fromISO("2025-06-01T09:30:00Z"), eventTypeId: "et-1"}]})
    op getSlots(
      @path id: string,
      @query from?: utcDateTime,
      @query to?: utcDateTime
    ): Slot[] | { @statusCode status: 400 | 404, @body body: ProblemDetails };

    @doc("Create a new booking for a selected slot. The server calculates endUtc = startUtc + EventType.durationMinutes. Before saving, the server checks for overlaps with existing bookings (all event types) in a transaction to prevent race conditions. startUtc must fall within valid working hours and the 14-day booking window. Returns 409 Conflict if the slot is already taken. Returns 400 if startUtc is invalid (outside working hours, outside 14-day window, in the past). Returns 404 if eventTypeId does not exist.")
    @post
    @route("/bookings")
    @opExample(#{parameters: #{body: #{eventTypeId: "et-1", startUtc: utcDateTime.fromISO("2025-06-01T09:00:00Z"), guestName: "Alice Johnson", guestEmail: "alice@example.com"}}, returnType: #{id: "bk-1", eventTypeId: "et-1", eventTypeName: "Consultation", startUtc: utcDateTime.fromISO("2025-06-01T09:00:00Z"), endUtc: utcDateTime.fromISO("2025-06-01T09:30:00Z"), guestName: "Alice Johnson", guestEmail: "alice@example.com", createdAtUtc: utcDateTime.fromISO("2025-05-20T08:00:00Z")}})
    op createBooking(
      @body body: BookingCreate
    ): Booking | { @statusCode status: 400 | 404 | 409, @body body: ProblemDetails };
  }
}
