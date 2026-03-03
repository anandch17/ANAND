using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TravelInsurance.Application.Dtos;

namespace TravelInsurance.Application.Interfaces.Services
{
    public interface IPlanService
    {
        Task<int> CreatePlanAsync(CreatePlanDto dto);
        Task<IEnumerable<PlanResponseDto>> GetAllPlansAsync();
        Task ActivatePlanAsync(int id);
        Task DeactivatePlanAsync(int id);

        Task<List<BrowsePlanDto>> BrowsePlansByCoverageAsync(string coverageType);
        Task<PlanResponseDto?> GetPlanByIdAsync(int id);
    }
}
