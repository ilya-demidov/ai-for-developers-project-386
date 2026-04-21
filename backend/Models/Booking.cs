namespace MiniCal.Api.Models;

public class Booking
{
    public string Id { get; set; } = default!;
    public string EventTypeId { get; set; } = default!;
    public string EventTypeName { get; set; } = default!;
    public DateTime StartUtc { get; set; }
    public DateTime EndUtc { get; set; }
    public string GuestName { get; set; } = default!;
    public string GuestEmail { get; set; } = default!;
    public string? Notes { get; set; }
    public DateTime CreatedAtUtc { get; set; }
}
