using Backend.Data;
using Backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Backend.Controllers;

public class BulkStockRequest
{
    public int ProductId { get; set; }
    public int Quantity { get; set; }
    public int WarehouseId { get; set; }
    public int LocationId { get; set; }
}

[Authorize(Roles = "SuperAdmin,Admin")]
[ApiController]
[Route("api/[controller]")]
public class BulkStockController : ControllerBase
{
    private readonly AppDbContext _context;

    public BulkStockController(AppDbContext context)
    {
        _context = context;
    }

    [HttpPost("upload")]
    public async Task<IActionResult> BulkUpload(List<BulkStockRequest> requests)
    {
        var userId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? "0");
        
        foreach (var req in requests)
        {
            var product = await _context.Products.FindAsync(req.ProductId);
            if (product == null) continue;

            // Update ProductStock
            var stock = await _context.ProductStocks
                .FirstOrDefaultAsync(ps => ps.ProductId == req.ProductId && ps.LocationId == req.LocationId);

            if (stock == null)
            {
                stock = new ProductStock
                {
                    ProductId = req.ProductId,
                    LocationId = req.LocationId,
                    Quantity = req.Quantity
                };
                _context.ProductStocks.Add(stock);
            }
            else
            {
                stock.Quantity += req.Quantity;
            }

            // Record Stock Movement
            var movement = new StockMovement
            {
                ProductId = req.ProductId,
                ToLocationId = req.LocationId,
                Quantity = req.Quantity,
                Type = MovementType.In,
                Date = DateTime.Now,
                CreatedByUserId = userId,
                Description = "Toplu Stok Girişi"
            };
            _context.StockMovements.Add(movement);
        }

        await _context.SaveChangesAsync();
        return Ok(new { message = $"{requests.Count} ürün için toplu stok girişi tamamlandı." });
    }
}
