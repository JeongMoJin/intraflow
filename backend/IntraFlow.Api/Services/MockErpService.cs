using System.Text.Json;
using IntraFlow.Api.Auth;
using IntraFlow.Api.Data;
using IntraFlow.Api.DTOs;
using IntraFlow.Api.Entities;
using Microsoft.EntityFrameworkCore;

namespace IntraFlow.Api.Services;

public interface IMockErpService
{
    Task<ErpSyncResultDto> RunSyncAsync(string triggeredBy, bool forceFailure, CancellationToken cancellationToken);
}

public sealed class MockErpService(AppDbContext db, IAuditService auditService) : IMockErpService
{
    public async Task<ErpSyncResultDto> RunSyncAsync(string triggeredBy, bool forceFailure, CancellationToken cancellationToken)
    {
        var startedAt = DateTime.UtcNow;

        if (forceFailure)
        {
            var failedLog = new ErpSyncLog
            {
                SyncType = "Manual",
                Status = "Failed",
                ImportedCount = 0,
                FailedCount = 1,
                Message = "Mock ERP timeout. Retry after checking external API health.",
                TriggeredBy = triggeredBy,
                StartedAt = startedAt,
                FinishedAt = DateTime.UtcNow
            };
            db.ErpSyncLogs.Add(failedLog);
            await db.SaveChangesAsync(cancellationToken);
            await auditService.LogAsync("ErpSyncFailed", "ErpSyncLog", failedLog.Id.ToString(), null, new { failedLog.Status, failedLog.Message }, cancellationToken);
            return new ErpSyncResultDto(failedLog.Id, failedLog.Status, failedLog.ImportedCount, failedLog.FailedCount, failedLog.Message);
        }

        var imported = 0;
        var employee = await db.Employees.FirstOrDefaultAsync(x => x.EmployeeNo == "ERP-1001", cancellationToken);
        if (employee is null)
        {
            employee = new Employee
            {
                EmployeeNo = "ERP-1001",
                Name = "ERP 연동직원",
                Email = "erp.user@intraflow.local",
                Department = "ERP Operations",
                Position = "ERP Coordinator",
                Role = RoleNames.Employee,
                Source = "MockERP",
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            db.Employees.Add(employee);
            imported++;
        }

        var project = await db.Projects.FirstOrDefaultAsync(x => x.ProjectCode == "ERP-BUD-1001", cancellationToken);
        if (project is null)
        {
            project = new Project
            {
                ProjectCode = "ERP-BUD-1001",
                Name = "ERP Imported Budget Project",
                Description = "Project created from Mock ERP budget data.",
                Department = "ERP Operations",
                Status = "InProgress",
                Budget = 12500000,
                Source = "MockERP",
                StartDate = DateOnly.FromDateTime(DateTime.Today),
                EndDate = DateOnly.FromDateTime(DateTime.Today.AddDays(90)),
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            db.Projects.Add(project);
            imported++;
        }

        await db.SaveChangesAsync(cancellationToken);

        db.ExternalErpRecords.AddRange(
            new ExternalErpRecord
            {
                ExternalSystem = "MockERP",
                ExternalId = "EMP-ERP-1001",
                EntityName = "Employee",
                PayloadJson = JsonSerializer.Serialize(new { employee.EmployeeNo, employee.Name, employee.Department }),
                SyncedAt = DateTime.UtcNow
            },
            new ExternalErpRecord
            {
                ExternalSystem = "MockERP",
                ExternalId = "PRJ-ERP-BUD-1001",
                EntityName = "Project",
                PayloadJson = JsonSerializer.Serialize(new { project.ProjectCode, project.Name, project.Budget }),
                SyncedAt = DateTime.UtcNow
            });

        db.IntegrationMappings.AddRange(
            new IntegrationMapping { ExternalSystem = "MockERP", ExternalId = "EMP-ERP-1001", InternalEntityName = "Employee", InternalEntityId = employee.Id, CreatedAt = DateTime.UtcNow },
            new IntegrationMapping { ExternalSystem = "MockERP", ExternalId = "PRJ-ERP-BUD-1001", InternalEntityName = "Project", InternalEntityId = project.Id, CreatedAt = DateTime.UtcNow });

        var log = new ErpSyncLog
        {
            SyncType = "Manual",
            Status = "Succeeded",
            ImportedCount = imported,
            FailedCount = 0,
            Message = imported == 0 ? "Mock ERP sync completed. No new records." : "Mock ERP sync completed.",
            TriggeredBy = triggeredBy,
            StartedAt = startedAt,
            FinishedAt = DateTime.UtcNow
        };
        db.ErpSyncLogs.Add(log);
        await db.SaveChangesAsync(cancellationToken);
        await auditService.LogAsync("ErpSyncSucceeded", "ErpSyncLog", log.Id.ToString(), null, new { log.Status, log.ImportedCount }, cancellationToken);

        return new ErpSyncResultDto(log.Id, log.Status, log.ImportedCount, log.FailedCount, log.Message);
    }
}
