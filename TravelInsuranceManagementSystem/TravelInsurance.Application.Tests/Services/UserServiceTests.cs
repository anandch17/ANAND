using Moq;
using TravelInsurance.Application.Interfaces.Repositories;
using TravelInsurance.Application.Services;
using TravelInsurance.Domain.Entities;
using Xunit;

namespace TravelInsurance.Application.Tests.Services;

public class UserServiceTests
{
    private readonly Mock<IUserRepository> _repoMock = new();
    private readonly UserService _service;

    public UserServiceTests()
    {
        _service = new UserService(_repoMock.Object);
    }

    [Fact]
    public async Task GetProfileAsync_ValidUser_ReturnsProfileDto()
    {
        var user = new User { Id = 1, Name = "Anand", Email = "a@a.com", Role = "Customer" };
        _repoMock.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(user);

        var result = await _service.GetProfileAsync(1);

        Assert.Equal("Anand", result.Name);
    }

    [Fact]
    public async Task DeactivateUserAsync_ActiveUser_SetsIsActiveFalse()
    {
        var user = new User { Id = 1, IsActive = true };
        _repoMock.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(user);

        await _service.DeactivateUserAsync(1);

        Assert.False(user.IsActive);
    }
}
