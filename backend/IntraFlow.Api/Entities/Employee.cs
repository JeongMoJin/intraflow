namespace IntraFlow.Api.Entities;

public sealed class Employee
{
    public int Id { get; set; }
    public string EmployeeNo { get; set; } = "";
    public string Name { get; set; } = "";
    public string Email { get; set; } = "";
    public string Department { get; set; } = "";
    public string Position { get; set; } = "";
    public string Role { get; set; } = "Employee";
    public bool IsActive { get; set; } = true;
    public string Source { get; set; } = "Seed";
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
