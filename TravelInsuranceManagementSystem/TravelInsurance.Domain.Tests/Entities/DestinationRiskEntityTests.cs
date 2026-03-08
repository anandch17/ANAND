using TravelInsurance.Domain.Entities;
using Xunit;

namespace TravelInsurance.Domain.Tests.Entities;

public class DestinationRiskEntityTests
{
    [Fact]
    public void DestinationRisk_RiskMultiplierAssignment_WorksCorrectly()
    {
        var risk = new DestinationRisk { Destination = "France", RiskMultiplier = 1.5m };
        Assert.Equal(1.5m, risk.RiskMultiplier);
        Assert.Equal("France", risk.Destination);
    }
}
