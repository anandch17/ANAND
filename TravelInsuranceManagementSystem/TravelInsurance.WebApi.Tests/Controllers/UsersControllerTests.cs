using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Moq;
using TravelInsurance.Application.Dtos;
using TravelInsurance.Application.Interfaces.Services;
using TravelInsurance.WebApi.Controllers;
using Xunit;

namespace TravelInsurance.WebApi.Tests.Controllers;

public class UsersControllerTests
{
    private readonly Mock<IUserService> _userMock = new();
    private readonly UsersController _controller;

    public UsersControllerTests()
    {
        _controller = new UsersController(_userMock.Object);
        _controller.ControllerContext = new ControllerContext { HttpContext = new DefaultHttpContext() };
        _controller.HttpContext.Items["userId"] = 1;
    }

    [Fact]
    public async Task GetProfile_Authorized_ReturnsOk()
    {
        _userMock.Setup(s => s.GetProfileAsync(1)).ReturnsAsync(new AuthDto.UserProfileDto(1, "N", "E", "R", DateTime.Today));
        var res = await _controller.GetProfile();
        Assert.IsType<OkObjectResult>(res);
    }
}
