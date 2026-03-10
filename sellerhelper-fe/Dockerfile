# ========== Build Stage ==========
FROM node:18-alpine AS builder

WORKDIR /app

# 의존성 설치
COPY package.json yarn.lock* ./
RUN yarn install --frozen-lockfile

# 소스 복사 및 빌드 (BE 직접 호출 주소. 배포 시 예: http://coverdreamit.iptime.org:5001)
ARG NEXT_PUBLIC_API_URL=http://localhost:5001
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
COPY . .
RUN yarn build
# public이 없을 수 있으므로 복사 시 존재하도록 생성
RUN mkdir -p /app/public

# ========== Production Stage ==========
FROM node:18-alpine AS runner

# 디버깅/헬스체크용 curl (선택)
RUN apk add --no-cache curl

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# standalone 출력에서 필요한 파일만 복사
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 5000
CMD ["node", "server.js"]
