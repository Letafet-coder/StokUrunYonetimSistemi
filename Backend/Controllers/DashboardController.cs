using Backend.Models;
using Backend.Repositories.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend.Data;
using Microsoft.AspNetCore.Authorization;

namespace Backend.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class DashboardController : ControllerBase
{
    private readonly AppDbContext _context;

    public DashboardController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet("stats")]
    public async Task<IActionResult> GetStats()
    {
        try
        {
            var totalProducts = await _context.Products.CountAsync();
            var totalCategories = await _context.Categories.CountAsync();
            
            // Sum stock per product and compare with critical level
            var productsForLowStock = await _context.Products
                .Include(p => p.ProductStocks)
                .ToListAsync();

            var lowStockCount = productsForLowStock
                .Count(p => p.ProductStocks.Sum(ps => ps.Quantity) <= p.CriticalLevel);
            
            var recentMovements = await _context.StockMovements
                .Include(m => m.Product)
                .OrderByDescending(m => m.Date)
                .Take(5)
                .ToListAsync();

            var totalInventoryCounts = await _context.InventoryCounts.CountAsync();
            var recentInventoryCounts = await _context.InventoryCounts
                .Include(c => c.CreatedByUser)
                .OrderByDescending(c => c.Date)
                .Take(3)
                .ToListAsync();

            // 1. Movement Trend (Last 7 Days)
            var movementTrend = new List<object>();
            for (int i = 6; i >= 0; i--)
            {
                var date = DateTime.UtcNow.Date.AddDays(-i);
                var count = await _context.StockMovements.CountAsync(m => m.Date.Date == date);
                movementTrend.Add(new { Date = date, Count = count });
            }

            // 2. Stock Value by Category
            var allProducts = await _context.Products
                .Include(p => p.Category)
                .Include(p => p.ProductStocks)
                .ToListAsync();

            var categoryDistribution = allProducts
                .GroupBy(p => p.Category?.Name ?? "Diğer")
                .Select(g => new {
                    CategoryName = g.Key,
                    TotalValue = (double)g.Sum(p => p.ProductStocks.Sum(ps => ps.Quantity) * p.Price)
                })
                .Where(x => x.TotalValue >= 0)
                .ToList();

            return Ok(new
            {
                TotalProducts = totalProducts,
                TotalCategories = totalCategories,
                LowStockCount = lowStockCount,
                RecentMovements = recentMovements,
                TotalInventoryCounts = totalInventoryCounts,
                RecentInventoryCounts = recentInventoryCounts,
                MovementTrend = movementTrend,
                CategoryDistribution = categoryDistribution
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Dashboard stats error: {ex.Message}");
        }
    }

    [HttpGet("low-stock")]
    public async Task<IActionResult> GetLowStockProducts()
    {
        var allProducts = await _context.Products
            .Include(p => p.Category)
            .Include(p => p.ProductStocks)
            .ToListAsync();

        var lowStockProducts = allProducts
            .Where(p => p.ProductStocks.Sum(ps => ps.Quantity) <= p.CriticalLevel)
            .ToList();
        
        return Ok(lowStockProducts);
    }
}
