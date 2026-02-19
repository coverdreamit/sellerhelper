# ========== Build Stage ==========
FROM node:18-alpine AS builder

WORKDIR /app

# 의존성 설치
COPY package.json yarn.lock* ./
RUN yarn install --frozen-lockfile

# 소스 복사 및 빌드 (API URL은 빌드 시 주입)
ARG NEXT_PUBLIC_API_URL=http://sellerhelper-be:8080
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
COPY . .
RUN yarn build

# ========== Production Stage ==========
FROM node:18-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# standalone 출력에서 필요한 파일만 복사
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 5000
CMD ["node", "server.js"]
