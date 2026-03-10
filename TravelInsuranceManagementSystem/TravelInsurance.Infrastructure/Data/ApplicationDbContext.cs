using Microsoft.EntityFrameworkCore;
using TravelInsurance.Domain.Entities;

namespace TravelInsurance.Infrastructure.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options) { }

        public DbSet<User> Users { get; set; }
        public DbSet<InsurancePlan> InsurancePlans { get; set; }
        public DbSet<Coverage> Coverages { get; set; }
        public DbSet<PremiumRule> PremiumRules { get; set; }
        public DbSet<DestinationRisk> DestinationRisks { get; set; }
        public DbSet<Policy> Policies { get; set; }
        public DbSet<Claim> Claims { get; set; }
        public DbSet<ClaimDocument> ClaimDocuments { get; set; }
        public DbSet<Payment> Payments { get; set; }
        public DbSet<Traveler> Travelers { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // -----------------------------
            // USER → POLICY (Customer)
            // -----------------------------
            modelBuilder.Entity<Policy>()
                .HasOne(p => p.Customer)
                .WithMany(u => u.CustomerPolicies)
                .HasForeignKey(p => p.CustomerId)
                .OnDelete(DeleteBehavior.Restrict);

            // -----------------------------
            // USER → POLICY (Agent optional)
            // -----------------------------
            modelBuilder.Entity<Policy>()
                .HasOne(p => p.Agent)
                .WithMany(u => u.AgentPolicies)
                .HasForeignKey(p => p.AgentId)
                .OnDelete(DeleteBehavior.SetNull);

            // -----------------------------
            // PLAN → COVERAGES (1-to-many)
            // -----------------------------
            modelBuilder.Entity<Coverage>()
                .HasOne(c => c.InsurancePlan)
                .WithMany(p => p.Coverages)
                .HasForeignKey(c => c.InsurancePlanId)
                .OnDelete(DeleteBehavior.Cascade);

            // -----------------------------
            // PLAN → PREMIUM RULE (1-to-1)
            // -----------------------------
            modelBuilder.Entity<PremiumRule>()
                .HasOne(pr => pr.InsurancePlan)
                .WithOne(p => p.PremiumRule)
                .HasForeignKey<PremiumRule>(pr => pr.InsurancePlanId)
                .OnDelete(DeleteBehavior.Cascade);

            // -----------------------------
            // POLICY → CLAIMS (1-to-many)
            // -----------------------------
            modelBuilder.Entity<Claim>()
                .HasOne(c => c.Policy)
                .WithMany(p => p.Claims)
                .HasForeignKey(c => c.PolicyId)
                .OnDelete(DeleteBehavior.Cascade);

            // -----------------------------
            // CLAIM → DOCUMENTS (1-to-many)
            // -----------------------------
            modelBuilder.Entity<ClaimDocument>()
                .HasOne(d => d.Claim)
                .WithMany(c => c.Documents)
                .HasForeignKey(d => d.ClaimId)
                .OnDelete(DeleteBehavior.Cascade);

            // -----------------------------
            // POLICY → PAYMENTS (1-to-many)
            // -----------------------------
            modelBuilder.Entity<Payment>()
                .HasOne(p => p.Policy)
                .WithMany(pol => pol.Payments)
                .HasForeignKey(p => p.PolicyId)
                .OnDelete(DeleteBehavior.Cascade);

            // -----------------------------
            // POLICY → TRAVELERS (1-to-many)
            // -----------------------------
            modelBuilder.Entity<Traveler>()
                .HasOne(t => t.Policy)
                .WithMany(p => p.Travelers)
                .HasForeignKey(t => t.PolicyId)
                .OnDelete(DeleteBehavior.Cascade);

            // -----------------------------
            // CLAIM → ASSIGNED OFFICER
            // -----------------------------
            modelBuilder.Entity<Claim>()
                .HasOne(c => c.AssignedOfficer)
                .WithMany(u => u.AssignedClaims)
                .HasForeignKey(c => c.AssignedOfficerId)
                .OnDelete(DeleteBehavior.Restrict);

          
            modelBuilder.Entity<Policy>()
                .HasOne(p => p.InsurancePlan)
                .WithMany(p => p.Policies)
                .HasForeignKey(p => p.InsurancePlanId)
                .OnDelete(DeleteBehavior.Restrict);

           
         
        }
    }
}