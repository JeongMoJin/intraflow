# API Spec

Base URL:

```txt
http://localhost:5121
```

Authentication:

```http
Authorization: Bearer {jwt}
```

## Auth

- `POST /api/auth/login`: 개발용 로그인, JWT 발급

## Dashboard

- `GET /api/dashboard`: 운영 요약, Admin/Manager

## Employees

- `GET /api/employees`: 직원 목록, Admin/Manager
- `GET /api/employees/me`: 본인 직원 정보
- `GET /api/employees/{id}`: 직원 상세, Admin/Manager
- `POST /api/employees`: 직원 등록, Admin
- `PUT /api/employees/{id}`: 직원 수정, Admin
- `PATCH /api/employees/{id}/deactivate`: 직원 비활성화, Admin

Manager 조회에서는 이메일이 마스킹됩니다.

## Projects

- `GET /api/projects`: 프로젝트 목록, authenticated
- `GET /api/projects/{id}`: 프로젝트 상세
- `POST /api/projects`: 등록, Admin/Manager
- `PUT /api/projects/{id}`: 수정, Admin/Manager
- `PATCH /api/projects/{id}/status`: 상태 변경, Admin/Manager

## Approvals

- `GET /api/approvals`: 결재 목록, role별 범위 제한
- `POST /api/approvals`: 결재 요청 생성
- `POST /api/approvals/{id}/approve`: 승인, Admin/Manager
- `POST /api/approvals/{id}/reject`: 반려, Admin/Manager

승인/반려는 AuditLog에 기록됩니다.

## ERP Sync

- `GET /api/erp-sync/logs`: 동기화 로그, Admin
- `GET /api/erp-sync/records`: 외부 ERP record, Admin
- `POST /api/erp-sync/run?forceFailure=false`: 동기화 실행, Admin

## Legacy Import

- `GET /api/legacy-import/logs`: 실패 로그, Admin
- `POST /api/legacy-import/sample`: 샘플 CSV import, Admin
- `POST /api/legacy-import/upload`: CSV 업로드 import, Admin

## Audit Logs

- `GET /api/audit-logs`: 감사 로그 조회, Admin

## Graph Users

- `GET /api/graph-users`: Mock Graph 사용자 조회, Admin/Manager

## Role Guide

- `GET /api/role-guide`: 권한별 메뉴와 제한 설명
