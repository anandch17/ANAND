using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TravelInsurance.Application.Dtos;
using TravelInsurance.Application.Interfaces.Repositories;
using TravelInsurance.Domain.Entities;
using TravelInsurance.Infrastructure.Data;

namespace TravelInsurance.Infrastructure.Repositories
{
    public class ClaimRepository : IClaimRepository
    {
        private readonly ApplicationDbContext _context;

        public ClaimRepository(ApplicationDbContext context)
        {
            _context = context;
        }
        public async Task<IEnumerable<ClaimListDto>> GetClaimsForAssignmentAsync()
        {
            return await _context.Claims
                .AsNoTracking()
                .Where(c => c.AssignedOfficerId == null)
                .Select(c => new ClaimListDto(
                    c.Id,
                    c.Policy.Id,          
                    c.Policy.Customer.Name,         
                    c.ClaimType,
                    c.ClaimAmount,
                    c.Status
                ))
                .ToListAsync();
        }

        public async Task<IEnumerable<AssignedClaimsDto>> GetAssignedClaimsAsync()
        {
            return await _context.Claims
               .AsNoTracking()
               .Where(c => c.AssignedOfficerId != null)
               .Select(c => new AssignedClaimsDto(
                   c.Id,
                   c.Policy.Id,
                   c.Policy.Customer.Name,
                   c.ClaimType,
                   c.ClaimAmount,
                   c.Policy.Agent != null ? c.Policy.Agent.Name : "",
                   c.Status,
                   c.Documents.Select(d => d.Url).ToList()
               ))
               .ToListAsync();
        }

        public async Task<IEnumerable<AssignedClaimsDto>> GetClaimsByOfficerAsync(int officerId)
        {
            return await _context.Claims
                .AsNoTracking()
                .Where(c => c.AssignedOfficerId == officerId)
                .Select(c => new AssignedClaimsDto(
                    c.Id,
                    c.Policy.Id,
                    c.Policy.Customer.Name,
                    c.ClaimType,
                    c.ClaimAmount,
                    c.Policy.Agent != null ? c.Policy.Agent.Name : "",
                    c.Status,
                    c.Documents.Select(d => d.Url).ToList()
                ))
                .ToListAsync();
        }

        public async Task<Claim?> GetByIdAsync(int id)
        {
            return await _context.Claims
                .FirstOrDefaultAsync(c => c.Id == id);
        }

        public async Task UpdateAsync(Claim claim)
        {
            _context.Claims.Update(claim);
            await _context.SaveChangesAsync();
        }

        public async Task AddAsync(Claim claim)
        {
            await _context.Claims.AddAsync(claim);
            await _context.SaveChangesAsync();
        }

        public async Task<List<ClaimWithDocumentsDto>> GetCustomerClaimsAsync(int customerId)
        {
            return await _context.Claims
     .Where(c => c.Policy.CustomerId == customerId)
     .Select(c => new ClaimWithDocumentsDto(
         c.Id,
         c.ClaimType,
         c.ClaimAmount,
         c.Status,
         c.Documents.Select(d => d.Url).ToList()
     ))
     .ToListAsync();
        }

        public async Task<IEnumerable<Claim>> GetClaimsByOfficerEntitiesAsync(int officerId)
        {
            return await _context.Claims
                .Where(c => c.AssignedOfficerId == officerId)
                .ToListAsync();
        }
    }
}
