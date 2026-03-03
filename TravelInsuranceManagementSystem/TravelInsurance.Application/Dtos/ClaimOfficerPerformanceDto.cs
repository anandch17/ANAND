namespace TravelInsurance.Application.Dtos
{
    public class ClaimOfficerPerformanceDto
    {
        public int TotalAssigned { get; set; }
        public int ApprovedClaims { get; set; }
        public int RejectedClaims { get; set; }
        public int PendingClaims { get; set; }
        public decimal TotalSettledAmount { get; set; }
    }
}
