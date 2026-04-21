namespace MiniCal.Api.Models;

public class WorkHoursOptions
{
    public int StartHour { get; set; } = 9;
    public int EndHour { get; set; } = 18;
}

public class MiniCalHostOptions
{
    public string Name { get; set; } = "Tota";
    public string TimeZone { get; set; } = "Europe/Moscow";
}

public class BookingWindowOptions
{
    public int Days { get; set; } = 14;
}
