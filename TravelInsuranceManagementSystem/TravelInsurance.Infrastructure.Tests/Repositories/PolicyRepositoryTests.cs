using Microsoft.EntityFrameworkCore;
using TravelInsurance.Domain.Entities;
using TravelInsurance.Infrastructure.Data;
using TravelInsurance.Infrastructure.Repositories;
using Xunit;

namespace TravelInsurance.Infrastructure.Tests.Repositories;

public class PolicyRepositoryTests
{
    private ApplicationDbContext GetDb()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>().UseInMemoryDatabase(Guid.NewGuid().ToString()).Options;
        return new ApplicationDbContext(options);
    }

    [Fact]
    public async Task GetByCustomerIdAsync_ReturnsCustomerSpecificPolicies()
    {
        using var db = GetDb();
        // Ensure Plan exists for FK
        var plan = new InsurancePlan { Id = 101, PolicyName = "Global", PlanType = "Standard" };
        db.InsurancePlans.Add(plan);

        db.Policies.Add(new Policy { CustomerId = 1, InsurancePlanId = 101, DestinationCountry = "UK", Status = "Active" });
        db.Policies.Add(new Policy { CustomerId = 2, InsurancePlanId = 101, DestinationCountry = "US", Status = "Active" });
        await db.SaveChangesAsync();

        var repo = new PolicyRepository(db);
        var result = await repo.GetByCustomerIdAsync(1);

        Assert.Single(result);
    }
}
