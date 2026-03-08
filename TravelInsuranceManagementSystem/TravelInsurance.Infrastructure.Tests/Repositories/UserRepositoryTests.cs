using Microsoft.EntityFrameworkCore;
using TravelInsurance.Domain.Entities;
using TravelInsurance.Infrastructure.Data;
using TravelInsurance.Infrastructure.Repositories;
using Xunit;

namespace TravelInsurance.Infrastructure.Tests.Repositories;

public class UserRepositoryTests
{
    private ApplicationDbContext GetDb()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>().UseInMemoryDatabase(Guid.NewGuid().ToString()).Options;
        return new ApplicationDbContext(options);
    }

    [Fact]
    public async Task ExistsAsync_UserFound_ReturnsTrue()
    {
        using var db = GetDb();
        db.Users.Add(new User { Name = "T", Email = "t@t.com", PasswordHash = "hash", Role = "Customer" });
        await db.SaveChangesAsync();

        var repo = new UserRepository(db);
        var result = await repo.ExistsAsync("t@t.com");

        Assert.True(result);
    }

    [Fact]
    public async Task AddAsync_AddsToDatabase()
    {
        using var db = GetDb();
        var repo = new UserRepository(db);
        var user = new User { Name = "New", Email = "n@n.com", PasswordHash = "hash", Role = "Customer" };
        
        await repo.AddAsync(user);
        await repo.SaveChangesAsync();

        Assert.True(await db.Users.AnyAsync(u => u.Email == "n@n.com"));
    }
}
