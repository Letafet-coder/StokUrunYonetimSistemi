using System.ComponentModel.DataAnnotations;

namespace Backend.Models;

public class SystemSetting
{
    [Key]
    public string Key { get; set; } = string.Empty;
    
    public string Value { get; set; } = string.Empty;
    
    public string Description { get; set; } = string.Empty;
    
    public string Group { get; set; } = "General"; // General, Security, Email, etc.
    
    public DateTime LastUpdated { get; set; } = DateTime.UtcNow;
}
