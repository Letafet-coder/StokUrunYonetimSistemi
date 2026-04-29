using Backend.Data;
using Backend.Models;
using Backend.Repositories.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace Backend.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class InventoryCountsController : ControllerBase
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly AppDbContext _context;

    public InventoryCountsController(IUnitOfWork unitOfWork, AppDbContext context)
    {
        _unitOfWork = unitOfWork;
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<InventoryCount>>> GetCounts()
    {
        var counts = await _context.InventoryCounts
            .Include(c => c.CreatedByUser)
            .OrderByDescending(c => c.Date)
            .ToListAsync();
        return Ok(counts);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<InventoryCount>> GetCount(int id)
    {
        var count = await _context.InventoryCounts
            .Include(c => c.Items)
            .ThenInclude(i => i.Product)
            .Include(c => c.CreatedByUser)
            .FirstOrDefaultAsync(c => c.Id == id);

        if (count == null) return NotFound();
        return Ok(count);
    }

    [HttpGet("products")]
    public async Task<ActionResult<IEnumerable<object>>> GetProductsForCount([FromQuery] int? warehouseId = null)
    {
        var query = _context.Products.AsQueryable();

        var products = await query
            .Select(p => new
            {
                p.Id,
                p.Name,
                p.Sku,
                StockQuantity = warehouseId.HasValue 
                    ? p.ProductStocks.Where(ps => ps.WarehouseId == warehouseId).Sum(ps => ps.Quantity)
                    : p.ProductStocks.Sum(ps => ps.Quantity),
                p.Unit,
                CategoryName = p.Category != null ? p.Category.Name : "N/A"
            })
            .ToListAsync();
        return Ok(products);
    }

    [HttpPost]
    public async Task<ActionResult<InventoryCount>> CreateCount(InventoryCount count)
    {
        var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (int.TryParse(userIdString, out int userId))
        {
            count.CreatedByUserId = userId;
        }

        count.Date = DateTime.UtcNow;
        count.Status = "Completed";

        foreach (var item in count.Items)
        {
            var product = await _unitOfWork.Products.GetByIdAsync(item.ProductId);
            if (product != null)
            {
                // Record the difference if any
                if (item.Difference != 0)
                {
                    var movement = new StockMovement
                    {
                        ProductId = product.Id,
                        Quantity = Math.Abs(item.Difference),
                        Type = MovementType.Adjustment,
                        Date = DateTime.UtcNow,
                        WarehouseId = count.WarehouseId,
                        ToLocationId = count.LocationId, 
                        Description = $"Envanter Sayımı Sonucu ({count.Description ?? "Genel Sayım"})",
                        DocumentNumber = $"COUNT-{DateTime.UtcNow:yyyyMMdd}"
                    };

                    await _unitOfWork.StockMovements.AddAsync(movement);
                    
                    // Update stock
                    await UpdateStock(product.Id, count.WarehouseId, count.LocationId, item.CountedQuantity);
                }
            }
        }

        await _unitOfWork.InventoryCounts.AddAsync(count);
        await _unitOfWork.CompleteAsync();

        return CreatedAtAction(nameof(GetCount), new { id = count.Id }, count);
    }

    private async Task UpdateStock(int productId, int? warehouseId, int? locationId, int newQuantity)
    {
        if (!warehouseId.HasValue && !locationId.HasValue) return;

        var stock = await _context.ProductStocks
            .FirstOrDefaultAsync(ps => ps.ProductId == productId && 
                                     (locationId.HasValue ? ps.LocationId == locationId : ps.WarehouseId == warehouseId));

        if (stock == null)
        {
            stock = new ProductStock 
            { 
                ProductId = productId, 
                WarehouseId = warehouseId ?? 0, 
                LocationId = locationId, 
                Quantity = newQuantity 
            };
            await _context.ProductStocks.AddAsync(stock);
        }
        else
        {
            stock.Quantity = newQuantity;
            _context.ProductStocks.Update(stock);
        }
    }
}
