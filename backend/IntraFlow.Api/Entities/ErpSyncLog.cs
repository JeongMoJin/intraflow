namespace IntraFlow.Api.Entities;

public sealed class ErpSyncLog
{
    public int Id { get; set; }
    public string SyncType { get; set; } = "Manual";
    public string Status { get; set; } = "Succeeded";
    public int ImportedCount { get; set; }
    public int FailedCount { get; set; }
    public string Message { get; set; } = "";
    public string TriggeredBy { get; set; } = "";
    public DateTime StartedAt { get; set; } = DateTime.UtcNow;
    public DateTime FinishedAt { get; set; } = DateTime.UtcNow;
}
