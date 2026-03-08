using Microsoft.AspNetCore.Mvc;
using Moq;
using TravelInsurance.Application.Dtos;
using TravelInsurance.Application.Interfaces.Services;
using TravelInsurance.WebApi.Controllers;
using Xunit;

namespace TravelInsurance.WebApi.Tests.Controllers;

public class PremiumCalculationControllerTests
{
    private readonly Mock<IPremiumCalculationService> _calcMock = new();
    private readonly PremiumCalculationController _controller;

    public PremiumCalculationControllerTests()
    {
        _controller = new PremiumCalculationController(_calcMock.Object);
    }

    [Fact]
    public async Task Calculate_ValidData_ReturnsOk()
    {
        _calcMock.Setup(s => s.CalculatePremiumAsync(It.IsAny<CalculatePremiumRequestDto>()))
            .ReturnsAsync(new CalculatePremiumResponseDto(100, 1, new List<CoverageDto>()));

        var res = await _controller.Calculate(new CalculatePremiumRequestDto(1, 25, 10, "USA"));
        Assert.IsType<OkObjectResult>(res);
    }
}
