using Microsoft.EntityFrameworkCore;
using TravelInsurance.Domain.Entities;
using TravelInsurance.Infrastructure.Data;
using TravelInsurance.Infrastructure.Repositories;
using Xunit;

namespace TravelInsurance.Infrastructure.Tests.Repositories;

public class InsuranceRepositoryTests
{
    private ApplicationDbContext GetDb()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>().UseInMemoryDatabase(Guid.NewGuid().ToString()).Options;
        return new ApplicationDbContext(options);
    }

    [Fact]
    public async Task GetAllAsync_ReturnsAllPlans()
    {
        using var db = GetDb();
        db.InsurancePlans.Add(new InsurancePlan { PolicyName = "A", PlanType = "TypeA" });
        db.InsurancePlans.Add(new InsurancePlan { PolicyName = "B", PlanType = "TypeB" });
        await db.SaveChangesAsync();

        var repo = new InsurancePlanRepository(db);
        var result = await repo.GetAllAsync();

        Assert.Equal(2, result.Count());
    }
}
