namespace Backend.Models;

public enum LocationType
{
    Internal,   // Standard storage
    Scrap,      // Damaged items
    Transit,    // Between warehouses
    View        // Category-like parent locations
}

public class Location
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public int WarehouseId { get; set; }
    public Warehouse? Warehouse { get; set; }
    public LocationType Type { get; set; } = LocationType.Internal;
    
    // Address Details
    public string? Aisle { get; set; }    // Koridor (e.g., A, B, C)
    public string? Rack { get; set; }     // Raf (e.g., 1, 2, 3)
    public string? Level { get; set; }    // Kat / Seviye (e.g., L1, L2)
    public string? Position { get; set; } // Göz / Sıra (e.g., 01, 02)
    
    public string? ShelfCode { get; set; } // Combined code (e.g., A-102 or A-1-L1-01)
}
