using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Backend.Migrations
{
    /// <inheritdoc />
    public partial class AddAvatarUrl : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "AvatarUrl",
                table: "Users",
                type: "TEXT",
                nullable: true);

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "AvatarUrl", "PasswordHash" },
                values: new object[] { null, "$2a$11$zfJXX/zZASxko1hf0cQVo.VxswGpoAXbSJTJrWVB6khhgRGIK009K" });

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 2,
                columns: new[] { "AvatarUrl", "PasswordHash" },
                values: new object[] { null, "$2a$11$8VJoTO26vaQ7sbhBu1sQq.XafAqcBU2sPwXIe77BiwTlFDRnI2vlC" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AvatarUrl",
                table: "Users");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 1,
                column: "PasswordHash",
                value: "$2a$11$MRejPZj0k3dzSVC6mHg48OrhaG2iKfXyqdtNux8fc6aLKbI0cZ6fG");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 2,
                column: "PasswordHash",
                value: "$2a$11$bcCWQSVL10PI45oKfOhFWOcFLDkWNK0oe.xGHUAve9RiKBKMPNM/6");
        }
    }
}
