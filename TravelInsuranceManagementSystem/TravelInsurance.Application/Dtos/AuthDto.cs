using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TravelInsurance.Application.Dtos
{
     public class  AuthDto
    {

     public record RegisterDto(string Username,string Email,string Password,string AadharNo, DateTime DateOfBirth); //only for agent commision rate

        public record AgenentCoRegisterDto(string Username, string Email, string Password,string Role, string AadharNo, DateTime DateOfBirth, int? CommissionRate); //only for agent commision rate

        public record LoginDto(string Email, string Password, string? CaptchaToken = null);

        public record ForgotPasswordDto(string Email);

        public record ResetPasswordDto(string Token, string NewPassword);
        
        public record UserProfileDto(int Id, string Name, string Email, string Role, DateTime? DateOfBirth, decimal? CommissionRate);

    }
}
