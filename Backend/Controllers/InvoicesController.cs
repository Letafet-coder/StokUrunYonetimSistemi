using Backend.Data;
using Backend.Repositories.Interfaces;
using Backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Backend.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class InvoicesController : ControllerBase
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly AppDbContext _context;

    public InvoicesController(IUnitOfWork unitOfWork, AppDbContext context)
    {
        _unitOfWork = unitOfWork;
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Invoice>>> GetInvoices()
    {
        return await _context.Invoices
            .Include(i => i.Items)
            .ThenInclude(it => it.Product)
            .OrderByDescending(i => i.Date)
            .ToListAsync();
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Invoice>> GetInvoice(int id)
    {
        var invoice = await _context.Invoices
            .Include(i => i.Items)
            .ThenInclude(it => it.Product)
            .FirstOrDefaultAsync(i => i.Id == id);

        if (invoice == null) return NotFound();

        return invoice;
    }

    [HttpPost]
    public async Task<ActionResult<Invoice>> CreateInvoice(Invoice invoice)
    {
        await _unitOfWork.Invoices.AddAsync(invoice);
        await _unitOfWork.CompleteAsync();

        // Return invoice with items/products if needed
        var created = await _context.Invoices
            .Include(i => i.Items)
            .FirstOrDefaultAsync(i => i.Id == invoice.Id);
            
        return CreatedAtAction(nameof(GetInvoice), new { id = invoice.Id }, created);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateInvoice(int id, Invoice invoice)
    {
        if (id != invoice.Id) return BadRequest();

        _unitOfWork.Invoices.Update(invoice);
        await _unitOfWork.CompleteAsync();

        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteInvoice(int id)
    {
        var invoice = await _unitOfWork.Invoices.GetByIdAsync(id);
        if (invoice == null) return NotFound();

        _unitOfWork.Invoices.Delete(invoice);
        await _unitOfWork.CompleteAsync();

        return NoContent();
    }

    [HttpPost("{id}/upload")]
    public async Task<IActionResult> UploadDocument(int id, IFormFile file)
    {
        var invoice = await _unitOfWork.Invoices.GetByIdAsync(id);
        if (invoice == null) return NotFound();

        if (file == null || file.Length == 0) return BadRequest("Dosya seçilmedi.");

        var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads", "invoices");
        if (!Directory.Exists(uploadsFolder)) Directory.CreateDirectory(uploadsFolder);

        var fileName = $"{id}_{Guid.NewGuid()}{Path.GetExtension(file.FileName)}";
        var filePath = Path.Combine(uploadsFolder, fileName);

        using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await file.CopyToAsync(stream);
        }

        invoice.DocumentUrl = $"/uploads/invoices/{fileName}";
        _unitOfWork.Invoices.Update(invoice);
        await _unitOfWork.CompleteAsync();

        return Ok(new { url = invoice.DocumentUrl });
    }
}
