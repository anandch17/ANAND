using Moq;
using TravelInsurance.Application.Dtos;
using TravelInsurance.Application.Interfaces.Repositories;
using TravelInsurance.Application.Interfaces.Services;
using TravelInsurance.Application.Services;
using TravelInsurance.Domain.Entities;
using Xunit;

namespace TravelInsurance.Application.Tests.Services;

public class ClaimServiceTests
{
    private readonly Mock<IClaimRepository> _claimRepo = new();
    private readonly Mock<IUserRepository> _userRepo = new();
    private readonly Mock<IPolicyRepository> _policyRepo = new();
    private readonly Mock<IEmailService> _email = new();
    private readonly ClaimService _service;

    public ClaimServiceTests()
    {
        _service = new ClaimService(_claimRepo.Object, _userRepo.Object, _policyRepo.Object, _email.Object);
    }

    [Fact]
    public async Task RaiseClaimAsync_ValidData_SavesClaimAndReturnsDto()
    {
        var policy = new Policy { Id = 1, CustomerId = 1, Status = "Active" };
        _policyRepo.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(policy);

        var result = await _service.RaiseClaimAsync(1, new RaiseClaimDto(1, "Medical", 5000, new List<string>()));

        Assert.Equal("Submitted", result.Status);
        _claimRepo.Verify(r => r.AddAsync(It.IsAny<Claim>()), Times.Once);
    }

    [Fact]
    public async Task AssignOfficerAsync_ValidAssignment_UpdatesStatus()
    {
        var claim = new Claim { Id = 1, Status = "Submitted" };
        var officer = new User { Id = 5, Role = "ClaimOfficer", Email = "o@t.com" };
        _claimRepo.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(claim);
        _userRepo.Setup(r => r.GetByIdAsync(5)).ReturnsAsync(officer);

        await _service.AssignOfficerAsync(1, 5);

        Assert.Equal("Under Review", claim.Status);
        Assert.Equal(5, claim.AssignedOfficerId);
    }
}
