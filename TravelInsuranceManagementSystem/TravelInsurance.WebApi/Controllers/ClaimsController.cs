using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using TravelInsurance.Application.Dtos;
using TravelInsurance.Application.Interfaces.Services;

namespace TravelInsurance.WebApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ClaimsController : ControllerBase
    {

        private readonly IClaimService _claimService;

        public ClaimsController(IClaimService claimService)
        {
            _claimService = claimService;
        }
        [Authorize(Roles = "Admin")]
        [HttpPatch("{id}/assign-officer")]
        public async Task<IActionResult> AssignOfficer(int id, int agentid)
        {
            await _claimService.AssignOfficerAsync(id, agentid);
            return NoContent();
        }

        [Authorize(Roles = "Admin")]
        [HttpGet("unassigned")]
        public async Task<IActionResult> GetUnassigned()
            => Ok(await _claimService.GetUnassignedAsync());


        [Authorize(Roles = "Customer")]
        [HttpPost("claims")]
        public async Task<IActionResult> RaiseClaim(RaiseClaimDto dto)
        {
            int customerId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

            var result = await _claimService.RaiseClaimAsync(customerId, dto);

            return Ok(result);
        }


        [Authorize(Roles = "Customer")]
        [HttpGet("claims")]
        public async Task<IActionResult> GetMyClaims()
        {
            int customerId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

            var result = await _claimService.GetCustomerClaimsAsync(customerId);

            return Ok(result);
        }

       

        [Authorize(Roles = "ClaimOfficer")]
        [HttpPatch("claims/{claimId}/review")]
        public async Task<IActionResult> ReviewClaim(int claimId, ReviewClaimDto dto)
        {
            int officerId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

            await _claimService.ReviewClaimAsync(officerId, claimId, dto);

            return Ok(new { message = "Claim reviewed successfully" });
        }

        [Authorize(Roles = "ClaimOfficer")]
        [HttpPatch("claims/{claimId}/settle")]
        public async Task<IActionResult> SettleClaim(int claimId, SettleClaimDto dto)
        {
            int officerId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

            await _claimService.SettleClaimAsync(claimId,dto.SettledAmount);

            return Ok(new { message = "Claim settled successfully" });
        }

        [Authorize(Roles = "Admin")]
        [HttpGet("assigned")]
        public async Task<IActionResult> GetAssigned()
            => Ok(await _claimService.GetAssignedAsync());

        [Authorize(Roles = "ClaimOfficer")]
        [HttpGet("officer/assigned")]
        public async Task<IActionResult> GetOfficerAssignedClaims()
        {
            int officerId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            return Ok(await _claimService.GetClaimsByOfficerAsync(officerId));
        }

        [Authorize(Roles = "ClaimOfficer")]
        [HttpGet("officer/performance")]
        public async Task<IActionResult> GetPerformance()
        {
            int officerId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            return Ok(await _claimService.GetOfficerPerformanceAsync(officerId));
        }
    }
}
