using Microsoft.EntityFrameworkCore;
using TravelInsurance.Domain.Entities;
using TravelInsurance.Infrastructure.Data;
using TravelInsurance.Infrastructure.Repositories;
using Xunit;

namespace TravelInsurance.Infrastructure.Tests.Repositories;

public class ClaimRepositoryTests
{
    private ApplicationDbContext GetDb()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>().UseInMemoryDatabase(Guid.NewGuid().ToString()).Options;
        return new ApplicationDbContext(options);
    }

    [Fact]
    public async Task GetClaimsForAssignmentAsync_ReturnsUnassigned()
    {
        using var db = GetDb();
        var repo = new ClaimRepository(db);
        var result = await repo.GetClaimsForAssignmentAsync();

        Assert.Empty(result);
    }
}
