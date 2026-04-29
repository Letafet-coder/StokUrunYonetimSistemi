using Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace Backend.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<Category> Categories => Set<Category>();
    public DbSet<Product> Products => Set<Product>();
    public DbSet<StockMovement> StockMovements => Set<StockMovement>();
    public DbSet<InventoryCount> InventoryCounts => Set<InventoryCount>();
    public DbSet<InventoryCountItem> InventoryCountItems => Set<InventoryCountItem>();
    public DbSet<Warehouse> Warehouses => Set<Warehouse>();
    public DbSet<Location> Locations => Set<Location>();
    public DbSet<ProductStock> ProductStocks => Set<ProductStock>();
    public DbSet<LotSerial> LotSerials => Set<LotSerial>();
    public DbSet<Invoice> Invoices => Set<Invoice>();
    public DbSet<InvoiceItem> InvoiceItems => Set<InvoiceItem>();
    public DbSet<AuditLog> AuditLogs => Set<AuditLog>();
    public DbSet<SystemSetting> SystemSettings => Set<SystemSetting>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Category>().HasKey(c => c.Id);
        modelBuilder.Entity<Product>().HasKey(p => p.Id);
        modelBuilder.Entity<StockMovement>().HasKey(sm => sm.Id);
        modelBuilder.Entity<AuditLog>().HasKey(al => al.Id);
        modelBuilder.Entity<SystemSetting>().HasKey(ss => ss.Key);

        // Seed Default System Settings
        modelBuilder.Entity<SystemSetting>().HasData(
            new SystemSetting { Key = "SiteName", Value = "LagerMaster", Description = "Uygulama adı", Group = "General" },
            new SystemSetting { Key = "AllowRegistration", Value = "true", Description = "Yeni kayıt izni", Group = "Security" },
            new SystemSetting { Key = "MaintenanceMode", Value = "false", Description = "Bakım modu", Group = "System" }
        );

        // Seed Default Warehouse and Location
        modelBuilder.Entity<Warehouse>().HasData(
            new Warehouse { Id = 1, Name = "Ana Depo", Code = "WH-MAIN", Address = "Genel Merkez" }
        );

        modelBuilder.Entity<Location>().HasData(
            new Location { Id = 1, Name = "Ana Raf", WarehouseId = 1, ShelfCode = "A-1", Type = LocationType.Internal }
        );
    }
}
