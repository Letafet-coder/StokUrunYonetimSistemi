namespace Backend.Models;

public class ProductStock
{
    public int Id { get; set; }
    public int ProductId { get; set; }
    public Product? Product { get; set; }
    public int LocationId { get; set; }
    public Location? Location { get; set; }
    public int? LotSerialId { get; set; }
    public LotSerial? LotSerial { get; set; }
    public int Quantity { get; set; }
}
