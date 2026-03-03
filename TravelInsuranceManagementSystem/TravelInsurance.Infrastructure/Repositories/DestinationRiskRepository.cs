using Microsoft.EntityFrameworkCore;
using TravelInsurance.Application.Interfaces.Repositories;
using TravelInsurance.Domain.Entities;
using TravelInsurance.Infrastructure.Data;

namespace TravelInsurance.Infrastructure.Repositories
{
    public class DestinationRiskRepository : IDestinationRiskRepository
    {
        private readonly ApplicationDbContext _context;

        public DestinationRiskRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<DestinationRisk?> GetByDestinationAsync(string destination)
        {
            return await _context.DestinationRisks
                .FirstOrDefaultAsync(r => r.Destination.ToLower() == destination.ToLower());
        }

        public async Task<IEnumerable<DestinationRisk>> GetAllAsync()
        {
            return await _context.DestinationRisks.ToListAsync();
        }

        public async Task AddAsync(DestinationRisk risk)
        {
            await _context.DestinationRisks.AddAsync(risk);
        }

        public async Task UpdateAsync(DestinationRisk risk)
        {
            _context.DestinationRisks.Update(risk);
            await Task.CompletedTask;
        }

        public async Task DeleteAsync(int id)
        {
            var risk = await _context.DestinationRisks.FindAsync(id);
            if (risk != null)
            {
                _context.DestinationRisks.Remove(risk);
            }
        }

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }
    }
}
