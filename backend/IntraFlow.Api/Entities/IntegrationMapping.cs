namespace IntraFlow.Api.Entities;

public sealed class IntegrationMapping
{
    public int Id { get; set; }
    public string ExternalSystem { get; set; } = "MockERP";
    public string ExternalId { get; set; } = "";
    public string InternalEntityName { get; set; } = "";
    public int InternalEntityId { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
