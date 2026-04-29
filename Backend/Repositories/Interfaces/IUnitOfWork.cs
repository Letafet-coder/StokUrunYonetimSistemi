using Backend.Models;

namespace Backend.Repositories.Interfaces;

public interface IUnitOfWork : IDisposable
{
    IGenericRepository<Category> Categories { get; }
    IGenericRepository<Product> Products { get; }
    IGenericRepository<StockMovement> StockMovements { get; }
    IGenericRepository<User> Users { get; }
    IGenericRepository<InventoryCount> InventoryCounts { get; }
    IGenericRepository<InventoryCountItem> InventoryCountItems { get; }
    IGenericRepository<Warehouse> Warehouses { get; }
    IGenericRepository<Location> Locations { get; }
    IGenericRepository<ProductStock> ProductStocks { get; }
    IGenericRepository<Invoice> Invoices { get; }
    IGenericRepository<InvoiceItem> InvoiceItems { get; }
    IGenericRepository<LotSerial> LotSerials { get; }
    Task<int> CompleteAsync();
}
