using Microsoft.AspNetCore.Mvc;
using Moq;
using TravelInsurance.Application.Interfaces.Repositories;
using TravelInsurance.WebApi.Controllers;
using Xunit;

namespace TravelInsurance.WebApi.Tests.Controllers;

public class DestinationRiskControllerTests
{
    private readonly Mock<IDestinationRiskRepository> _riskRepo = new();
    private readonly DestinationRiskController _controller;

    public DestinationRiskControllerTests()
    {
        _controller = new DestinationRiskController(_riskRepo.Object);
    }

    [Fact]
    public async Task GetAll_ReturnsOk()
    {
        _riskRepo.Setup(r => r.GetAllAsync()).ReturnsAsync(new List<TravelInsurance.Domain.Entities.DestinationRisk>());
        var res = await _controller.GetAll();
        Assert.IsType<OkObjectResult>(res);
    }
}
