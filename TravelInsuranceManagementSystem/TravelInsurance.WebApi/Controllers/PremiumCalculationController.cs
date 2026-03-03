using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TravelInsurance.Application.Dtos;
using TravelInsurance.Application.Interfaces.Services;

namespace TravelInsurance.WebApi.Controllers
{
    [Route("api/premium")]
    [ApiController]
    public class PremiumCalculationController : ControllerBase
    {
        private readonly IPremiumCalculationService _premiumService;

        public PremiumCalculationController(IPremiumCalculationService premiumService)
        {
            _premiumService = premiumService;
        }

        [HttpPost("calculate")]
        [Authorize]
        public async Task<IActionResult> Calculate([FromBody] CalculatePremiumRequestDto dto)
        {
            try
            {
                var result = await _premiumService.CalculatePremiumAsync(dto);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
        }
    }
}
