using IntraFlow.Api.Auth;
using IntraFlow.Api.Data;
using IntraFlow.Api.DTOs;
using IntraFlow.Api.Entities;
using IntraFlow.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace IntraFlow.Api.Controllers;

[Route("api/employees")]
[Authorize]
public sealed class EmployeesController(AppDbContext db, IEmployeePrivacyService privacyService, IAuditService auditService) : ApiControllerBase
{
    [HttpGet]
    [Authorize(Roles = RoleNames.AdminOrManager)]
    public async Task<ActionResult<IReadOnlyList<EmployeeDto>>> GetList([FromQuery] string? search, [FromQuery] string? department, [FromQuery] string? role, CancellationToken cancellationToken)
    {
        var query = db.Employees.AsNoTracking().AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            query = query.Where(x => x.Name.Contains(search) || x.EmployeeNo.Contains(search));
        }

        if (!string.IsNullOrWhiteSpace(department))
        {
            query = query.Where(x => x.Department == department);
        }

        if (!string.IsNullOrWhiteSpace(role))
        {
            query = query.Where(x => x.Role == role);
        }

        var employees = await query.OrderBy(x => x.EmployeeNo).ToListAsync(cancellationToken);
        return employees.Select(x => privacyService.ToDto(x, CurrentRole)).ToList();
    }

    [HttpGet("me")]
    public async Task<ActionResult<EmployeeDto>> GetMe(CancellationToken cancellationToken)
    {
        if (CurrentEmployeeId is null)
        {
            return NotFound();
        }

        var employee = await db.Employees.AsNoTracking().FirstOrDefaultAsync(x => x.Id == CurrentEmployeeId, cancellationToken);
        return employee is null ? NotFound() : privacyService.ToDto(employee, RoleNames.Admin);
    }

    [HttpGet("{id:int}")]
    [Authorize(Roles = RoleNames.AdminOrManager)]
    public async Task<ActionResult<EmployeeDto>> GetById(int id, CancellationToken cancellationToken)
    {
        var employee = await db.Employees.AsNoTracking().FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
        return employee is null ? NotFound() : privacyService.ToDto(employee, CurrentRole);
    }

    [HttpPost]
    [Authorize(Roles = RoleNames.Admin)]
    public async Task<ActionResult<EmployeeDto>> Create(UpsertEmployeeRequest request, CancellationToken cancellationToken)
    {
        if (await db.Employees.AnyAsync(x => x.EmployeeNo == request.EmployeeNo, cancellationToken))
        {
            return Conflict(new { message = "EmployeeNo already exists." });
        }

        var employee = new Employee
        {
            EmployeeNo = request.EmployeeNo,
            Name = request.Name,
            Email = request.Email,
            Department = request.Department,
            Position = request.Position,
            Role = NormalizeRole(request.Role),
            IsActive = request.IsActive,
            Source = "Manual",
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        db.Employees.Add(employee);
        await db.SaveChangesAsync(cancellationToken);
        await auditService.LogAsync("EmployeeCreated", "Employee", employee.Id.ToString(), null, new { employee.EmployeeNo, employee.Name, employee.Department, employee.Role }, cancellationToken);

        return CreatedAtAction(nameof(GetById), new { id = employee.Id }, privacyService.ToDto(employee, CurrentRole));
    }

    [HttpPut("{id:int}")]
    [Authorize(Roles = RoleNames.Admin)]
    public async Task<ActionResult<EmployeeDto>> Update(int id, UpsertEmployeeRequest request, CancellationToken cancellationToken)
    {
        var employee = await db.Employees.FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
        if (employee is null)
        {
            return NotFound();
        }

        var before = new { employee.EmployeeNo, employee.Name, employee.Department, employee.Position, employee.Role, employee.IsActive };
        employee.EmployeeNo = request.EmployeeNo;
        employee.Name = request.Name;
        employee.Email = request.Email;
        employee.Department = request.Department;
        employee.Position = request.Position;
        employee.Role = NormalizeRole(request.Role);
        employee.IsActive = request.IsActive;
        employee.UpdatedAt = DateTime.UtcNow;

        await db.SaveChangesAsync(cancellationToken);
        await auditService.LogAsync("EmployeeUpdated", "Employee", employee.Id.ToString(), before, new { employee.EmployeeNo, employee.Name, employee.Department, employee.Position, employee.Role, employee.IsActive }, cancellationToken);

        return privacyService.ToDto(employee, CurrentRole);
    }

    [HttpPatch("{id:int}/deactivate")]
    [Authorize(Roles = RoleNames.Admin)]
    public async Task<IActionResult> Deactivate(int id, CancellationToken cancellationToken)
    {
        var employee = await db.Employees.FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
        if (employee is null)
        {
            return NotFound();
        }

        var before = new { employee.IsActive };
        employee.IsActive = false;
        employee.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync(cancellationToken);
        await auditService.LogAsync("EmployeeDeactivated", "Employee", employee.Id.ToString(), before, new { employee.IsActive }, cancellationToken);
        return NoContent();
    }

    private static string NormalizeRole(string role)
        => role.Trim().ToLowerInvariant() switch
        {
            "admin" => RoleNames.Admin,
            "manager" => RoleNames.Manager,
            _ => RoleNames.Employee
        };
}
