using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TravelInsurance.Domain.Entities
{
    public class Claim
    {
        [Key]
        public int Id { get; set; }

        public int PolicyId { get; set; }

        public string ClaimType { get; set; } = default!;
        public string? Description { get; set; }
        public decimal ClaimAmount { get; set; }
        public string Status { get; set; } = default!;

        public decimal? SettledAmount { get; set; }
        public string? ReviewNotes { get; set; }
        public DateTime? SettledDate { get; set; }

        public int? AssignedOfficerId { get; set; }

        public DateTime CreatedDate { get; set; } = DateTime.UtcNow;

        [ForeignKey(nameof(PolicyId))]
        public Policy Policy { get; set; } = default!;

        [ForeignKey(nameof(AssignedOfficerId))]
        public User? AssignedOfficer { get; set; } 

        public ICollection<ClaimDocument> Documents { get; set; } = new List<ClaimDocument>();
    }
}