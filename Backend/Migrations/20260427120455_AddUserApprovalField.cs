using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Backend.Migrations
{
    /// <inheritdoc />
    public partial class AddUserApprovalField : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsApproved",
                table: "Users",
                type: "INTEGER",
                nullable: false,
                defaultValue: false);

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "IsApproved", "PasswordHash" },
                values: new object[] { true, "$2a$11$MRejPZj0k3dzSVC6mHg48OrhaG2iKfXyqdtNux8fc6aLKbI0cZ6fG" });

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 2,
                columns: new[] { "IsApproved", "PasswordHash" },
                values: new object[] { true, "$2a$11$bcCWQSVL10PI45oKfOhFWOcFLDkWNK0oe.xGHUAve9RiKBKMPNM/6" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsApproved",
                table: "Users");

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
        }
    }
}
