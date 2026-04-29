using System.ComponentModel.DataAnnotations;

namespace Backend.Models;

public class InventoryCount
{
    public int Id { get; set; }
    public DateTime Date { get; set; } = DateTime.UtcNow;
    public string? Description { get; set; }
    public string Status { get; set; } = "Completed"; // Completed, Draft
    public int CreatedByUserId { get; set; }
    public User? CreatedByUser { get; set; }
    public int LocationId { get; set; } = 1; // Default to Main Shelf for migration
    public Location? Location { get; set; }
    public List<InventoryCountItem> Items { get; set; } = new();
}
