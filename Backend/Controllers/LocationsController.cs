using Backend.Data;
using Backend.Models;
using Backend.Repositories.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;

namespace Backend.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class LocationsController : ControllerBase
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly AppDbContext _context;

    public LocationsController(IUnitOfWork unitOfWork, AppDbContext context)
    {
        _unitOfWork = unitOfWork;
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Location>>> GetLocations([FromQuery] int? warehouseId)
    {
        var query = _context.Locations.Include(l => l.Warehouse).AsQueryable();
        
        if (warehouseId.HasValue && warehouseId.Value > 0)
        {
            query = query.Where(l => l.WarehouseId == warehouseId.Value);
        }
        
        var locations = await query.ToListAsync();
        return Ok(locations);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Location>> GetLocation(int id)
    {
        var location = await _context.Locations.Include(l => l.Warehouse).FirstOrDefaultAsync(l => l.Id == id);
        if (location == null) return NotFound();
        return Ok(location);
    }

    [Authorize(Roles = "SuperAdmin,Admin")]
    [HttpPost]
    public async Task<ActionResult<Location>> CreateLocation(Location location)
    {
        await _unitOfWork.Locations.AddAsync(location);
        await _unitOfWork.CompleteAsync();
        
        // Return location with warehouse included for frontend display
        var created = await _context.Locations.Include(l => l.Warehouse).FirstOrDefaultAsync(l => l.Id == location.Id);
        return CreatedAtAction(nameof(GetLocation), new { id = location.Id }, created);
    }

    [Authorize(Roles = "SuperAdmin,Admin")]
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateLocation(int id, Location location)
    {
        if (id != location.Id) return BadRequest();
        _unitOfWork.Locations.Update(location);
        await _unitOfWork.CompleteAsync();
        return NoContent();
    }

    [Authorize(Roles = "SuperAdmin,Admin")]
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteLocation(int id)
    {
        var location = await _unitOfWork.Locations.GetByIdAsync(id);
        if (location == null) return NotFound();
        _unitOfWork.Locations.Delete(location);
        await _unitOfWork.CompleteAsync();
        return NoContent();
    }
}
