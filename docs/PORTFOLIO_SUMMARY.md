# Portfolio Summary

## 1. 프로젝트 한 줄 소개

IntraFlow는 ASP.NET Core .NET 8 기반으로 직원 관리, 프로젝트 관리, 전자결재, ERP 연계, 레거시 CSV import, 감사 로그를 구현한 Art-Tech Operations Console 포트폴리오 프로젝트입니다.

## 2. 문제 정의

사내 시스템 개발자는 단순 CRUD뿐 아니라 권한, 개인정보 보호, 외부 시스템 연계, 운영 로그, 레거시 데이터 이관까지 함께 고려해야 합니다. 이 프로젝트는 그런 실무 흐름을 작은 범위에서 실행 가능하게 재현했고, 실제 미디어아트/아트테크 회사 내부에서 운영 중인 인트라넷이라는 가정으로 정보 구조와 화면 톤을 설계했습니다.

## 3. 해결 방법

백엔드는 ASP.NET Core Web API와 EF Core로 구성하고, 프론트엔드는 React TypeScript와 DevExtreme DataGrid/Chart 중심으로 구현했습니다. 실제 ERP와 Microsoft Graph는 계정 설정이 필요하므로 Mock service와 실제 연동 skeleton을 분리했습니다. UI는 d'strict CAREER 페이지의 흰색 헤더, 어두운 히어로 배너, 큰 섹션 타이틀, 좌측 카테고리 구조를 참고하되, 실제 브랜드 에셋을 복사하지 않고 IntraFlow만의 내부 운영 시스템 화면으로 재해석했습니다.

## 4. 기술스택

.NET 8, ASP.NET Core Web API, EF Core, SQL Server provider 구조, SQLite fallback, React, TypeScript, DevExtreme, JWT Dev Login.

## 5. 주요 기능

- People Directory와 Project Operations
- Approval Flow 요청, 승인, 반려
- ERP Integration 동기화와 실패 케이스
- Legacy Migration CSV import와 실패 로그
- Admin/Manager/Employee 권한 제한
- Audit Trail과 개인정보 마스킹
- Microsoft Graph/Entra ID 확장 구조

## 6. 내가 강조할 역량

요구사항을 기능으로 분해하고, 실행 가능한 MVP로 구현한 점을 강조할 수 있습니다. 단순 CRUD 화면이 아니라 운영 중인 내부 시스템처럼 보이도록 권한별 UX, 운영 로그, ERP 연계 상태, 레거시 이관 흐름을 화면에 드러낸 점도 강조할 수 있습니다. 특히 AI 도구를 활용하되 빌드, 테스트, 보안 기준으로 결과물을 검증했다는 점을 포트폴리오 메시지로 삼을 수 있습니다.

## 7. 채용공고와의 연결점

디스트릭트코리아 인트라넷 시스템 개발자 공고에서 요구하는 ASP.NET Core, C#, EF Core, MSSQL, ERP/전자결재 연계, Microsoft Graph/Entra ID 구조, DevExtreme TypeScript UI를 프로젝트 기능과 문서에 직접 연결했습니다.

## 8. 향후 개선사항

실제 Entra ID SSO 연결, Microsoft Graph SDK 적용, EF Core migration 운영화, ERP retry queue, 승인 라인 다단계화, 프론트 접근성 테스트를 추가할 수 있습니다.
