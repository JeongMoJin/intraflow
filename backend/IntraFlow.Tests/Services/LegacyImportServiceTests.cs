using System.Text;
using IntraFlow.Api.Data;
using IntraFlow.Api.Entities;
using IntraFlow.Api.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;

namespace IntraFlow.Tests.Services;

public sealed class LegacyImportServiceTests
{
    [Fact]
    public async Task ImportAsync_ImportsValidRows_AndLogsInvalidRows()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;
        await using var db = new AppDbContext(options);
        db.Employees.Add(new Employee
        {
            EmployeeNo = "EXIST-1",
            Name = "Existing",
            Email = "existing@example.com",
            Department = "IT",
            Position = "Developer",
            Role = "Employee"
        });
        await db.SaveChangesAsync();

        var accessor = new HttpContextAccessor { HttpContext = new DefaultHttpContext() };
        var audit = new AuditService(db, accessor);
        var service = new LegacyImportService(db, audit);
        var csv = """
EmployeeNo,Name,Email,Department,Position,Role
NEW-1,Valid User,valid@example.com,IT,Developer,Employee
NEW-2,Bad Email,bad-email,IT,Developer,Employee
EXIST-1,Duplicate User,dup@example.com,IT,Developer,Employee
""";
        await using var stream = new MemoryStream(Encoding.UTF8.GetBytes(csv));

        var result = await service.ImportAsync("test.csv", stream, CancellationToken.None);

        Assert.Equal(3, result.TotalRows);
        Assert.Equal(1, result.SuccessCount);
        Assert.Equal(2, result.FailedCount);
        Assert.True(await db.Employees.AnyAsync(x => x.EmployeeNo == "NEW-1"));
        Assert.Equal(2, await db.LegacyImportLogs.CountAsync());
        Assert.True(await db.AuditLogs.AnyAsync(x => x.Action == "LegacyImportExecuted"));
    }
}
