namespace Backend.Dtos;

public class LoginDto
{
    public string Username { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}

public class RegisterDto
{
    public string Username { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Role { get; set; } = "User";
}

// Herkese açık kayıt — sadece User rolü atanır
public class PublicRegisterDto
{
    public string Username { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
}

// Admin'in kullanıcı güncellemesi için — rol ve opsiyonel şifre değişimi
public class AdminUserUpdateDto
{
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Role { get; set; } = "User";
    public string? NewPassword { get; set; } // null ise şifre değiştirilmez
    public string? AvatarUrl { get; set; }
}

public class UserUpdateDto
{
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Language { get; set; } = "tr";
    public string ThemeColor { get; set; } = "#3B82F6";
    public bool IsDarkMode { get; set; } = false;
    public string? AvatarUrl { get; set; }
}
