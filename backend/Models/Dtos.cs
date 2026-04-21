using System.Globalization;
using System.Net.Mail;

namespace MiniCal.Api.Models;

public record EventTypeCreateDto(
    string Name,
    string? Description,
    int DurationMinutes
);

public record EventTypeUpdateDto(
    string Name,
    string? Description,
    int DurationMinutes
);

public record EventTypeResponseDto(
    string Id,
    string Name,
    string? Description,
    int DurationMinutes
);

public record SlotResponseDto(
    DateTime StartUtc,
    DateTime EndUtc,
    string EventTypeId
);

public record BookingCreateDto(
    string EventTypeId,
    DateTime StartUtc,
    string GuestName,
    string GuestEmail,
    string? Notes
);

public record BookingResponseDto(
    string Id,
    string EventTypeId,
    string EventTypeName,
    DateTime StartUtc,
    DateTime EndUtc,
    string GuestName,
    string GuestEmail,
    string? Notes,
    DateTime CreatedAtUtc
);

public static class DtoValidator
{
    public static Dictionary<string, string[]> ValidateEventTypeCreate(EventTypeCreateDto dto)
    {
        var errors = new Dictionary<string, List<string>>();

        if (string.IsNullOrWhiteSpace(dto.Name) || dto.Name.Length is < 1 or > 100)
            errors.Add("name", ["Name must be between 1 and 100 characters."]);

        if (dto.Description is not null && dto.Description.Length > 1000)
            errors.Add("description", ["Description must be at most 1000 characters."]);

        if (dto.DurationMinutes is < 5 or > 480)
            errors.Add("durationMinutes", ["DurationMinutes must be between 5 and 480."]);

        return errors.ToDictionary(k => k.Key, v => v.Value.ToArray());
    }

    public static Dictionary<string, string[]> ValidateEventTypeUpdate(EventTypeUpdateDto dto)
    {
        return ValidateEventTypeCreate(new EventTypeCreateDto(dto.Name, dto.Description, dto.DurationMinutes));
    }

    public static Dictionary<string, string[]> ValidateBookingCreate(BookingCreateDto dto)
    {
        var errors = new Dictionary<string, List<string>>();

        if (string.IsNullOrWhiteSpace(dto.EventTypeId))
            errors.Add("eventTypeId", ["EventTypeId is required."]);

        if (dto.StartUtc.Kind != DateTimeKind.Utc && dto.StartUtc.Kind != DateTimeKind.Unspecified)
            errors.Add("startUtc", ["StartUtc must be in UTC."]);

        if (string.IsNullOrWhiteSpace(dto.GuestName) || dto.GuestName.Length is < 1 or > 100)
            errors.Add("guestName", ["GuestName must be between 1 and 100 characters."]);

        if (!MailAddress.TryCreate(dto.GuestEmail, out _))
            errors.Add("guestEmail", ["GuestEmail must be a valid email address."]);

        if (dto.Notes is not null && dto.Notes.Length > 1000)
            errors.Add("notes", ["Notes must be at most 1000 characters."]);

        return errors.ToDictionary(k => k.Key, v => v.Value.ToArray());
    }

    public static string FormatUtc(DateTime dt)
    {
        return DateTime.SpecifyKind(dt, DateTimeKind.Utc).ToString("yyyy-MM-ddTHH:mm:ssZ", CultureInfo.InvariantCulture);
    }
}
