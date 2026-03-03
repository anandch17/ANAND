using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TravelInsurance.Domain.Entities
{
    public class Policy
    {
        [Key]
        public int Id { get; set; }

        public int CustomerId { get; set; }
        public int? AgentId { get; set; }

        public int InsurancePlanId { get; set; }

        public string DestinationCountry { get; set; } = default!;

        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }

        public decimal PremiumAmount { get; set; }
        public string Status { get; set; } = default!;

        public decimal AgeMultiplier { get; set; } = 1.0m;
        public int PurchaseAge { get; set; }

        // Navigation
        public User Customer { get; set; } = default!;
        public User? Agent { get; set; }

        public InsurancePlan InsurancePlan { get; set; } = default!;

        public ICollection<Claim> Claims { get; set; } = new List<Claim>();
        public ICollection<Payment> Payments { get; set; } = new List<Payment>();
    }
}