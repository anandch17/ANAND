using TravelInsurance.Domain.Entities;

namespace TravelInsurance.Application.Interfaces.Repositories
{
    public interface IDestinationRiskRepository
    {
        Task<DestinationRisk?> GetByDestinationAsync(string destination);
        Task<IEnumerable<DestinationRisk>> GetAllAsync();
        Task AddAsync(DestinationRisk risk);
        Task UpdateAsync(DestinationRisk risk);
        Task DeleteAsync(int id);
        Task SaveChangesAsync();
    }
}
