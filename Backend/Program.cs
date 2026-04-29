using Backend.Data;
using Backend.Models;
using Backend.Repositories.Implementations;
using Backend.Repositories.Interfaces;
using Backend.Services;
using Backend.Middleware;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
        options.JsonSerializerOptions.Converters.Add(new System.Text.Json.Serialization.JsonStringEnumConverter());
    });

// SQLite Configuration
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection")));

// Repository Pattern & Unit of Work
builder.Services.AddScoped<IUnitOfWork, UnitOfWork>();
builder.Services.AddScoped<IAuditLogService, AuditLogService>();

// CORS configuration
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngular", policy =>
    {
        policy.WithOrigins("http://localhost:4400")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

// JWT Authentication
var jwtSettings = builder.Configuration.GetSection("Jwt");
var key = System.Text.Encoding.ASCII.GetBytes(jwtSettings["Key"]!);

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = Microsoft.AspNetCore.Authentication.JwtBearer.JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = Microsoft.AspNetCore.Authentication.JwtBearer.JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new Microsoft.IdentityModel.Tokens.TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtSettings["Issuer"],
        ValidAudience = jwtSettings["Audience"],
        IssuerSigningKey = new Microsoft.IdentityModel.Tokens.SymmetricSecurityKey(key)
    };
});

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new Microsoft.OpenApi.Models.OpenApiInfo { Title = "Stok Yonetim API", Version = "v1" });
    c.AddSecurityDefinition("Bearer", new Microsoft.OpenApi.Models.OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme. Example: \"Authorization: Bearer {token}\"",
        Name = "Authorization",
        In = Microsoft.OpenApi.Models.ParameterLocation.Header,
        Type = Microsoft.OpenApi.Models.SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });
    c.AddSecurityRequirement(new Microsoft.OpenApi.Models.OpenApiSecurityRequirement
    {
        {
            new Microsoft.OpenApi.Models.OpenApiSecurityScheme
            {
                Reference = new Microsoft.OpenApi.Models.OpenApiReference
                {
                    Type = Microsoft.OpenApi.Models.ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            new string[] {}
        }
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseCors("AllowAngular");

app.UseAuthentication();
app.UseMiddleware<MaintenanceMiddleware>();
app.UseAuthorization();

app.MapControllers();

// Ensure Database is created
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.EnsureCreated();

    // Runtime Seeding for Passwords (ensure unique and correct hashes)
    if (!db.Users.Any())
    {
        db.Users.AddRange(new List<User>
        {
            new User { 
                Username = "superadmin", 
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("admin123"), 
                FullName = "Süper Yönetici", 
                Role = UserRole.SuperAdmin,
                IsApproved = true
            },
            new User { 
                Username = "admin", 
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("manager123"), 
                FullName = "Sistem Yöneticisi", 
                Role = UserRole.Admin,
                IsApproved = true
            },
            new User { 
                Username = "personel", 
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("staff123"), 
                FullName = "Depo Görevlisi", 
                Role = UserRole.User,
                IsApproved = true
            }
        });
        db.SaveChanges();
    }

    if (!db.Categories.Any())
    {
        db.Categories.AddRange(new List<Category>
        {
            new Category { Name = "Elektronik", Description = "Bilgisayar, telefon ve parçaları" },
            new Category { Name = "Ofis Malzemeleri", Description = "Kırtasiye ve sarf malzemeleri" },
            new Category { Name = "Hırdavat", Description = "El aletleri ve yedek parçalar" }
        });
        db.SaveChanges();
    }

    if (!db.Products.Any())
    {
        var category = db.Categories.First();
        var products = new List<Product>
        {
            new Product { Name = "Laptop Pro X", Sku = "LPT001", Price = 1200, CategoryId = category.Id, Unit = "Adet", CriticalLevel = 5 },
            new Product { Name = "Kablosuz Mouse", Sku = "MS002", Price = 25, CategoryId = category.Id, Unit = "Adet", CriticalLevel = 10 },
            new Product { Name = "HDMI Kablo", Sku = "CBL003", Price = 15, CategoryId = category.Id, Unit = "Adet", CriticalLevel = 20 }
        };
        db.Products.AddRange(products);
        db.SaveChanges();

        // Seed some initial stocks
        db.ProductStocks.AddRange(new List<ProductStock>
        {
            new ProductStock { ProductId = products[0].Id, LocationId = 1, Quantity = 10 },
            new ProductStock { ProductId = products[1].Id, LocationId = 1, Quantity = 50 },
            new ProductStock { ProductId = products[2].Id, LocationId = 1, Quantity = 100 }
        });
        db.SaveChanges();
    }
}

app.Run();
