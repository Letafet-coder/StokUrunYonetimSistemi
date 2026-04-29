using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace Backend.Migrations
{
    /// <inheritdoc />
    public partial class FixProductStockWarehouseId : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_InventoryCounts_Locations_LocationId",
                table: "InventoryCounts");

            migrationBuilder.DropForeignKey(
                name: "FK_ProductStocks_Locations_LocationId",
                table: "ProductStocks");

            migrationBuilder.DeleteData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 1);

            migrationBuilder.DeleteData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 2);

            migrationBuilder.AddColumn<int>(
                name: "WarehouseId",
                table: "StockMovements",
                type: "INTEGER",
                nullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "LocationId",
                table: "ProductStocks",
                type: "INTEGER",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "INTEGER");

            migrationBuilder.AddColumn<int>(
                name: "WarehouseId",
                table: "ProductStocks",
                type: "INTEGER",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "Aisle",
                table: "Locations",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Level",
                table: "Locations",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Position",
                table: "Locations",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Rack",
                table: "Locations",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "LocationId",
                table: "InventoryCounts",
                type: "INTEGER",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "INTEGER");

            migrationBuilder.AddColumn<int>(
                name: "WarehouseId",
                table: "InventoryCounts",
                type: "INTEGER",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "AuditLogs",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    UserId = table.Column<int>(type: "INTEGER", nullable: false),
                    Action = table.Column<string>(type: "TEXT", nullable: false),
                    EntityName = table.Column<string>(type: "TEXT", nullable: false),
                    EntityId = table.Column<string>(type: "TEXT", nullable: true),
                    OldValues = table.Column<string>(type: "TEXT", nullable: true),
                    NewValues = table.Column<string>(type: "TEXT", nullable: true),
                    Timestamp = table.Column<DateTime>(type: "TEXT", nullable: false),
                    IPAddress = table.Column<string>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AuditLogs", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AuditLogs_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "SystemSettings",
                columns: table => new
                {
                    Key = table.Column<string>(type: "TEXT", nullable: false),
                    Value = table.Column<string>(type: "TEXT", nullable: false),
                    Description = table.Column<string>(type: "TEXT", nullable: false),
                    Group = table.Column<string>(type: "TEXT", nullable: false),
                    LastUpdated = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SystemSettings", x => x.Key);
                });

            migrationBuilder.UpdateData(
                table: "Locations",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "Aisle", "Level", "Position", "Rack" },
                values: new object[] { null, null, null, null });

            migrationBuilder.InsertData(
                table: "SystemSettings",
                columns: new[] { "Key", "Description", "Group", "LastUpdated", "Value" },
                values: new object[,]
                {
                    { "AllowRegistration", "Yeni kayıt izni", "Security", new DateTime(2026, 4, 29, 18, 28, 43, 321, DateTimeKind.Utc).AddTicks(5893), "true" },
                    { "MaintenanceMode", "Bakım modu", "System", new DateTime(2026, 4, 29, 18, 28, 43, 321, DateTimeKind.Utc).AddTicks(5894), "false" },
                    { "SiteName", "Uygulama adı", "General", new DateTime(2026, 4, 29, 18, 28, 43, 321, DateTimeKind.Utc).AddTicks(5888), "LagerMaster" }
                });

            migrationBuilder.CreateIndex(
                name: "IX_StockMovements_WarehouseId",
                table: "StockMovements",
                column: "WarehouseId");

            migrationBuilder.CreateIndex(
                name: "IX_ProductStocks_WarehouseId",
                table: "ProductStocks",
                column: "WarehouseId");

            migrationBuilder.CreateIndex(
                name: "IX_InventoryCounts_WarehouseId",
                table: "InventoryCounts",
                column: "WarehouseId");

            migrationBuilder.CreateIndex(
                name: "IX_AuditLogs_UserId",
                table: "AuditLogs",
                column: "UserId");

            migrationBuilder.AddForeignKey(
                name: "FK_InventoryCounts_Locations_LocationId",
                table: "InventoryCounts",
                column: "LocationId",
                principalTable: "Locations",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_InventoryCounts_Warehouses_WarehouseId",
                table: "InventoryCounts",
                column: "WarehouseId",
                principalTable: "Warehouses",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_ProductStocks_Locations_LocationId",
                table: "ProductStocks",
                column: "LocationId",
                principalTable: "Locations",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_ProductStocks_Warehouses_WarehouseId",
                table: "ProductStocks",
                column: "WarehouseId",
                principalTable: "Warehouses",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_StockMovements_Warehouses_WarehouseId",
                table: "StockMovements",
                column: "WarehouseId",
                principalTable: "Warehouses",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_InventoryCounts_Locations_LocationId",
                table: "InventoryCounts");

            migrationBuilder.DropForeignKey(
                name: "FK_InventoryCounts_Warehouses_WarehouseId",
                table: "InventoryCounts");

            migrationBuilder.DropForeignKey(
                name: "FK_ProductStocks_Locations_LocationId",
                table: "ProductStocks");

            migrationBuilder.DropForeignKey(
                name: "FK_ProductStocks_Warehouses_WarehouseId",
                table: "ProductStocks");

            migrationBuilder.DropForeignKey(
                name: "FK_StockMovements_Warehouses_WarehouseId",
                table: "StockMovements");

            migrationBuilder.DropTable(
                name: "AuditLogs");

            migrationBuilder.DropTable(
                name: "SystemSettings");

            migrationBuilder.DropIndex(
                name: "IX_StockMovements_WarehouseId",
                table: "StockMovements");

            migrationBuilder.DropIndex(
                name: "IX_ProductStocks_WarehouseId",
                table: "ProductStocks");

            migrationBuilder.DropIndex(
                name: "IX_InventoryCounts_WarehouseId",
                table: "InventoryCounts");

            migrationBuilder.DropColumn(
                name: "WarehouseId",
                table: "StockMovements");

            migrationBuilder.DropColumn(
                name: "WarehouseId",
                table: "ProductStocks");

            migrationBuilder.DropColumn(
                name: "Aisle",
                table: "Locations");

            migrationBuilder.DropColumn(
                name: "Level",
                table: "Locations");

            migrationBuilder.DropColumn(
                name: "Position",
                table: "Locations");

            migrationBuilder.DropColumn(
                name: "Rack",
                table: "Locations");

            migrationBuilder.DropColumn(
                name: "WarehouseId",
                table: "InventoryCounts");

            migrationBuilder.AlterColumn<int>(
                name: "LocationId",
                table: "ProductStocks",
                type: "INTEGER",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "INTEGER",
                oldNullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "LocationId",
                table: "InventoryCounts",
                type: "INTEGER",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "INTEGER",
                oldNullable: true);

            migrationBuilder.InsertData(
                table: "Users",
                columns: new[] { "Id", "AvatarUrl", "Email", "FullName", "IsApproved", "IsDarkMode", "Language", "PasswordHash", "Role", "ThemeColor", "Username" },
                values: new object[,]
                {
                    { 1, null, "admin@stok.com", "Sistem Yöneticisi", true, true, "tr", "$2a$11$GXfIachNhzAxsSrKuxLBSujB9IOjjvUMRcjW4cID/kM0kkFrdKMve", 0, "#3B82F6", "admin" },
                    { 2, null, "user@stok.com", "Depo Görevlisi", true, false, "tr", "$2a$11$EGatJnkcMXFbYi32x.dxYuFLrfO4yN.okkqICf9VE56IMAJs26Udi", 1, "#10B981", "personel" }
                });

            migrationBuilder.AddForeignKey(
                name: "FK_InventoryCounts_Locations_LocationId",
                table: "InventoryCounts",
                column: "LocationId",
                principalTable: "Locations",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_ProductStocks_Locations_LocationId",
                table: "ProductStocks",
                column: "LocationId",
                principalTable: "Locations",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
