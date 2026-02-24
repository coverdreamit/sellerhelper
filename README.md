# 셀러 보조 사이트 (SellerHelper)

여러 온라인 쇼핑몰 API를 연동하는 셀러 보조 사이트입니다.  
프론트엔드와 백엔드를 폴더별로 분리하여 구성합니다.

## 문서

- [스토어 관리·사용 가이드](docs/STORE_MANAGEMENT.md) – 플랫폼/스토어 개념, 스토어 관리 vs 스토어 연동 흐름

## 프로젝트 구조

```
sellerhelper/
├── sellerhelper-fe/   # Next.js 프론트엔드
├── sellerhelper-be/   # Spring Boot 백엔드
├── scripts/           # 백엔드 시작/종료/재시작 스크립트
└── README.md          # 본 파일
```

- **sellerhelper-fe/** – Next.js 14 (App Router) + React 18. [sellerhelper-fe/README.md](sellerhelper-fe/README.md)
- **sellerhelper-be/** – Spring Boot 백엔드 (Java 16, JPA, PostgreSQL). [sellerhelper-be/README.md](sellerhelper-be/README.md)
- **scripts/** – 백엔드 start/stop/restart/dev/run 스크립트 (.bat, .sh)

## 빠른 실행

### 프론트엔드

```bash
cd sellerhelper-fe
yarn
yarn dev
```

브라우저: `http://localhost:5000`

### 백엔드

```bash
cd scripts
dev-be.bat        # Windows 개발모드
# ./dev-be.sh     # Linux/macOS
```

백엔드: `http://localhost:5080` (헬스체크: `/api/health`)
