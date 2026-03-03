using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TravelInsurance.Application.Dtos;
using TravelInsurance.Application.Interfaces.Repositories;
using TravelInsurance.Application.Interfaces.Services;
using TravelInsurance.Domain.Entities;

namespace TravelInsurance.Application.Services
{
    public  class PolicyService: IPolicyService
    {

        private readonly IPolicyRepository _policyRepo;
        private readonly IPremiumCalculationService _premiumService;
        private readonly IUserRepository _userRepo;

        public PolicyService(
            IPolicyRepository policyRepo,
            IPremiumCalculationService premiumService,
            IUserRepository userRepo)
        {
            _policyRepo = policyRepo;
            _premiumService = premiumService;
            _userRepo = userRepo;
        }


        public async Task<PolicyList> GetByPolicyIdAsync(int policyId)
        {
            var policy = await _policyRepo.GetPolicyWithDetailsAsync(policyId);

            if (policy == null)
                throw new Exception("Policy not found");

            return new PolicyList(
                policy.Id,
                policy.InsurancePlanId,
                policy.InsurancePlan.PolicyName,
                policy.Customer.Name,
                policy.StartDate,
                policy.EndDate,
                policy.PremiumAmount,
                policy.Status,
                policy.AgeMultiplier
            );
        }

        public async Task<int> CreatePolicyRequestAsync(int customerId, CreatePolicyRequestDto dto)
        {
            var customer = await _userRepo.GetByIdAsync(customerId);
            if (customer == null) throw new Exception("Customer not found");

            if (customer.DateOfBirth == null)
                throw new Exception("Date of birth is required to purchase a policy.");

            // 1. Calculate current age
            int currentAge = DateTime.Now.Year - customer.DateOfBirth.Value.Year;
            if (customer.DateOfBirth.Value.Date > DateTime.Now.AddYears(-currentAge)) currentAge--;

            // 2. Fetch the plan
            var plan = await _policyRepo.GetByPlanId(dto.PlanId); // This method existed in repo
            if (plan == null) throw new Exception("Plan not found");

            // 3. Student Plan Age Limit (38)
            if (plan.PolicyName.Contains("Student", StringComparison.OrdinalIgnoreCase) && currentAge > 38)
            {
                throw new Exception("Age limit exceeded. Student plans are only available for individuals aged 38 or below.");
            }

            // 4. Age Category Duplication Check
            // Categories: < 30 (1), 30-50 (2), > 50 (3)
            Func<int, int> getCategory = (a) => a switch { < 30 => 1, >= 30 and <= 50 => 2, _ => 3 };
            int currentCategory = getCategory(currentAge);

            var existingPolicies = await _policyRepo.GetByCustomerIdAsync(customerId);
            var duplicate = existingPolicies.Where(p => p != null && p.InsurancePlanId == dto.PlanId && 
                                                        p.Status != "Rejected" && p.Status != "Cancelled" && p.Status != "Expired" && p.Status != "Interested")
                .FirstOrDefault(p => {
                    int ageAtPolicy = p!.PurchaseAge > 0 ? p.PurchaseAge : (p.StartDate.Year - customer.DateOfBirth.Value.Year);
                    if (p.PurchaseAge <= 0 && customer.DateOfBirth.Value.Date > p.StartDate.AddYears(-ageAtPolicy)) ageAtPolicy--;
                    Console.WriteLine(getCategory(ageAtPolicy));
                    return getCategory(ageAtPolicy) == currentCategory;
                });

            if (duplicate != null)
            {
                throw new Exception($"You already have an active or pending policy for '{plan.PolicyName}' in your current age category ({ (currentCategory == 1 ? "<30" : currentCategory == 2 ? "30-50" : ">50") }). You can purchase this plan again once you enter a different age category.");
            }


            // 5. Calculate and Store Dynamic Values
            int tripDays = (dto.EndDate - dto.StartDate).Days;
            if (tripDays <= 0) tripDays = 1;

            var calculation = await _premiumService.CalculatePremiumAsync(new CalculatePremiumRequestDto(
                dto.PlanId,
                currentAge,
                tripDays,
                dto.DestinationCountry
            ));

            var policy = new Policy
            {
                CustomerId = customerId,
                InsurancePlanId = dto.PlanId,
                DestinationCountry = dto.DestinationCountry,
                StartDate = dto.StartDate,
                EndDate = dto.EndDate,
                PremiumAmount = calculation.FinalPremium,
                AgeMultiplier = calculation.AgeMultiplier,
                PurchaseAge = currentAge,
                Status = "Interested"
            };

            await _policyRepo.AddAsync(policy);
            await _policyRepo.SaveChangesAsync();

            return policy.Id;
        }


        public async Task ApprovePolicyAsync(int agentId, int policyId)
        {
            var policy = await _policyRepo.GetByIdAsync(policyId);

            if (policy == null || policy.Status != "PendingAgentApproval")
                throw new Exception("Invalid policy state");

            var customer = await _userRepo.GetByIdAsync(policy.CustomerId);

            if (customer.DateOfBirth == null)
                throw new Exception("Date of birth missing");

            int age = DateTime.Now.Year - customer.DateOfBirth.Value.Year;
            int days = (policy.EndDate - policy.StartDate).Days;

            var calculationResult = await _premiumService.CalculatePremiumAsync(
                new CalculatePremiumRequestDto(
                    policy.InsurancePlanId,
                    age,
                    days,
                    policy.DestinationCountry
                ));

            policy.AgentId = agentId;
            policy.PremiumAmount = calculationResult.FinalPremium;
            policy.Status = "PaymentPending";

            await _policyRepo.SaveChangesAsync();
        }

