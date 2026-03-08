using TravelInsurance.Application.Dtos;
using TravelInsurance.Application.Interfaces.Repositories;
using TravelInsurance.Application.Interfaces.Services;

public class PremiumCalculationService : IPremiumCalculationService
{
    private readonly IInsurancePlanRepository _planRepository;
    private readonly IDestinationRiskRepository _riskRepository;

    public PremiumCalculationService(IInsurancePlanRepository planRepository, IDestinationRiskRepository riskRepository)
    {
        _planRepository = planRepository;
        _riskRepository = riskRepository;
    }

    public async Task<CalculatePremiumResponseDto> CalculatePremiumAsync(CalculatePremiumRequestDto dto)
    {
        var plan = await _planRepository.GetByIdAsync(dto.PlanId);

        if (plan == null || plan.PremiumRule == null)
            throw new Exception("Invalid Plan");

        var rule = plan.PremiumRule;

        decimal ageMultiplier = dto.Age switch
        {
            < 30 => rule.AgeBelow30Multiplier,
            >= 30 and <= 50 => rule.AgeBetween30And50Multiplier,
            _ => rule.AgeAbove50Multiplier
        };

        var destinationRisk = await _riskRepository.GetByDestinationAsync(dto.DestinationCountry);
        decimal destinationRiskMultiplier = destinationRisk?.RiskMultiplier ?? 1.0m;

        decimal basePrice = rule.BasePrice;
        decimal perDayRate = rule.PerDayRate;
        int tripDays = dto.TravelDays > 0 ? dto.TravelDays : 1;

        // corePremium = basePrice + (perDayRate × tripDays)
        decimal corePremium = basePrice + (perDayRate * tripDays);

        // riskMultiplier = ageMultiplier × destinationRiskMultiplier
        decimal totalRiskMultiplier = ageMultiplier * destinationRiskMultiplier;

        // finalPremium = corePremium × riskMultiplier
        decimal finalPremium = corePremium * totalRiskMultiplier;

        // Dynamic Coverage Scaling - Scale existing coverages by the age multiplier
        var dynamicCoverages = plan.Coverages.Select(c => new CoverageDto(
            c.CoverageType,
            c.CoverageAmount * ageMultiplier
        )).ToList();

        return new CalculatePremiumResponseDto(finalPremium, ageMultiplier, dynamicCoverages);
    }
}