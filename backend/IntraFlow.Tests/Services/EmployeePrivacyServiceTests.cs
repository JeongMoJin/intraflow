using IntraFlow.Api.Auth;
using IntraFlow.Api.Entities;
using IntraFlow.Api.Services;

namespace IntraFlow.Tests.Services;

public sealed class EmployeePrivacyServiceTests
{
    [Fact]
    public void ToDto_MasksEmail_ForNonAdmin()
    {
        var service = new EmployeePrivacyService();
        var employee = new Employee
        {
            Id = 1,
            EmployeeNo = "IF-1000",
            Name = "테스트",
            Email = "person@example.com",
            Department = "IT",
            Position = "Developer",
            Role = RoleNames.Employee
        };

        var managerView = service.ToDto(employee, RoleNames.Manager);
        var adminView = service.ToDto(employee, RoleNames.Admin);

        Assert.Equal("p***@example.com", managerView.Email);
        Assert.Equal("person@example.com", adminView.Email);
    }
}
