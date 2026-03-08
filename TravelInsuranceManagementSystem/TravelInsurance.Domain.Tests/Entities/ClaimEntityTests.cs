using TravelInsurance.Domain.Entities;
using Xunit;

namespace TravelInsurance.Domain.Tests.Entities;

public class ClaimEntityTests
{
    [Fact]
    public void Claim_DocumentsCollection_InitialisedEmpty()
    {
        var claim = new Claim();
        Assert.NotNull(claim.Documents);
        Assert.Empty(claim.Documents);
    }
}
