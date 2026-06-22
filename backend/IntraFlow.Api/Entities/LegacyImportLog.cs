namespace IntraFlow.Api.Entities;

public sealed class LegacyImportLog
{
    public int Id { get; set; }
    public string FileName { get; set; } = "";
    public int RowNumber { get; set; }
    public string? EmployeeNo { get; set; }
    public string Status { get; set; } = "Failed";
    public string Message { get; set; } = "";
    public string RawValue { get; set; } = "";
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
