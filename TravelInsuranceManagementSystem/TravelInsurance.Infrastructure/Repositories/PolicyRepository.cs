using Microsoft.EntityFrameworkCore;
using TravelInsurance.Application.Dtos;
using TravelInsurance.Application.Interfaces.Repositories;
using TravelInsurance.Domain.Entities;
using TravelInsurance.Infrastructure.Data;

namespace TravelInsurance.Infrastructure.Repositories
{
    public class PolicyRepository : IPolicyRepository
    {
        private readonly ApplicationDbContext _context;

        public PolicyRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<Policy?> GetByIdAsync(int id)
        {
            return await _context.Policies
                .Include(p => p.InsurancePlan)
                    .ThenInclude(ip => ip.Coverages)
                .Include(p => p.Customer)
                .FirstOrDefaultAsync(p => p.Id == id);
        }

        public async Task<List<Policy?>> GetByCustomerIdAsync(int customerId)
        {
            return await _context.Policies
                .Include(p => p.InsurancePlan)
                    .ThenInclude(ip => ip.Coverages)
                .Where(p => p.CustomerId == customerId)
                .ToListAsync();
        }

        public async Task<InsurancePlan?> GetByPlanId(int id)
        {
            return await _context.InsurancePlans
                .Include(p => p.Coverages)
                .Include(p => p.PremiumRule)
                .FirstOrDefaultAsync(p => p.Id == id);
        }

        public async Task UpdatePlanAsync(InsurancePlan plan)
        {
            _context.InsurancePlans.Update(plan);
            await _context.SaveChangesAsync();
        }

        public async Task<Policy?> GetPolicyWithDetailsAsync(int id)
        {
            return await _context.Policies
                .Include(p => p.Customer)
                .Include(p => p.Agent)
                .Include(p => p.InsurancePlan)
                    .ThenInclude(ip => ip.Coverages)
                .FirstOrDefaultAsync(p => p.Id == id);
        }

        public async Task<IEnumerable<Policy>> GetPoliciesWithDetailsAsync()
        {
            return await _context.Policies
                .Include(p => p.Customer)
                .Include(p => p.Agent)
                .Include(p => p.InsurancePlan)
                .ToListAsync();
        }

        public async Task<List<PolicyResponseDto>> GetActivePoliciesAsync(int customerId)
        {
            return await _context.Policies
                .Where(p => p.CustomerId == customerId && p.Status == "Active")
                .Select(p => new PolicyResponseDto(
                    p.Id,
                    p.InsurancePlanId,
                    p.InsurancePlan.PolicyName,
                    p.StartDate,
                    p.EndDate,
                    p.PremiumAmount,
                    p.Status,
                    p.DestinationCountry,
                    p.AgeMultiplier
                ))
                .ToListAsync();
        }

        public async Task<List<PaymentPendingPolicyDto>> GetPaymentPendingPoliciesAsync(int customerId)
        {
            return await _context.Policies
                .Where(p => p.CustomerId == customerId && p.Status == "PaymentPending")
                .Select(p => new PaymentPendingPolicyDto(
                    p.Id,
                    p.InsurancePlanId,
                    p.InsurancePlan.PolicyName,
                    p.StartDate,
                    p.EndDate,
                    p.PremiumAmount,
                    p.DestinationCountry,
                    p.AgeMultiplier
                ))
                .ToListAsync();
        }

        public async Task UpdateAsync(Policy policy)
        {
            _context.Policies.Update(policy);
            await _context.SaveChangesAsync();
        }

        public async Task<Claim?> GetClaimByIdAsync(int claimId)
        {
            return await _context.Claims.FirstOrDefaultAsync(c => c.Id == claimId);
        }

        public async Task AddPaymentAsync(Payment payment)
        {
            await _context.Payments.AddAsync(payment);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateClaimAsync(Claim claim)
        {
            _context.Claims.Update(claim);
            await _context.SaveChangesAsync();
        }

        public async Task AddAsync(Policy policy)
        {
            await _context.Policies.AddAsync(policy);
            await _context.SaveChangesAsync();
        }

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }
    }
}