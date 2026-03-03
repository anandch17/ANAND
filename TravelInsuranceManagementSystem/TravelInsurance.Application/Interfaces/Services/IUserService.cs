using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TravelInsurance.Application.Dtos;

namespace TravelInsurance.Application.Interfaces.Services
{
    public interface IUserService
    {
        Task ActivateUserAsync(int id);
        Task DeactivateUserAsync(int id);
        Task<IEnumerable<UserResponseDto>> GetAgentsAsync();
        Task<IEnumerable<UserResponseDto>> GetCustomersAsync();
        Task<IEnumerable<UserResponseDto>> GetClaimOfficersAsync();
        Task<AuthDto.UserProfileDto> GetProfileAsync(int userId);
    }
}
