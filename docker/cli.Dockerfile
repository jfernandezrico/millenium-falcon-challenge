FROM node:22-slim AS builder

WORKDIR /app

COPY package.json package-lock.json ./
COPY packages/backend/package.json packages/backend/
COPY packages/cli/package.json packages/cli/

RUN npm ci --workspace=packages/backend --workspace=packages/cli --include-workspace-root

COPY tsconfig.base.json ./
COPY packages/backend/ packages/backend/
COPY packages/cli/ packages/cli/

RUN npm run build -w packages/backend && npm run build -w packages/cli

FROM node:22-slim

WORKDIR /app

COPY --from=builder /app/package.json /app/package-lock.json ./
COPY --from=builder /app/packages/backend/package.json packages/backend/
COPY --from=builder /app/packages/cli/package.json packages/cli/

RUN npm ci --workspace=packages/backend --workspace=packages/cli --include-workspace-root --omit=dev

COPY --from=builder /app/packages/backend/dist packages/backend/dist/
COPY --from=builder /app/packages/cli/dist packages/cli/dist/

RUN npm link -w packages/cli

ENTRYPOINT ["give-me-the-odds"]
