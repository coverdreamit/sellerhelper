# 스크립트

백엔드(sellerhelper-be) 실행/종료용 스크립트입니다. Maven Wrapper(mvnw)를 사용합니다.

## 스크립트 목록

| 스크립트 | 설명 |
|---------|------|
| `start-be` | 백엔드 시작 (동일 터미널에서 실행) |
| `stop-be` | 백엔드 종료 (포트 5080 프로세스 종료) |
| `restart-be` | stop 후 start |
| `dev-be` | 개발모드 (local 프로파일) |
| `run-be` | jar 빌드 후 런타임 실행 |

## 사용 방법

### Windows (.bat)

```cmd
cd scripts
dev-be.bat        # 개발모드
start-be.bat      # 시작
stop-be.bat       # 종료
restart-be.bat    # 재시작
run-be.bat        # jar 런타임
```

### Linux / macOS / Git Bash (.sh)

```bash
./scripts/dev-be.sh
./scripts/start-be.sh
./scripts/stop-be.sh
./scripts/restart-be.sh
./scripts/run-be.sh
```

## 환경 변수

- `SPRING_PROFILES_ACTIVE` – 프로파일 (기본: local)
- `SERVER_PORT` – 서버 포트 (기본: 5080)
- `JAVA_HOME` – Java 16 권장
