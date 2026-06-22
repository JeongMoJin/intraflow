# Database

## Provider Strategy

기본 개발 실행은 SQLite fallback입니다. Docker나 SQL Server가 없는 PC에서도 백엔드와 프론트를 바로 검증하기 위한 선택입니다.

포트폴리오의 메인 메시지는 MSSQL 대응 가능한 ASP.NET Core 인트라넷입니다. `DatabaseProvider` 설정을 `SqlServer`로 바꾸면 EF Core SQL Server provider를 사용합니다.

## Main Tables

- `AppUsers`: 개발용 로그인 계정
- `Employees`: 직원 마스터
- `Projects`: 사내 프로젝트
- `Approvals`: 전자결재 요청과 상태
- `ErpSyncLogs`: ERP 동기화 실행 결과
- `ExternalErpRecords`: 외부 ERP 원본 payload
- `IntegrationMappings`: 외부 ID와 내부 entity 매핑
- `LegacyImportLogs`: CSV import 실패/검증 로그
- `AuditLogs`: 보안/운영 감사 로그

## Seed Data

Admin, Manager, Employee 계정과 직원, 프로젝트, 결재, ERP Sync 샘플 데이터가 최초 실행 시 생성됩니다.

## SQL Server Run

```bash
docker compose up -d
```

`DatabaseProvider`를 `SqlServer`로 바꾼 후 백엔드를 실행합니다.

## 운영 전환 시 보완

- EF Core migration 파일 관리
- connection string secret 분리
- SQL Server 계정 최소 권한 적용
- AuditLog 보관 주기와 파티셔닝 정책 검토
- ERP 원본 payload 저장 범위 제한
