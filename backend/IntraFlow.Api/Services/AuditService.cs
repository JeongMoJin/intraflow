using System.Security.Claims;
using System.Text.Json;
using System.Text.RegularExpressions;
using IntraFlow.Api.Data;
using IntraFlow.Api.Entities;

namespace IntraFlow.Api.Services;

public interface IAuditService
{
    Task LogAsync(string action, string entityName, string? entityId = null, object? before = null, object? after = null, CancellationToken cancellationToken = default);
}

public sealed class AuditService(AppDbContext db, IHttpContextAccessor httpContextAccessor) : IAuditService
{
    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web);
    private static readonly Regex EmailRegex = new(@"([A-Z0-9._%+-])([A-Z0-9._%+-]*)(@[^""\s,}]+)", RegexOptions.IgnoreCase | RegexOptions.Compiled);

    public async Task LogAsync(string action, string entityName, string? entityId = null, object? before = null, object? after = null, CancellationToken cancellationToken = default)
    {
        var httpContext = httpContextAccessor.HttpContext;
        var user = httpContext?.User;
        var userId = user?.FindFirstValue(ClaimTypes.NameIdentifier);
        var userName = user?.Identity?.IsAuthenticated == true
            ? user.Identity.Name ?? "authenticated-user"
            : "anonymous";

        db.AuditLogs.Add(new AuditLog
        {
            UserId = userId,
            UserName = userName,
            Action = action,
            EntityName = entityName,
            EntityId = entityId,
            BeforeValue = SerializeSafe(before),
            AfterValue = SerializeSafe(after),
            IpAddress = httpContext?.Connection.RemoteIpAddress?.ToString(),
            CreatedAt = DateTime.UtcNow
        });

        await db.SaveChangesAsync(cancellationToken);
    }

    private static string? SerializeSafe(object? value)
    {
        if (value is null)
        {
            return null;
        }

        var json = value is string text ? text : JsonSerializer.Serialize(value, JsonOptions);
        json = EmailRegex.Replace(json, match => $"{match.Groups[1].Value}***{match.Groups[3].Value}");
        json = Regex.Replace(json, @"(?i)(""password""\s*:\s*"")[^""]+", "$1***");
        json = Regex.Replace(json, @"(?i)(""clientSecret""\s*:\s*"")[^""]+", "$1***");
        return json.Length > 3000 ? json[..3000] : json;
    }
}
