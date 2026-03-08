using Microsoft.AspNetCore.Mvc;
using Moq;
using TravelInsurance.Application.Dtos;
using TravelInsurance.Application.Interfaces.Services;
using TravelInsurance.WebApi.Controllers;
using Xunit;

namespace TravelInsurance.WebApi.Tests.Controllers;

public class PlansControllerTests
{
    private readonly Mock<IPlanService> _planMock = new();
    private readonly PlansController _controller;

    public PlansControllerTests()
    {
        _controller = new PlansController(_planMock.Object);
    }

    [Fact]
    public async Task GetAll_ReturnsOk()
    {
        _planMock.Setup(s => s.GetAllPlansAsync()).ReturnsAsync(new List<PlanResponseDto>());
        var res = await _controller.GetAll();
        Assert.IsType<OkObjectResult>(res);
    }
}
