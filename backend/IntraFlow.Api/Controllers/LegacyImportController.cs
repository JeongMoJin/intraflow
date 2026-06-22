using IntraFlow.Api.Auth;
using IntraFlow.Api.Data;
using IntraFlow.Api.DTOs;
using IntraFlow.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace IntraFlow.Api.Controllers;

[Route("api/legacy-import")]
[Authorize(Roles = RoleNames.Admin)]
public sealed class LegacyImportController(AppDbContext db, ILegacyImportService legacyImportService, IWebHostEnvironment environment) : ApiControllerBase
{
    [HttpGet("logs")]
    public async Task<IReadOnlyList<LegacyImportLogDto>> GetLogs(CancellationToken cancellationToken)
        => await db.LegacyImportLogs
            .OrderByDescending(x => x.CreatedAt)
            .Select(x => new LegacyImportLogDto(x.Id, x.FileName, x.RowNumber, x.EmployeeNo, x.Status, x.Message, x.RawValue, x.CreatedAt))
            .ToListAsync(cancellationToken);

    [HttpPost("sample")]
    public async Task<ActionResult<LegacyImportResultDto>> ImportSample(CancellationToken cancellationToken)
    {
        var path = Path.GetFullPath(Path.Combine(environment.ContentRootPath, "..", "..", "samples", "legacy_employees.csv"));
        if (!System.IO.File.Exists(path))
        {
            return NotFound(new { message = $"Sample file not found: {path}" });
        }

        await using var stream = System.IO.File.OpenRead(path);
        return await legacyImportService.ImportAsync("legacy_employees.csv", stream, cancellationToken);
    }

    [HttpPost("upload")]
    [Consumes("multipart/form-data")]
    public async Task<ActionResult<LegacyImportResultDto>> Upload(IFormFile file, CancellationToken cancellationToken)
    {
        if (file.Length == 0)
        {
            return BadRequest(new { message = "CSV file is required." });
        }

        await using var stream = file.OpenReadStream();
        return await legacyImportService.ImportAsync(file.FileName, stream, cancellationToken);
    }
}
