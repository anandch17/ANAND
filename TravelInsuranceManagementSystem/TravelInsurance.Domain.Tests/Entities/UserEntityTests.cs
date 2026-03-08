using TravelInsurance.Domain.Entities;
using Xunit;

namespace TravelInsurance.Domain.Tests.Entities;

public class UserEntityTests
{
    [Fact]
    public void User_DefaultIsActive_IsTrue()
    {
        var user = new User();
        Assert.True(user.IsActive);
    }

    [Fact]
    public void User_RoleAssignment_WorksCorrectly()
    {
        var user = new User { Role = "Agent" };
        Assert.Equal("Agent", user.Role);
    }
}