        public async Task<List<PaymentPendingPolicyDto>> GetPaymentPendingPoliciesAsync(int customerId)
        {
            return await _policyRepo.GetPaymentPendingPoliciesAsync(customerId);
        }

        public async Task<BuyPolicyResponseDto> BuyPolicyAsync(int customerId, int policyId)
        {
            var policy = await _policyRepo.GetByIdAsync(policyId);

            if (policy == null)
                throw new Exception("Policy not found");

            if (policy.CustomerId != customerId)
                throw new Exception("Unauthorized access");

            if (policy.Status != "PaymentPending")
                throw new Exception("Policy not ready for payment");

            // Create payment record
            var payment = new Payment
            {
                PolicyId = policy.Id,
                Amount = policy.PremiumAmount,
                Status = "Success",
                PaymentDate = DateTime.UtcNow
            };

            policy.Status = "Active";

            await _policyRepo.AddPaymentAsync(payment);
            await _policyRepo.SaveChangesAsync();

            return new BuyPolicyResponseDto(
                policy.Id,
                payment.Amount,
                payment.Status,
                policy.Status
            );
        }


        public async Task<List<PolicyResponseDto>> GetActivePoliciesAsync(int customerId)
        {
            return await _policyRepo.GetActivePoliciesAsync(customerId);
        }


        public async Task RenewPolicyAsync(int policyId)
        {
            var policy = await _policyRepo.GetByIdAsync(policyId);

            if (policy.Status != "Active")
                throw new Exception("Only active policies can be renewed");

            policy.EndDate = policy.EndDate.AddMonths(6);

            await _policyRepo.SaveChangesAsync();
        }

        public async Task AssignAgentAsync(int policyId, int agentId)
        {

            var policy = await _policyRepo.GetByIdAsync(policyId);
            if (policy == null) throw new Exception("Policy not found");
            if (policy.AgentId != null && policy.Status != "Interested" && policy.Status != "PendingAgentApproval") 
                throw new Exception("Already assigned");

            var agent = await _userRepo.GetByIdAsync(agentId);
            if (agent == null || agent.Role != "Agent")
                throw new Exception("Invalid agent");

            policy.AgentId = agentId;
            policy.Status = "PendingAgentApproval";

            await _policyRepo.UpdateAsync(policy);
        }



        public async Task<IEnumerable<PolicyAssignmentDto>> GetAgentPendingPoliciesAsync(int agentId)
        {
            var policies = await _policyRepo.GetPoliciesWithDetailsAsync();
            return policies
                .Where(p => p.AgentId == agentId && p.Status == "PendingAgentApproval")
                .Select(p => new PolicyAssignmentDto(
                    p.Id,
                    p.InsurancePlan.PolicyName,
                    p.Customer.Name,
                    p.StartDate,
                    p.EndDate,
                    p.PremiumAmount,
                    p.Status,
                    p.AgentId,
                    p.Agent!.Name,
                    p.AgeMultiplier
                ));
        }

        public async Task<IEnumerable<PolicyAssignmentDto>> GetAgentSoldPoliciesAsync(int agentId)
        {
            var policies = await _policyRepo.GetPoliciesWithDetailsAsync();
            return policies
                .Where(p => p.AgentId == agentId && p.Status == "Active")
                .Select(p => new PolicyAssignmentDto(
                    p.Id,
                    p.InsurancePlan.PolicyName,
                    p.Customer.Name,
                    p.StartDate,
                    p.EndDate,
                    p.PremiumAmount,
                    p.Status,
                    p.AgentId,
                    p.Agent!.Name,
                    p.AgeMultiplier
                ));
        }

        public async Task<IEnumerable<PolicyAssignmentDto>> GetPoliciesByStatusAsync(string? status)
        {
            var policies = await _policyRepo.GetPoliciesWithDetailsAsync();

            if (!string.IsNullOrWhiteSpace(status))
            {
                policies = policies
                    .Where(p => p.Status.Equals(status, StringComparison.OrdinalIgnoreCase))
                    .ToList();
            }

            return policies.Select(p => new PolicyAssignmentDto(
                p.Id,
                p.InsurancePlan.PolicyName,
                p.Customer.Name,
                p.StartDate,
                p.EndDate,
                p.PremiumAmount,
                p.Status,
                p.AgentId,
                p.Agent?.Name,
                p.AgeMultiplier
            ));
        }

        public async Task<List<PolicyResponseDto>> GetMyPoliciesAsync(int customerId)
        {
            var policies = await _policyRepo.GetByCustomerIdAsync(customerId);
            return policies
                .Where(p => p != null)
                .Select(p => new PolicyResponseDto(
                    p!.Id,
                    p.InsurancePlanId,
                    p.InsurancePlan?.PolicyName ?? "",
                    p.StartDate,
                    p.EndDate,
                    p.PremiumAmount,
                    p.Status,
                    p.DestinationCountry,
                    p.AgeMultiplier
                )).ToList();
        }

        public async Task<AgentPerformanceDto> GetAgentPerformanceAsync(int agentId)
        {
            var policies = await _policyRepo.GetPoliciesWithDetailsAsync();
            var agentPolicies = policies.Where(p => p.AgentId == agentId).ToList();

            return new AgentPerformanceDto(
                TotalAssigned: agentPolicies.Count,
                SoldPolicies: agentPolicies.Count(p => p.Status == "Active"),
                PendingApprovals: agentPolicies.Count(p => p.Status == "PendingAgentApproval"),
                InterestedPolicies: agentPolicies.Count(p => p.Status == "Interested"),
                TotalPremiumGenerated: agentPolicies.Where(p => p.Status == "Active").Sum(p => p.PremiumAmount)
            );
        }
    }
}
