using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TravelInsurance.Application.Dtos;

namespace TravelInsurance.Application.Interfaces.Services
{
    public interface IPremiumCalculationService
    {
        Task<CalculatePremiumResponseDto> CalculatePremiumAsync(CalculatePremiumRequestDto dto);
    }
}
