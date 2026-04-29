using Backend.Data;
using Backend.Models;
using System.Text.Json;

namespace Backend.Services;

public interface IAuditLogService
{
    Task LogAsync(int userId, string action, string entityName, string? entityId = null, object? oldData = null, object? newData = null, string? ipAddress = null);
}

public class AuditLogService : IAuditLogService
{
    private readonly AppDbContext _context;

    public AuditLogService(AppDbContext context)
    {
        _context = context;
    }

    public async Task LogAsync(int userId, string action, string entityName, string? entityId = null, object? oldData = null, object? newData = null, string? ipAddress = null)
    {
        var log = new AuditLog
        {
            UserId = userId,
            Action = action,
            EntityName = entityName,
            EntityId = entityId,
            OldValues = oldData != null ? JsonSerializer.Serialize(oldData) : null,
            NewValues = newData != null ? JsonSerializer.Serialize(newData) : null,
            Timestamp = DateTime.UtcNow,
            IPAddress = ipAddress
        };

        _context.AuditLogs.Add(log);
        await _context.SaveChangesAsync();
    }
}
