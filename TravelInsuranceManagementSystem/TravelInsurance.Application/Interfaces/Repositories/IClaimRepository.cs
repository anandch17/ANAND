using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TravelInsurance.Application.Dtos;
using TravelInsurance.Domain.Entities;

namespace TravelInsurance.Application.Interfaces.Repositories
{
    public interface IClaimRepository
    {

        Task<Claim?> GetByIdAsync(int id);
        Task UpdateAsync(Claim claim);

        Task<IEnumerable<ClaimListDto>> GetClaimsForAssignmentAsync();

        Task<IEnumerable<AssignedClaimsDto>> GetAssignedClaimsAsync();

        Task<IEnumerable<AssignedClaimsDto>> GetClaimsByOfficerAsync(int officerId);

        Task AddAsync(Claim claim);

        Task<List<ClaimWithDocumentsDto>> GetCustomerClaimsAsync(int customerId);

        Task<IEnumerable<Claim>> GetClaimsByOfficerEntitiesAsync(int officerId);
        Task<IEnumerable<Claim>> GetAllClaimsAsync();
    }
}
