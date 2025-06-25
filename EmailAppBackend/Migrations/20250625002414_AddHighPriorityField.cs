using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EmailAppBackend.Migrations
{
    /// <inheritdoc />
    public partial class AddHighPriorityField : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsHighPriority",
                table: "Emails",
                type: "INTEGER",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsHighPriority",
                table: "Emails");
        }
    }
}
