using System.Globalization;
using System.Text.Json;
using System.Text.Json.Serialization;
using MiniCal.Api.Models;
using MiniCal.Api.Services;
using MiniCal.Api.Storage;

var builder = WebApplication.CreateBuilder(args);

builder.Services.Configure<WorkHoursOptions>(builder.Configuration.GetSection("WorkHours"));
builder.Services.Configure<MiniCalHostOptions>(builder.Configuration.GetSection("Host"));
builder.Services.AddSingleton<IEventTypeStore, InMemoryEventTypeStore>();
builder.Services.AddSingleton<IBookingStore, InMemoryBookingStore>();
builder.Services.AddSingleton<WorkHoursOptions>(builder.Configuration.GetSection("WorkHours").Get<WorkHoursOptions>()!);
builder.Services.AddSingleton<MiniCalHostOptions>(builder.Configuration.GetSection("Host").Get<MiniCalHostOptions>() ?? new MiniCalHostOptions());
builder.Services.AddSingleton<BookingWindowOptions>(builder.Configuration.GetSection("BookingWindowOptions").Get<BookingWindowOptions>() ?? new BookingWindowOptions());
builder.Services.AddSingleton<SlotService>();
builder.Services.AddSingleton<BookingService>();

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
        policy.WithOrigins("http://localhost:5173")
              .AllowAnyHeader()
              .AllowAnyMethod());
});

builder.Services.Configure<Microsoft.AspNetCore.Http.Json.JsonOptions>(options =>
{
    options.SerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
    options.SerializerOptions.DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull;
    options.SerializerOptions.Converters.Add(new UtcDateTimeJsonConverter());
});

var app = builder.Build();

app.UseCors();

SeedData(app);

var admin = app.MapGroup("/api/admin");
var pub = app.MapGroup("/api");

// ── Admin: Event Types ────────────────────────────────────

admin.MapGet("/event-types", (IEventTypeStore store) =>
{
    var items = store.GetAll().Select(ToEventTypeResponse);
    return Results.Ok(items);
});

admin.MapGet("/event-types/{id}", (string id, IEventTypeStore store) =>
{
    var et = store.GetById(id);
    return et is null ? ProblemNotFound($"Event type '{id}' not found.") : Results.Ok(ToEventTypeResponse(et));
});

admin.MapPost("/event-types", (EventTypeCreateDto dto, IEventTypeStore store) =>
{
    var errors = DtoValidator.ValidateEventTypeCreate(dto);
    if (errors.Count > 0) return ProblemValidation(errors);

    var et = store.Create(new EventType
    {
        Id = GenerateId("et"),
        Name = dto.Name,
        Description = dto.Description,
        DurationMinutes = dto.DurationMinutes
    });
    return Results.Ok(ToEventTypeResponse(et));
});

admin.MapPut("/event-types/{id}", (string id, EventTypeUpdateDto dto, IEventTypeStore store) =>
{
    var errors = DtoValidator.ValidateEventTypeUpdate(dto);
    if (errors.Count > 0) return ProblemValidation(errors);

    var et = store.Update(id, dto.Name, dto.Description, dto.DurationMinutes);
    return et is null ? ProblemNotFound($"Event type '{id}' not found.") : Results.Ok(ToEventTypeResponse(et));
});

admin.MapDelete("/event-types/{id}", (string id, IEventTypeStore store) =>
{
    return store.Delete(id) ? Results.NoContent() : ProblemNotFound($"Event type '{id}' not found.");
});

// ── Admin: Bookings ────────────────────────────────────────

admin.MapGet("/bookings", (DateTime? from, DateTime? to, IBookingStore store) =>
{
    var bookings = store.GetInRange(from, to).Select(ToBookingResponse);
    return Results.Ok(bookings);
});

// ── Public: Event Types ────────────────────────────────────

pub.MapGet("/event-types", (IEventTypeStore store) =>
{
    var items = store.GetAll().Select(ToEventTypeResponse);
    return Results.Ok(items);
});

