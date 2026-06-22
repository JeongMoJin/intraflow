namespace IntraFlow.Api.Auth;

public sealed class JwtOptions
{
    public string Issuer { get; set; } = "IntraFlow";
    public string Audience { get; set; } = "IntraFlow.Frontend";
    public string SigningKey { get; set; } = "";
    public int ExpiresMinutes { get; set; } = 120;
}
