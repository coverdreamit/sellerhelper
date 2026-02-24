# 셀러 보조 사이트 (프론트엔드)

여러 온라인 쇼핑몰 API를 연동하는 셀러 보조 사이트의 **Next.js** 프론트엔드입니다.  
백엔드(Spring Boot) API와 연동하여 사용합니다.

## 기술 스택

- **Next.js 14** (App Router)
- React 18
- **Zustand** (전역 상태)
- **@dnd-kit** (드래그 앤 드롭)
- TypeScript
- Spring Boot 백엔드 연동 (API 프록시: `/api/*` → `http://localhost:5080/api/*`)

## 실행 방법

```bash
yarn
yarn dev
```

브라우저에서 `http://localhost:5000` 접속

## 프로젝트 구조

```
app/                    # Next.js App Router (페이지 라우팅)
├── layout.tsx          # 루트 레이아웃 (사이드바 + 본문)
├── page.tsx            # 대시보드 (/)
├── login/              # 로그인, 회원가입
├── product/            # 상품 목록, 상품 등록
├── order/              # 주문 목록, 처리중, 클레임, 신규 등
├── shipping/           # 배송 목록, 출고대기, 배송중, 배송완료
├── sales/              # 매출 현황, 구매확정, 정산
├── customer/           # 고객 목록, 문의, 클레임
├── settings/           # 환경설정
│   ├── basic/          # 회사/셀러 정보, 알림 설정
│   ├── store/          # 스토어 연동
│   ├── supplier/       # 발주업체 목록, 발주양식 관리
│   └── user-log/       # 사용자 로그
└── system/             # 시스템관리 (운영자)
    ├── user/           # 사용자 관리, 권한, 등록/수정
    ├── role/           # 권한 관리
    ├── platform/       # 플랫폼 관리
    ├── code/           # 코드 관리 (공통/주문/배송/기타)
    ├── log/            # 로그 / 이력
    ├── menu/           # 메뉴 관리
    └── setting/        # 시스템 설정

src/
├── config/
│   └── menu.ts         # 메뉴 구조 (menuKeys 기반 권한 제어)
├── layout/
│   ├── Layout.tsx      # 공통 레이아웃, initAppData
│   └── Sidebar.tsx     # 사이드바 네비게이션
├── components/         # 공통 UI 및 도메인 컴포넌트
│   ├── store/          # StoreCard, StoreAuthModal, StoreSettingModal, StoreAddModal
│   ├── vendor/         # SupplierEditModal 등
│   └── order-template/ # OrderTemplateEditor, TemplateFieldItem
├── views/              # 화면별 페이지 컴포넌트
│   ├── product/, order/, shipping/, sales/, customer/
│   ├── settings/       # StoreList, SupplierList, SupplierFormManage
│   └── system/         # StoreManage, RoleManage, UserList, CodeManage, PlatformManage
│       └── store/      # StoreRegisterModal, StoreEditModal
├── stores/             # Zustand (authStore, storeStore, userStoreStore 등)
├── services/           # API 호출 (auth, user, mall, storeSystem, company 등)
├── lib/
│   └── api.ts         # apiFetch (credentials, Content-Type)
└── styles/             # Settings.css, RoleManage.css 등
```

## 주요 화면

### 대시보드 & 업무

- **대시보드** (`/`): 메인
- **상품** (`/product/list`): 상품 목록, 스토어 탭 필터
- **주문** (`/order/*`): 주문 목록, 처리중, 클레임
- **배송** (`/shipping/*`): 배송 목록, 출고대기, 배송중, 배송완료
- **정산** (`/sales/*`): 매출 현황, 구매확정, 정산 내역

### 환경설정

- **회사 / 셀러 정보** (`/settings/basic/company`)
- **알림 설정** (`/settings/basic/notification`)
- **스토어 연동** (`/settings/store/list`): 내 회사 스토어 API 설정, 연동 해제, 순서 변경
- **발주업체** (`/settings/supplier/*`): 발주업체 목록, 발주양식 DnD 관리
- **사용자 로그** (`/settings/user-log`)

### 시스템관리 (운영자)

- **사용자 관리** (`/system/user`): 사용자 CRUD, 승인/비활성
- **권한 관리** (`/system/role`): 권한 CRUD, 메뉴 접근 설정 (menuKeys)
- **플랫폼 관리** (`/system/platform`): 쇼핑몰 플랫폼 등록·수정·삭제
- **코드 관리** (`/system/code`): 공통코드, 주문상태, 배송상태, 기타코드
- **로그 / 이력** (`/system/log`)

## 백엔드 연동

- **프록시**: `next.config.mjs`의 rewrites로 `/api/*` → `NEXT_PUBLIC_API_URL` (기본 `http://localhost:5080`)
- **인증**: 세션 기반. `apiFetch`에서 `credentials: 'include'`로 쿠키 전송
- **환경 변수**: `NEXT_PUBLIC_API_URL` 로 API 서버 URL 변경

## 빌드 및 프로덕션

```bash
yarn build
yarn start
```

- `output: 'standalone'` 설정으로 Docker 빌드 최적화

## 관련 문서

- [스토어 관리·사용 가이드](../docs/STORE_MANAGEMENT.md) - 스토어 연동 vs 스토어 관리, 플랫폼/스토어 개념
