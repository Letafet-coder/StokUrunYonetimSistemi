using Backend.Data;
using Backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ClosedXML.Excel;
using System.Globalization;
using CsvHelper;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;
using QuestPDF.Previewer;

namespace Backend.Controllers;

[Authorize(Roles = "SuperAdmin,Admin")]
[ApiController]
[Route("api/[controller]")]
public class ReportsController : ControllerBase
{
    private readonly AppDbContext _context;

    public ReportsController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet("summary")]
    public async Task<IActionResult> GetSummary()
    {
        var totalProducts = await _context.Products.CountAsync();
        var totalMovements = await _context.StockMovements.CountAsync();
        
        var allProducts = await _context.Products
            .Include(p => p.ProductStocks)
            .ToListAsync();

        var inventoryValue = allProducts.Sum(p => p.ProductStocks.Sum(ps => ps.Quantity) * p.Price);
        var lowStockCount = allProducts.Count(p => p.ProductStocks.Sum(ps => ps.Quantity) <= p.CriticalLevel);

        return Ok(new
        {
            TotalProducts = totalProducts,
            InventoryValue = inventoryValue,
            LowStockCount = lowStockCount,
            TotalMovements = totalMovements
        });
    }

    [HttpGet("analytics")]
    public async Task<IActionResult> GetAnalytics()
    {
        // 1. Movement Type Distribution
        var typeStats = await _context.StockMovements
            .GroupBy(m => m.Type)
            .Select(g => new { Type = g.Key, Count = g.Count() })
            .ToListAsync();

        // 2. Top Products by Value
        var allProducts = await _context.Products
            .Include(p => p.ProductStocks)
            .ToListAsync();

        var topProducts = allProducts
            .Select(p => new
            {
                Name = p.Name,
                Value = p.ProductStocks.Sum(ps => ps.Quantity) * p.Price
            })
            .OrderByDescending(x => x.Value)
            .Take(5)
            .ToList();

        // 3. Category Distribution (Value)
        var categoryStats = allProducts
            .GroupBy(p => p.CategoryId)
            .Select(g => new
            {
                CategoryName = _context.Categories.Find(g.Key)?.Name ?? "Diğer",
                Value = g.Sum(p => p.ProductStocks.Sum(ps => ps.Quantity) * p.Price)
            })
            .ToList();

        // 4. Movement Trend (Last 14 days, split by In/Out)
        var twoWeeksAgo = DateTime.UtcNow.Date.AddDays(-14);
        var movements = await _context.StockMovements
            .Where(m => m.Date >= twoWeeksAgo)
            .ToListAsync();

        var trend = movements
            .GroupBy(m => m.Date.Date)
            .Select(g => new
            {
                Date = g.Key,
                In = g.Count(m => m.Type == MovementType.In),
                Out = g.Count(m => m.Type == MovementType.Out)
            })
            .OrderBy(g => g.Date)
            .ToList();

        return Ok(new
        {
            TypeDistribution = typeStats,
            TopProducts = topProducts,
            CategoryValueDistribution = categoryStats,
            MovementTrend = trend
        });
    }

    [HttpGet("low-stock-report")]
    public async Task<IActionResult> GetLowStockReport()
    {
        var allProducts = await _context.Products
            .Include(p => p.Category)
            .Include(p => p.ProductStocks)
            .ToListAsync();

        var report = allProducts
            .Where(p => p.ProductStocks.Sum(ps => ps.Quantity) <= p.CriticalLevel)
            .Select(p => {
                var currentStock = p.ProductStocks.Sum(ps => ps.Quantity);
                return new
                {
                    Name = p.Name,
                    Sku = p.Sku,
                    CurrentStock = currentStock,
                    MinStock = p.CriticalLevel,
                    Shortage = p.CriticalLevel > currentStock ? p.CriticalLevel - currentStock : 0,
                    Supplier = "Tedarikçi Bilgisi Yok"
                };
            })
            .ToList();

        return Ok(report);
    }
    
    [HttpGet("export-products")]
    public async Task<IActionResult> ExportProducts()
    {
        var products = await _context.Products
            .Include(p => p.Category)
            .Include(p => p.ProductStocks)
            .ToListAsync();

        using var workbook = new XLWorkbook();
        var worksheet = workbook.Worksheets.Add("Envanter");
        
        // Headers
        worksheet.Cell(1, 1).Value = "SKU";
        worksheet.Cell(1, 2).Value = "Ürün Adı";
        worksheet.Cell(1, 3).Value = "Kategori";
        worksheet.Cell(1, 4).Value = "Fiyat";
        worksheet.Cell(1, 5).Value = "Stok Miktarı";
        worksheet.Cell(1, 6).Value = "Birim";
        worksheet.Cell(1, 7).Value = "Kritik Eşik";

        // Styling
        var headerRow = worksheet.Row(1);
        headerRow.Style.Font.Bold = true;
        headerRow.Style.Fill.BackgroundColor = XLColor.FromHtml("#0d9488");
        headerRow.Style.Font.FontColor = XLColor.White;

        for (int i = 0; i < products.Count; i++)
        {
            var p = products[i];
            var row = i + 2;
            worksheet.Cell(row, 1).Value = p.Sku;
            worksheet.Cell(row, 2).Value = p.Name;
            worksheet.Cell(row, 3).Value = p.Category?.Name ?? "N/A";
            worksheet.Cell(row, 4).Value = p.Price;
            worksheet.Cell(row, 5).Value = p.ProductStocks.Sum(ps => ps.Quantity);
            worksheet.Cell(row, 6).Value = p.Unit;
            worksheet.Cell(row, 7).Value = p.CriticalLevel;
        }

        worksheet.Columns().AdjustToContents();

        using var stream = new MemoryStream();
        workbook.SaveAs(stream);
        var content = stream.ToArray();

        return File(
            content, 
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", 
            $"Envanter_{DateTime.Now:yyyyMMdd}.xlsx");
    }

    [HttpGet("export-csv")]
    public async Task<IActionResult> ExportCsv()
    {
        var products = await _context.Products
            .Include(p => p.Category)
            .Include(p => p.ProductStocks)
            .ToListAsync();

        using var writer = new StringWriter();
        using var csv = new CsvWriter(writer, CultureInfo.InvariantCulture);
        
        var data = products.Select(p => new {
            p.Sku,
            p.Name,
            Category = p.Category?.Name,
            p.Price,
            Stock = p.ProductStocks.Sum(ps => ps.Quantity),
            p.Unit
        });

        csv.WriteRecords(data);
        var content = System.Text.Encoding.UTF8.GetBytes(writer.ToString());

        return File(content, "text/csv", $"Envanter_{DateTime.Now:yyyyMMdd}.csv");
    }

    [HttpGet("export-pdf")]
    public async Task<IActionResult> ExportPdf()
    {
        QuestPDF.Settings.License = LicenseType.Community;

        var products = await _context.Products
            .Include(p => p.Category)
            .Include(p => p.ProductStocks)
            .ToListAsync();

        var document = Document.Create(container =>
        {
            container.Page(page =>
            {
                page.Margin(1, Unit.Centimetre);
                page.Header().Text("Envanter Raporu").FontSize(24).Bold().FontColor(Colors.Blue.Medium);
                
                page.Content().Table(table =>
                {
                    table.ColumnsDefinition(columns =>
                    {
                        columns.RelativeColumn(2);
                        columns.RelativeColumn(4);
                        columns.RelativeColumn(2);
                        columns.RelativeColumn(2);
                    });

                    table.Header(header =>
                    {
                        header.Cell().Text("SKU").Bold();
                        header.Cell().Text("Ürün").Bold();
                        header.Cell().Text("Kategori").Bold();
                        header.Cell().Text("Stok").Bold();
                    });

                    foreach (var p in products)
                    {
                        table.Cell().Text(p.Sku);
                        table.Cell().Text(p.Name);
                        table.Cell().Text(p.Category?.Name ?? "-");
                        table.Cell().Text(p.ProductStocks.Sum(ps => ps.Quantity).ToString());
                    }
                });
            });
        });

        using var stream = new MemoryStream();
        document.GeneratePdf(stream);
        return File(stream.ToArray(), "application/pdf", $"Envanter_{DateTime.Now:yyyyMMdd}.pdf");
    }
}
