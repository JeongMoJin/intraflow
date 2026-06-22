using IntraFlow.Api.Auth;
using IntraFlow.Api.Entities;
using IntraFlow.Api.Services;
using Microsoft.EntityFrameworkCore;

namespace IntraFlow.Api.Data;

public static class DataSeeder
{
    public static async Task SeedAsync(AppDbContext db, IPasswordHasher passwordHasher)
    {
        if (await db.AppUsers.AnyAsync())
        {
            return;
        }

        var now = DateTime.UtcNow;
        var employees = new List<Employee>
        {
            new() { EmployeeNo = "IF-0001", Name = "김관리", Email = "admin@intraflow.local", Department = "IT Platform", Position = "System Administrator", Role = RoleNames.Admin, Source = "Seed", CreatedAt = now, UpdatedAt = now },
            new() { EmployeeNo = "IF-0002", Name = "박매니저", Email = "manager@intraflow.local", Department = "Business Operations", Position = "Project Manager", Role = RoleNames.Manager, Source = "Seed", CreatedAt = now, UpdatedAt = now },
            new() { EmployeeNo = "IF-0003", Name = "이사원", Email = "employee@intraflow.local", Department = "Creative Tech", Position = "Developer", Role = RoleNames.Employee, Source = "Seed", CreatedAt = now, UpdatedAt = now },
            new() { EmployeeNo = "IF-0004", Name = "정기획", Email = "planner@intraflow.local", Department = "Business Operations", Position = "Planner", Role = RoleNames.Employee, Source = "Seed", CreatedAt = now, UpdatedAt = now },
            new() { EmployeeNo = "IF-0005", Name = "최연동", Email = "erp.ops@intraflow.local", Department = "IT Platform", Position = "Integration Engineer", Role = RoleNames.Manager, Source = "Seed", CreatedAt = now, UpdatedAt = now }
        };

        db.Employees.AddRange(employees);
        await db.SaveChangesAsync();

        db.AppUsers.AddRange(
            new AppUser { Email = "admin@intraflow.local", PasswordHash = passwordHasher.Hash("Admin123!"), Role = RoleNames.Admin, EmployeeId = employees[0].Id, CreatedAt = now },
            new AppUser { Email = "manager@intraflow.local", PasswordHash = passwordHasher.Hash("Manager123!"), Role = RoleNames.Manager, EmployeeId = employees[1].Id, CreatedAt = now },
            new AppUser { Email = "employee@intraflow.local", PasswordHash = passwordHasher.Hash("Employee123!"), Role = RoleNames.Employee, EmployeeId = employees[2].Id, CreatedAt = now });

        db.Projects.AddRange(
            new Project
            {
                ProjectCode = "DSTR-ERP-001",
                Name = "ERP Budget Sync Pilot",
                Description = "Mock ERP budget data integration flow for intranet operations.",
                Department = "IT Platform",
                OwnerEmployeeId = employees[4].Id,
                Status = "InProgress",
                StartDate = DateOnly.FromDateTime(DateTime.Today.AddDays(-21)),
                EndDate = DateOnly.FromDateTime(DateTime.Today.AddDays(45)),
                Budget = 28000000,
                Source = "Seed",
                CreatedAt = now,
                UpdatedAt = now
            },
            new Project
            {
                ProjectCode = "DSTR-APP-002",
                Name = "Approval Workflow Renewal",
                Description = "Electronic approval workflow for vacation, expenses, and project budget requests.",
                Department = "Business Operations",
                OwnerEmployeeId = employees[1].Id,
                Status = "InProgress",
                StartDate = DateOnly.FromDateTime(DateTime.Today.AddDays(-10)),
                EndDate = DateOnly.FromDateTime(DateTime.Today.AddDays(60)),
                Budget = 18000000,
                Source = "Seed",
                CreatedAt = now,
                UpdatedAt = now
            },
            new Project
            {
                ProjectCode = "DSTR-LEG-003",
                Name = "Legacy HR CSV Migration",
                Description = "Gradual employee data migration from legacy CSV exports.",
                Department = "IT Platform",
                OwnerEmployeeId = employees[0].Id,
                Status = "Planned",
                StartDate = DateOnly.FromDateTime(DateTime.Today.AddDays(7)),
                EndDate = DateOnly.FromDateTime(DateTime.Today.AddDays(35)),
                Budget = 7500000,
                Source = "Seed",
                CreatedAt = now,
                UpdatedAt = now
            });

        db.Approvals.AddRange(
            new Approval
            {
                ApprovalNo = "APV-20260622-001",
                Title = "Creative Tech 휴가 신청",
                Type = "Vacation",
                RequesterId = employees[2].Id,
                ApproverId = employees[1].Id,
                Amount = 0,
                Status = "Pending",
                Content = "프로젝트 릴리즈 이후 1일 연차 사용 요청",
                RequestedAt = now.AddHours(-8)
            },
            new Approval
            {
                ApprovalNo = "APV-20260622-002",
                Title = "ERP Sync 테스트 서버 비용",
                Type = "Expense",
                RequesterId = employees[4].Id,
                ApproverId = employees[0].Id,
                Amount = 450000,
                Status = "Approved",
                Content = "동기화 검증용 테스트 서버 비용",
                RequestedAt = now.AddDays(-2),
                ApprovedAt = now.AddDays(-1)
            });

        db.ErpSyncLogs.Add(new ErpSyncLog
        {
            SyncType = "Seed",
            Status = "Succeeded",
            ImportedCount = 3,
            FailedCount = 0,
            Message = "Initial sample ERP sync log.",
            TriggeredBy = "system",
            StartedAt = now.AddDays(-1),
            FinishedAt = now.AddDays(-1).AddSeconds(3)
        });

        db.AuditLogs.Add(new AuditLog
        {
            UserName = "system",
            Action = "SeedCreated",
            EntityName = "Database",
            AfterValue = "{\"message\":\"Initial portfolio demo data created\"}",
            CreatedAt = now
        });

        await db.SaveChangesAsync();
    }
}
