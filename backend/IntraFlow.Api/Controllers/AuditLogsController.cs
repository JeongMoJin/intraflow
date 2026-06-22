using IntraFlow.Api.Auth;
using IntraFlow.Api.Data;
using IntraFlow.Api.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace IntraFlow.Api.Controllers;

[Route("api/audit-logs")]
[Authorize(Roles = RoleNames.Admin)]
public sealed class AuditLogsController(AppDbContext db) : ApiControllerBase
{
    [HttpGet]
    public async Task<IReadOnlyList<AuditLogDto>> Get([FromQuery] string? action, [FromQuery] string? entityName, CancellationToken cancellationToken)
    {
        var query = db.AuditLogs.AsNoTracking().AsQueryable();

        if (!string.IsNullOrWhiteSpace(action))
        {
            query = query.Where(x => x.Action == action);
        }

        if (!string.IsNullOrWhiteSpace(entityName))
        {
            query = query.Where(x => x.EntityName == entityName);
        }

        return await query
            .OrderByDescending(x => x.CreatedAt)
            .Take(200)
            .Select(x => new AuditLogDto(x.Id, x.UserId, x.UserName, x.Action, x.EntityName, x.EntityId, x.BeforeValue, x.AfterValue, x.IpAddress, x.CreatedAt))
            .ToListAsync(cancellationToken);
    }
}
