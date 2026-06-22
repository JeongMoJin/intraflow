namespace IntraFlow.Api.Auth;

public static class RoleNames
{
    public const string Admin = "Admin";
    public const string Manager = "Manager";
    public const string Employee = "Employee";

    public const string AdminOrManager = $"{Admin},{Manager}";
    public const string AnyUser = $"{Admin},{Manager},{Employee}";
}
