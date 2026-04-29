namespace Backend.Models;

public enum UserRole
{
    SuperAdmin,
    Admin,
    User
}

public class User
{
    public int Id { get; set; }
    public string Username { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public UserRole Role { get; set; } = UserRole.User;
    
    // User Preferences
    public string Language { get; set; } = "tr"; // "tr" or "en"
    public string ThemeColor { get; set; } = "#3B82F6"; // Default Blue
    public bool IsDarkMode { get; set; } = false;
    public bool IsApproved { get; set; } = false; // Changed to false by default for new system
    public string? AvatarUrl { get; set; }
}
