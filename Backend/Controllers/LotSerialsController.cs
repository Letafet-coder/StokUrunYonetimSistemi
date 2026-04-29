using Backend.Data;
using Backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Backend.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class LotSerialsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public LotSerialsController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<LotSerial>>> GetLotSerials()
        {
            return await _context.LotSerials.Include(ls => ls.Product).OrderByDescending(ls => ls.CreatedAt).ToListAsync();
        }

        [HttpGet("product/{productId}")]
        public async Task<ActionResult<IEnumerable<LotSerial>>> GetByProduct(int productId)
        {
            return await _context.LotSerials
                .Where(ls => ls.ProductId == productId)
                .OrderByDescending(ls => ls.CreatedAt)
                .ToListAsync();
        }

        [HttpPost]
        public async Task<ActionResult<LotSerial>> CreateLotSerial(LotSerial lotSerial)
        {
            // Check for duplicate identifier for the same product
            var exists = await _context.LotSerials
                .AnyAsync(ls => ls.ProductId == lotSerial.ProductId && ls.Identifier == lotSerial.Identifier);
            
            if (exists) return BadRequest("This identifier already exists for this product.");

            lotSerial.CreatedAt = DateTime.UtcNow;
            _context.LotSerials.Add(lotSerial);
            await _context.SaveChangesAsync();

            return Ok(lotSerial);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteLotSerial(int id)
        {
            var item = await _context.LotSerials.FindAsync(id);
            if (item == null) return NotFound();

            // Check if there is stock for this lot
            var hasStock = await _context.ProductStocks.AnyAsync(ps => ps.LotSerialId == id && ps.Quantity > 0);
            if (hasStock) return BadRequest("Cannot delete a Lot/Serial that has active stock.");

            _context.LotSerials.Remove(item);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}
