using Microsoft.EntityFrameworkCore;
using TravelInsurance.Application.Dtos;
using TravelInsurance.Application.Interfaces.Repositories;
using TravelInsurance.Domain.Entities;
using TravelInsurance.Infrastructure.Data;

namespace TravelInsurance.Infrastructure.Repositories
{
    public class InsurancePlanRepository : IInsurancePlanRepository
    {
        private readonly ApplicationDbContext _context;

        public InsurancePlanRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task AddAsync(InsurancePlan plan)
        {
            await _context.InsurancePlans.AddAsync(plan);
            await _context.SaveChangesAsync();
        }

        public async Task<IEnumerable<InsurancePlan>> GetAllAsync()
        {
            return await _context.InsurancePlans
                .Include(p => p.Coverages)
                .Include(p => p.PremiumRule)
                .ToListAsync();
        }

        public async Task<InsurancePlan?> GetByIdAsync(int id)
        {
            return await _context.InsurancePlans
                .Include(p => p.Coverages)
                .Include(p => p.PremiumRule)
                .FirstOrDefaultAsync(p => p.Id == id);
        }

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }

        public async Task UpdateAsync(InsurancePlan plan)
        {
            _context.InsurancePlans.Update(plan);
            await _context.SaveChangesAsync();
        }

        public async Task<List<BrowsePlanDto>> BrowsePlansByCoverageAsync(string coverageType)
        {
            return await _context.InsurancePlans
                .Where(p => p.Coverages.Any(c => c.CoverageType == coverageType))
                .Select(p => new
                {
                    Plan = p,
                    HighestCoverageAmount = p.Coverages
                        .Where(c => c.CoverageType == coverageType)
                        .Max(c => c.CoverageAmount)
                })
                .OrderByDescending(x => x.HighestCoverageAmount)
                .Select(x => new BrowsePlanDto(
                    x.Plan.Id,
                    x.Plan.PolicyName,
                    x.Plan.PlanType,
                    x.Plan.MaxCoverageAmount,
                    x.HighestCoverageAmount
                ))
                .ToListAsync();
        }
    }
}