using Microsoft.EntityFrameworkCore;
using TravelInsurance.Domain.Entities;
using TravelInsurance.Infrastructure.Data;
using TravelInsurance.Infrastructure.Repositories;
using Xunit;

namespace TravelInsurance.Infrastructure.Tests.Repositories;

public class DestinationRiskRepositoryTests
{
    private ApplicationDbContext GetDb()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>().UseInMemoryDatabase(Guid.NewGuid().ToString()).Options;
        return new ApplicationDbContext(options);
    }

    [Fact]
    public async Task GetByDestinationAsync_Found_ReturnsRisk()
    {
        using var db = GetDb();
        db.DestinationRisks.Add(new DestinationRisk { Destination = "France", RiskMultiplier = 1.2m });
        await db.SaveChangesAsync();

        var repo = new DestinationRiskRepository(db);
        var res = await repo.GetByDestinationAsync("France");

        Assert.Equal(1.2m, res?.RiskMultiplier);
    }
}
