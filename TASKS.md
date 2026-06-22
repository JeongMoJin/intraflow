# IntraFlow Task Checklist

## Backend
- [x] Create .NET 8 Web API project
- [x] Configure Swagger/OpenAPI
- [x] Implement EF Core DbContext and entities
- [x] Implement SQL Server provider switching with SQLite fallback
- [x] Implement API controllers for core modules
- [x] Add backend tests for critical business rules

## Frontend
- [x] Create Vite React TypeScript app
- [x] Install and use DevExtreme components
- [x] Implement layout with sidebar and topbar
- [x] Implement required screens
- [x] Apply role-based menu and action restrictions

## Database
- [x] Add SQLite fallback configuration
- [x] Add SQL Server configuration path
- [x] Add docker-compose SQL Server setup
- [x] Add seed data for demo accounts and business records

## Auth & Role
- [x] Implement JWT Dev Login
- [x] Seed Admin, Manager, Employee users
- [x] Add role policies for Admin, Manager, Employee
- [x] Audit login and forbidden access attempts

## ERP Sync
- [x] Implement Mock ERP service
- [x] Add ERP sync API
- [x] Persist sync logs and external record metadata
- [x] Provide success and failure scenarios

## Legacy Import
- [x] Add legacy_employees.csv sample
- [x] Implement CSV import API
- [x] Validate required fields, email format, and duplicate employee numbers
- [x] Persist import success/failure summary logs

## Audit Log
- [x] Implement audit log entity and service
- [x] Record employee, project, approval, ERP, import, login, and forbidden events
- [x] Avoid excessive personal data in audit values

## Microsoft Graph / Entra ID Mock
- [x] Add Graph user DTO
- [x] Implement IGraphUserService
- [x] Implement MockGraphUserService
- [x] Add RealGraphUserService skeleton without secrets
- [x] Document Entra ID and Microsoft Graph extension flow

## Documentation
- [x] Write README.md
- [x] Write ARCHITECTURE.md
- [x] Write DATABASE.md
- [x] Write API_SPEC.md
- [x] Write AI_DEVELOPMENT_LOG.md
- [x] Write SECURITY.md
- [x] Write PORTFOLIO_SUMMARY.md
- [x] Write INTERVIEW_GUIDE.md

## Test & Verification
- [x] Run dotnet build
- [x] Run dotnet test
- [x] Run npm install
- [x] Run npm run build
- [x] Fix build, type, and test failures
- [x] Verify README commands match actual project layout

## Final Portfolio Review
- [x] Review against d'strict intranet developer requirements
- [x] Confirm MSSQL-ready positioning despite SQLite fallback
- [x] Confirm DevExtreme is used in real screens
- [x] Confirm AI usage documents emphasize validation and security
- [x] Finalize limitations and next-step notes
