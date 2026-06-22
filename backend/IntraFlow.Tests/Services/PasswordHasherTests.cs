using IntraFlow.Api.Services;

namespace IntraFlow.Tests.Services;

public sealed class PasswordHasherTests
{
    [Fact]
    public void Verify_ReturnsTrue_ForOriginalPassword()
    {
        var hasher = new PasswordHasher();

        var hash = hasher.Hash("Admin123!");

        Assert.True(hasher.Verify("Admin123!", hash));
        Assert.False(hasher.Verify("wrong-password", hash));
    }
}
