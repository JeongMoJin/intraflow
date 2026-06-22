using System.Text;
using System.Text.RegularExpressions;
using IntraFlow.Api.Auth;
using IntraFlow.Api.Data;
using IntraFlow.Api.DTOs;
using IntraFlow.Api.Entities;
using Microsoft.EntityFrameworkCore;

namespace IntraFlow.Api.Services;

public interface ILegacyImportService
{
    Task<LegacyImportResultDto> ImportAsync(string fileName, Stream csvStream, CancellationToken cancellationToken);
}

public sealed class LegacyImportService(AppDbContext db, IAuditService auditService) : ILegacyImportService
{
    private static readonly Regex EmailRegex = new(@"^[^@\s]+@[^@\s]+\.[^@\s]+$", RegexOptions.Compiled);

    public async Task<LegacyImportResultDto> ImportAsync(string fileName, Stream csvStream, CancellationToken cancellationToken)
    {
        using var reader = new StreamReader(csvStream, Encoding.UTF8, detectEncodingFromByteOrderMarks: true, leaveOpen: true);
        var rows = new List<string>();
        while (!reader.EndOfStream)
        {
            rows.Add(await reader.ReadLineAsync(cancellationToken) ?? "");
        }

        var failures = new List<LegacyImportLog>();
        var successCount = 0;
        var totalRows = Math.Max(rows.Count - 1, 0);
        var existingNos = await db.Employees.Select(x => x.EmployeeNo).ToListAsync(cancellationToken);
        var seenNos = new HashSet<string>(existingNos, StringComparer.OrdinalIgnoreCase);

        for (var i = 1; i < rows.Count; i++)
        {
            var rowNumber = i + 1;
            var raw = rows[i];
            if (string.IsNullOrWhiteSpace(raw))
            {
                continue;
            }

            var columns = raw.Split(',').Select(x => x.Trim()).ToArray();
            if (columns.Length < 6)
            {
                failures.Add(Fail(fileName, rowNumber, null, "Column count is invalid.", raw));
                continue;
            }

            var employeeNo = columns[0];
            var name = columns[1];
            var email = columns[2];
            var department = columns[3];
            var position = columns[4];
            var role = columns[5];

            var error = Validate(employeeNo, name, email, department, role, seenNos);
            if (error is not null)
            {
                failures.Add(Fail(fileName, rowNumber, employeeNo, error, raw));
                continue;
            }

            seenNos.Add(employeeNo);
            db.Employees.Add(new Employee
            {
                EmployeeNo = employeeNo,
                Name = name,
                Email = email,
                Department = department,
                Position = string.IsNullOrWhiteSpace(position) ? "Staff" : position,
                Role = NormalizeRole(role),
                Source = "LegacyCsv",
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            });
            successCount++;
        }

        db.LegacyImportLogs.AddRange(failures);
        await db.SaveChangesAsync(cancellationToken);
        await auditService.LogAsync("LegacyImportExecuted", "LegacyImport", fileName, null, new { fileName, totalRows, successCount, failedCount = failures.Count }, cancellationToken);

        return new LegacyImportResultDto(
            fileName,
            totalRows,
            successCount,
            failures.Count,
            failures.Select(x => new LegacyImportLogDto(x.Id, x.FileName, x.RowNumber, x.EmployeeNo, x.Status, x.Message, x.RawValue, x.CreatedAt)).ToList());
    }

    private static string? Validate(string employeeNo, string name, string email, string department, string role, HashSet<string> seenNos)
    {
        if (string.IsNullOrWhiteSpace(employeeNo) || string.IsNullOrWhiteSpace(name) || string.IsNullOrWhiteSpace(email) || string.IsNullOrWhiteSpace(department))
        {
            return "Required field is missing.";
        }

        if (seenNos.Contains(employeeNo))
        {
            return "Duplicate EmployeeNo.";
        }

        if (!EmailRegex.IsMatch(email))
        {
            return "Invalid email format.";
        }

        var normalizedRole = NormalizeRole(role);
        if (normalizedRole is not (RoleNames.Admin or RoleNames.Manager or RoleNames.Employee))
        {
            return "Invalid role.";
        }

        return null;
    }

    private static LegacyImportLog Fail(string fileName, int rowNumber, string? employeeNo, string message, string raw)
        => new()
        {
            FileName = fileName,
            RowNumber = rowNumber,
            EmployeeNo = employeeNo,
            Status = "Failed",
            Message = message,
            RawValue = raw,
            CreatedAt = DateTime.UtcNow
        };

    private static string NormalizeRole(string role)
        => role.Trim().ToLowerInvariant() switch
        {
            "admin" => RoleNames.Admin,
            "manager" => RoleNames.Manager,
            _ => RoleNames.Employee
        };
}
