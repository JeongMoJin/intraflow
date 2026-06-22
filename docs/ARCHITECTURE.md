# Architecture

IntraFlow는 포트폴리오 완성도와 실행 가능성을 우선하여 단일 ASP.NET Core Web API 프로젝트 안에 기능별 폴더를 나눈 구조입니다. 과한 Clean Architecture 대신, 채용공고에서 확인하고 싶은 REST API, EF Core, 권한, 연계, 감사 로그 흐름이 잘 보이도록 구성했습니다.

## Backend

- `Controllers`: REST API entrypoint
- `Entities`: EF Core entity
- `Data`: DbContext와 seed
- `Services`: 인증, 감사 로그, ERP Sync, CSV Import, Graph Mock
- `Middleware`: 401/403 접근 시도 감사 로그
- `Auth`: Role 상수와 JWT option

요청 흐름은 `Controller -> Service -> AppDbContext`입니다. 변경 작업은 service 또는 controller에서 저장 후 `IAuditService`를 통해 감사 로그를 남깁니다.

## Frontend

Vite + React + TypeScript 기반이며 라우터 의존성 없이 내부 상태로 화면을 전환합니다. 포트폴리오 MVP에서는 단순성이 중요하므로 사이드바, 상단바, 역할별 메뉴 제한, DevExtreme DataGrid/Chart를 중심으로 구성했습니다.

## Auth

현재 구현은 개발용 JWT 로그인입니다. `AppUser` seed 계정으로 로그인하면 JWT에 user id, email, role, employee id가 포함됩니다. 실제 운영에서는 Entra ID SSO를 붙이고 JWT 발급 주체를 사내 IdP로 전환하는 구조를 문서화했습니다.

## Integration

Mock ERP와 Mock Graph는 실제 외부 계정 없이도 연계 구조를 설명하기 위한 adapter입니다. 실제 운영에서는 service interface는 유지하고 implementation만 교체합니다.
