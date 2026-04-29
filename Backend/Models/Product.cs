using System.Text.Json.Serialization;

namespace Backend.Models;

public enum TrackingType
{
    None = 0,
    Lot = 1,
    Serial = 2
}

public class Product
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int CategoryId { get; set; }
    public Category? Category { get; set; }
    public decimal Price { get; set; }
    
    public TrackingType Tracking { get; set; } = TrackingType.None;

    // Physical stock is now tracked across multiple locations and potentially multiple lots
    public List<ProductStock> ProductStocks { get; set; } = new();
    
    [JsonPropertyName("stockQuantity")]
    public int StockQuantity => ProductStocks?.Sum(ps => ps.Quantity) ?? 0;

    public int CriticalLevel { get; set; } = 10;
    public string Unit { get; set; } = "Adet"; // e.g., Adet, KG, Litre
    public string? Sku { get; set; } // Barcode or SKU
}
