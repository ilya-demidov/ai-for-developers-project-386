using System.Collections.Concurrent;
using MiniCal.Api.Models;

namespace MiniCal.Api.Storage;

public interface IBookingStore
{
    List<Booking> GetAll();
    List<Booking> GetInRange(DateTime? from, DateTime? to);
    Booking Create(Booking booking);
}

public class InMemoryBookingStore : IBookingStore
{
    private readonly ConcurrentDictionary<string, Booking> _data = new();
    private readonly object _lock = new();

    public List<Booking> GetAll() => [.. _data.Values.OrderBy(b => b.StartUtc)];

    public List<Booking> GetInRange(DateTime? from, DateTime? to)
    {
        var query = _data.Values.AsEnumerable();
        if (from.HasValue) query = query.Where(b => b.StartUtc >= from.Value);
        if (to.HasValue) query = query.Where(b => b.EndUtc <= to.Value);
        return [.. query.OrderBy(b => b.StartUtc)];
    }

    public Booking Create(Booking booking)
    {
        lock (_lock)
        {
            var overlaps = _data.Values.Any(b =>
                b.StartUtc < booking.EndUtc && b.EndUtc > booking.StartUtc);
            if (overlaps)
                throw new InvalidOperationException("Slot is already booked.");
            _data[booking.Id] = booking;
            return booking;
        }
    }

    public bool HasOverlap(DateTime startUtc, DateTime endUtc)
    {
        lock (_lock)
        {
            return _data.Values.Any(b => b.StartUtc < endUtc && b.EndUtc > startUtc);
        }
    }
}
