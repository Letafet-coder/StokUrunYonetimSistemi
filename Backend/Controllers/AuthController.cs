using Backend.Data;
using Backend.Dtos;
using Backend.Models;
using Backend.Repositories.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Authorization;

namespace Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IConfiguration _configuration;

    public AuthController(IUnitOfWork unitOfWork, IConfiguration configuration)
    {
        _unitOfWork = unitOfWork;
        _configuration = configuration;
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginDto loginDto)
    {
        var users = await _unitOfWork.Users.GetAllAsync();
        var user = users.FirstOrDefault(u => u.Username == loginDto.Username);

        if (user == null || !BCrypt.Net.BCrypt.Verify(loginDto.Password, user.PasswordHash))
        {
            return Unauthorized("Geçersiz kullanıcı adı veya şifre.");
        }

        if (!user.IsApproved)
        {
            return BadRequest("Hesabınız henüz onaylanmamış. Lütfen yöneticinizin onaylamasını bekleyin.");
        }

        var token = GenerateJwtToken(user);

        return Ok(new
        {
            token,
            user = new
            {
                user.Id,
                user.Username,
                user.FullName,
                user.Role,
                user.Language,
                user.ThemeColor,
                user.IsDarkMode,
                user.IsApproved,
                user.AvatarUrl
            }
        });
    }

    [Authorize]
    [HttpGet("profile")]
    public async Task<IActionResult> GetProfile()
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
        var user = await _unitOfWork.Users.GetByIdAsync(userId);

        if (user == null) return NotFound();

        return Ok(new {
            user.Id,
            user.Username,
            user.FullName,
            user.Email,
            user.Role,
            user.Language,
            user.ThemeColor,
            user.IsDarkMode,
            user.IsApproved,
            user.AvatarUrl
        });
    }

    [Authorize]
    [HttpPut("profile")]
    public async Task<IActionResult> UpdateProfile(UserUpdateDto updateDto)
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
        var user = await _unitOfWork.Users.GetByIdAsync(userId);

        if (user == null) return NotFound();

        user.FullName = updateDto.FullName;
        user.Email = updateDto.Email;
        user.Language = updateDto.Language;
        user.ThemeColor = updateDto.ThemeColor;
        user.IsDarkMode = updateDto.IsDarkMode;
        user.AvatarUrl = updateDto.AvatarUrl;

        _unitOfWork.Users.Update(user);
        await _unitOfWork.CompleteAsync();

        return Ok(new {
            user.Id,
            user.Username,
            user.FullName,
            user.Email,
            user.Role,
            user.Language,
            user.ThemeColor,
            user.IsDarkMode,
            user.IsApproved,
            user.AvatarUrl
        });
    }

    // Admin veya SuperAdmin tarafından belirli bir rolle kullanıcı ekleme
    [Authorize(Roles = "SuperAdmin,Admin")]
    [HttpPost("register")]
    public async Task<IActionResult> Register(RegisterDto registerDto)
    {
        var users = await _unitOfWork.Users.GetAllAsync();
        if (users.Any(u => u.Username == registerDto.Username))
        {
            return BadRequest("Kullanıcı adı zaten mevcut.");
        }

        if (!Enum.TryParse<UserRole>(registerDto.Role, out var parsedRole))
        {
            return BadRequest("Geçersiz rol.");
        }

        // Sadece SuperAdmin başka bir SuperAdmin veya Admin ekleyebilir
        var currentRole = User.FindFirst(ClaimTypes.Role)?.Value;
        if (parsedRole != UserRole.User && currentRole != UserRole.SuperAdmin.ToString())
        {
            return Forbid("Sadece Süper Yöneticiler üst düzey yetki verebilir.");
        }

        var user = new User
        {
            Username = registerDto.Username,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(registerDto.Password),
            FullName = registerDto.FullName,
            Email = registerDto.Email,
            Role = parsedRole,
            Language = "tr",
            ThemeColor = "#3B82F6",
            IsDarkMode = false
        };

        await _unitOfWork.Users.AddAsync(user);
        await _unitOfWork.CompleteAsync();

        return Ok("Kullanıcı başarıyla kaydedildi.");
    }

    // Herkese açık kayıt — sadece User rolüyle kayıt olunabilir
    [AllowAnonymous]
    [HttpPost("register-public")]
    public async Task<IActionResult> RegisterPublic(PublicRegisterDto registerDto)
    {
        var settings = await _unitOfWork.SystemSettings.GetAllAsync();
        var allowReg = settings.FirstOrDefault(s => s.Key == "AllowRegistration")?.Value ?? "true";
        if (allowReg.ToLower() != "true")
        {
            return BadRequest("Sisteme yeni kayıt alımı geçici olarak durdurulmuştur.");
        }

        var users = await _unitOfWork.Users.GetAllAsync();
        if (users.Any(u => u.Username == registerDto.Username))
        {
            return BadRequest("Bu kullanıcı adı zaten kullanılıyor.");
        }

        var user = new User
        {
            Username = registerDto.Username,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(registerDto.Password),
            FullName = registerDto.FullName,
            Email = registerDto.Email,
            Role = UserRole.User, // Public kayıtta her zaman User rolü
            Language = "tr",
            ThemeColor = "#3B82F6",
            IsDarkMode = false,
            IsApproved = false // Onay bekliyor
        };

        await _unitOfWork.Users.AddAsync(user);
        await _unitOfWork.CompleteAsync();

        return Ok(new
        {
            message = "Kayıt talebiniz alındı! Yöneticiniz onayladıktan sonra giriş yapabilirsiniz."
        });
    }

    private string GenerateJwtToken(User user)
    {
        var jwtSettings = _configuration.GetSection("Jwt");
        var key = Encoding.ASCII.GetBytes(jwtSettings["Key"]!);

        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Name, user.Username),
                new Claim(ClaimTypes.Role, user.Role.ToString())
            }),
            Expires = DateTime.UtcNow.AddDays(7),
            Issuer = jwtSettings["Issuer"],
            Audience = jwtSettings["Audience"],
            SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
        };

        var tokenHandler = new JwtSecurityTokenHandler();
        var token = tokenHandler.CreateToken(tokenDescriptor);

        return tokenHandler.WriteToken(token);
    }

    [Authorize(Roles = "SuperAdmin,Admin")]
    [HttpGet("pending-users")]
    public async Task<IActionResult> GetPendingUsers()
    {
        var users = await _unitOfWork.Users.GetAllAsync();
        var pending = users.Where(u => !u.IsApproved).Select(u => new {
            u.Id,
            u.Username,
            u.FullName,
            u.Email,
            u.Role
        });
        return Ok(pending);
    }

    [Authorize(Roles = "SuperAdmin,Admin")]
    [HttpPost("approve/{id}")]
    public async Task<IActionResult> ApproveUser(int id)
    {
        var user = await _unitOfWork.Users.GetByIdAsync(id);
        if (user == null) return NotFound();

        user.IsApproved = true;
        _unitOfWork.Users.Update(user);
        await _unitOfWork.CompleteAsync();

        return Ok(new { message = "Kullanıcı başarıyla onaylandı." });
    }

    [Authorize(Roles = "SuperAdmin,Admin")]
    [HttpDelete("reject/{id}")]
    public async Task<IActionResult> RejectUser(int id)
    {
        var user = await _unitOfWork.Users.GetByIdAsync(id);
        if (user == null) return NotFound();

        _unitOfWork.Users.Delete(user);
        await _unitOfWork.CompleteAsync();

        return Ok(new { message = "Kayıt talebi reddedildi ve silindi." });
    }
    [Authorize]
    [HttpPost("change-password")]
    public async Task<IActionResult> ChangePassword(ChangePasswordDto changePasswordDto)
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
        var user = await _unitOfWork.Users.GetByIdAsync(userId);

        if (user == null) return NotFound();

        if (!BCrypt.Net.BCrypt.Verify(changePasswordDto.OldPassword, user.PasswordHash))
        {
            return BadRequest("Mevcut şifre hatalı.");
        }

        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(changePasswordDto.NewPassword);
        _unitOfWork.Users.Update(user);
        await _unitOfWork.CompleteAsync();

        return Ok(new { message = "Şifreniz başarıyla güncellendi." });
    }
}
