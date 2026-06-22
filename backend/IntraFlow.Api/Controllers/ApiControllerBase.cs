using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;

namespace IntraFlow.Api.Controllers;

[ApiController]
public abstract class ApiControllerBase : ControllerBase
{
    protected int CurrentUserId => int.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var id) ? id : 0;
    protected string CurrentUserEmail => User.FindFirstValue(ClaimTypes.Email) ?? User.Identity?.Name ?? "anonymous";
    protected string CurrentRole => User.FindFirstValue(ClaimTypes.Role) ?? "";
    protected int? CurrentEmployeeId => int.TryParse(User.FindFirstValue("employeeId"), out var id) ? id : null;
}
