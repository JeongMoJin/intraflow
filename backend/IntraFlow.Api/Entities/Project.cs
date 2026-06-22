namespace IntraFlow.Api.Entities;

public sealed class Project
{
    public int Id { get; set; }
    public string ProjectCode { get; set; } = "";
    public string Name { get; set; } = "";
    public string Description { get; set; } = "";
    public string Department { get; set; } = "";
    public int? OwnerEmployeeId { get; set; }
    public string Status { get; set; } = "Planned";
    public DateOnly? StartDate { get; set; }
    public DateOnly? EndDate { get; set; }
    public decimal Budget { get; set; }
    public string Source { get; set; } = "Seed";
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public Employee? OwnerEmployee { get; set; }
}
