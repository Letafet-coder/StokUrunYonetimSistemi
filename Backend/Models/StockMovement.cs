namespace Backend.Models;

public enum MovementType
{
    In,         // Giriş
    Out,        // Çıkış
    Adjustment, // Düzeltme/Sayım
    Transfer    // Depolar/Konumlar arası transfer
}

public class StockMovement
{
    public int Id { get; set; }
    public int ProductId { get; set; }
    public Product? Product { get; set; }
    public int Quantity { get; set; }
    public MovementType Type { get; set; }
    public DateTime Date { get; set; } = DateTime.UtcNow;
    
    // New Multi-Location Fields
    public int? WarehouseId { get; set; }
    public Warehouse? Warehouse { get; set; }
    public int? FromLocationId { get; set; }
    public Location? FromLocation { get; set; }
    public int? ToLocationId { get; set; }
    public Location? ToLocation { get; set; }

    public int? LotSerialId { get; set; }
    public LotSerial? LotSerial { get; set; }

    public string? Description { get; set; }
    public string? SupplierOrClient { get; set; }
    public string? DocumentNumber { get; set; }
    public int? CreatedByUserId { get; set; }
    public User? CreatedByUser { get; set; }
}
