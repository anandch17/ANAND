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
    public class ClaimService : IClaimService
    {
        private readonly IClaimRepository _claimRepository;
        private readonly IUserRepository _userRepository;
        private readonly IPolicyRepository _policyRepo;
        private readonly IEmailService _email;

        public ClaimService(IClaimRepository claimRepository,
                            IUserRepository userRepository,
                            IPolicyRepository policyRepo,
                            IEmailService email)
        {
            _claimRepository = claimRepository;
            _userRepository = userRepository;
            _policyRepo = policyRepo;
            _email = email;
        }

        public async Task AssignOfficerAsync(int claimId, int officerId)
        {
            var claim = await _claimRepository.GetByIdAsync(claimId);
            if (claim == null) throw new AppException("Claim not found",404);
            if (claim.AssignedOfficerId != null)
                throw new AppException("Already assigned",400);

            var officer = await _userRepository.GetByIdAsync(officerId);
            if (officer == null || officer.Role != "ClaimOfficer")
                throw new AppException("Invalid claim officer",401);

            claim.AssignedOfficerId = officerId;
            claim.Status = "Under Review";

            await _claimRepository.UpdateAsync(claim);

            // Email the assigned officer
            var html = $@"
<div style='font-family:sans-serif;max-width:600px;margin:auto;'>
  <div style='background:linear-gradient(135deg,#7c3aed,#6d28d9);padding:32px;border-radius:12px 12px 0 0;'>
    <h1 style='color:white;margin:0;font-size:24px;'>New Claim Assigned</h1>
    <p style='color:#ede9fe;margin:8px 0 0;'>TravelSecure — Claims Department</p>
  </div>
  <div style='background:#f8fafc;padding:32px;border-radius:0 0 12px 12px;border:1px solid #e2e8f0;'>
    <p style='color:#475569;'>Hello <strong>{officer.Name}</strong>,</p>
    <p style='color:#475569;'>A new claim has been assigned to you for review.</p>
    <div style='background:#f5f3ff;border:1px solid #ddd6fe;border-radius:8px;padding:16px;margin:16px 0;'>
      <p style='margin:4px 0;color:#4c1d95;'><strong>Claim ID:</strong> #{claimId}</p>
      <p style='margin:4px 0;color:#4c1d95;'><strong>Claim Type:</strong> {claim.ClaimType}</p>
      <p style='margin:4px 0;color:#4c1d95;'><strong>Amount Requested:</strong> ₹{claim.ClaimAmount:N2}</p>
      <p style='margin:4px 0;color:#4c1d95;'><strong>Status:</strong> Under Review</p>
    </div>
    <p style='color:#475569;'>Please log in to the portal to review and process this claim promptly.</p>
  </div>
</div>";

            await _email.SendHtmlEmailAsync(officer.Email, $"New Claim #{claimId} Assigned to You", html);
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
            var policy = await _policyRepo.GetPolicyWithDetailsAsync(dto.PolicyId);

            if (policy == null || policy.CustomerId != customerId)
                throw new AppException("Invalid policy",401);

            if (policy.Status != "Active")
                throw new AppException("Claims allowed only for active policies", 400);

            // Coverage validation
            var coverage = policy.InsurancePlan.Coverages
                .FirstOrDefault(c => c.CoverageType.Equals(dto.ClaimType, StringComparison.OrdinalIgnoreCase));

            if (coverage != null && dto.ClaimAmount > coverage.CoverageAmount)
            {
                throw new AppException($"Claim amount ₹{dto.ClaimAmount:N2} exceeds the coverage limit of ₹{coverage.CoverageAmount:N2} for {dto.ClaimType}.", 400);
            }

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
            await _policyRepo.SaveChangesAsync(); 

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
                throw new AppException("Claim not found", 404);

            if (claim.Status != "Submitted" && claim.Status != "Under Review")
                throw new AppException("Invalid state", 401);

            claim.Status = dto.Status;
          

            await _claimRepository.UpdateAsync(claim);
        }

        public async Task SettleClaimAsync(int claimId, decimal settledAmount)
        {
            var claim = await _claimRepository.GetByIdAsync(claimId);

            if (claim == null)
                throw new AppException("Claim not found", 404);

            if (claim.Status != "Approved")
                throw new AppException("Only approved claims can be settled", 400);

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
        public async Task<IEnumerable<ClaimListDto>> GetAllClaimsAsync()
        {
            var claims = await _claimRepository.GetAllClaimsAsync();
            return claims.Select(c => new ClaimListDto(
                c.Id,
                c.PolicyId,
                c.Policy.Customer.Name,
                c.ClaimType,
                c.ClaimAmount,
                c.Status
            ));
        }
    }
}
