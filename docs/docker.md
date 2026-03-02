# Docker

The project provides Docker images for all three components: backend, web frontend, and CLI.

## Prerequisites

- Docker >= 24
- Docker Compose >= 2

## Quick Start

```bash
# Start backend + web frontend (defaults to example1)
docker compose up --build

# Start with a different example
EXAMPLE=example2 docker compose up --build

# Access the web frontend at http://localhost:8080
# Backend API available at http://localhost:3000
```

## Services

### Backend (`backend`)

NestJS API server.

- **Port**: 3000
- **Config**: Mounted via volume at `/data/millennium-falcon.json`
- **Default data**: `examples/example1/` (configurable via `EXAMPLE` env var)

To use different example data:

```bash
EXAMPLE=example3 docker compose up --build
```

### Web (`web`)

React SPA served by nginx. Proxies `/api/` requests to the backend.

- **Port**: 8080
- **Depends on**: backend

### CLI (`cli`)

Command-line tool for computing odds without a server.

The CLI uses the `cli` profile and is not started by default:

```bash
# Run the CLI against example 2
docker compose run --rm cli /data/example2/millennium-falcon.json /data/example2/empire.json
# Output: 81

# Run against example 4
docker compose run --rm cli /data/example4/millennium-falcon.json /data/example4/empire.json
# Output: 100

# Interactive shell (run multiple times)
docker compose run --rm --entrypoint sh cli
# Then inside the container:
#   give-me-the-odds /data/example1/millennium-falcon.json /data/example1/empire.json
```

## Build Individual Images

```bash
# Backend only
docker build -f docker/backend.Dockerfile -t mfc-backend .

# Web only
docker build -f docker/web.Dockerfile -t mfc-web .

# CLI only
docker build -f docker/cli.Dockerfile -t mfc-cli .
```

## Environment Variables

| Service | Variable | Default | Description |
|---|---|---|---|
| backend | `PORT` | `3000` | HTTP server port |
| backend | `NODE_ENV` | `production` | Node environment |
| backend | `MILLENNIUM_FALCON_CONFIG` | `./millennium-falcon.json` | Config file path |
| (host) | `EXAMPLE` | `example1` | Example directory to mount as `/data` |
| web | `VITE_API_URL` | `""` | Backend URL (set at build time) |
