using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TravelInsurance.Application.Dtos
{
    public record RaiseClaimDto(
    int PolicyId,
    string ClaimType,
    string? Description,
    decimal ClaimAmount,
    List<string> DocumentUrls
);

    public record ClaimWithDocumentsDto(
       int ClaimId,
       string ClaimType,
       decimal ClaimAmount,
       string Status,
       List<string> DocumentUrls,
       string? ReviewNotes = null,
       decimal? SettledAmount = null
   );
    public record ClaimResponseDto(
    int ClaimId,
    string ClaimType,
    decimal ClaimAmount,
    string Status
);

    public record ReviewClaimDto(
    string Status, // Approved / Rejected
    string? ReviewNotes,
    decimal SettledAmount
);

    public record SettleClaimDto(
    decimal SettledAmount
);

}
