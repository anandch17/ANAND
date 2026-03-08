using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Moq;
using TravelInsurance.WebApi.Controllers;
using Xunit;

namespace TravelInsurance.WebApi.Tests.Controllers;

public class FileUploadControllerTests
{
    private readonly Mock<IWebHostEnvironment> _envMock = new();
    private readonly FileUploadController _controller;

    public FileUploadControllerTests()
    {
        _controller = new FileUploadController(_envMock.Object);
    }

    [Fact]
    public async Task UploadFile_NoFile_ReturnsBadRequest()
    {
        var res = await _controller.UploadFile(null!);
        Assert.IsType<BadRequestObjectResult>(res);
    }
}
