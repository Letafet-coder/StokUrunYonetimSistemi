using Backend.Data;
using Backend.Models;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace Backend.Middleware;

public class MaintenanceMiddleware
{
    private readonly RequestDelegate _next;

    public MaintenanceMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(HttpContext context, AppDbContext dbContext)
    {
        // 1. Skip if it's the login or system settings endpoint
        var path = context.Request.Path.Value?.ToLower() ?? "";
        
        // Allow login, profile (to check role), and system settings (to turn off maintenance)
        bool isAllowedPath = path.Contains("/api/auth/login") || 
                             path.Contains("/api/systemsettings") ||
                             path.Contains("/api/auth/profile");

        if (isAllowedPath)
        {
            await _next(context);
            return;
        }

        // 2. Check MaintenanceMode setting
        var maintenanceMode = await dbContext.SystemSettings
            .FirstOrDefaultAsync(s => s.Key == "MaintenanceMode");

        if (maintenanceMode?.Value.ToLower() == "true")
        {
            // 3. Check if user is Admin or SuperAdmin
            var role = context.User.FindFirst(ClaimTypes.Role)?.Value;
            
            bool isAdmin = role == UserRole.Admin.ToString() || role == UserRole.SuperAdmin.ToString();

            if (!isAdmin)
            {
                context.Response.StatusCode = StatusCodes.Status503ServiceUnavailable;
                context.Response.ContentType = "application/json";
                await context.Response.WriteAsJsonAsync(new { 
                    message = "Sistem şu anda bakım modundadır. Lütfen daha sonra tekrar deneyiniz.",
                    maintenance = true
                });
                return;
            }
        }

        await _next(context);
    }
}
