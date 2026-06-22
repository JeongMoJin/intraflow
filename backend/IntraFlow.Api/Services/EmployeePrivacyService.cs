using IntraFlow.Api.Auth;
using IntraFlow.Api.DTOs;
using IntraFlow.Api.Entities;

namespace IntraFlow.Api.Services;

public interface IEmployeePrivacyService
{
    EmployeeDto ToDto(Employee employee, string? viewerRole);
    string MaskEmail(string email);
}

public sealed class EmployeePrivacyService : IEmployeePrivacyService
{
    public EmployeeDto ToDto(Employee employee, string? viewerRole)
    {
        var email = viewerRole == RoleNames.Admin ? employee.Email : MaskEmail(employee.Email);
        return new EmployeeDto(
            employee.Id,
            employee.EmployeeNo,
            employee.Name,
            email,
            employee.Department,
            employee.Position,
            employee.Role,
            employee.IsActive,
            employee.Source,
            employee.CreatedAt,
            employee.UpdatedAt);
    }

    public string MaskEmail(string email)
    {
        var atIndex = email.IndexOf('@');
        if (atIndex <= 1)
        {
            return "***";
        }

        return $"{email[0]}***{email[atIndex..]}";
    }
}
