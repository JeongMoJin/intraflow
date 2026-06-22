using IntraFlow.Api.Auth;
using IntraFlow.Api.Data;
using IntraFlow.Api.DTOs;
using IntraFlow.Api.Entities;
using IntraFlow.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace IntraFlow.Api.Controllers;

[Route("api/projects")]
[Authorize]
public sealed class ProjectsController(AppDbContext db, IAuditService auditService) : ApiControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<ProjectDto>>> GetList([FromQuery] string? search, [FromQuery] string? department, [FromQuery] string? status, CancellationToken cancellationToken)
    {
        var query = db.Projects.Include(x => x.OwnerEmployee).AsNoTracking().AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            query = query.Where(x => x.Name.Contains(search) || x.ProjectCode.Contains(search));
        }

        if (!string.IsNullOrWhiteSpace(department))
        {
            query = query.Where(x => x.Department == department);
        }

        if (!string.IsNullOrWhiteSpace(status))
        {
            query = query.Where(x => x.Status == status);
        }

        var projects = await query.OrderByDescending(x => x.UpdatedAt).ToListAsync(cancellationToken);
        return projects.Select(ToDto).ToList();
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<ProjectDto>> GetById(int id, CancellationToken cancellationToken)
    {
        var project = await db.Projects.Include(x => x.OwnerEmployee).AsNoTracking().FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
        return project is null ? NotFound() : ToDto(project);
    }

    [HttpPost]
    [Authorize(Roles = RoleNames.AdminOrManager)]
    public async Task<ActionResult<ProjectDto>> Create(UpsertProjectRequest request, CancellationToken cancellationToken)
    {
        if (await db.Projects.AnyAsync(x => x.ProjectCode == request.ProjectCode, cancellationToken))
        {
            return Conflict(new { message = "ProjectCode already exists." });
        }

        var project = new Project
        {
            ProjectCode = request.ProjectCode,
            Name = request.Name,
            Description = request.Description,
            Department = request.Department,
            OwnerEmployeeId = request.OwnerEmployeeId,
            Status = request.Status,
            StartDate = request.StartDate,
            EndDate = request.EndDate,
            Budget = request.Budget,
            Source = "Manual",
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        db.Projects.Add(project);
        await db.SaveChangesAsync(cancellationToken);
        await auditService.LogAsync("ProjectCreated", "Project", project.Id.ToString(), null, new { project.ProjectCode, project.Name, project.Status, project.Budget }, cancellationToken);

        return CreatedAtAction(nameof(GetById), new { id = project.Id }, ToDto(project));
    }

    [HttpPut("{id:int}")]
    [Authorize(Roles = RoleNames.AdminOrManager)]
    public async Task<ActionResult<ProjectDto>> Update(int id, UpsertProjectRequest request, CancellationToken cancellationToken)
    {
        var project = await db.Projects.Include(x => x.OwnerEmployee).FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
        if (project is null)
        {
            return NotFound();
        }

        var before = new { project.ProjectCode, project.Name, project.Department, project.OwnerEmployeeId, project.Status, project.Budget };
        project.ProjectCode = request.ProjectCode;
        project.Name = request.Name;
        project.Description = request.Description;
        project.Department = request.Department;
        project.OwnerEmployeeId = request.OwnerEmployeeId;
        project.Status = request.Status;
        project.StartDate = request.StartDate;
        project.EndDate = request.EndDate;
        project.Budget = request.Budget;
        project.UpdatedAt = DateTime.UtcNow;

        await db.SaveChangesAsync(cancellationToken);
        await auditService.LogAsync("ProjectUpdated", "Project", project.Id.ToString(), before, new { project.ProjectCode, project.Name, project.Department, project.OwnerEmployeeId, project.Status, project.Budget }, cancellationToken);

        return ToDto(project);
    }

    [HttpPatch("{id:int}/status")]
    [Authorize(Roles = RoleNames.AdminOrManager)]
    public async Task<IActionResult> UpdateStatus(int id, UpdateProjectStatusRequest request, CancellationToken cancellationToken)
    {
        var project = await db.Projects.FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
        if (project is null)
        {
            return NotFound();
        }

        var before = new { project.Status };
        project.Status = request.Status;
        project.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync(cancellationToken);
        await auditService.LogAsync("ProjectStatusChanged", "Project", project.Id.ToString(), before, new { project.Status }, cancellationToken);
        return NoContent();
    }

    private static ProjectDto ToDto(Project project)
        => new(
            project.Id,
            project.ProjectCode,
            project.Name,
            project.Description,
            project.Department,
            project.OwnerEmployeeId,
            project.OwnerEmployee?.Name,
            project.Status,
            project.StartDate,
            project.EndDate,
            project.Budget,
            project.Source,
            project.CreatedAt,
            project.UpdatedAt);
}
