namespace IntraFlow.Api.Entities;

public sealed class AppUser
{
    public int Id { get; set; }
    public int? EmployeeId { get; set; }
    public string Email { get; set; } = "";
    public string PasswordHash { get; set; } = "";
    public string Role { get; set; } = "Employee";
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? LastLoginAt { get; set; }

    public Employee? Employee { get; set; }
}
