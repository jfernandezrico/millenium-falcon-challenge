FROM node:22-slim AS builder

WORKDIR /app

COPY package.json package-lock.json ./
COPY packages/web/package.json packages/web/

RUN npm ci --workspace=packages/web --include-workspace-root

COPY packages/web/ packages/web/

RUN npm run build -w packages/web

FROM nginx:alpine

COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/packages/web/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
