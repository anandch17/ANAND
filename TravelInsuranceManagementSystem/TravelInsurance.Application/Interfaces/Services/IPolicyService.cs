using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TravelInsurance.Application.Dtos;

namespace TravelInsurance.Application.Interfaces.Services
{
    public interface IPolicyService
    {
        Task<int> CreatePolicyRequestAsync(int customerId, CreatePolicyRequestDto dto);

        Task ApprovePolicyAsync(int agentId, int policyId);

        Task<PolicyList> GetByPolicyIdAsync(int policyId);

        Task<List<PolicyResponseDto>> GetActivePoliciesAsync(int customerId);

        Task<List<PaymentPendingPolicyDto>> GetPaymentPendingPoliciesAsync(int customerId);

        Task<BuyPolicyResponseDto> BuyPolicyAsync(int customerId, int policyId);

        Task RenewPolicyAsync(int policyId, int extensionDays);

        Task AssignAgentAsync(int policyId, int agentId);

        Task<IEnumerable<PolicyAssignmentDto>> GetAgentPendingPoliciesAsync(int agentId);
        Task<IEnumerable<PolicyAssignmentDto>> GetAgentSoldPoliciesAsync(int agentId);

        Task<IEnumerable<PolicyAssignmentDto>> GetPoliciesByStatusAsync(string? status);
        Task<List<PolicyResponseDto>> GetMyPoliciesAsync(int customerId);
        Task<List<CoverageDto>> GetPolicyCoveragesAsync(int policyId);
    }

}
