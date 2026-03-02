using Microsoft.AspNetCore.Identity;
using TravelInsurance.Application.Interfaces.Repositories;
using TravelInsurance.Application.Interfaces.Services;
using TravelInsurance.Domain.Entities;
using static TravelInsurance.Application.Dtos.AuthDto;

namespace TravelInsurance.Application.Services
{
    public class AuthService : IAuthService
    {
        private readonly IUserRepository _repo;
        private readonly IJwtService _jwt;
        private readonly IPasswordHasherService _hasher;

        public AuthService(
            IUserRepository repo,
            IJwtService jwt,
            IPasswordHasherService hasher)
        {
            _repo = repo;
            _jwt = jwt;
            _hasher = hasher;
        }

        // ================================
        // 1️⃣ SELF REGISTER (CUSTOMER ONLY)
        // ================================
        public async Task<string> RegisterAsync(RegisterDto dto)
        {
            if (await _repo.ExistsAsync(dto.Email))
                throw new Exception("Email already exists");

            var user = new User
            {
                Name = dto.Username,
                Email = dto.Email,
                Role = "Customer",
                AadharCardNumber = dto.AadharNo,
                DateOfBirth = dto.DateOfBirth,
                DateOfJoin = DateTime.UtcNow,
                CreatedAt = DateTime.UtcNow
               
            };

            user.PasswordHash = _hasher.Hash(user,dto.Password);

            await _repo.AddAsync(user);
            await _repo.SaveChangesAsync();

            return _jwt.GenerateToken(user);
        }

        // =========================================
        // 2️⃣ ADMIN REGISTER (AGENT / CLAIM OFFICER)
        // =========================================
        public async Task AgentCoRegisterAsync(AgenentCoRegisterDto dto)
        {
            if (await _repo.ExistsAsync(dto.Email))
                throw new Exception("Email already exists");

            if (dto.Role != "Agent" && dto.Role != "ClaimOfficer")
                throw new Exception("Invalid role for admin registration");

            var user = new User
            {
                Name = dto.Username,
                Email = dto.Email,
                Role = dto.Role,
                AadharCardNumber = dto.AadharNo,
                DateOfBirth = dto.DateOfBirth,
                CreatedAt = DateTime.UtcNow,
                DateOfJoin= DateTime.UtcNow,
                CommissionRate = dto.CommissionRate
            };

            user.PasswordHash = _hasher.Hash(user,dto.Password);

            await _repo.AddAsync(user);
            await _repo.SaveChangesAsync();

            
        }

        // ================================
        // 3️⃣ LOGIN (EVERYONE)
        // ================================
        public async Task<string> LoginAsync(LoginDto dto)
        {
            var user = await _repo.GetByUserEmailAsync(dto.Email)
                ?? throw new UnauthorizedAccessException("Invalid credentials");

            if (!_hasher.Verify(user,user.PasswordHash, dto.Password))
                throw new UnauthorizedAccessException("Invalid credentials");

            return _jwt.GenerateToken(user);
        }

        public async Task<string> ForgotPasswordAsync(ForgotPasswordDto dto)
        {
            var user = await _repo.GetByUserEmailAsync(dto.Email);
            if (user == null)
                throw new Exception("If this email exists, a reset link will be sent.");

            var token = Convert.ToBase64String(Guid.NewGuid().ToByteArray()).Replace("+", "").Replace("/", "").TrimEnd('=');
            user.ResetToken = token;
            user.ResetTokenExpiry = DateTime.UtcNow.AddHours(1);
            await _repo.UpdateAsync(user);

            return token;
        }

        public async Task ResetPasswordAsync(ResetPasswordDto dto)
        {
            var user = await _repo.GetByResetTokenAsync(dto.Token)
                ?? throw new Exception("Invalid or expired reset token.");

            user.PasswordHash = _hasher.Hash(user, dto.NewPassword);
            user.ResetToken = null;
            user.ResetTokenExpiry = null;
            await _repo.UpdateAsync(user);
        }
    }
}