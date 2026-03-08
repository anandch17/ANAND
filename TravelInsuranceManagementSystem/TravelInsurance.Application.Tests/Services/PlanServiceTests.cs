using Moq;
using TravelInsurance.Application.Interfaces.Repositories;
using TravelInsurance.Application.Services;
using TravelInsurance.Application.Dtos;
using TravelInsurance.Domain.Entities;
using Xunit;

namespace TravelInsurance.Application.Tests.Services;

public class PlanServiceTests
{
    private readonly Mock<IInsurancePlanRepository> _planRepo = new();
    private readonly PlanService _service;

    public PlanServiceTests()
    {
        _service = new PlanService(_planRepo.Object);
    }

    [Fact]
    public async Task CreatePlanAsync_ValidData_Succeeds()
    {
        var coverages = new List<CreateCoverageDto> { new CreateCoverageDto("Medical", 100000) };
        var premiumRule = new CreatePremiumRuleDto(100, 1.0m, 1.2m, 1.5m, 10);
        var dto = new CreatePlanDto("Gold", "International", 500000, true, coverages, premiumRule);

        await _service.CreatePlanAsync(dto);

        _planRepo.Verify(r => r.AddAsync(It.IsAny<InsurancePlan>()), Times.Once);
    }

    [Fact]
    public async Task GetAllPlans_ReturnsList()
    {
        var plan = new InsurancePlan 
        { 
            Id = 1,
            PolicyName = "P1", 
            PlanType = "T1",
            PremiumRule = new PremiumRule { BasePrice = 100 } 
        };
        _planRepo.Setup(r => r.GetAllAsync()).ReturnsAsync(new List<InsurancePlan> { plan });

        var result = await _service.GetAllPlansAsync();

        Assert.Single(result);
    }
}
