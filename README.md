# IntraFlow

AI-assisted Enterprise Intranet & ERP Workflow System

IntraFlow는 디스트릭트코리아 “인트라넷 시스템 개발자” 포지션을 염두에 둔 ASP.NET Core .NET 8 기반 사내 인트라넷 포트폴리오 프로젝트입니다. 직원 관리, 프로젝트 관리, 전자결재, Mock ERP 연계, 레거시 CSV Import, 권한 관리, 감사 로그를 하나의 관리자 시스템으로 구현했습니다.

IntraFlow는 단순 기능 데모가 아니라, 실제 사내 인트라넷이 운영 중이라는 가정으로 정보 구조, 권한별 UX, 운영 로그, ERP 연계 상태, 레거시 데이터 이관 흐름을 설계한 포트폴리오 프로젝트입니다. 프론트엔드는 d'strict CAREER 페이지의 흰색 헤더, 어두운 히어로 배너, 큰 섹션 타이틀, 좌측 카테고리와 우측 직무공고형 정보 구조를 참고하되, 실제 로고나 이미지는 사용하지 않고 IntraFlow만의 내부 운영 시스템 UI로 재해석했습니다.

기본 개발 환경에서는 빠른 실행을 위해 SQLite fallback을 제공하지만, 실제 사내 인트라넷 운영 환경을 가정하여 EF Core 기반 SQL Server provider 전환 구조와 docker-compose 설정을 함께 제공합니다.

| 기술              | IntraFlow에서 구현한 내용                           |
| ----------------------- | -------------------------------------------- |
| ASP.NET Core /.NET 8    | 백엔드 REST API 구현                              |
| EF Core / MSSQL         | EF Core 기반 DB 접근 및 SQL Server provider 전환 구조 |
| ERP 연계                  | Mock ERP Sync 및 동기화 로그                       |
| 전자결재                    | Approval Workflow                            |
| Microsoft Graph         | Mock Graph Service 및 실제 연동 skeleton          |
| Entra ID SSO            | SSO 확장 구조 및 권한 관리                            |
| DevExtreme + TypeScript | 관리자 UI 구현                                    |
| 레거시 유지보수                | CSV Import 및 LegacyImportLog                 |
| AI 코딩 도구 활용             | AI_DEVELOPMENT_LOG 문서화                       |
| 보안 감수성                  | 권한 분리, 감사 로그, 개인정보 마스킹                       |

## 기술스택

- Backend: .NET 8, ASP.NET Core Web API, C#, EF Core, Swagger, JWT Dev Login
- Database: SQLite fallback, SQL Server provider 전환 구조, docker-compose SQL Server
- Frontend: Vite, React, TypeScript, DevExtreme React DataGrid/Chart, Axios, career-page inspired operations UI
- Security: Role 기반 접근 제어, AuditLog, 이메일 마스킹, secret 미커밋 원칙

## 실행 방법

### 1. 백엔드 실행

```bash
cd backend/IntraFlow.Api
dotnet run --launch-profile http
```

Swagger:

```txt
http://localhost:5121/swagger
```

기본 설정은 SQLite fallback입니다. 최초 실행 시 `backend/IntraFlow.Api/App_Data/intraflow-dev.db`가 생성되고 seed 데이터가 들어갑니다.

### 2. 프론트엔드 실행

```bash
cd frontend
npm install
npm run dev
```

브라우저:

```txt
http://localhost:5173
```

### 3. SQL Server로 실행하기

Docker가 설치된 환경에서는 다음 명령으로 SQL Server를 띄울 수 있습니다.

```bash
cp .env.example .env
docker compose up -d
```

그 다음 `backend/IntraFlow.Api/appsettings.Development.json` 또는 환경 변수에서 다음처럼 provider를 전환합니다.

```json
{
  "DatabaseProvider": "SqlServer"
}
```

SQL Server connection string 예시는 `backend/IntraFlow.Api/appsettings.example.json`에 있습니다. 실제 운영 secret은 user-secrets, 환경 변수, Key Vault 같은 외부 secret store를 사용해야 합니다.

### 4. Vercel 프론트엔드 배포

