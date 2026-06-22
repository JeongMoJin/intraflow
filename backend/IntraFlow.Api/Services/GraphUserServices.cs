using IntraFlow.Api.DTOs;

namespace IntraFlow.Api.Services;

public interface IGraphUserService
{
    Task<IReadOnlyList<GraphUserDto>> GetUsersAsync(CancellationToken cancellationToken);
}

public sealed class MockGraphUserService : IGraphUserService
{
    public Task<IReadOnlyList<GraphUserDto>> GetUsersAsync(CancellationToken cancellationToken)
    {
        IReadOnlyList<GraphUserDto> users =
        [
            new("mock-graph-001", "김관리", "admin@intraflow.local", "IT Platform", "System Administrator"),
            new("mock-graph-002", "박매니저", "manager@intraflow.local", "Business Operations", "Project Manager"),
            new("mock-graph-003", "이사원", "employee@intraflow.local", "Creative Tech", "Developer")
        ];

        return Task.FromResult(users);
    }
}

public sealed class RealGraphUserService(IConfiguration configuration) : IGraphUserService
{
    public Task<IReadOnlyList<GraphUserDto>> GetUsersAsync(CancellationToken cancellationToken)
    {
        _ = configuration["Graph:TenantId"];
        throw new NotSupportedException("Real Microsoft Graph integration is intentionally left as a skeleton. Configure Microsoft Graph SDK, managed secrets, and delegated/application permissions before enabling it.");
    }
}
