using System.Text.Json;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TravelInsurance.Application.Interfaces.Services;
using static TravelInsurance.Application.Dtos.AuthDto;

namespace TravelInsurance.WebApi.Controllers
{
    [ApiController]
    [Route("api/auth")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly IConfiguration _config;

        public AuthController(IAuthService authService, IHttpClientFactory httpClientFactory, IConfiguration config)
        {
            _authService = authService;
            _httpClientFactory = httpClientFactory;
            _config = config;
        }

        // 🔹 Customer Self Register
        [HttpPost("register")]
        public async Task<IActionResult> Register(RegisterDto dto)
        {
            var token = await _authService.RegisterAsync(dto);
            return Ok(token);
        }

        // 🔹 Admin Register Agent / ClaimOfficer
        [Authorize(Roles = "Admin")]
        [HttpPost("admin/register")]
        public async Task<IActionResult> RegisterAgent(AgenentCoRegisterDto dto)
        {
            await _authService.AgentCoRegisterAsync(dto);

            return Ok(new
            {
                success = true,
                message = "User created successfully"
            });
        }

        // 🔹 Login
        [HttpPost("login")]
        public async Task<IActionResult> Login(LoginDto dto)
        {
            var secretKey = _config["Recaptcha:SecretKey"];
            if (!string.IsNullOrEmpty(secretKey) && !string.IsNullOrEmpty(dto.CaptchaToken))
            {
                var client = _httpClientFactory.CreateClient();
                var response = await client.GetStringAsync($"https://www.google.com/recaptcha/api/siteverify?secret={secretKey}&response={dto.CaptchaToken}");
                var json = JsonSerializer.Deserialize<JsonElement>(response);
                if (!json.TryGetProperty("success", out var success) || !success.GetBoolean())
                    return BadRequest(new { message = "Captcha verification failed." });
            }
            else if (!string.IsNullOrEmpty(secretKey) && string.IsNullOrEmpty(dto.CaptchaToken))
            {
                return BadRequest(new { message = "Captcha is required." });
            }

            var token = await _authService.LoginAsync(dto);
            return Ok(token);
        }

        // 🔹 Forgot Password
        [HttpPost("forgot-password")]
        public async Task<IActionResult> ForgotPassword(ForgotPasswordDto dto)
        {
            var token = await _authService.ForgotPasswordAsync(dto);
            return Ok(new { token });
        }

        // 🔹 Reset Password
        [HttpPost("reset-password")]
        public async Task<IActionResult> ResetPassword(ResetPasswordDto dto)
        {
            await _authService.ResetPasswordAsync(dto);
            return Ok(new { message = "Password reset successful." });
        }
    }
}
