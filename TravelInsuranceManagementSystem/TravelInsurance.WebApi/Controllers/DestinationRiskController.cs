using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TravelInsurance.Application.Interfaces.Repositories;
using TravelInsurance.Domain.Entities;

namespace TravelInsurance.WebApi.Controllers
{
    [Route("api/destination-risk")]
    [ApiController]
    [Authorize(Roles = "Admin")]
    public class DestinationRiskController : ControllerBase
    {
        private readonly IDestinationRiskRepository _riskRepository;

        public DestinationRiskController(IDestinationRiskRepository riskRepository)
        {
            _riskRepository = riskRepository;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var risks = await _riskRepository.GetAllAsync();
            return Ok(risks);
        }

        [HttpPost]
        public async Task<IActionResult> Create(DestinationRisk risk)
        {
            await _riskRepository.AddAsync(risk);
            await _riskRepository.SaveChangesAsync();
            return CreatedAtAction(nameof(GetAll), new { id = risk.Id }, risk);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, DestinationRisk risk)
        {
            if (id != risk.Id) return BadRequest();
            await _riskRepository.UpdateAsync(risk);
            await _riskRepository.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            await _riskRepository.DeleteAsync(id);
            await _riskRepository.SaveChangesAsync();
            return NoContent();
        }
    }
}
