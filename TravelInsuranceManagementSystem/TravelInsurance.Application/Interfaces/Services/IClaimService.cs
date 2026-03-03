using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TravelInsurance.Application.Dtos;

namespace TravelInsurance.Application.Interfaces.Services
{
    public interface IClaimService
    {
        Task AssignOfficerAsync(int claimId, int officerId);
        Task<IEnumerable<ClaimListDto>> GetUnassignedAsync();
        Task<IEnumerable<AssignedClaimsDto>> GetAssignedAsync();

        Task<IEnumerable<AssignedClaimsDto>> GetClaimsByOfficerAsync(int officerId);

        Task<ClaimResponseDto> RaiseClaimAsync(int customerId, RaiseClaimDto dto);

        Task<List<ClaimWithDocumentsDto>> GetCustomerClaimsAsync(int customerId);

        Task ReviewClaimAsync(int officerId, int claimId, ReviewClaimDto dto);

        Task SettleClaimAsync(int claimId, decimal settledAmount);

        Task<ClaimOfficerPerformanceDto> GetOfficerPerformanceAsync(int officerId);
    }
}
