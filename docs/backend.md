# Backend (`@mfc/backend`)

The Millennium Falcon onboard computer — a NestJS HTTP server that computes the odds of reaching Endor safely.

## Prerequisites

- Node.js >= 22
- npm >= 10

## Setup

From the repository root:

```bash
npm install
npm run build:backend
```

## Configuration

The backend reads a `millennium-falcon.json` configuration file on startup. Set the path via environment variable:

```bash
export MILLENNIUM_FALCON_CONFIG=./examples/example1/millennium-falcon.json
```

If not set, defaults to `./millennium-falcon.json` in the current working directory.

## Running

### Development

```bash
MILLENNIUM_FALCON_CONFIG=./examples/example1/millennium-falcon.json \
  npm run start:dev -w packages/backend
```

### Production

```bash
npm run build:backend
MILLENNIUM_FALCON_CONFIG=./millennium-falcon.json \
  npm run start -w packages/backend
```

The server starts on port 3000 by default. Set `PORT` environment variable to change.

## API

### `GET /api/health`

Health check endpoint.

**Response**: `200 OK`
```json
{ "status": "ok" }
```

### `POST /api/odds`

Computes the probability that the Millennium Falcon reaches Endor safely.

**Request body** (`empire.json` format):
```json
{
  "countdown": 8,
  "bounty_hunters": [
    { "planet": "Hoth", "day": 6 },
    { "planet": "Hoth", "day": 7 }
  ]
}
```

**Response**: `200 OK`
```json
{ "odds": 0.81 }
```

The `odds` field is a decimal between 0 and 1 representing the probability of success.

## Testing

### Unit tests (core algorithm)

```bash
npm run test -w packages/core
```

### Integration tests (HTTP endpoints)

```bash
npm run test -w packages/backend
```

## Architecture

```
src/
├── adapters/in/
│   ├── odds/
│   │   ├── odds.controller.ts    # POST /api/odds
│   │   ├── odds.module.ts        # NestJS module
│   │   └── dto/
│   │       └── empire.dto.ts     # Request validation
│   └── health/
│       └── health.controller.ts  # GET /api/health
├── app.module.ts                 # Root module (providers, logging)
└── main.ts                       # Bootstrap
```

The controller is intentionally thin — it maps the HTTP request to domain types and delegates to `computeOdds` from `@mfc/core`.