Vercel에는 `frontend`의 Vite/React 정적 프론트엔드를 배포합니다. 실제 .NET 8 API는 별도 서버(Azure App Service, VM, Render/Railway 등)에 배포한 뒤 `VITE_API_BASE_URL`로 연결하는 구조입니다.

현재 포트폴리오 시연 URL:

```txt
https://intraflow-livid.vercel.app
```

배포 명령:

```bash
cd frontend
vercel --prod
```

배포 URL에서 별도 백엔드가 연결되지 않은 경우에도 화면 탐색과 주요 버튼 시연이 가능하도록 프론트엔드에는 정적 데모용 Mock API fallback을 제공합니다. 로컬 또는 운영 API가 살아 있으면 실제 ASP.NET Core API를 우선 사용합니다.

## 테스트 계정

| Role | Email | Password |
| --- | --- | --- |
| Admin | admin@intraflow.local | Admin123! |
| Manager | manager@intraflow.local | Manager123! |
| Employee | employee@intraflow.local | Employee123! |

위 계정은 개발 데모용 seed 계정입니다. 실제 운영용 비밀번호 정책이나 계정 관리 방식이 아닙니다.

## 주요 기능

- Dashboard: 운영 KPI, 진행 프로젝트, 대기 결재, ERP Sync, AuditLog, DevExtreme Chart
- People Directory: 직원 CRUD, 비활성화, 검색/필터, 권한별 이메일 마스킹
- Project Operations: 프로젝트 등록/수정, 상태/담당자/예산 관리
- Approval Flow: 휴가, 지출결의서, 프로젝트 예산 승인 요청/승인/반려
- ERP Integration: Mock ERP 데이터 동기화, 성공/실패 로그, 외부 레코드 출처 표시
- Legacy Migration: CSV import, 중복/이메일/필수값 검증, 실패 로그 저장
- Audit Trail: 로그인, 변경, 승인/반려, ERP/CSV 실행, 권한 없는 접근 기록
- Access Model: Microsoft Graph mock, Role별 메뉴 제한, API authorization 설명

## 폴더 구조

```txt
intraflow/
  backend/
    IntraFlow.Api/
    IntraFlow.Tests/
  frontend/
    src/
      api/
      components/
      hooks/
      pages/
      types/
  docs/
  samples/
  docker-compose.yml
  README.md
  TASKS.md
```

## 주요 화면

- Login: CAREER 페이지형 히어로와 Admin/Manager/Employee 빠른 로그인
- Operations Dashboard: 운영 지표와 최근 로그를 DevExtreme Chart/DataGrid로 표시
- People/Projects/Approvals: 실제 내부 운영 콘솔처럼 요약 카드와 업무 표 제공
- ERP Integration/Legacy Migration/Audit Trail: 운영 연계와 유지보수 시나리오 확인
- Access Model: 권한별 메뉴, 개인정보 노출 차이, Mock Graph 사용자 확인

## 검증 명령

```bash
dotnet build backend/IntraFlow.slnx
dotnet test backend/IntraFlow.slnx
cd frontend
npm run build
```

## 보안 주의사항

- 실제 secret, tenant secret, access token은 저장소에 커밋하지 않습니다.
- `appsettings.example.json`은 예시값만 포함합니다.
- 감사 로그에는 이메일과 비밀번호성 필드를 마스킹합니다.
- Manager/Employee 권한에서는 개인정보와 운영 기능 접근을 제한합니다.

## 한계점

- 실제 Microsoft Graph/Entra ID 로그인은 skeleton과 문서화 수준입니다.
- SQL Server migration 파일 대신 `EnsureCreated` 기반 데모 실행을 우선했습니다.
- DevExtreme 번들 크기는 MVP에서는 코드 스플리팅보다 구현 검증을 우선했습니다.
- Vercel 배포 URL은 프론트엔드 정적 시연이며, 실제 백엔드 운영 배포는 별도 호스팅과 `VITE_API_BASE_URL` 연결이 필요합니다.

## 향후 개선사항

- Entra ID SSO 실제 연결 및 Microsoft Graph SDK 연동
- EF Core migration 분리와 운영 배포 profile 구성
- 승인 라인 다단계화, 첨부 파일, 알림 기능
- ERP 재처리 큐와 장애 모니터링 대시보드
- 프론트 코드 스플리팅과 접근성 테스트 강화
