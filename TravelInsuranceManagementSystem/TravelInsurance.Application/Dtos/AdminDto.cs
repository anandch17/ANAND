using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TravelInsurance.Application.Dtos
{

    // ============================
    // USER MANAGEMENT
    // ============================

    public record AgentDropdownDto(
    int Id,
    string Name
);
    public record CreateAgentDto(
            string Name,
            string Email,
            string Password,
            decimal CommissionRate
        );

        public record CreateClaimOfficerDto(
            string Name,
            string Email,
            string Password
        );

        public record UpdateUserStatusDto(
            int UserId,
            bool IsActive
        );

        public record AssignAgentDto(
           
            int PolicyId,
            int AgentId
        );

        public record AssignClaimOfficerDto(
            int ClaimId,
            int OfficerId
        );

        public record UserResponseDto(
            int Id,
            string Name,
            string Email,
            string Role,
            bool IsActive
        );


        // ============================
        // PLAN MANAGEMENT
        // ============================

        public record CreatePlanDto(
            string PlanName,
            string PlanType,
            decimal MaxCoverageAmount,
            bool IsActive,
            List<CreateCoverageDto> Coverages,
            CreatePremiumRuleDto PremiumRule
        );


   

    public record CreateCoverageDto(
            string CoverageName,
            decimal CoverageAmount
        );

        public record CreatePremiumRuleDto(
            decimal BasePrice,
            decimal AgeBelow30Multiplier,
            decimal AgeBetween30And50Multiplier,
            decimal AgeAbove50Multiplier,
            decimal PerDayRate
        );

    public record PlanResponseDto(
    int Id,
    string PlanName,
    string PlanType,
    decimal MaxCoverageAmount,
    bool IsActive,
    List<CreateCoverageDto> Coverages,
    PremiumRuleResponseDto PremiumRule
);

    public record PremiumRuleResponseDto(
        decimal BasePrice,
        decimal AgeBelow30Multiplier,
        decimal AgeBetween30And50Multiplier,
        decimal AgeAbove50Multiplier,
        decimal PerDayRate
    );



    // ============================
    // POLICY MANAGEMENT
    // ============================

    public record PolicyAssignmentDto(
    int PolicyId,
    string PlanName,
    string CustomerName,
    DateTime StartDate,
    DateTime EndDate,
    decimal PremiumAmount,
    string Status,
    int? AssignedAgentId,
    string? AssignedAgentName,
    decimal AgeMultiplier
);
   

        public record PolicyFilterDto(
            string? PlanType,
            DateTime? FromDate,
            DateTime? ToDate,
            string? Status
        );

        public record PolicyListDto(
            int Id,
            string PlanName,
            string CustomerName,
            DateTime StartDate,
            DateTime EndDate,
            decimal PremiumAmount,
            string Status,
            decimal AgeMultiplier
        );



        // ============================
        // CLAIM MANAGEMENT
        // ============================

        public record ClaimListDto(
            int Id,
            int PolicyNumber,
            string CustomerName,
            string PlanName,
            string ClaimType,
            decimal ClaimAmount,
            string Status,
            string? ReviewNotes = null,
            decimal? SettledAmount = null
        );

        public record AssignedClaimsDto(
            int id, 
            int PolicyNumber, 
            string CustomerName, 
            string PlanName,
            string ClaimType, 
            decimal ClaimAmount, 
            string AgentName, 
            string Status, 
            List<string> DocumentUrls,
            decimal BaseSettlementAmount,
            string? Description,
            string? ReviewNotes,
            decimal? SettledAmount
        );

        public record AgentPerformanceDto(
            int TotalAssigned,
            int SoldPolicies,
            int PendingApprovals,
            int InterestedPolicies,
            decimal TotalPremiumGenerated
        );
    }

