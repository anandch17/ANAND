using Moq;
using TravelInsurance.Application.Interfaces.Services;
using TravelInsurance.WebApi.Controllers;
using TravelInsurance.Application.Dtos;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using Microsoft.AspNetCore.Http;
using Xunit;

namespace TravelInsurance.WebApi.Tests.Controllers;

public class ClaimsControllerTests
{
    private readonly Mock<IClaimService> _claimService = new();
    private readonly ClaimsController _controller;

    public ClaimsControllerTests()
    {
        _controller = new ClaimsController(_claimService.Object);
        SetupUser("1");
    }

    private void SetupUser(string id)
    {
        var claims = new Claim[] { new Claim(ClaimTypes.NameIdentifier, id) };
        var identity = new ClaimsIdentity(claims, "TestAuth");
        var user = new ClaimsPrincipal(identity);
        _controller.ControllerContext = new ControllerContext
        {
            HttpContext = new DefaultHttpContext { User = user }
        };
    }

    [Fact]
    public async Task RaiseClaim_ValidData_ReturnsOk()
    {
        var dto = new RaiseClaimDto(10, "Medical", 5000, new List<string> { "doc.png" });
        var response = new ClaimResponseDto(1, "Medical", 5000, "Pending");
        _claimService.Setup(s => s.RaiseClaimAsync(1, dto)).ReturnsAsync(response);

        var result = await _controller.RaiseClaim(dto);

        Assert.IsType<OkObjectResult>(result);
    }
}
