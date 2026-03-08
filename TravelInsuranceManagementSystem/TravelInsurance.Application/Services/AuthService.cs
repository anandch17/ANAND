using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using TravelInsurance.Application.Common;
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
        private readonly IEmailService _email;
        private readonly string _frontendUrl;

        public AuthService(
            IUserRepository repo,
            IJwtService jwt,
            IPasswordHasherService hasher,
            IEmailService email,
            IConfiguration config)
        {
            _repo = repo;
            _jwt = jwt;
            _hasher = hasher;
            _email = email;
            _frontendUrl = config["FrontendUrl"] ?? "http://localhost:4200";
        }

        // ================================
        // 1️⃣ SELF REGISTER (CUSTOMER ONLY)
        // ================================
        public async Task<string> RegisterAsync(RegisterDto dto)
        {
            if (await _repo.ExistsAsync(dto.Email))
                throw new AppException("Email already exists",400);

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

            user.PasswordHash = _hasher.Hash(user, dto.Password);

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
                throw new AppException("Email already exists",400);

            if (dto.Role != "Agent" && dto.Role != "ClaimOfficer")
                throw new AppException("Invalid role for admin registration",401);

            var user = new User
            {
                Name = dto.Username,
                Email = dto.Email,
                Role = dto.Role,
                AadharCardNumber = dto.AadharNo,
                DateOfBirth = dto.DateOfBirth,
                CreatedAt = DateTime.UtcNow,
                DateOfJoin = DateTime.UtcNow,
                CommissionRate = dto.CommissionRate
            };

            user.PasswordHash = _hasher.Hash(user, dto.Password);

            await _repo.AddAsync(user);
            await _repo.SaveChangesAsync();

            // Send welcome email with credentials
            var roleLabel = dto.Role == "Agent" ? "Insurance Agent" : "Claim Officer";
            var loginUrl = $"{_frontendUrl}/login";
            var html = $@"
<div style='font-family:sans-serif;max-width:600px;margin:auto;'>
  <div style='background:linear-gradient(135deg,#0ea5e9,#0284c7);padding:32px;border-radius:12px 12px 0 0;'>
    <h1 style='color:white;margin:0;font-size:24px;'>Welcome to TravelSecure</h1>
    <p style='color:#bae6fd;margin:8px 0 0;'>Your {roleLabel} account has been created</p>
  </div>
  <div style='background:#f8fafc;padding:32px;border-radius:0 0 12px 12px;border:1px solid #e2e8f0;'>
    <p style='color:#475569;'>Hello <strong>{dto.Username}</strong>,</p>
    <p style='color:#475569;'>Your account has been set up by the admin. Here are your login credentials:</p>
    <div style='background:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;padding:16px;margin:16px 0;'>
      <p style='margin:4px 0;color:#1e40af;'><strong>Email:</strong> {dto.Email}</p>
      <p style='margin:4px 0;color:#1e40af;'><strong>Temporary Password:</strong> {dto.Password}</p>
    </div>
    <p style='color:#dc2626;font-size:14px;'>⚠️ Please change your password immediately after logging in for the first time.</p>
    <a href='{loginUrl}' style='display:inline-block;margin-top:16px;padding:12px 24px;background:#0ea5e9;color:white;border-radius:8px;text-decoration:none;font-weight:bold;'>Login to TravelSecure</a>
  </div>
</div>";

            await _email.SendHtmlEmailAsync(dto.Email, $"Your TravelSecure {roleLabel} Account", html);
        }

        // ================================
        // 3️⃣ LOGIN (EVERYONE)
        // ================================
        public async Task<string> LoginAsync(LoginDto dto)
        {
            var user = await _repo.GetByUserEmailAsync(dto.Email)
                ?? throw new AppException("Invalid credentials");

            if (!_hasher.Verify(user, user.PasswordHash, dto.Password))
                throw new AppException("Invalid credentials",401);

            return _jwt.GenerateToken(user);
        }

        // ================================
        // 4️⃣ FORGOT PASSWORD
        // ================================
        public async Task<string> ForgotPasswordAsync(ForgotPasswordDto dto)
        {
            var user = await _repo.GetByUserEmailAsync(dto.Email);
            if (user == null)
                
                return "Email doesnt  exists.";

            // Generate GUID-based token (URL-safe)
            var token = Guid.NewGuid().ToString("N") + Guid.NewGuid().ToString("N");
            user.ResetToken = token;
            user.ResetTokenExpiry = DateTime.UtcNow.AddMinutes(15); // 15-min expiry
            await _repo.UpdateAsync(user);

            var resetLink = $"{_frontendUrl}/reset-password?token={token}";
            var html = $@"
<div style='font-family:sans-serif;max-width:600px;margin:auto;'>
  <div style='background:linear-gradient(135deg,#0ea5e9,#0284c7);padding:32px;border-radius:12px 12px 0 0;'>
    <h1 style='color:white;margin:0;font-size:24px;'>Reset Your Password</h1>
    <p style='color:#bae6fd;margin:8px 0 0;'>TravelSecure Account Recovery</p>
  </div>
  <div style='background:#f8fafc;padding:32px;border-radius:0 0 12px 12px;border:1px solid #e2e8f0;'>
    <p style='color:#475569;'>Hello <strong>{user.Name}</strong>,</p>
    <p style='color:#475569;'>We received a request to reset your password. Click the button below to set a new password. This link will expire in <strong>15 minutes</strong>.</p>
    <a href='{resetLink}' style='display:inline-block;margin:24px 0;padding:14px 28px;background:#0ea5e9;color:white;border-radius:8px;text-decoration:none;font-weight:bold;font-size:16px;'>Reset Password</a>
    <p style='color:#94a3b8;font-size:13px;'>If you did not request a password reset, you can safely ignore this email. Your password will remain unchanged.</p>
    <p style='color:#94a3b8;font-size:12px;'>This link expires at {user.ResetTokenExpiry:HH:mm} UTC.</p>
  </div>
</div>";

            await _email.SendHtmlEmailAsync(dto.Email, "Reset Your TravelSecure Password", html);
            return "If this email exists, a reset link has been sent.";
        }

        // ================================
        // 5️⃣ RESET PASSWORD
        // ================================
        public async Task ResetPasswordAsync(ResetPasswordDto dto)
        {
            var user = await _repo.GetByResetTokenAsync(dto.Token)
                ?? throw new AppException("Invalid or expired reset token.",401);

            // Check expiry
            if (user.ResetTokenExpiry == null || user.ResetTokenExpiry < DateTime.UtcNow)
                throw new AppException("This password reset link has expired. Please request a new one.",400);

            user.PasswordHash = _hasher.Hash(user, dto.NewPassword);
            // Nullify token — marks it as used so it can't be reused
            user.ResetToken = null;
            user.ResetTokenExpiry = null;
            await _repo.UpdateAsync(user);
        }
    }
}