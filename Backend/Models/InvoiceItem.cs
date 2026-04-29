using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace Backend.Models;

public class InvoiceItem
{
    public int Id { get; set; }
    
    public int InvoiceId { get; set; }
    
    [JsonIgnore]
    public Invoice? Invoice { get; set; }
    
    public int ProductId { get; set; }
    
    public Product? Product { get; set; }
    
    [Required]
    public double Quantity { get; set; }
    
    [Required]
    public decimal UnitPrice { get; set; }
    
    public decimal TotalPrice => (decimal)Quantity * UnitPrice;
}
