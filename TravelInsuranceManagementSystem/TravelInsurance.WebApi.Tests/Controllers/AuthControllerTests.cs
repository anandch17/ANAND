using Microsoft.AspNetCore.Mvc;
using Moq;
using TravelInsurance.Application.Dtos;
using TravelInsurance.Application.Interfaces.Services;
using TravelInsurance.WebApi.Controllers;
using Xunit;

namespace TravelInsurance.WebApi.Tests.Controllers;

public class AuthControllerTests
{
    private readonly Mock<IAuthService> _authMock = new();
    private readonly Mock<IHttpClientFactory> _httpMock = new();
    private readonly AuthController _controller;

    public AuthControllerTests()
    {
        _controller = new AuthController(_authMock.Object, _httpMock.Object, new Microsoft.Extensions.Configuration.ConfigurationBuilder().Build());
    }

    [Fact]
    public async Task Login_ValidData_ReturnsOk()
    {
        _authMock.Setup(s => s.LoginAsync(It.IsAny<AuthDto.LoginDto>())).ReturnsAsync("token");
        var res = await _controller.Login(new AuthDto.LoginDto("e@a.com", "p"));
        Assert.IsType<OkObjectResult>(res);
    }
}
