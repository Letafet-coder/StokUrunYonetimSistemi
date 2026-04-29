namespace Backend.Models;

public class InventoryCountItem
{
    public int Id { get; set; }
    public int InventoryCountId { get; set; }
    public int ProductId { get; set; }
    public Product? Product { get; set; }
    public int TheoreticalQuantity { get; set; } // Quantity in system at start of count
    public int CountedQuantity { get; set; }
    public int Difference => CountedQuantity - TheoreticalQuantity;
}
