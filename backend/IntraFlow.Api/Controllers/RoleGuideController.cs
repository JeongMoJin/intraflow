using IntraFlow.Api.Auth;
using IntraFlow.Api.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace IntraFlow.Api.Controllers;

[Route("api/role-guide")]
[Authorize]
public sealed class RoleGuideController : ApiControllerBase
{
    [HttpGet]
    public IReadOnlyList<RoleGuideDto> Get()
        =>
        [
            new(RoleNames.Admin,
                ["Dashboard", "Employees", "Projects", "Approvals", "ERP Sync", "Legacy Import", "Audit Logs", "Role Guide"],
                [],
                "All demo operations are available. Production should still apply least privilege and approval separation."),
            new(RoleNames.Manager,
                ["Dashboard", "Employees read-only with masked email", "Projects", "Approvals", "Graph Users", "Role Guide"],
                ["ERP Sync", "Legacy Import", "Audit Logs"],
                "Managers can approve assigned approvals and manage projects, but cannot run integration jobs."),
            new(RoleNames.Employee,
                ["Projects", "Own approvals", "Role Guide"],
                ["Employees list", "ERP Sync", "Legacy Import", "Audit Logs"],
                "Employees can request approvals and view project information. Personal data is minimized.")
        ];
}
