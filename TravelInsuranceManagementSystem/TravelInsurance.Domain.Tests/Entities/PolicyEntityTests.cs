using TravelInsurance.Domain.Entities;
using Xunit;

namespace TravelInsurance.Domain.Tests.Entities;

public class PolicyEntityTests
{
    [Fact]
    public void Policy_StatusAssignment_WorksCorrectly()
    {
        var policy = new Policy { Status = "Pending" };
        Assert.Equal("Pending", policy.Status);
    }
}
