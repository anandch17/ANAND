using TravelInsurance.Domain.Entities;
using Xunit;

namespace TravelInsurance.Domain.Tests.Entities;

public class InsurancePlanEntityTests
{
    [Fact]
    public void InsurancePlan_Properties_WorkCorrectly()
    {
        var plan = new InsurancePlan 
        { 
            PolicyName = "Gold Plan", 
            PlanType = "International",
            MaxCoverageAmount = 500000m
        };
        
        Assert.Equal("Gold Plan", plan.PolicyName);
        Assert.Equal("International", plan.PlanType);
        Assert.Equal(500000m, plan.MaxCoverageAmount);
    }

    [Fact]
    public void InsurancePlan_Collections_AreInitialized()
    {
        var plan = new InsurancePlan();
        Assert.NotNull(plan.Coverages);
        Assert.NotNull(plan.Policies);
    }
}
