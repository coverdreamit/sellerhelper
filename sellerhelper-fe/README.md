# 셀러 보조 사이트 (프론트엔드)

여러 온라인 쇼핑몰 API를 연동하는 셀러 보조 사이트의 **Next.js** 프론트엔드입니다.  
백엔드(Spring Boot) API와 연동하여 사용합니다.

## 기술 스택

- **Next.js 14** (App Router)
- React 18
- **Zustand** (전역 상태)
- **@dnd-kit** (발주서 템플릿 필드 드래그 앤 드롭)
- Spring Boot 백엔드 연동 (API 프록시: `/api/*` → `http://localhost:8080/api/*`)

## 실행 방법

```bash
yarn
yarn dev
```

브라우저에서 `http://localhost:5000` 접속

## 프로젝트 구조

```
app/                    # Next.js App Router
├── layout.jsx          # 루트 레이아웃 (사이드바 + 본문)
├── page.jsx            # 대시보드 (/)
├── globals.css
├── product/list/       # 상품 목록 등
├── order/              # 주문 목록, 상세 [id] 등
├── shipping/           # 배송 목록 등
├── sales/              # 매출·정산
├── customer/           # 고객·문의·클레임
├── settings/           # 환경설정 (basic, store, supplier)
└── system/             # 시스템관리 (user, role, menu, code, log)

src/
├── config/menu.js      # 메뉴 구조 (추후 메뉴관리로 동적 변경 예정)
├── layout/
│   ├── Layout.jsx      # 공통 레이아웃 (initAppData 1회 호출, 사이드바 + 본문)
│   └── Sidebar.jsx     # 사이드바 네비게이션 (next/link, usePathname)
├── components/         # 공통 UI + 도메인 컴포넌트
│   ├── Link.jsx
│   ├── store/          # StoreCard 등
│   ├── vendor/         # VendorCard 등
│   └── order-template/ # OrderTemplateEditor, TemplateFieldItem, OrderTemplatePreview
├── views/              # 화면별 페이지 컴포넌트 (App Router와 구분)
│   ├── Dashboard.jsx
│   ├── product/, order/, shipping/, sales/, customer/
│   └── settings/       # store(스토어 목록), supplier(발주업체 목록·양식 관리)
├── stores/             # Zustand (storeStore, userStoreStore, vendorStore, orderTemplateStore)
├── services/           # API·mock 교체 지점 (fetchStores, fetchUserStores, fetchVendors, fetchOrderTemplates)
├── mocks/              # 개발용 mock 데이터 (stores, userStores, vendors, orderTemplates)
└── types/              # JSDoc 타입 (store, userStore, vendor, orderTemplate)
```

- **데이터 흐름**: 앱 진입 시 `Layout`에서 `initAppData()` → services에서 mock(또는 API) 로드 → stores에 저장 → 페이지/컴포넌트에서 구독·렌더.
- **스토어 관리** (`/settings/store/list`): 스토어 카드, 연결 상태, 사용 ON/OFF.
- **발주업체** (`/settings/supplier/list`, `/settings/supplier/form`): 목록(등록·수정·정책 모달), 발주양식 관리에서 필드 DnD·미리보기.

## 백엔드(Spring Boot) 연동

- 개발 시: `next.config.js`의 `rewrites`로 `/api/*` 요청을 `http://localhost:8080/api/*`로 프록시합니다.
- Spring Boot 서버를 `localhost:8080`에서 실행한 뒤, 프론트에서 `fetch('/api/...')`로 호출하면 됩니다.

## 빌드 및 프로덕션

```bash
yarn build
yarn start
```

프로덕션 배포 시 백엔드 URL은 환경 변수 등으로 설정해 두고, `next.config.js`의 `rewrites` 또는 API 베이스 URL을 조정하면 됩니다.
