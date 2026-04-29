using Backend.Data;
using Backend.Models;
using Backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace Backend.Controllers;

[Authorize(Roles = "SuperAdmin")]
[ApiController]
[Route("api/[controller]")]
public class SystemSettingsController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IAuditLogService _auditLog;

    public SystemSettingsController(AppDbContext context, IAuditLogService auditLog)
    {
        _context = context;
        _auditLog = auditLog;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<SystemSetting>>> GetSettings()
    {
        return await _context.SystemSettings.ToListAsync();
    }

    [HttpPut("{key}")]
    public async Task<IActionResult> UpdateSetting(string key, [FromBody] string value)
    {
        var setting = await _context.SystemSettings.FindAsync(key);
        if (setting == null) return NotFound();

        var oldValue = setting.Value;
        setting.Value = value;
        setting.LastUpdated = DateTime.UtcNow;

        _context.SystemSettings.Update(setting);
        await _context.SaveChangesAsync();

        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
        await _auditLog.LogAsync(userId, "Update", "SystemSettings", key, oldValue, value);

        return NoContent();
    }

    [HttpPost("bulk-update")]
    public async Task<IActionResult> BulkUpdateSettings([FromBody] Dictionary<string, string> settings)
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
        
        foreach (var item in settings)
        {
            var setting = await _context.SystemSettings.FindAsync(item.Key);
            if (setting != null)
            {
                var oldValue = setting.Value;
                setting.Value = item.Value;
                setting.LastUpdated = DateTime.UtcNow;
                
                await _auditLog.LogAsync(userId, "Update", "SystemSettings", item.Key, oldValue, item.Value);
            }
        }

        await _context.SaveChangesAsync();
        return Ok();
    }
}
