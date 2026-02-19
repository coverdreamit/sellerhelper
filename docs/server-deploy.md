# 서버 배포 가이드 (5분마다 pull 배포)

**서버가 5분마다** 소스를 pull 받아 **로컬에서 Docker 빌드** 후 배포합니다. (외부 이미지 저장소 사용 안 함)

---

## 적용 방법 (순서대로 진행)

### 1단계: 서버에 SSH 접속

```bash
ssh -p 2256 사용자명@coverdreamit.iptime.org
```

---

### 2단계: 프로젝트 클론

```bash
cd ~
mkdir -p sellerhelper
cd sellerhelper
git clone https://github.com/coverdreamit/sellerhelper.git .
```

---

### 3단계: 환경 변수 파일(.env) 생성

```bash
nano .env
```

아래 내용 입력 (DB 계정은 실제 값으로 변경):

```
DB_USERNAME=실제DB사용자명
DB_PASSWORD=실제DB비밀번호
```

저장: `Ctrl+O` → Enter → `Ctrl+X` 종료

---

### 4단계: 배포 스크립트 실행 권한 부여

```bash
chmod +x scripts/deploy.sh
```

---

### 5단계: 최초 배포 실행 (동작 확인)

```bash
./scripts/deploy.sh
```

에러 없이 끝나면 Docker 컨테이너가 실행된 상태입니다.

---

### 6단계: 크론 등록 (5분마다 자동 실행)

```bash
crontab -e
```

에디터가 뜨면 **맨 아래에** 다음 줄 추가:

```
*/5 * * * * $HOME/sellerhelper/scripts/deploy.sh >> $HOME/sellerhelper/deploy.log 2>&1
```

> `$HOME`은 크론이 사용자 홈 디렉터리(~/)로 자동 설정합니다.

저장 후 종료 (nano: `Ctrl+O` → Enter → `Ctrl+X`)

---

### 7단계: 크론 등록 확인

```bash
crontab -l
```

방금 추가한 줄이 보이면 설정 완료입니다.

---

## 확인 방법

- **서비스 접속**: `http://coverdreamit.iptime.org:5000` (프론트엔드)
- **배포 로그**: `tail -f ~/sellerhelper/deploy.log`
- **컨테이너 상태**: `docker ps`

---

## 동작 흐름

| 순서 | 내용 |
|------|------|
| 1 | main에 push → 서버에 배포될 준비 완료 |
| 2 | 서버 크론이 5분마다 `deploy.sh` 실행 |
| 3 | `git pull` → `docker compose build` → `docker compose up -d` 순으로 배포 |

배포 반영까지 **최대 5분** 걸릴 수 있습니다. 첫 빌드는 몇 분 걸릴 수 있습니다.
