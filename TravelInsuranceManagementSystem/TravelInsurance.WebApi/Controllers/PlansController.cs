using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using TravelInsurance.Application.Dtos;
using TravelInsurance.Application.Interfaces.Services;

namespace TravelInsurance.WebApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PlansController : ControllerBase
    {
        private readonly IPlanService _planService;

        public PlansController(IPlanService planService)
        {
            _planService = planService;
        }

        [Authorize(Roles = "Admin")]
        [HttpPost]
        public async Task<IActionResult> Create(CreatePlanDto dto)
        {
            var id = await _planService.CreatePlanAsync(dto);
            return Ok(new
            {
                success = true,
                message = "Plan created successfully"
            });
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var plans = await _planService.GetAllPlansAsync();
            return Ok(plans);
        }

        [Authorize(Roles = "Admin")]
        [HttpPatch("{id}/activate")]
        public async Task<IActionResult> Activate(int id)
        {
            await _planService.ActivatePlanAsync(id);
            return NoContent();
        }

        [Authorize(Roles = "Admin")]
        [HttpPatch("{id}/deactivate")]
        public async Task<IActionResult> Deactivate(int id)
        {
            await _planService.DeactivatePlanAsync(id);
            return NoContent();
        }

        [Authorize(Roles = "Customer")]
        [HttpGet("browse")]
        public async Task<IActionResult> BrowsePlans([FromQuery] string coverageType)
        {
            var result = await _planService.BrowsePlansByCoverageAsync(coverageType);
            return Ok(result);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var plan = await _planService.GetPlanByIdAsync(id);
            if (plan == null) return NotFound();
            return Ok(plan);
        }
    }
}
