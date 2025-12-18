# 1. Build Stage
FROM node:18-alpine AS builder

# git 설치
RUN apk add --no-cache git

WORKDIR /app

# GitHub 저장소 클론
# 예: https://github.com/your-org/your-repo.git
ARG GIT_REPO_URL=https://github.com/field-animal/biznum-check.git
ARG GIT_BRANCH=main

RUN git clone --depth=1 --branch ${GIT_BRANCH} ${GIT_REPO_URL} .

# 의존성 설치
RUN npm install

# 프로덕션 빌드
RUN npm run build


# 2. Production Stage
FROM nginx:alpine

# 빌드 결과 복사
COPY --from=builder /app/dist /usr/share/nginx/html

# 80 포트 노출
EXPOSE 80

# Nginx 실행
CMD ["nginx", "-g", "daemon off;"]
