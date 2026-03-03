using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using TravelInsurance.Application.Interfaces.Services;

namespace TravelInsurance.WebApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UsersController : ControllerBase
    {
        private readonly IUserService _userService;

        public UsersController(IUserService userService)
        {
            _userService = userService;
        }

        [Authorize(Roles = "Admin")]
        [HttpPatch("{id}/activate")]
        public async Task<IActionResult> Activate(int id)
        {
            await _userService.ActivateUserAsync(id);
            return NoContent();
        }

        [Authorize(Roles = "Admin")]
        [HttpPatch("{id}/deactivate")]
        public async Task<IActionResult> Deactivate(int id)
        {
            await _userService.DeactivateUserAsync(id);
            return NoContent();
        }

        [Authorize(Roles = "Admin")]
        [HttpGet("agents")]
        public async Task<IActionResult> GetAgents()
            => Ok(await _userService.GetAgentsAsync());

        [Authorize(Roles = "Admin")]
        [HttpGet("customers")]
        public async Task<IActionResult> GetCustomers()
            => Ok(await _userService.GetCustomersAsync());

        [Authorize(Roles = "Admin")]
        [HttpGet("claim-officers")]
        public async Task<IActionResult> GetClaimOfficers()
            => Ok(await _userService.GetClaimOfficersAsync());

        [Authorize]
        [HttpGet("profile")]
        public async Task<IActionResult> GetProfile()
        {
            var userId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? "0");
            return Ok(await _userService.GetProfileAsync(userId));
        }
    }
}
