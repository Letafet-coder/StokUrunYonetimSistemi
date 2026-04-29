using Backend.Data;
using Backend.Models;
using Backend.Repositories.Interfaces;

namespace Backend.Repositories.Implementations;

public class UnitOfWork : IUnitOfWork
{
    private readonly AppDbContext _context;
    private IGenericRepository<Category>? _categories;
    private IGenericRepository<Product>? _products;
    private IGenericRepository<StockMovement>? _stockMovements;
    private IGenericRepository<User>? _users;
    private IGenericRepository<InventoryCount>? _inventoryCounts;
    private IGenericRepository<InventoryCountItem>? _inventoryCountItems;
    private IGenericRepository<Warehouse>? _warehouses;
    private IGenericRepository<Location>? _locations;
    private IGenericRepository<ProductStock>? _productStocks;
    private IGenericRepository<Invoice>? _invoices;
    private IGenericRepository<InvoiceItem>? _invoiceItems;
    private IGenericRepository<LotSerial>? _lotSerials;

    public UnitOfWork(AppDbContext context)
    {
        _context = context;
    }

    public IGenericRepository<Category> Categories => _categories ??= new GenericRepository<Category>(_context);
    public IGenericRepository<Product> Products => _products ??= new GenericRepository<Product>(_context);
    public IGenericRepository<StockMovement> StockMovements => _stockMovements ??= new GenericRepository<StockMovement>(_context);
    public IGenericRepository<User> Users => _users ??= new GenericRepository<User>(_context);
    public IGenericRepository<InventoryCount> InventoryCounts => _inventoryCounts ??= new GenericRepository<InventoryCount>(_context);
    public IGenericRepository<InventoryCountItem> InventoryCountItems => _inventoryCountItems ??= new GenericRepository<InventoryCountItem>(_context);
    public IGenericRepository<Warehouse> Warehouses => _warehouses ??= new GenericRepository<Warehouse>(_context);
    public IGenericRepository<Location> Locations => _locations ??= new GenericRepository<Location>(_context);
    public IGenericRepository<ProductStock> ProductStocks => _productStocks ??= new GenericRepository<ProductStock>(_context);
    public IGenericRepository<Invoice> Invoices => _invoices ??= new GenericRepository<Invoice>(_context);
    public IGenericRepository<InvoiceItem> InvoiceItems => _invoiceItems ??= new GenericRepository<InvoiceItem>(_context);
    public IGenericRepository<LotSerial> LotSerials => _lotSerials ??= new GenericRepository<LotSerial>(_context);

    public async Task<int> CompleteAsync()
    {
        return await _context.SaveChangesAsync();
    }

    public void Dispose()
    {
        _context.Dispose();
    }
}
