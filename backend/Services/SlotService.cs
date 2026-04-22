using MiniCal.Api.Models;
using MiniCal.Api.Storage;

namespace MiniCal.Api.Services;

public class SlotService
{
    private readonly IEventTypeStore _eventTypeStore;
    private readonly IBookingStore _bookingStore;
    private readonly WorkHoursOptions _workHours;
    private readonly BookingWindowOptions _bookingWindow;
    private readonly TimeZoneInfo _hostTimeZone;

    public SlotService(
        IEventTypeStore eventTypeStore,
        IBookingStore bookingStore,
        WorkHoursOptions workHours,
        BookingWindowOptions bookingWindow,
        MiniCalHostOptions hostOptions)
    {
        _eventTypeStore = eventTypeStore;
        _bookingStore = bookingStore;
        _workHours = workHours;
        _bookingWindow = bookingWindow;
        _hostTimeZone = TimeZoneInfo.FindSystemTimeZoneById(hostOptions.TimeZone);
    }

    public List<SlotResponseDto> GetSlots(string eventTypeId, DateTime? from, DateTime? to)
    {
        var eventType = _eventTypeStore.GetById(eventTypeId)
            ?? throw new KeyNotFoundException("Event type not found.");

        var now = DateTime.UtcNow;
        var windowStart = now;
        var windowEnd = now.AddDays(_bookingWindow.Days);
        var startTolerance = TimeSpan.FromSeconds(2);

        var effectiveFrom = from ?? windowStart;
        var effectiveTo = to ?? windowEnd;

        if (effectiveFrom < windowStart)
        {
            var lag = windowStart - effectiveFrom;
            if (lag <= startTolerance)
            {
                effectiveFrom = windowStart;
            }
            else
            {
                throw new ArgumentException("Requested range is outside the 14-day booking window.");
            }
        }

        if (effectiveFrom >= effectiveTo)
            throw new ArgumentException("Parameter 'from' must be earlier than 'to'.");

        if (effectiveTo > windowEnd)
            throw new ArgumentException("Requested range is outside the 14-day booking window.");

        var candidates = GenerateCandidates(eventType, effectiveFrom, effectiveTo, now);

        var bookings = _bookingStore.GetAll();
        var freeSlots = candidates
            .Where(slot => !bookings.Any(b => b.StartUtc < slot.EndUtc && b.EndUtc > slot.StartUtc))
            .ToList();

        return freeSlots;
    }

    private List<SlotResponseDto> GenerateCandidates(EventType eventType, DateTime from, DateTime to, DateTime now)
    {
        var slots = new List<SlotResponseDto>();
        var duration = TimeSpan.FromMinutes(eventType.DurationMinutes);

        var dayStart = from.Date;
        var dayEnd = to.Date;

        for (var day = dayStart; day <= dayEnd; day = day.AddDays(1))
        {
            var workStartUtc = ToUtcFromHostLocal(day, _workHours.StartHour, 0);
            var workEndUtc = ToUtcFromHostLocal(day, _workHours.EndHour, 0);

            if (workEndUtc <= from || workStartUtc >= to)
                continue;

            for (var slotStart = workStartUtc; slotStart + duration <= workEndUtc; slotStart = slotStart.Add(duration))
            {
                var slotEnd = slotStart + duration;

                if (slotStart < from) continue;
                if (slotEnd > to) continue;
                if (slotStart < now) continue;

                slots.Add(new SlotResponseDto(slotStart, slotEnd, eventType.Id));
            }
        }

        return slots;
    }

    private DateTime ToUtcFromHostLocal(DateTime dateOnly, int hour, int minute)
    {
        var localDateTime = new DateTime(dateOnly.Year, dateOnly.Month, dateOnly.Day, hour, minute, 0, DateTimeKind.Unspecified);
        return TimeZoneInfo.ConvertTimeToUtc(localDateTime, _hostTimeZone);
    }

    public bool IsWithinWorkingHours(DateTime startUtc, DateTime endUtc)
    {
        var startLocal = TimeZoneInfo.ConvertTimeFromUtc(startUtc, _hostTimeZone);
        var endLocal = TimeZoneInfo.ConvertTimeFromUtc(endUtc, _hostTimeZone);

        if (startLocal.Date != endLocal.Date) return false;

        var startOk = startLocal.Hour >= _workHours.StartHour && startLocal.Minute == 0;
        var endOk = (endLocal.Hour < _workHours.EndHour) ||
                    (endLocal.Hour == _workHours.EndHour && endLocal.Minute == 0);

        return startOk && endOk;
    }

    public bool IsAlignedToSlotGrid(DateTime startUtc, int durationMinutes)
    {
        var startLocal = TimeZoneInfo.ConvertTimeFromUtc(startUtc, _hostTimeZone);
        var dayStartLocal = startLocal.Date.AddHours(_workHours.StartHour);
        var offset = startLocal - dayStartLocal;
        return offset.Ticks % TimeSpan.FromMinutes(durationMinutes).Ticks == 0;
    }
}
