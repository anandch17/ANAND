using Moq;
using TravelInsurance.Application.Interfaces.Repositories;
using TravelInsurance.Application.Interfaces.Services;
using TravelInsurance.Application.Services;
using TravelInsurance.Domain.Entities;
using Xunit;
using Microsoft.Extensions.Configuration;
using static TravelInsurance.Application.Dtos.AuthDto;

namespace TravelInsurance.Application.Tests.Services;

public class AuthServiceTests
{
    private readonly Mock<IUserRepository> _userRepo = new();
    private readonly Mock<IJwtService> _jwt = new();
    private readonly Mock<IPasswordHasherService> _hasher = new();
    private readonly Mock<IEmailService> _email = new();
    private readonly Mock<IConfiguration> _config = new();
    private readonly AuthService _service;

    public AuthServiceTests()
    {
        _service = new AuthService(_userRepo.Object, _jwt.Object, _hasher.Object, _email.Object, _config.Object);
    }

    [Fact]
    public async Task RegisterAsync_ValidUser_ReturnsToken()
    {
        var dto = new RegisterDto("Test", "test@email.com", "Password123", "1234567890", DateTime.Now.AddYears(-25));
        
        _userRepo.Setup(r => r.ExistsAsync(dto.Email)).ReturnsAsync(false);
        _jwt.Setup(j => j.GenerateToken(It.IsAny<User>())).Returns("test_token");

        var result = await _service.RegisterAsync(dto);

        Assert.Equal("test_token", result);
        _userRepo.Verify(r => r.AddAsync(It.IsAny<User>()), Times.Once);
    }

    [Fact]
    public async Task AgentCoRegisterAsync_SendsEmail()
    {
        // DTO order: (Username, Email, Password, Role, AadharNo, DateOfBirth, CommissionRate)
        var dto = new AgenentCoRegisterDto("Agent1", "agent@email.com", "Pass123", "Agent", "9876543210", DateTime.Now.AddYears(-30), 10);
        _userRepo.Setup(r => r.ExistsAsync(dto.Email)).ReturnsAsync(false);

        await _service.AgentCoRegisterAsync(dto);

        _email.Verify(e => e.SendHtmlEmailAsync(dto.Email, It.IsAny<string>(), It.IsAny<string>()), Times.Once);
    }
}