pub.MapGet("/event-types/{id}", (string id, IEventTypeStore store) =>
{
    var et = store.GetById(id);
    return et is null ? ProblemNotFound($"Event type '{id}' not found.") : Results.Ok(ToEventTypeResponse(et));
});

// ── Public: Slots ──────────────────────────────────────────

pub.MapGet("/event-types/{id}/slots", (string id, DateTime? from, DateTime? to, SlotService slotService) =>
{
    try
    {
        var slots = slotService.GetSlots(id, from, to);
        return Results.Ok(slots);
    }
    catch (KeyNotFoundException)
    {
        return ProblemNotFound($"Event type '{id}' not found.");
    }
    catch (ArgumentException ex)
    {
        return ProblemBadRequest(ex.Message);
    }
});

// ── Public: Bookings ───────────────────────────────────────

pub.MapPost("/bookings", (BookingCreateDto dto, BookingService bookingService) =>
{
    var errors = DtoValidator.ValidateBookingCreate(dto);
    if (errors.Count > 0) return ProblemValidation(errors);

    try
    {
        var booking = bookingService.CreateBooking(dto);
        return Results.Ok(ToBookingResponse(booking));
    }
    catch (KeyNotFoundException)
    {
        return ProblemNotFound($"Event type '{dto.EventTypeId}' not found.");
    }
    catch (InvalidOperationException)
    {
        return ProblemConflict("Slot is already booked.");
    }
    catch (ArgumentException ex)
    {
        return ProblemBadRequest(ex.Message);
    }
});

app.Run();

// ── Helpers ────────────────────────────────────────────────

static EventTypeResponseDto ToEventTypeResponse(EventType et) =>
    new(et.Id, et.Name, et.Description, et.DurationMinutes);

static BookingResponseDto ToBookingResponse(Booking b) =>
    new(b.Id, b.EventTypeId, b.EventTypeName, b.StartUtc, b.EndUtc,
        b.GuestName, b.GuestEmail, b.Notes, b.CreatedAtUtc);

static IResult ProblemNotFound(string detail) =>
    Results.Problem(detail, statusCode: 404, title: "Not Found");

static IResult ProblemBadRequest(string detail) =>
    Results.Problem(detail, statusCode: 400, title: "Bad Request");

static IResult ProblemConflict(string detail) =>
    Results.Problem(detail, statusCode: 409, title: "Conflict");

static IResult ProblemValidation(Dictionary<string, string[]> errors) =>
    Results.ValidationProblem(errors, detail: "One or more validation errors occurred.");

static string GenerateId(string prefix) => $"{prefix}-{Guid.NewGuid().ToString("N")[..8]}";

static void SeedData(WebApplication app)
{
    var store = app.Services.GetRequiredService<IEventTypeStore>();

    if (store.GetAll().Count != 0) return;

    store.Create(new EventType { Id = "et-consultation", Name = "Consultation", Description = "A general consultation session", DurationMinutes = 30 });
    store.Create(new EventType { Id = "et-intro", Name = "Intro call", Description = "A quick introduction call", DurationMinutes = 15 });
    store.Create(new EventType { Id = "et-deepdive", Name = "Deep dive", Description = "An in-depth deep dive session", DurationMinutes = 60 });
}

// ── JSON Converter for UTC DateTime ────────────────────────

public class UtcDateTimeJsonConverter : JsonConverter<DateTime>
{
    public override DateTime Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
    {
        var dateStr = reader.GetString()!;
        return DateTime.Parse(dateStr, CultureInfo.InvariantCulture, DateTimeStyles.AdjustToUniversal | DateTimeStyles.AssumeUniversal);
    }

    public override void Write(Utf8JsonWriter writer, DateTime value, JsonSerializerOptions options)
    {
        var utc = DateTime.SpecifyKind(value, DateTimeKind.Utc);
        writer.WriteStringValue(utc.ToString("yyyy-MM-ddTHH:mm:ssZ", CultureInfo.InvariantCulture));
    }
}
