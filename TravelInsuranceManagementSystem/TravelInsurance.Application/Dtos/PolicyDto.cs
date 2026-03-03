using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TravelInsurance.Application.Dtos
{
    public record CalculatePremiumRequestDto(
      int PlanId,
      int Age,
      int TravelDays,
      string DestinationCountry
  );

    public record CreatePolicyRequestDto(
    int PlanId,
    string DestinationCountry,
    DateTime StartDate,
    DateTime EndDate
);

    public record ApprovePolicyDto(
    int PolicyId
);

    public record PolicyResponseDto(
    int Id,
    int PlanId,
    string PlanName,
    DateTime StartDate,
    DateTime EndDate,
    decimal PremiumAmount,
    string Status,
    string DestinationCountry,
    decimal AgeMultiplier
);
    public record PolicyList(
       int Id,
       int PlanId,
       string PlanName,
       string CustomerName,
       DateTime StartDate,
       DateTime EndDate,
       decimal PremiumAmount,
       string Status,
       decimal AgeMultiplier
   );

    public record PaymentPendingPolicyDto(
    int PolicyId,
    int PlanId,
    string PlanName,
    DateTime StartDate,
    DateTime EndDate,
    decimal PremiumAmount,
    string DestinationCountry,
    decimal AgeMultiplier
);

    public record BuyPolicyResponseDto(
    int PolicyId,
    decimal PaidAmount,
    string PaymentStatus,
    string PolicyStatus
);

    public record BrowsePlanDto(
    int PlanId,
    string PlanName,
    string PlanType,
    decimal MaxCoverageAmount,
    decimal CoverageAmount
);

    public record CoverageDto(
        string CoverageType,
        decimal CoverageAmount
    );

    public record CalculatePremiumResponseDto(
        decimal FinalPremium,
        decimal AgeMultiplier,
        List<CoverageDto> DynamicCoverages
    );

}
