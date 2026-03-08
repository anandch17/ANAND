using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TravelInsurance.Application.Common;
using TravelInsurance.Application.Dtos;
using TravelInsurance.Application.Interfaces.Repositories;
using TravelInsurance.Application.Interfaces.Services;

namespace TravelInsurance.Application.Services
{
    public class UserService : IUserService
    {
        private readonly IUserRepository _userRepository;

        public UserService(IUserRepository userRepository)
        {
            _userRepository = userRepository;
        }

        public async Task ActivateUserAsync(int id)
        {
            var user = await _userRepository.GetByIdAsync(id);
            if (user == null) throw new AppException("User not found",404);
            if (user.IsActive) throw new AppException("Already active",400);

            user.IsActive = true;
            await _userRepository.UpdateAsync(user);
        }

        public async Task DeactivateUserAsync(int id)
        {
            var user = await _userRepository.GetByIdAsync(id);
            if (user == null) throw new AppException("User not found",404);
            if (!user.IsActive) throw new AppException("Already inactive", 401);

            user.IsActive = false;
            await _userRepository.UpdateAsync(user);
        }

        public async Task<IEnumerable<UserResponseDto>> GetAgentsAsync()
        {
            var agents = await _userRepository.GetAgentsAsync();
            return agents.Select(a => new UserResponseDto(
        a.Id,
        a.Name,
        a.Email,
        "Agent",
        a.IsActive));
        }

        public async Task<IEnumerable<UserResponseDto>> GetCustomersAsync()
        {
            var users = await _userRepository.GetAllAsync();
            return users.Where(u => u.Role == "Customer")
                .Select(u => new UserResponseDto(u.Id, u.Name, u.Email, u.Role, u.IsActive));
        }

        public async Task<IEnumerable<UserResponseDto>> GetClaimOfficersAsync()
        {
            var users = await _userRepository.GetAllAsync();
            return users.Where(u => u.Role == "ClaimOfficer")
                .Select(u => new UserResponseDto(u.Id, u.Name, u.Email, u.Role, u.IsActive));
        }

        public async Task<AuthDto.UserProfileDto> GetProfileAsync(int userId)
        {
            var user = await _userRepository.GetByIdAsync(userId);
            if (user == null) throw new AppException("User not found",404);

            return new AuthDto.UserProfileDto(
                user.Id,
                user.Name,
                user.Email,
                user.Role,
                user.DateOfBirth
            );
        }
    }
}
