# 셀러 보조 사이트 (SellerHelper)

여러 온라인 쇼핑몰 API를 연동하는 셀러 보조 사이트입니다.  
프론트엔드와 백엔드를 폴더별로 분리하여 구성합니다.

## 프로젝트 구조

```
sellerhelper/
├── sellerhelper-fe/   # Next.js 프론트엔드
├── sellerhelper-be/   # Spring Boot 백엔드 (구축 예정)
└── README.md          # 본 파일
```

- **sellerhelper-fe/** – Next.js 14 (App Router) + React 18. 실행 방법은 [sellerhelper-fe/README.md](sellerhelper-fe/README.md) 참고.
- **sellerhelper-be/** – Spring Boot 백엔드 (Java, JPA, PostgreSQL). 자세한 내용은 [sellerhelper-be/README.md](sellerhelper-be/README.md) 참고.

## 빠른 실행 (프론트엔드)

```bash
cd sellerhelper-fe
yarn
yarn dev
```

브라우저에서 `http://localhost:5000` 접속

백엔드 연동은 추후 구축 예정입니다.
