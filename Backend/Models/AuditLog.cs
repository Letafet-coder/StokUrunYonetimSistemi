using System.ComponentModel.DataAnnotations;

namespace Backend.Models;

public class AuditLog
{
    public int Id { get; set; }
    
    [Required]
    public int UserId { get; set; }
    public User? User { get; set; }
    
    [Required]
    public string Action { get; set; } = string.Empty; // Create, Update, Delete, Login, etc.
    
    [Required]
    public string EntityName { get; set; } = string.Empty; // Products, Users, etc.
    
    public string? EntityId { get; set; }
    
    public string? OldValues { get; set; } // JSON serialized
    
    public string? NewValues { get; set; } // JSON serialized
    
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    
    public string? IPAddress { get; set; }
}
