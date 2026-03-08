using Moq;
using TravelInsurance.Application.Dtos;
using TravelInsurance.Application.Interfaces.Repositories;
using TravelInsurance.Application.Services;
using TravelInsurance.Domain.Entities;
using Xunit;

namespace TravelInsurance.Application.Tests.Services;

public class PremiumCalculationServiceTests
{
    private readonly Mock<IInsurancePlanRepository> _planRepo = new();
    private readonly Mock<IDestinationRiskRepository> _riskRepo = new();
    private readonly PremiumCalculationService _service;

    public PremiumCalculationServiceTests()
    {
        _service = new PremiumCalculationService(_planRepo.Object, _riskRepo.Object);
    }

    [Fact]
    public async Task CalculatePremiumAsync_StandardData_ReturnsCalculatedPremium()
    {
        var plan = new InsurancePlan 
        { 
            PremiumRule = new PremiumRule { BasePrice = 1000, PerDayRate = 10, AgeBelow30Multiplier = 1.0m, AgeBetween30And50Multiplier = 1.0m, AgeAbove50Multiplier = 1.0m }
        };
        _planRepo.Setup(r => r.GetByIdAsync(It.IsAny<int>())).ReturnsAsync(plan);

        var result = await _service.CalculatePremiumAsync(new CalculatePremiumRequestDto(1, 25, 10, "USA"));

        Assert.Equal(1100m, result.FinalPremium);
    }
}
