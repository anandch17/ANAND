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
    public class ClaimService : IClaimService
    {
        private readonly IClaimRepository _claimRepository;
        private readonly IUserRepository _userRepository;
        private readonly IPolicyRepository _policyRepo;

        public ClaimService(IClaimRepository claimRepository,
                            IUserRepository userRepository,
                            IPolicyRepository policyRepo)
        {
            _claimRepository = claimRepository;
            _userRepository = userRepository;
            _policyRepo = policyRepo;
        }

        public async Task AssignOfficerAsync(int claimId, int officerId)
        {
            var claim = await _claimRepository.GetByIdAsync(claimId);
            if (claim == null) throw new Exception("Claim not found");
            if (claim.AssignedOfficerId != null)
                throw new Exception("Already assigned");

            var officer = await _userRepository.GetByIdAsync(officerId);
            if (officer == null || officer.Role != "ClaimOfficer")
                throw new Exception("Invalid claim officer");

            claim.AssignedOfficerId = officerId;
            claim.Status = "Under Review";

            await _claimRepository.UpdateAsync(claim);
        }

        public async Task<IEnumerable<ClaimListDto>> GetUnassignedAsync()
        {
            return await _claimRepository.GetClaimsForAssignmentAsync();
        }

        public async Task<IEnumerable<AssignedClaimsDto>> GetAssignedAsync()
        {
            return await _claimRepository.GetAssignedClaimsAsync();
        }

        public async Task<IEnumerable<AssignedClaimsDto>> GetClaimsByOfficerAsync(int officerId)
        {
            return await _claimRepository.GetClaimsByOfficerAsync(officerId);
        }

        public async Task<List<ClaimWithDocumentsDto>> GetCustomerClaimsAsync(int customerId)
        {
            return await _claimRepository.GetCustomerClaimsAsync(customerId);
        }
        public async Task<ClaimResponseDto> RaiseClaimAsync(int customerId, RaiseClaimDto dto)
        {
            var policy = await _policyRepo.GetByIdAsync(dto.PolicyId);

            if (policy == null || policy.CustomerId != customerId)
                throw new Exception("Invalid policy");

            if (policy.Status != "Active")
                throw new Exception("Claims allowed only for active policies");

            var claim = new Claim
            {
                PolicyId = dto.PolicyId,
                ClaimType = dto.ClaimType,
                ClaimAmount = dto.ClaimAmount,
                Status = "Submitted",
                CreatedDate = DateTime.UtcNow
            };

            // Attach documents correctly
            foreach (var url in dto.DocumentUrls)
            {
                claim.Documents.Add(new ClaimDocument
                {
                    Url = url
                });
            }

            await _claimRepository.AddAsync(claim);

            return new ClaimResponseDto(
                claim.Id,
                claim.ClaimType,
                claim.ClaimAmount,
                claim.Status
            );
        }

        public async Task ReviewClaimAsync(int officerId, int claimId, ReviewClaimDto dto)
        {
            var claim = await _claimRepository.GetByIdAsync(claimId);

            if (claim == null)
                throw new Exception("Claim not found");

            if (claim.Status != "Submitted" && claim.Status != "Under Review")
                throw new Exception("Invalid state");

            claim.Status = dto.Status;
          

            await _claimRepository.UpdateAsync(claim);
        }

        public async Task SettleClaimAsync(int claimId, decimal settledAmount)
        {
            var claim = await _claimRepository.GetByIdAsync(claimId);

            if (claim == null)
                throw new Exception("Claim not found");

            if (claim.Status != "Approved")
                throw new Exception("Only approved claims can be settled");

            claim.Status = "Settled";
            claim.SettledAmount = settledAmount;
            claim.SettledDate = DateTime.UtcNow;

            await _claimRepository.UpdateAsync(claim);
        }

        public async Task<ClaimOfficerPerformanceDto> GetOfficerPerformanceAsync(int officerId)
        {
            var claims = await _claimRepository.GetClaimsByOfficerEntitiesAsync(officerId);

            return new ClaimOfficerPerformanceDto
            {
                TotalAssigned = claims.Count(),
                ApprovedClaims = claims.Count(c => c.Status == "Approved" || c.Status == "Settled"),
                RejectedClaims = claims.Count(c => c.Status == "Rejected"),
                PendingClaims = claims.Count(c => c.Status == "Submitted" || c.Status == "Under Review"),
                TotalSettledAmount = claims.Where(c => c.Status == "Settled").Sum(c => c.SettledAmount ?? 0)
            };
        }
    }
}
