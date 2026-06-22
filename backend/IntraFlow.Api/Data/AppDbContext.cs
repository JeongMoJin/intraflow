using IntraFlow.Api.Entities;
using Microsoft.EntityFrameworkCore;

namespace IntraFlow.Api.Data;

public sealed class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<AppUser> AppUsers => Set<AppUser>();
    public DbSet<Employee> Employees => Set<Employee>();
    public DbSet<Project> Projects => Set<Project>();
    public DbSet<Approval> Approvals => Set<Approval>();
    public DbSet<ErpSyncLog> ErpSyncLogs => Set<ErpSyncLog>();
    public DbSet<ExternalErpRecord> ExternalErpRecords => Set<ExternalErpRecord>();
    public DbSet<IntegrationMapping> IntegrationMappings => Set<IntegrationMapping>();
    public DbSet<LegacyImportLog> LegacyImportLogs => Set<LegacyImportLog>();
    public DbSet<AuditLog> AuditLogs => Set<AuditLog>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<AppUser>()
            .HasIndex(x => x.Email)
            .IsUnique();

        modelBuilder.Entity<Employee>()
            .HasIndex(x => x.EmployeeNo)
            .IsUnique();

        modelBuilder.Entity<Project>()
            .HasIndex(x => x.ProjectCode)
            .IsUnique();

        modelBuilder.Entity<Approval>()
            .HasIndex(x => x.ApprovalNo)
            .IsUnique();

        modelBuilder.Entity<Project>()
            .Property(x => x.Budget)
            .HasColumnType("decimal(18,2)");

        modelBuilder.Entity<Approval>()
            .Property(x => x.Amount)
            .HasColumnType("decimal(18,2)");
    }
}
