using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TravelInsurance.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddPolicySnapshotData : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<decimal>(
                name: "AgeAbove50Multiplier",
                table: "Policies",
                type: "decimal(18,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "AgeBelow30Multiplier",
                table: "Policies",
                type: "decimal(18,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "AgeBetween30And50Multiplier",
                table: "Policies",
                type: "decimal(18,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "BasePrice",
                table: "Policies",
                type: "decimal(18,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<string>(
                name: "CoveragesJson",
                table: "Policies",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<decimal>(
                name: "MaxCoverageAmount",
                table: "Policies",
                type: "decimal(18,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "PerDayRate",
                table: "Policies",
                type: "decimal(18,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<string>(
                name: "PlanName",
                table: "Policies",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "PlanType",
                table: "Policies",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.Sql(@"
                UPDATE p
                SET 
                    p.PlanName = ip.PolicyName,
                    p.PlanType = ip.PlanType,
                    p.MaxCoverageAmount = ip.MaxCoverageAmount,
                    p.BasePrice = ISNULL(pr.BasePrice, 0),
                    p.PerDayRate = ISNULL(pr.PerDayRate, 0),
                    p.AgeBelow30Multiplier = ISNULL(pr.AgeBelow30Multiplier, 1),
                    p.AgeBetween30And50Multiplier = ISNULL(pr.AgeBetween30And50Multiplier, 1),
                    p.AgeAbove50Multiplier = ISNULL(pr.AgeAbove50Multiplier, 1),
                    p.CoveragesJson = ISNULL((
                        SELECT c.CoverageType, c.CoverageAmount
                        FROM Coverages c
                        WHERE c.InsurancePlanId = p.InsurancePlanId
                        FOR JSON PATH
                    ), '[]')
                FROM Policies p
                INNER JOIN InsurancePlans ip ON p.InsurancePlanId = ip.Id
                LEFT JOIN PremiumRule pr ON ip.Id = pr.InsurancePlanId
                WHERE p.PlanName = '';
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AgeAbove50Multiplier",
                table: "Policies");

            migrationBuilder.DropColumn(
                name: "AgeBelow30Multiplier",
                table: "Policies");

            migrationBuilder.DropColumn(
                name: "AgeBetween30And50Multiplier",
                table: "Policies");

            migrationBuilder.DropColumn(
                name: "BasePrice",
                table: "Policies");

            migrationBuilder.DropColumn(
                name: "CoveragesJson",
                table: "Policies");

            migrationBuilder.DropColumn(
                name: "MaxCoverageAmount",
                table: "Policies");

            migrationBuilder.DropColumn(
                name: "PerDayRate",
                table: "Policies");

            migrationBuilder.DropColumn(
                name: "PlanName",
                table: "Policies");

            migrationBuilder.DropColumn(
                name: "PlanType",
                table: "Policies");
        }
    }
}
