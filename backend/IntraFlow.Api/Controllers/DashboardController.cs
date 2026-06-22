using IntraFlow.Api.Auth;
using IntraFlow.Api.Data;
using IntraFlow.Api.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace IntraFlow.Api.Controllers;

[Route("api/dashboard")]
[Authorize(Roles = RoleNames.AdminOrManager)]
public sealed class DashboardController(AppDbContext db) : ApiControllerBase
{
    [HttpGet]
    public async Task<ActionResult<DashboardSummaryDto>> Get(CancellationToken cancellationToken)
    {
        var recentSyncs = await db.ErpSyncLogs
            .OrderByDescending(x => x.StartedAt)
            .Take(5)
            .Select(x => new ErpSyncLogDto(x.Id, x.SyncType, x.Status, x.ImportedCount, x.FailedCount, x.Message, x.TriggeredBy, x.StartedAt, x.FinishedAt))
            .ToListAsync(cancellationToken);

        var recentAudits = await db.AuditLogs
            .OrderByDescending(x => x.CreatedAt)
            .Take(8)
            .Select(x => new AuditLogDto(x.Id, x.UserId, x.UserName, x.Action, x.EntityName, x.EntityId, x.BeforeValue, x.AfterValue, x.IpAddress, x.CreatedAt))
            .ToListAsync(cancellationToken);

        var projectsByDepartment = await db.Projects
            .GroupBy(x => x.Department)
            .Select(x => new DashboardCountItemDto(x.Key, x.Count()))
            .ToListAsync(cancellationToken);

        var approvalsByStatus = await db.Approvals
            .GroupBy(x => x.Status)
            .Select(x => new DashboardCountItemDto(x.Key, x.Count()))
            .ToListAsync(cancellationToken);

        return new DashboardSummaryDto(
            await db.Employees.CountAsync(x => x.IsActive, cancellationToken),
            await db.Projects.CountAsync(x => x.Status == "InProgress", cancellationToken),
            await db.Approvals.CountAsync(x => x.Status == "Pending", cancellationToken),
            recentSyncs,
            recentAudits,
            projectsByDepartment,
            approvalsByStatus);
    }
}
