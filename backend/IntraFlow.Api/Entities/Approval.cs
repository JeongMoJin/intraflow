namespace IntraFlow.Api.Entities;

public sealed class Approval
{
    public int Id { get; set; }
    public string ApprovalNo { get; set; } = "";
    public string Title { get; set; } = "";
    public string Type { get; set; } = "Vacation";
    public int RequesterId { get; set; }
    public int ApproverId { get; set; }
    public decimal Amount { get; set; }
    public string Status { get; set; } = "Pending";
    public string Content { get; set; } = "";
    public DateTime RequestedAt { get; set; } = DateTime.UtcNow;
    public DateTime? ApprovedAt { get; set; }
    public DateTime? RejectedAt { get; set; }
    public string? RejectReason { get; set; }

    public Employee? Requester { get; set; }
    public Employee? Approver { get; set; }
}
