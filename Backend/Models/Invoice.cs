using System.ComponentModel.DataAnnotations;

namespace Backend.Models;

public enum InvoiceType
{
    Purchase, // Alış
    Sale      // Satış
}

public enum InvoiceStatus
{
    Draft,         // Taslak
    NotInvoiced,   // Faturalanmadı
    Invoiced,      // Faturalandı
    Paid,          // Ödendi
    Cancelled      // İptal
}

public class Invoice
{
    public int Id { get; set; }
    
    [Required]
    public string InvoiceNumber { get; set; } = string.Empty;
    
    [Required]
    public DateTime Date { get; set; } = DateTime.Now;
    
    [Required]
    public string CustomerSupplierName { get; set; } = string.Empty; // Cari Ünvanı
    
    public InvoiceType Type { get; set; } = InvoiceType.Purchase;
    
    public InvoiceStatus Status { get; set; } = InvoiceStatus.Draft;
    
    public decimal TotalAmount { get; set; }
    
    public string? Notes { get; set; }
    
    public string? DocumentUrl { get; set; }
    
    public List<InvoiceItem> Items { get; set; } = new();
}
