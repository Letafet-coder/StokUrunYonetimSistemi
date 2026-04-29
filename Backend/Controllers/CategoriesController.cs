using Backend.Models;
using Backend.Repositories.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;

namespace Backend.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class CategoriesController : ControllerBase
{
    private readonly IUnitOfWork _unitOfWork;

    public CategoriesController(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Category>>> GetCategories()
    {
        var categories = await _unitOfWork.Categories.GetAllAsync();
        return Ok(categories);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Category>> GetCategory(int id)
    {
        var category = await _unitOfWork.Categories.GetByIdAsync(id);
        if (category == null) return NotFound();
        return Ok(category);
    }

    [Authorize(Roles = "SuperAdmin,Admin")]
    [HttpPost]
    public async Task<ActionResult<Category>> CreateCategory(Category category)
    {
        Console.WriteLine($"[API] Creating category: {category.Name}");
        
        await _unitOfWork.Categories.AddAsync(category);
        var result = await _unitOfWork.CompleteAsync();
        
        if (result > 0)
        {
            Console.WriteLine($"[API] Successfully saved category {category.Name} with ID {category.Id}");
            return CreatedAtAction(nameof(GetCategory), new { id = category.Id }, category);
        }

        Console.WriteLine("[API ERROR] Database changes were not saved for category (0 rows affected)");
        return StatusCode(500, "Kategori kaydedildi ancak veritabanı değişikliği onaylanmadı.");
    }

    [Authorize(Roles = "SuperAdmin,Admin")]
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateCategory(int id, Category category)
    {
        if (id != category.Id) return BadRequest();
        _unitOfWork.Categories.Update(category);
        await _unitOfWork.CompleteAsync();
        return NoContent();
    }

    [Authorize(Roles = "SuperAdmin,Admin")]
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteCategory(int id)
    {
        var category = await _unitOfWork.Categories.GetByIdAsync(id);
        if (category == null) return NotFound();
        _unitOfWork.Categories.Delete(category);
        await _unitOfWork.CompleteAsync();
        return NoContent();
    }
}
