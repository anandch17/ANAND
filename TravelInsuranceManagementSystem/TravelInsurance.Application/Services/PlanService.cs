using TravelInsurance.Application.Dtos;
using TravelInsurance.Application.Interfaces.Repositories;
using TravelInsurance.Application.Interfaces.Services;
using TravelInsurance.Domain.Entities;

namespace TravelInsurance.Application.Services {
    public class PlanService : IPlanService
    {
        private readonly IInsurancePlanRepository _planRepository;

        public PlanService(IInsurancePlanRepository planRepository)
        {
            _planRepository = planRepository;
        }

        public async Task<int> CreatePlanAsync(CreatePlanDto dto)
        {
            var plan = new InsurancePlan
            {
                PolicyName = dto.PlanName,
                PlanType = dto.PlanType,
                MaxCoverageAmount = dto.MaxCoverageAmount,
                IsActive = dto.IsActive
            };

            foreach (var c in dto.Coverages)
            {
                plan.Coverages.Add(new Coverage
                {
                    CoverageType = c.CoverageName,
                    CoverageAmount = c.CoverageAmount
                });
            }

            plan.PremiumRule = new PremiumRule
            {
                BasePrice = dto.PremiumRule.BasePrice,
                AgeBelow30Multiplier = dto.PremiumRule.AgeBelow30Multiplier,
                AgeBetween30And50Multiplier = dto.PremiumRule.AgeBetween30And50Multiplier,
                AgeAbove50Multiplier = dto.PremiumRule.AgeAbove50Multiplier,
                PerDayRate = dto.PremiumRule.PerDayRate
            };

            await _planRepository.AddAsync(plan);
            return plan.Id;
        }

        public async Task<IEnumerable<PlanResponseDto>> GetAllPlansAsync()
        {
            var plans = await _planRepository.GetAllAsync();

            return plans.Select(p => new PlanResponseDto(
                p.Id,
                p.PolicyName,
                p.PlanType,
                p.MaxCoverageAmount,
                p.IsActive,
                p.Coverages.Select(c => new CreateCoverageDto(
                    c.CoverageType,
                    c.CoverageAmount
                )).ToList(),
                new PremiumRuleResponseDto(
                    p.PremiumRule.BasePrice,
                    p.PremiumRule.AgeBelow30Multiplier,
                    p.PremiumRule.AgeBetween30And50Multiplier,
                    p.PremiumRule.AgeAbove50Multiplier,
                    p.PremiumRule.PerDayRate
                )
            ));
        }

        public async Task ActivatePlanAsync(int id)
        {
            var plan = await _planRepository.GetByIdAsync(id);
            if (plan == null) throw new Exception("Plan not found");
            if (plan.IsActive) throw new Exception("Already active");

            plan.IsActive = true;
            await _planRepository.UpdateAsync(plan);
        }

        public async Task DeactivatePlanAsync(int id)
        {
            var plan = await _planRepository.GetByIdAsync(id);
            if (plan == null) throw new Exception("Plan not found");
            if (!plan.IsActive) throw new Exception("Already inactive");

            plan.IsActive = false;
            await _planRepository.UpdateAsync(plan);
        }

        public async Task<List<BrowsePlanDto>> BrowsePlansByCoverageAsync(string coverageType)
        {
            return await _planRepository.BrowsePlansByCoverageAsync(coverageType);
        }

        public async Task<PlanResponseDto?> GetPlanByIdAsync(int id)
        {
            var p = await _planRepository.GetByIdAsync(id);
            if (p == null) return null;

            return new PlanResponseDto(
                p.Id,
                p.PolicyName,
                p.PlanType,
                p.MaxCoverageAmount,
                p.IsActive,
                p.Coverages.Select(c => new CreateCoverageDto(
                    c.CoverageType,
                    c.CoverageAmount
                )).ToList(),
                new PremiumRuleResponseDto(
                    p.PremiumRule.BasePrice,
                    p.PremiumRule.AgeBelow30Multiplier,
                    p.PremiumRule.AgeBetween30And50Multiplier,
                    p.PremiumRule.AgeAbove50Multiplier,
                    p.PremiumRule.PerDayRate
                )
            );
        }
    }
}