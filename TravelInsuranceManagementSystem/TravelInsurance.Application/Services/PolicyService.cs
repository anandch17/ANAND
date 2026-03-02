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
                policy.InsurancePlan.PolicyName,
                policy.Customer.Name,
                policy.StartDate,
                policy.EndDate,
                policy.PremiumAmount,
                policy.Status
            );
        }

        public async Task<int> CreatePolicyRequestAsync(int customerId, CreatePolicyRequestDto dto)
        {
            var policy = new Policy
            {
                CustomerId = customerId,
                InsurancePlanId = dto.PlanId,
                DestinationCountry = dto.DestinationCountry,
                StartDate = dto.StartDate,
                EndDate = dto.EndDate,
                PremiumAmount = 0,
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

            var premium = await _premiumService.CalculatePremiumAsync(
                new CalculatePremiumRequestDto(
                    policy.InsurancePlanId,
                    age,
                    days,
                    policy.DestinationCountry
                ));

            policy.AgentId = agentId;
            policy.PremiumAmount = premium;
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
            if (policy.AgentId != null) throw new Exception("Already assigned");

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
                    p.Agent!.Name
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
                    p.Agent!.Name
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
                p.Agent?.Name
            ));
        }
    }
}
