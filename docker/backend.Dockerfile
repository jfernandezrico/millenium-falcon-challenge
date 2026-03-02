FROM node:22-slim AS builder

WORKDIR /app

COPY package.json package-lock.json ./
COPY packages/backend/package.json packages/backend/

RUN npm ci --workspace=packages/backend --include-workspace-root

COPY tsconfig.base.json ./
COPY packages/backend/ packages/backend/

RUN npm run build -w packages/backend

FROM node:22-slim

WORKDIR /app

COPY --from=builder /app/package.json /app/package-lock.json ./
COPY --from=builder /app/packages/backend/package.json packages/backend/

RUN npm ci --workspace=packages/backend --include-workspace-root --omit=dev

COPY --from=builder /app/packages/backend/dist packages/backend/dist/

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

CMD ["node", "packages/backend/dist/main.js"]
