namespace Backend.Models;

public class Warehouse
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty; // e.g., WH01
    public string? Address { get; set; }
    public List<Location> Locations { get; set; } = new();
}
