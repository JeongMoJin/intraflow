# Security

## 권한 분리

권한은 Admin, Manager, Employee로 나뉩니다.

- Admin: 전체 기능 접근
- Manager: Dashboard, Projects, Approvals, 제한된 Employees 조회
- Employee: Projects 조회, 본인 Approval 요청, Role Guide

API와 UI 모두 권한 제한을 적용했습니다. API 권한은 `[Authorize(Roles = ...)]`와 controller 내부 business rule로 처리합니다.

## 감사 로그

다음 이벤트를 AuditLog에 기록합니다.

- 로그인 성공/실패
- 직원 등록/수정/비활성화
- 프로젝트 등록/수정/상태 변경
- 결재 요청/승인/반려
- ERP Sync 성공/실패
- Legacy CSV Import 실행
- 401/403 접근 시도

## 개인정보 마스킹

Manager 권한에서는 직원 이메일이 `p***@example.com` 형태로 마스킹됩니다. AuditLog serializer에서도 이메일과 password/clientSecret 형태의 필드를 마스킹합니다.

## 비밀키 관리

저장소에는 실제 secret을 넣지 않습니다. `appsettings.example.json`에는 placeholder만 넣고 실제 운영에서는 다음 방식을 사용합니다.

- 로컬 개발: .NET user-secrets
- CI/CD: 배포 환경 변수
- Azure 운영: Key Vault 또는 관리형 secret store

## Microsoft Graph Secret 관리

Graph 연동은 현재 Mock service와 Real service skeleton으로 분리되어 있습니다. 실제 연동 시에는 client secret을 코드나 appsettings에 저장하지 않고 secret store에서 주입합니다. 권한은 최소 scope로 시작하고 관리자 동의 범위를 문서화해야 합니다.

## 사내 코드/데이터 외부 반출 방지

- AI 도구에 실제 회사 코드, DB dump, token, customer data를 입력하지 않습니다.
- 장애 분석 시 로그도 개인정보와 secret을 제거한 뒤 사용합니다.
- 외부 연계 payload 저장 범위는 운영에서 반드시 최소화합니다.

## 운영 적용 고려사항

- HTTPS 강제와 CORS origin 제한
- refresh token 또는 Entra ID 기반 인증 전환
- AuditLog 보관 기간과 접근 권한 분리
- DB migration과 backup 정책
- ERP 연계 실패 재처리 큐와 알림
