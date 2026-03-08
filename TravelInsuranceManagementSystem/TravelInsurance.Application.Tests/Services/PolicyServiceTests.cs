using Moq;
using TravelInsurance.Application.Dtos;
using TravelInsurance.Application.Interfaces.Repositories;
using TravelInsurance.Application.Interfaces.Services;
using TravelInsurance.Application.Services;
using TravelInsurance.Domain.Entities;
using Xunit;

namespace TravelInsurance.Application.Tests.Services;

public class PolicyServiceTests
{
    private readonly Mock<IPolicyRepository> _policyRepo = new();
    private readonly Mock<IPremiumCalculationService> _premiumService = new();
    private readonly Mock<IUserRepository> _userRepo = new();
    private readonly Mock<IEmailService> _email = new();
    private readonly PolicyService _service;

    public PolicyServiceTests()
    {
        _service = new PolicyService(_policyRepo.Object, _premiumService.Object, _userRepo.Object, _email.Object);
    }

    [Fact]
    public async Task ApprovePolicyAsync_ValidPolicy_Succeeds()
    {
        // ApprovePolicyAsync in service calls:
        // 1. _policyRepo.GetByIdAsync(policyId)
        // 2. _userRepo.GetByIdAsync(policy.CustomerId)
        // 3. _premiumService.CalculatePremiumAsync(...)
        // 4. _policyRepo.SaveChangesAsync()
        
        var policy = new Policy { Id = 10, CustomerId = 1, Status = "PendingAgentApproval", StartDate = DateTime.Now, EndDate = DateTime.Now.AddDays(7) };
        var customer = new User { Id = 1, Name = "Test", Email = "test@test.com", DateOfBirth = DateTime.Now.AddYears(-30) };
        
        _policyRepo.Setup(r => r.GetByIdAsync(10)).ReturnsAsync(policy);
        _userRepo.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(customer);
        _premiumService.Setup(s => s.CalculatePremiumAsync(It.IsAny<CalculatePremiumRequestDto>()))
            .ReturnsAsync(new CalculatePremiumResponseDto(150, 1.2m, new List<CoverageDto>()));

        await _service.ApprovePolicyAsync(1, 10); // agentId=1, policyId=10
        
        Assert.Equal("PaymentPending", policy.Status);
        _policyRepo.Verify(r => r.SaveChangesAsync(), Times.Once);
    }

    
}
