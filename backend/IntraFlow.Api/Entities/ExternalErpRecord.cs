namespace IntraFlow.Api.Entities;

public sealed class ExternalErpRecord
{
    public int Id { get; set; }
    public string ExternalSystem { get; set; } = "MockERP";
    public string ExternalId { get; set; } = "";
    public string EntityName { get; set; } = "";
    public string PayloadJson { get; set; } = "";
    public DateTime SyncedAt { get; set; } = DateTime.UtcNow;
}
