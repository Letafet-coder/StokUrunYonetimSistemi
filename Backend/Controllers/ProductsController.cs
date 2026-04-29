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
public class ProductsController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IUnitOfWork _unitOfWork;

    public ProductsController(AppDbContext context, IUnitOfWork unitOfWork)
    {
        _context = context;
        _unitOfWork = unitOfWork;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Product>>> GetProducts()
    {
        var products = await _context.Products
            .Include(p => p.Category)
            .Include(p => p.ProductStocks)
            .ToListAsync();
        return Ok(products);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Product>> GetProduct(int id)
    {
        var product = await _context.Products
            .Include(p => p.Category)
            .Include(p => p.ProductStocks)
            .FirstOrDefaultAsync(p => p.Id == id);
            
        if (product == null) return NotFound();
        return Ok(product);
    }

    [Authorize(Roles = "SuperAdmin,Admin")]
    [HttpPost]
    public async Task<ActionResult<Product>> CreateProduct(Product product)
    {
        try 
        {
            product.Id = 0;
            Console.WriteLine($"[API] Creating product: {product.Name} (SKU: {product.Sku})");
            
            await _unitOfWork.Products.AddAsync(product);
            var result = await _unitOfWork.CompleteAsync();
            
            if (result > 0)
            {
                Console.WriteLine($"[API] Successfully saved product {product.Name} with ID {product.Id}");
                return CreatedAtAction(nameof(GetProduct), new { id = product.Id }, product);
            }
            
            Console.WriteLine("[API ERROR] Database changes were not saved (0 rows affected)");
            return StatusCode(500, "Veri kaydedildi ancak veritabanı değişikliği onaylanmadı.");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[API FATAL ERROR] {ex.Message}");
            return StatusCode(500, $"Ürün kaydedilirken sunucu hatası oluştu: {ex.Message}");
        }
    }

    [Authorize(Roles = "SuperAdmin,Admin")]
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateProduct(int id, Product product)
    {
        if (id != product.Id) return BadRequest();
        _unitOfWork.Products.Update(product);
        await _unitOfWork.CompleteAsync();
        return NoContent();
    }

    [Authorize(Roles = "SuperAdmin,Admin")]
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteProduct(int id)
    {
        var product = await _unitOfWork.Products.GetByIdAsync(id);
        if (product == null) return NotFound();
        _unitOfWork.Products.Delete(product);
        await _unitOfWork.CompleteAsync();
        return NoContent();
    }
}
