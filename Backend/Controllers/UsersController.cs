using Backend.Dtos;
using Backend.Models;
using Backend.Repositories.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

using Backend.Services;
using System.Security.Claims;

namespace Backend.Controllers;

[Authorize(Roles = "SuperAdmin,Admin")]
[ApiController]
[Route("api/[controller]")]
public class UsersController : ControllerBase
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IAuditLogService _auditLog;

    public UsersController(IUnitOfWork unitOfWork, IAuditLogService auditLog)
    {
        _unitOfWork = unitOfWork;
        _auditLog = auditLog;
    }

    // GET: api/users — Admin: Tüm kullanıcıları listele
    [HttpGet]
    public async Task<ActionResult<IEnumerable<object>>> GetUsers()
    {
        var users = await _unitOfWork.Users.GetAllAsync();
        return Ok(users.Select(u => new
        {
            u.Id,
            u.Username,
            u.FullName,
            u.Email,
            u.Role,
            u.Language,
            u.ThemeColor,
            u.IsDarkMode
        }));
    }

    // GET: api/users/{id} — Admin: Belirli kullanıcı detayı
    [HttpGet("{id}")]
    public async Task<ActionResult<object>> GetUser(int id)
    {
        var user = await _unitOfWork.Users.GetByIdAsync(id);
        if (user == null) return NotFound("Kullanıcı bulunamadı.");

        return Ok(new
        {
            user.Id,
            user.Username,
            user.FullName,
            user.Email,
            user.Role,
            user.Language,
            user.ThemeColor,
            user.IsDarkMode
        });
    }

    // POST: api/users — Admin: Yeni kullanıcı oluştur (rol seçilebilir)
    [HttpPost]
    public async Task<IActionResult> CreateUser(RegisterDto registerDto)
    {
        var users = await _unitOfWork.Users.GetAllAsync();
        if (users.Any(u => u.Username == registerDto.Username))
        {
            return BadRequest("Bu kullanıcı adı zaten kullanılıyor.");
        }

        if (!Enum.TryParse<UserRole>(registerDto.Role, out var parsedRole))
        {
            return BadRequest("Geçersiz rol.");
        }

        var currentUserId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
        var currentRole = User.FindFirst(ClaimTypes.Role)?.Value;

        // Hiyerarşi kontrolü: Admin, başka bir Admin veya SuperAdmin oluşturamaz
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

        await _auditLog.LogAsync(currentUserId, "Create", "Users", user.Id.ToString(), null, user.Username);

        return CreatedAtAction(nameof(GetUser), new { id = user.Id }, new
        {
            user.Id,
            user.Username,
            user.FullName,
            user.Email,
            user.Role
        });
    }

    // PUT: api/users/{id} — Admin: Kullanıcıyı güncelle
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateUser(int id, AdminUserUpdateDto updateDto)
    {
        var user = await _unitOfWork.Users.GetByIdAsync(id);
        if (user == null) return NotFound("Kullanıcı bulunamadı.");

        user.FullName = updateDto.FullName;
        user.Email = updateDto.Email;

        if (!Enum.TryParse<UserRole>(updateDto.Role, out var parsedRole))
        {
            return BadRequest("Geçersiz rol.");
        }

        var currentUserId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
        var currentRole = User.FindFirst(ClaimTypes.Role)?.Value;

        // Hiyerarşi kontrolü: Admin, birinin rolünü Admin/SuperAdmin yapamaz
        if (parsedRole != UserRole.User && currentRole != UserRole.SuperAdmin.ToString())
        {
            return Forbid("Sadece Süper Yöneticiler üst düzey yetki değiştirebilir.");
        }
        
        // Admin, başka bir Admin'in veya SuperAdmin'in bilgilerini güncelleyemez
        if (currentRole == UserRole.Admin.ToString() && (user.Role == UserRole.Admin || user.Role == UserRole.SuperAdmin))
        {
            return Forbid("Üst düzey veya eş düzey yetkiye sahip kullanıcıları güncelleyemezsiniz.");
        }

        user.Role = parsedRole;

        // Eğer yeni şifre gönderildiyse güncelle
        if (!string.IsNullOrWhiteSpace(updateDto.NewPassword))
        {
            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(updateDto.NewPassword);
        }

        _unitOfWork.Users.Update(user);
        await _unitOfWork.CompleteAsync();

        await _auditLog.LogAsync(currentUserId, "Update", "Users", user.Id.ToString(), null, user.Username);

        return Ok(new
        {
            user.Id,
            user.Username,
            user.FullName,
            user.Email,
            user.Role
        });
    }

    // DELETE: api/users/{id} — Admin: Kullanıcıyı sil (kendi hesabını silemez)
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteUser(int id)
    {
        var currentUserId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
        var currentRole = User.FindFirst(ClaimTypes.Role)?.Value;

        if (currentUserId == id)
        {
            return BadRequest("Kendi hesabınızı silemezsiniz.");
        }

        var user = await _unitOfWork.Users.GetByIdAsync(id);
        if (user == null) return NotFound("Kullanıcı bulunamadı.");

        // Hiyerarşi kontrolü: Admin, başka bir Admin'i veya SuperAdmin'i silemez
        if (currentRole == UserRole.Admin.ToString() && (user.Role == UserRole.Admin || user.Role == UserRole.SuperAdmin))
        {
            return Forbid("Üst düzey veya eş düzey yetkiye sahip kullanıcıları silemezsiniz.");
        }

        _unitOfWork.Users.Delete(user);
        await _unitOfWork.CompleteAsync();

        await _auditLog.LogAsync(currentUserId, "Delete", "Users", user.Id.ToString(), user.Username, null);

        return NoContent();
    }

    // POST: api/users/freeze-account — Herkes: Kendi hesabını dondur
    [Authorize]
    [HttpPost("freeze-account")]
    public async Task<IActionResult> FreezeAccount()
    {
        var currentUserId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
        var user = await _unitOfWork.Users.GetByIdAsync(currentUserId);
        
        if (user == null) return NotFound("Kullanıcı bulunamadı.");

        user.IsApproved = false; // Hesabı dondur
        
        _unitOfWork.Users.Update(user);
        await _unitOfWork.CompleteAsync();

        await _auditLog.LogAsync(currentUserId, "Freeze", "Users", user.Id.ToString(), "Active", "Frozen");

        return Ok("Hesabınız başarıyla donduruldu. Tekrar giriş yapmak için yönetici onayı gerekecektir.");
    }
}
