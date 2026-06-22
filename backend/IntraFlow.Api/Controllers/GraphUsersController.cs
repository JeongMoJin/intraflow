using IntraFlow.Api.Auth;
using IntraFlow.Api.DTOs;
using IntraFlow.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace IntraFlow.Api.Controllers;

[Route("api/graph-users")]
[Authorize(Roles = RoleNames.AdminOrManager)]
public sealed class GraphUsersController(IGraphUserService graphUserService) : ApiControllerBase
{
    [HttpGet]
    public Task<IReadOnlyList<GraphUserDto>> Get(CancellationToken cancellationToken)
        => graphUserService.GetUsersAsync(cancellationToken);
}
