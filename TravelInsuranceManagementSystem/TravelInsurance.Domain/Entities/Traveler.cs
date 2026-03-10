using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TravelInsurance.Domain.Entities
{
    public class Traveler
    {
        [Key]
        public int Id { get; set; }

        public int PolicyId { get; set; }

        public string FullName { get; set; } = default!;

        public DateTime DateOfBirth { get; set; }

        public string Aadharcard { get; set; } = default!;

        public string TravelerType { get; set; } = default!;

        public string? Relationship { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [ForeignKey(nameof(PolicyId))]
        public Policy Policy { get; set; } = default!;
    }
}
