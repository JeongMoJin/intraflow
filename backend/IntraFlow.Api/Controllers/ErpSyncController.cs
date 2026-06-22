using IntraFlow.Api.Auth;
using IntraFlow.Api.Data;
using IntraFlow.Api.DTOs;
using IntraFlow.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace IntraFlow.Api.Controllers;

[Route("api/erp-sync")]
[Authorize(Roles = RoleNames.Admin)]
public sealed class ErpSyncController(AppDbContext db, IMockErpService mockErpService) : ApiControllerBase
{
    [HttpGet("logs")]
    public async Task<IReadOnlyList<ErpSyncLogDto>> GetLogs(CancellationToken cancellationToken)
        => await db.ErpSyncLogs
            .OrderByDescending(x => x.StartedAt)
            .Select(x => new ErpSyncLogDto(x.Id, x.SyncType, x.Status, x.ImportedCount, x.FailedCount, x.Message, x.TriggeredBy, x.StartedAt, x.FinishedAt))
            .ToListAsync(cancellationToken);

    [HttpGet("records")]
    public async Task<IReadOnlyList<ExternalErpRecordDto>> GetRecords(CancellationToken cancellationToken)
        => await db.ExternalErpRecords
            .OrderByDescending(x => x.SyncedAt)
            .Select(x => new ExternalErpRecordDto(x.Id, x.ExternalSystem, x.ExternalId, x.EntityName, x.PayloadJson, x.SyncedAt))
            .ToListAsync(cancellationToken);

    [HttpPost("run")]
    public Task<ErpSyncResultDto> Run([FromQuery] bool forceFailure, CancellationToken cancellationToken)
        => mockErpService.RunSyncAsync(CurrentUserEmail, forceFailure, cancellationToken);
}
