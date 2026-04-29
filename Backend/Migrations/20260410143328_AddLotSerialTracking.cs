using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Backend.Migrations
{
    /// <inheritdoc />
    public partial class AddLotSerialTracking : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "LotSerialId",
                table: "StockMovements",
                type: "INTEGER",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "LotSerialId",
                table: "ProductStocks",
                type: "INTEGER",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "Tracking",
                table: "Products",
                type: "INTEGER",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateTable(
                name: "LotSerials",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Identifier = table.Column<string>(type: "TEXT", nullable: false),
                    ProductId = table.Column<int>(type: "INTEGER", nullable: false),
                    ExpirationDate = table.Column<DateTime>(type: "TEXT", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LotSerials", x => x.Id);
                    table.ForeignKey(
                        name: "FK_LotSerials_Products_ProductId",
                        column: x => x.ProductId,
                        principalTable: "Products",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 1,
                column: "PasswordHash",
                value: "$2a$11$8rgkUXbxc0Ko4dGiJZwK7OkCAdxRC8sDcIUcazmwn38QX0rO3r2iq");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 2,
                column: "PasswordHash",
                value: "$2a$11$kjv.xAJBMQHaMGOwJ1arZuS8vvTLX2ZwYl0wT0LTjQsEr8Pug3hnG");

            migrationBuilder.CreateIndex(
                name: "IX_StockMovements_LotSerialId",
                table: "StockMovements",
                column: "LotSerialId");

            migrationBuilder.CreateIndex(
                name: "IX_ProductStocks_LotSerialId",
                table: "ProductStocks",
                column: "LotSerialId");

            migrationBuilder.CreateIndex(
                name: "IX_LotSerials_ProductId",
                table: "LotSerials",
                column: "ProductId");

            migrationBuilder.AddForeignKey(
                name: "FK_ProductStocks_LotSerials_LotSerialId",
                table: "ProductStocks",
                column: "LotSerialId",
                principalTable: "LotSerials",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_StockMovements_LotSerials_LotSerialId",
                table: "StockMovements",
                column: "LotSerialId",
                principalTable: "LotSerials",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ProductStocks_LotSerials_LotSerialId",
                table: "ProductStocks");

            migrationBuilder.DropForeignKey(
                name: "FK_StockMovements_LotSerials_LotSerialId",
                table: "StockMovements");

            migrationBuilder.DropTable(
                name: "LotSerials");

            migrationBuilder.DropIndex(
                name: "IX_StockMovements_LotSerialId",
                table: "StockMovements");

            migrationBuilder.DropIndex(
                name: "IX_ProductStocks_LotSerialId",
                table: "ProductStocks");

            migrationBuilder.DropColumn(
                name: "LotSerialId",
                table: "StockMovements");

            migrationBuilder.DropColumn(
                name: "LotSerialId",
                table: "ProductStocks");

            migrationBuilder.DropColumn(
                name: "Tracking",
                table: "Products");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 1,
                column: "PasswordHash",
                value: "$2a$11$Nf7pIHDD.p2I9e4RNO0Wpej6UUY9u.eLJ438B6ppGI.Olwu80hfv2");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 2,
                column: "PasswordHash",
                value: "$2a$11$KllLvEVAK2Qu84.krkA/9OVHC5Nm/86PXyjPSAatyd2lXW9CY1Qrm");
        }
    }
}
