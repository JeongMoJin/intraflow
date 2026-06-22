namespace IntraFlow.Api.Entities;

public sealed class AuditLog
{
    public int Id { get; set; }
    public string? UserId { get; set; }
    public string UserName { get; set; } = "anonymous";
    public string Action { get; set; } = "";
    public string EntityName { get; set; } = "";
    public string? EntityId { get; set; }
    public string? BeforeValue { get; set; }
    public string? AfterValue { get; set; }
    public string? IpAddress { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
