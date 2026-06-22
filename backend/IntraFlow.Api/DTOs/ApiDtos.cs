namespace IntraFlow.Api.DTOs;

public sealed record LoginRequest(string Email, string Password);
public sealed record LoginResponse(string Token, string Email, string Role, int UserId, int? EmployeeId, DateTime ExpiresAt);

public sealed record EmployeeDto(int Id, string EmployeeNo, string Name, string Email, string Department, string Position, string Role, bool IsActive, string Source, DateTime CreatedAt, DateTime UpdatedAt);
public sealed record UpsertEmployeeRequest(string EmployeeNo, string Name, string Email, string Department, string Position, string Role, bool IsActive);

public sealed record ProjectDto(int Id, string ProjectCode, string Name, string Description, string Department, int? OwnerEmployeeId, string? OwnerName, string Status, DateOnly? StartDate, DateOnly? EndDate, decimal Budget, string Source, DateTime CreatedAt, DateTime UpdatedAt);
public sealed record UpsertProjectRequest(string ProjectCode, string Name, string Description, string Department, int? OwnerEmployeeId, string Status, DateOnly? StartDate, DateOnly? EndDate, decimal Budget);
public sealed record UpdateProjectStatusRequest(string Status);

public sealed record ApprovalDto(int Id, string ApprovalNo, string Title, string Type, int RequesterId, string? RequesterName, int ApproverId, string? ApproverName, decimal Amount, string Status, string Content, DateTime RequestedAt, DateTime? ApprovedAt, DateTime? RejectedAt, string? RejectReason);
public sealed record CreateApprovalRequest(string Title, string Type, int? RequesterId, int? ApproverId, decimal Amount, string Content);
public sealed record RejectApprovalRequest(string RejectReason);

public sealed record DashboardSummaryDto(
    int TotalEmployees,
    int InProgressProjects,
    int PendingApprovals,
    IReadOnlyList<ErpSyncLogDto> RecentErpSyncs,
    IReadOnlyList<AuditLogDto> RecentAuditLogs,
    IReadOnlyList<DashboardCountItemDto> ProjectsByDepartment,
    IReadOnlyList<DashboardCountItemDto> ApprovalsByStatus);

public sealed record DashboardCountItemDto(string Label, int Count);

public sealed record ErpSyncLogDto(int Id, string SyncType, string Status, int ImportedCount, int FailedCount, string Message, string TriggeredBy, DateTime StartedAt, DateTime FinishedAt);
public sealed record ExternalErpRecordDto(int Id, string ExternalSystem, string ExternalId, string EntityName, string PayloadJson, DateTime SyncedAt);
public sealed record ErpSyncResultDto(int LogId, string Status, int ImportedCount, int FailedCount, string Message);

public sealed record LegacyImportLogDto(int Id, string FileName, int RowNumber, string? EmployeeNo, string Status, string Message, string RawValue, DateTime CreatedAt);
public sealed record LegacyImportResultDto(string FileName, int TotalRows, int SuccessCount, int FailedCount, IReadOnlyList<LegacyImportLogDto> Failures);

public sealed record AuditLogDto(int Id, string? UserId, string UserName, string Action, string EntityName, string? EntityId, string? BeforeValue, string? AfterValue, string? IpAddress, DateTime CreatedAt);

public sealed record GraphUserDto(string Id, string DisplayName, string Mail, string Department, string JobTitle);
public sealed record RoleGuideDto(string Role, IReadOnlyList<string> AllowedMenus, IReadOnlyList<string> RestrictedAreas, string Notes);
