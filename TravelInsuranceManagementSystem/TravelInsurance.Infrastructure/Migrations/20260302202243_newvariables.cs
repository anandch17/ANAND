using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TravelInsurance.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class newvariables : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<decimal>(
                name: "AgeMultiplier",
                table: "Policies",
                type: "decimal(18,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<int>(
                name: "PurchaseAge",
                table: "Policies",
                type: "int",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AgeMultiplier",
                table: "Policies");

            migrationBuilder.DropColumn(
                name: "PurchaseAge",
                table: "Policies");
        }
    }
}
