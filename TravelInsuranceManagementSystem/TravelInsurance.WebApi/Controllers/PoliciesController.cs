using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TravelInsurance.Application.Dtos;
using TravelInsurance.Application.Interfaces.Services;
using System.Security.Claims;

namespace TravelInsurance.WebApi.Controllers
{
    [Route("api/policies")]
    [ApiController]
    public class PoliciesController : ControllerBase
    {
        private readonly IPolicyService _policyService;

        public PoliciesController(IPolicyService policyService)
        {
            _policyService = policyService;
        }

        // =========================================================
        // CUSTOMER: Request Policy (Buy)
        // POST /api/policies
        // =========================================================
        [Authorize(Roles = "Customer")]
        [HttpPost]
        public async Task<IActionResult> RequestPolicy(CreatePolicyRequestDto dto)
        {
            int customerId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

            var id = await _policyService.CreatePolicyRequestAsync(customerId, dto);

            return CreatedAtAction(nameof(GetById), new { id },
                new { Message = "Policy request created", PolicyId = id });
        }

        // =========================================================
        // AGENT: Approve Policy
        // PATCH /api/policies/{policyId}/approve
        // =========================================================
        [Authorize(Roles = "Agent")]
        [HttpPatch("{policyId}/approve")]
        public async Task<IActionResult> ApprovePolicy(int policyId)
        {
            int agentId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

            await _policyService.ApprovePolicyAsync(agentId, policyId);

            return Ok(new { Message = "Policy approved successfully" });
        }

        // =========================================================
        // CUSTOMER: Get My Active Policies
        // GET /api/policies/active
        // =========================================================
        [Authorize(Roles = "Customer")]
        [HttpGet("active")]
        public async Task<IActionResult> GetActivePolicies()
        {
            int customerId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

            var result = await _policyService.GetActivePoliciesAsync(customerId);

            return Ok(result);
        }

        // =========================================================
        // CUSTOMER: Renew Policy
        // PATCH /api/policies/{policyId}/renew
        // =========================================================
        [Authorize(Roles = "Customer")]
        [HttpPatch("{policyId}/renew")]
        public async Task<IActionResult> Renew(int policyId)
        {

            await _policyService.RenewPolicyAsync(policyId);

            return Ok(new { Message = "Policy renewed successfully" });
        }

        // =========================================================
        // ADMIN: Assign Agent to Policy
        // PATCH /api/policies/{id}/assign-agent
        // =========================================================
        [Authorize(Roles = "Admin")]
        [HttpPatch("{id}/assign-agent")]
        public async Task<IActionResult> AssignAgent(int id, int agentId)
        {
            await _policyService.AssignAgentAsync(id,agentId );

            return NoContent();
        }

        [Authorize(Roles = "Admin")]
        [HttpGet("admin")]
        public async Task<IActionResult> GetPoliciesByStatus([FromQuery] string? status)
        {
            var result = await _policyService.GetPoliciesByStatusAsync(status);
            return Ok(result);
        }





 

        // =========================================================
        // COMMON: Get Policy By Id
        // GET /api/policies/{id}
        // =========================================================
        [Authorize]
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var policy = await _policyService.GetByPolicyIdAsync(id);

            if (policy == null)
                return NotFound();

            return Ok(policy);
        }

        [Authorize(Roles = "Customer")]
        [HttpGet("payment-pending")]
        public async Task<IActionResult> GetPaymentPendingPolicies()
        {
            int customerId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

            var result = await _policyService.GetPaymentPendingPoliciesAsync(customerId);

            return Ok(result);
        }

        [Authorize(Roles = "Customer")]
        [HttpPost("{policyId}/buy")]
        public async Task<IActionResult> BuyPolicy(int policyId)
        {
            int customerId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

            var result = await _policyService.BuyPolicyAsync(customerId, policyId);

            return Ok(result);
        }

        // =========================================================
        // AGENT: Get My Pending Approval Policies
        // GET /api/policies/agent/pending
        // =========================================================
        [Authorize(Roles = "Agent")]
        [HttpGet("agent/pending")]
        public async Task<IActionResult> GetAgentPendingPolicies()
        {
            int agentId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            var result = await _policyService.GetAgentPendingPoliciesAsync(agentId);
            return Ok(result);
        }

        // =========================================================
        // AGENT: Get My Sold Policies (Active)
        // GET /api/policies/agent/sold
        // =========================================================
        [Authorize(Roles = "Agent")]
        [HttpGet("agent/sold")]
        public async Task<IActionResult> GetAgentSoldPolicies()
        {
            int agentId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            var result = await _policyService.GetAgentSoldPoliciesAsync(agentId);
            return Ok(result);
        }

        [Authorize(Roles = "Customer")]
        [HttpGet("my-policies")]
        public async Task<IActionResult> GetMyPolicies()
        {
            int customerId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            var result = await _policyService.GetMyPoliciesAsync(customerId);
            return Ok(result);
        }

        // =========================================================
        // CUSTOMER: Get coverages for a specific policy's plan
        // GET /api/policies/{id}/coverages
        // =========================================================
        [Authorize(Roles = "Customer")]
        [HttpGet("{id}/coverages")]
        public async Task<IActionResult> GetPolicyCoverages(int id)
        {
            var result = await _policyService.GetPolicyCoveragesAsync(id);
            return Ok(result);
        }
    }
}