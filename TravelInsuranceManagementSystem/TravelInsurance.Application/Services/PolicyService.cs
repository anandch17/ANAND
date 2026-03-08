using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TravelInsurance.Application.Common;
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
        private readonly IEmailService _email;

        public PolicyService(
            IPolicyRepository policyRepo,
            IPremiumCalculationService premiumService,
            IUserRepository userRepo,
            IEmailService email)
        {
            _policyRepo = policyRepo;
            _premiumService = premiumService;
            _userRepo = userRepo;
            _email = email;
        }

        public async Task<PolicyList> GetByPolicyIdAsync(int policyId)
        {
            var policy = await _policyRepo.GetPolicyWithDetailsAsync(policyId);

            if (policy == null)
                throw new AppException("Policy not found",404);

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
            if (customer == null) throw new AppException("Customer not found",404);

            if (customer.DateOfBirth == null)
                throw new AppException("Date of birth is required to purchase a policy.", 400);

            // 1. Calculate current age
            int currentAge = DateTime.Now.Year - customer.DateOfBirth.Value.Year;
            if (customer.DateOfBirth.Value.Date > DateTime.Now.AddYears(-currentAge)) currentAge--;

            // 2. Fetch the plan
            var plan = await _policyRepo.GetByPlanId(dto.PlanId); // This method existed in repo
            if (plan == null) throw new Exception("Plan not found");

            // 3. Student Plan Age Limit (38)
            if (plan.PolicyName.Contains("Student", StringComparison.OrdinalIgnoreCase) && currentAge > 38)
            {
                throw new AppException("Age limit exceeded. Student plans are only available for individuals aged 38 or below.",400);
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
                throw new AppException($"You already have an active or pending policy for '{plan.PolicyName}' in your current age category ({ (currentCategory == 1 ? "<30" : currentCategory == 2 ? "30-50" : ">50") }). You can purchase this plan again once you enter a different age category.",400);
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
                throw new AppException("Invalid policy state",400);

            var customer = await _userRepo.GetByIdAsync(policy.CustomerId);

            if (customer.DateOfBirth == null)
                throw new AppException("Date of birth missing",400);

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

            // Email the customer about policy approval
            var planName = policy.InsurancePlan?.PolicyName ?? "your plan";
            var html = $@"
<div style='font-family:sans-serif;max-width:600px;margin:auto;'>
  <div style='background:linear-gradient(135deg,#10b981,#059669);padding:32px;border-radius:12px 12px 0 0;'>
    <h1 style='color:white;margin:0;font-size:24px;'>🎉 Policy Approved!</h1>
    <p style='color:#d1fae5;margin:8px 0 0;'>TravelSecure — Great news!</p>
  </div>
  <div style='background:#f8fafc;padding:32px;border-radius:0 0 12px 12px;border:1px solid #e2e8f0;'>
    <p style='color:#475569;'>Hello <strong>{customer.Name}</strong>,</p>
    <p style='color:#475569;'>Your insurance policy has been reviewed and <strong>approved</strong> by your agent. You can now proceed with payment to activate it.</p>
    <div style='background:#ecfdf5;border:1px solid #a7f3d0;border-radius:8px;padding:16px;margin:16px 0;'>
      <p style='margin:4px 0;color:#064e3b;'><strong>Policy ID:</strong> #{policyId}</p>
      <p style='margin:4px 0;color:#064e3b;'><strong>Plan:</strong> {planName}</p>
      <p style='margin:4px 0;color:#064e3b;'><strong>Status:</strong> Payment Pending</p>
      <p style='margin:4px 0;color:#064e3b;'><strong>Premium:</strong> ₹{calculationResult.FinalPremium:N2}</p>
    </div>
    <p style='color:#475569;'>Please log in to your account to complete the payment and activate your coverage.</p>
  </div>
</div>";

            await _email.SendHtmlEmailAsync(customer.Email, $"Your Policy #{policyId} Has Been Approved", html);
        }

        public async Task<List<PaymentPendingPolicyDto>> GetPaymentPendingPoliciesAsync(int customerId)
        {
            return await _policyRepo.GetPaymentPendingPoliciesAsync(customerId);
        }

        public async Task<BuyPolicyResponseDto> BuyPolicyAsync(int customerId, int policyId)
        {
            var policy = await _policyRepo.GetByIdAsync(policyId);

            if (policy == null)
                throw new AppException("Policy not found", 404);

            if (policy.CustomerId != customerId)
                throw new AppException("Unauthorized access", 401);

            if (policy.Status != "PaymentPending")
                throw new AppException("Policy not ready for payment",400);

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
                throw new AppException("Only active policies can be renewed", 400);

            policy.EndDate = policy.EndDate.AddMonths(6);

            await _policyRepo.SaveChangesAsync();
        }

        public async Task AssignAgentAsync(int policyId, int agentId)
        {
            var policy = await _policyRepo.GetByIdAsync(policyId);
            if (policy == null) throw new AppException("Policy not found",404);
            if (policy.AgentId != null && policy.Status != "Interested" && policy.Status != "PendingAgentApproval") 
                throw new AppException("Already assigned", 400);

            var agent = await _userRepo.GetByIdAsync(agentId);
            if (agent == null || agent.Role != "Agent")
                throw new AppException("Invalid agent", 401);

            policy.AgentId = agentId;
            policy.Status = "PendingAgentApproval";

            await _policyRepo.UpdateAsync(policy);

            // Email the assigned agent
            var planName = policy.InsurancePlan?.PolicyName ?? "a travel insurance plan";
            var html = $@"
<div style='font-family:sans-serif;max-width:600px;margin:auto;'>
  <div style='background:linear-gradient(135deg,#f59e0b,#d97706);padding:32px;border-radius:12px 12px 0 0;'>
    <h1 style='color:white;margin:0;font-size:24px;'>New Policy Assigned</h1>
    <p style='color:#fef3c7;margin:8px 0 0;'>TravelSecure &mdash; Agent Portal</p>
  </div>
  <div style='background:#f8fafc;padding:32px;border-radius:0 0 12px 12px;border:1px solid #e2e8f0;'>
    <p style='color:#475569;'>Hello <strong>{agent.Name}</strong>,</p>
    <p style='color:#475569;'>A new policy has been assigned to you for review and approval.</p>
    <div style='background:#fffbeb;border:1px solid #fde68a;border-radius:8px;padding:16px;margin:16px 0;'>
      <p style='margin:4px 0;color:#78350f;'><strong>Policy ID:</strong> #{policyId}</p>
      <p style='margin:4px 0;color:#78350f;'><strong>Plan:</strong> {planName}</p>
      <p style='margin:4px 0;color:#78350f;'><strong>Status:</strong> Pending Your Approval</p>
    </div>
    <p style='color:#475569;'>Please log in to the agent portal to review the policy details and approve or request changes.</p>
  </div>
</div>";

            await _email.SendHtmlEmailAsync(agent.Email, $"New Policy #{policyId} Assigned to You", html);
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

        public async Task<List<CoverageDto>> GetPolicyCoveragesAsync(int policyId)
        {
            var policy = await _policyRepo.GetPolicyWithDetailsAsync(policyId);
            if (policy == null) throw new AppException("Policy not found",404);

            return policy.InsurancePlan.Coverages
                .Select(c => new CoverageDto(c.CoverageType, c.CoverageAmount))
                .ToList();
        }
    }
}
