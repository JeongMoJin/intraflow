using IntraFlow.Api.Auth;
using IntraFlow.Api.Data;
using IntraFlow.Api.DTOs;
using IntraFlow.Api.Entities;
using IntraFlow.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace IntraFlow.Api.Controllers;

[Route("api/approvals")]
[Authorize]
public sealed class ApprovalsController(AppDbContext db, IAuditService auditService) : ApiControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<ApprovalDto>>> GetList([FromQuery] string? status, [FromQuery] int? requesterId, [FromQuery] int? approverId, CancellationToken cancellationToken)
    {
        var query = db.Approvals
            .Include(x => x.Requester)
            .Include(x => x.Approver)
            .AsNoTracking()
            .AsQueryable();

        if (CurrentRole == RoleNames.Employee)
        {
            query = query.Where(x => x.RequesterId == CurrentEmployeeId);
        }
        else if (CurrentRole == RoleNames.Manager && CurrentEmployeeId.HasValue)
        {
            query = query.Where(x => x.ApproverId == CurrentEmployeeId || x.RequesterId == CurrentEmployeeId);
        }

        if (!string.IsNullOrWhiteSpace(status))
        {
            query = query.Where(x => x.Status == status);
        }

        if (requesterId.HasValue)
        {
            query = query.Where(x => x.RequesterId == requesterId);
        }

        if (approverId.HasValue)
        {
            query = query.Where(x => x.ApproverId == approverId);
        }

        var approvals = await query.OrderByDescending(x => x.RequestedAt).ToListAsync(cancellationToken);
        return approvals.Select(ToDto).ToList();
    }

    [HttpPost]
    public async Task<ActionResult<ApprovalDto>> Create(CreateApprovalRequest request, CancellationToken cancellationToken)
    {
        var requesterId = CurrentRole == RoleNames.Admin && request.RequesterId.HasValue
            ? request.RequesterId.Value
            : CurrentEmployeeId;

        if (requesterId is null)
        {
            return BadRequest(new { message = "Requester employee profile is required." });
        }

        var approverId = request.ApproverId ?? await db.Employees
            .Where(x => x.Role == RoleNames.Manager && x.IsActive)
            .OrderBy(x => x.Id)
            .Select(x => x.Id)
            .FirstOrDefaultAsync(cancellationToken);

        if (approverId == 0)
        {
            return BadRequest(new { message = "Approver is required." });
        }

        var todayPrefix = $"APV-{DateTime.UtcNow:yyyyMMdd}";
        var sequence = await db.Approvals.CountAsync(x => x.ApprovalNo.StartsWith(todayPrefix), cancellationToken) + 1;
        var approval = new Approval
        {
            ApprovalNo = $"{todayPrefix}-{sequence:000}",
            Title = request.Title,
            Type = request.Type,
            RequesterId = requesterId.Value,
            ApproverId = approverId,
            Amount = request.Amount,
            Status = "Pending",
            Content = request.Content,
            RequestedAt = DateTime.UtcNow
        };

        db.Approvals.Add(approval);
        await db.SaveChangesAsync(cancellationToken);
        await auditService.LogAsync("ApprovalRequested", "Approval", approval.Id.ToString(), null, new { approval.ApprovalNo, approval.Title, approval.Type, approval.Amount, approval.Status }, cancellationToken);

        return CreatedAtAction(nameof(GetList), new { id = approval.Id }, ToDto(approval));
    }

    [HttpPost("{id:int}/approve")]
    [Authorize(Roles = RoleNames.AdminOrManager)]
    public async Task<IActionResult> Approve(int id, CancellationToken cancellationToken)
    {
        var approval = await db.Approvals.FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
        if (approval is null)
        {
            return NotFound();
        }

        if (CurrentRole == RoleNames.Manager && approval.ApproverId != CurrentEmployeeId)
        {
            return Forbid();
        }

        if (approval.Status != "Pending")
        {
            return BadRequest(new { message = "Only pending approvals can be approved." });
        }

        var before = new { approval.Status };
        approval.Status = "Approved";
        approval.ApprovedAt = DateTime.UtcNow;
        await db.SaveChangesAsync(cancellationToken);
        await auditService.LogAsync("ApprovalApproved", "Approval", approval.Id.ToString(), before, new { approval.Status, approval.ApprovedAt }, cancellationToken);
        return NoContent();
    }

    [HttpPost("{id:int}/reject")]
    [Authorize(Roles = RoleNames.AdminOrManager)]
    public async Task<IActionResult> Reject(int id, RejectApprovalRequest request, CancellationToken cancellationToken)
    {
        var approval = await db.Approvals.FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
        if (approval is null)
        {
            return NotFound();
        }

        if (CurrentRole == RoleNames.Manager && approval.ApproverId != CurrentEmployeeId)
        {
            return Forbid();
        }

        if (approval.Status != "Pending")
        {
            return BadRequest(new { message = "Only pending approvals can be rejected." });
        }

        var before = new { approval.Status };
        approval.Status = "Rejected";
        approval.RejectedAt = DateTime.UtcNow;
        approval.RejectReason = request.RejectReason;
        await db.SaveChangesAsync(cancellationToken);
        await auditService.LogAsync("ApprovalRejected", "Approval", approval.Id.ToString(), before, new { approval.Status, approval.RejectedAt, approval.RejectReason }, cancellationToken);
        return NoContent();
    }

    private static ApprovalDto ToDto(Approval approval)
        => new(
            approval.Id,
            approval.ApprovalNo,
            approval.Title,
            approval.Type,
            approval.RequesterId,
            approval.Requester?.Name,
            approval.ApproverId,
            approval.Approver?.Name,
            approval.Amount,
            approval.Status,
            approval.Content,
            approval.RequestedAt,
            approval.ApprovedAt,
            approval.RejectedAt,
            approval.RejectReason);
}
