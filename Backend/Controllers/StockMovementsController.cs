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
public class StockMovementsController : ControllerBase
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly AppDbContext _context;

    public StockMovementsController(IUnitOfWork unitOfWork, AppDbContext context)
    {
        _unitOfWork = unitOfWork;
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<StockMovement>>> GetMovements()
    {
        var movements = await _context.StockMovements
            .Include(m => m.Product)
            .Include(m => m.FromLocation)
            .Include(m => m.ToLocation)
            .Include(m => m.LotSerial)
            .Include(m => m.CreatedByUser)
            .OrderByDescending(m => m.Date)
            .ToListAsync();
        return Ok(movements);
    }

    [HttpGet("summary")]
    public async Task<IActionResult> GetSummary()
    {
        var today = DateTime.UtcNow.Date;
        var stats = await _context.StockMovements
            .GroupBy(m => m.Type)
            .Select(g => new { Type = g.Key, Count = g.Count() })
            .ToListAsync();

        return Ok(new
        {
            StockIn = stats.FirstOrDefault(s => s.Type == MovementType.In)?.Count ?? 0,
            StockOut = stats.FirstOrDefault(s => s.Type == MovementType.Out)?.Count ?? 0,
            Adjustment = stats.FirstOrDefault(s => s.Type == MovementType.Adjustment)?.Count ?? 0,
            Transfer = stats.FirstOrDefault(s => s.Type == MovementType.Transfer)?.Count ?? 0
        });
    }

    [HttpPost]
    public async Task<ActionResult<StockMovement>> CreateMovement(StockMovement movement)
    {
        var product = await _unitOfWork.Products.GetByIdAsync(movement.ProductId);
        if (product == null) return NotFound("Product not found");

        // Tracking Validation
        if (product.Tracking != TrackingType.None)
        {
            if (movement.LotSerialId == null)
            {
                return BadRequest($"Product {product.Name} requires a Lot/Serial identifier.");
            }

            if (product.Tracking == TrackingType.Serial && movement.Quantity != 1)
            {
                return BadRequest("Serialized items must have a quantity of exactly 1 per movement.");
            }
        }

        // Use default location (ID=1) if none provided
        if (movement.Type == MovementType.In && movement.ToLocationId == null) movement.ToLocationId = 1;
        if (movement.Type == MovementType.Out && movement.FromLocationId == null) movement.FromLocationId = 1;
        if (movement.Type == MovementType.Adjustment && movement.ToLocationId == null) movement.ToLocationId = 1;

        if (movement.Type == MovementType.In || movement.Type == MovementType.Adjustment)
        {
            await UpdateStock(movement.ProductId, movement.ToLocationId!.Value, movement.LotSerialId, movement.Quantity);
        }
        else if (movement.Type == MovementType.Out)
        {
            var currentStock = await GetLocationStock(movement.ProductId, movement.FromLocationId!.Value, movement.LotSerialId);
            if (currentStock < movement.Quantity) return BadRequest("Insufficient stock in source location" + (movement.LotSerialId != null ? " for this Lot/Serial" : ""));
            await UpdateStock(movement.ProductId, movement.FromLocationId!.Value, movement.LotSerialId, -movement.Quantity);
        }
        else if (movement.Type == MovementType.Transfer)
        {
            if (movement.FromLocationId == null || movement.ToLocationId == null)
                return BadRequest("Transfer requires both source and destination locations");

            var currentStock = await GetLocationStock(movement.ProductId, movement.FromLocationId.Value, movement.LotSerialId);
            if (currentStock < movement.Quantity) return BadRequest("Insufficient stock in source location");

            await UpdateStock(movement.ProductId, movement.FromLocationId.Value, movement.LotSerialId, -movement.Quantity);
            await UpdateStock(movement.ProductId, movement.ToLocationId.Value, movement.LotSerialId, movement.Quantity);
        }

        movement.Date = DateTime.UtcNow;
        await _unitOfWork.StockMovements.AddAsync(movement);
        await _unitOfWork.CompleteAsync();
        
        return Ok(movement);
    }

    [Authorize(Roles = "SuperAdmin,Admin")]
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteMovement(int id)
    {
        var movement = await _context.StockMovements.FindAsync(id);
        if (movement == null) return NotFound();

        // Revert stock changes before deleting
        if (movement.Type == MovementType.In || movement.Type == MovementType.Adjustment)
        {
            if (movement.ToLocationId.HasValue)
                await UpdateStock(movement.ProductId, movement.ToLocationId.Value, movement.LotSerialId, -movement.Quantity);
        }
        else if (movement.Type == MovementType.Out)
        {
            if (movement.FromLocationId.HasValue)
                await UpdateStock(movement.ProductId, movement.FromLocationId.Value, movement.LotSerialId, movement.Quantity);
        }
        else if (movement.Type == MovementType.Transfer)
        {
            if (movement.FromLocationId.HasValue && movement.ToLocationId.HasValue)
            {
                await UpdateStock(movement.ProductId, movement.FromLocationId.Value, movement.LotSerialId, movement.Quantity);
                await UpdateStock(movement.ProductId, movement.ToLocationId.Value, movement.LotSerialId, -movement.Quantity);
            }
        }

        _context.StockMovements.Remove(movement);
        await _context.SaveChangesAsync();
        return NoContent();
    }

    private async Task<int> GetLocationStock(int productId, int locationId, int? lotSerialId)
    {
        var stock = await _context.ProductStocks
            .FirstOrDefaultAsync(ps => ps.ProductId == productId && ps.LocationId == locationId && ps.LotSerialId == lotSerialId);
        return stock?.Quantity ?? 0;
    }

    private async Task UpdateStock(int productId, int locationId, int? lotSerialId, int change)
    {
        var stock = await _context.ProductStocks
            .FirstOrDefaultAsync(ps => ps.ProductId == productId && ps.LocationId == locationId && ps.LotSerialId == lotSerialId);

        if (stock == null)
        {
            stock = new ProductStock { 
                ProductId = productId, 
                LocationId = locationId, 
                LotSerialId = lotSerialId,
                Quantity = change 
            };
            await _context.ProductStocks.AddAsync(stock);
        }
        else
        {
            stock.Quantity += change;
            _context.ProductStocks.Update(stock);
        }
    }
}
