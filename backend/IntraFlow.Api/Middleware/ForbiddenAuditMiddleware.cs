using System.Security.Claims;
using IntraFlow.Api.Data;
using IntraFlow.Api.Entities;

namespace IntraFlow.Api.Middleware;

public sealed class ForbiddenAuditMiddleware(RequestDelegate next)
{
    public async Task InvokeAsync(HttpContext context)
    {
        await next(context);

        if (!context.Request.Path.StartsWithSegments("/api") ||
            context.Response.StatusCode is not (StatusCodes.Status401Unauthorized or StatusCodes.Status403Forbidden))
        {
            return;
        }

        var db = context.RequestServices.GetRequiredService<AppDbContext>();
        db.AuditLogs.Add(new AuditLog
        {
            UserId = context.User.FindFirstValue(ClaimTypes.NameIdentifier),
            UserName = context.User.Identity?.IsAuthenticated == true ? context.User.Identity.Name ?? "authenticated-user" : "anonymous",
            Action = context.Response.StatusCode == StatusCodes.Status403Forbidden ? "ForbiddenAccess" : "UnauthorizedAccess",
            EntityName = "HttpRequest",
            EntityId = context.Request.Path,
            AfterValue = $"{{\"method\":\"{context.Request.Method}\",\"statusCode\":{context.Response.StatusCode}}}",
            IpAddress = context.Connection.RemoteIpAddress?.ToString(),
            CreatedAt = DateTime.UtcNow
        });
        await db.SaveChangesAsync();
    }
}
