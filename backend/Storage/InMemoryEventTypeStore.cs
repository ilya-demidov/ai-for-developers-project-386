using System.Collections.Concurrent;
using MiniCal.Api.Models;

namespace MiniCal.Api.Storage;

public interface IEventTypeStore
{
    List<EventType> GetAll();
    EventType? GetById(string id);
    EventType Create(EventType eventType);
    EventType? Update(string id, string name, string? description, int durationMinutes);
    bool Delete(string id);
}

public class InMemoryEventTypeStore : IEventTypeStore
{
    private readonly ConcurrentDictionary<string, EventType> _data = new();

    public List<EventType> GetAll() => [.. _data.Values];

    public EventType? GetById(string id) => _data.GetValueOrDefault(id);

    public EventType Create(EventType eventType)
    {
        _data[eventType.Id] = eventType;
        return eventType;
    }

    public EventType? Update(string id, string name, string? description, int durationMinutes)
    {
        if (!_data.TryGetValue(id, out var existing)) return null;
        var updated = existing with { Name = name, Description = description, DurationMinutes = durationMinutes };
        _data[id] = updated;
        return updated;
    }

    public bool Delete(string id) => _data.TryRemove(id, out _);
}
