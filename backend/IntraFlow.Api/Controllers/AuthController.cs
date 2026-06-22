using IntraFlow.Api.Data;
using IntraFlow.Api.DTOs;
using IntraFlow.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace IntraFlow.Api.Controllers;

[Route("api/auth")]
public sealed class AuthController(AppDbContext db, IPasswordHasher passwordHasher, IJwtTokenService jwtTokenService, IAuditService auditService) : ApiControllerBase
{
    [HttpPost("login")]
    [AllowAnonymous]
    public async Task<ActionResult<LoginResponse>> Login(LoginRequest request, CancellationToken cancellationToken)
    {
        var normalizedEmail = request.Email.Trim().ToLowerInvariant();
        var user = await db.AppUsers.FirstOrDefaultAsync(x => x.Email.ToLower() == normalizedEmail, cancellationToken);

        if (user is null || !user.IsActive || !passwordHasher.Verify(request.Password, user.PasswordHash))
        {
            await auditService.LogAsync("LoginFailed", "AppUser", null, null, new { email = request.Email, reason = "Invalid credentials or inactive account" }, cancellationToken);
            return Unauthorized(new { message = "Invalid email or password." });
        }

        user.LastLoginAt = DateTime.UtcNow;
        await db.SaveChangesAsync(cancellationToken);

        var (token, expiresAt) = jwtTokenService.CreateToken(user);
        await auditService.LogAsync("LoginSucceeded", "AppUser", user.Id.ToString(), null, new { user.Email, user.Role }, cancellationToken);

        return new LoginResponse(token, user.Email, user.Role, user.Id, user.EmployeeId, expiresAt);
    }
}
