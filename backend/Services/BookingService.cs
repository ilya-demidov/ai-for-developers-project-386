using MiniCal.Api.Models;
using MiniCal.Api.Storage;

namespace MiniCal.Api.Services;

public class BookingService
{
    private readonly IEventTypeStore _eventTypeStore;
    private readonly IBookingStore _bookingStore;
    private readonly BookingWindowOptions _bookingWindow;
    private readonly SlotService _slotService;

    public BookingService(
        IEventTypeStore eventTypeStore,
        IBookingStore bookingStore,
        BookingWindowOptions bookingWindow,
        SlotService slotService)
    {
        _eventTypeStore = eventTypeStore;
        _bookingStore = bookingStore;
        _bookingWindow = bookingWindow;
        _slotService = slotService;
    }

    public Booking CreateBooking(BookingCreateDto dto)
    {
        var eventType = _eventTypeStore.GetById(dto.EventTypeId)
            ?? throw new KeyNotFoundException("Event type not found.");

        var now = DateTime.UtcNow;
        var startUtc = DateTime.SpecifyKind(dto.StartUtc, DateTimeKind.Utc);
        var endUtc = startUtc.AddMinutes(eventType.DurationMinutes);
        var windowEnd = now.AddDays(_bookingWindow.Days);

        if (startUtc < now)
            throw new ArgumentException("Cannot book a slot in the past.");

        if (startUtc >= windowEnd || endUtc > windowEnd)
            throw new ArgumentException($"Booking is outside the {_bookingWindow.Days}-day booking window.");

        if (!_slotService.IsWithinWorkingHours(startUtc, endUtc))
            throw new ArgumentException("Booking is outside working hours.");

        if (!_slotService.IsAlignedToSlotGrid(startUtc, eventType.DurationMinutes))
            throw new ArgumentException("Start time is not aligned to the slot grid.");

        if (_bookingStore.HasOverlap(startUtc, endUtc))
            throw new InvalidOperationException("Slot is already booked.");

        var booking = new Booking
        {
            Id = GenerateId("bk"),
            EventTypeId = eventType.Id,
            EventTypeName = eventType.Name,
            StartUtc = startUtc,
            EndUtc = endUtc,
            GuestName = dto.GuestName,
            GuestEmail = dto.GuestEmail,
            Notes = dto.Notes,
            CreatedAtUtc = DateTime.UtcNow
        };

        return _bookingStore.Create(booking);
    }

    private static string GenerateId(string prefix) => $"{prefix}-{Guid.NewGuid().ToString("N")[..8]}";
}
