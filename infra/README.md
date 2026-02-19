# 배포 설정 가이드

## GitHub Secrets 설정

Repository → Settings → Secrets and variables → Actions 에 다음 시크릿을 추가하세요.

| 시크릿 이름 | 설명 |
|------------|------|
| `SSH_PRIVATE_KEY` | 배포 서버 SSH 접속용 개인키 전체 내용 |
| `SSH_USERNAME` | SSH 로그인 사용자명 |
| `DB_USERNAME` | PostgreSQL 사용자명 |
| `DB_PASSWORD` | PostgreSQL 비밀번호 |

## 배포 서버 사전 설정

1. **Docker / Docker Compose** 설치
2. **Git** 설치
3. 서버의 공개키를 GitHub에 등록 (선택) - 또는 SSH 키페어 생성 후 개인키를 `SSH_PRIVATE_KEY`에 저장

## 트리거

- `main` 브랜치에 push 시 자동 배포
- Actions 탭에서 `workflow_dispatch`로 수동 실행 가능

## 배포 흐름

1. GitHub Runner에서 FE/BE Docker 이미지 빌드
2. 이미지를 GHCR(ghcr.io)에 푸시
3. SSH(포트 2256)로 `coverdreamit.iptime.org` 접속
4. `~/sellerhelper` 디렉토리에서 `docker compose pull && docker compose up -d` 실행
