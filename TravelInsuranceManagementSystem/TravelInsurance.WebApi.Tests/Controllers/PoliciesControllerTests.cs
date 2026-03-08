using Moq;
using TravelInsurance.Application.Interfaces.Services;
using TravelInsurance.WebApi.Controllers;
using TravelInsurance.Application.Dtos;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using Microsoft.AspNetCore.Http;
using Xunit;

namespace TravelInsurance.WebApi.Tests.Controllers;

public class PoliciesControllerTests
{
    private readonly Mock<IPolicyService> _policyService = new();
    private readonly PoliciesController _controller;

    public PoliciesControllerTests()
    {
        _controller = new PoliciesController(_policyService.Object);
        SetupUser("1");
    }

    private void SetupUser(string id)
    {
        var claims = new List<Claim> { new Claim(ClaimTypes.NameIdentifier, id) };
        var identity = new ClaimsIdentity(claims, "TestAuth");
        var user = new ClaimsPrincipal(identity);
        _controller.ControllerContext = new ControllerContext
        {
            HttpContext = new DefaultHttpContext { User = user }
        };
    }

    [Fact]
    public async Task ApprovePolicy_ValidPolicy_ReturnsOk()
    {
        _policyService.Setup(s => s.ApprovePolicyAsync(1, 10)).Returns(Task.CompletedTask);

        var result = await _controller.ApprovePolicy(10);

        Assert.IsType<OkObjectResult>(result);
    }

    [Fact]
    public async Task GetMyPolicies_Authorized_ReturnsOk()
    {
        _policyService.Setup(s => s.GetMyPoliciesAsync(1)).ReturnsAsync(new List<PolicyResponseDto>());

        var result = await _controller.GetMyPolicies();

        Assert.IsType<OkObjectResult>(result);
    }
}
