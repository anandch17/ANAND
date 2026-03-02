using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using  TravelInsurance.Application.Dtos;
using static TravelInsurance.Application.Dtos.AuthDto;

namespace TravelInsurance.Application.Interfaces.Services
{
    public interface IAuthService
    {
         Task<string> RegisterAsync(RegisterDto dto);
        Task AgentCoRegisterAsync(AgenentCoRegisterDto dto);
        Task<string> LoginAsync(LoginDto dto);
        Task<string> ForgotPasswordAsync(ForgotPasswordDto dto);
        Task ResetPasswordAsync(ResetPasswordDto dto);
    }
}
