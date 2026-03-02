# Architecture

## Overview

This project follows **hexagonal architecture** (ports & adapters) with a monorepo structure managed by npm workspaces. The domain and all adapters live in the backend package, while the CLI and web are thin consumers.

```
┌──────────────────────────────────────────────────────────────────┐
│                        Monorepo Root                             │
│                                                                  │
│  ┌───────────────────┐   ┌──────────┐   ┌──────────┐             │
│  │    @mfc/backend   │   │  @mfc/   │   │  @mfc/   │             │
│  │  (domain + all    │   │   cli    │   │   web    │             │
│  │   adapters)       │   └────┬─────┘   └──────────┘             │
│  └────┬──────────────┘        │                                  │
│       │                       │                                  │
│       ◄───────────────────────┘                                  │
│    imports domain + adapters/out                                 │
└──────────────────────────────────────────────────────────────────┘
```

## Backend Package — Hexagonal Architecture

The backend is the heart of the system, structured with three clear layers:

```
packages/backend/src/
├── domain/                       # The core — pure business logic
│   ├── models/                   # Data types (Route, EmpireData, etc.)
│   ├── ports/                    # Port types (RouteRepository, ConfigLoader)
│   └── use-cases/                # Pure functions (computeOdds)
├── adapters/
│   ├── in/                       # Driving adapters — receive external requests
│   │   ├── odds/                 # POST /api/odds (OddsController)
│   │   └── health/               # GET /api/health (HealthController)
│   └── out/                      # Driven adapters — access external systems
│       ├── database/             # Drizzle schema & SQLite connection
│       ├── repository/           # RouteRepository implementation
│       └── config/               # ConfigLoader implementation
├── app.module.ts                 # NestJS wiring (providers, logging)
└── main.ts                       # Bootstrap with Fastify + Pino
```

### Domain Layer

Pure TypeScript types and functions with **zero framework dependencies**:

- **Models** define the data shapes: `Route`, `MillenniumFalconConfig`, `EmpireData`, `BountyHunter`
- **Ports** are type definitions that adapters implement: `RouteRepository`, `ConfigLoader`
- **Use cases** are pure functions: `computeOdds` is a 0-1 BFS algorithm that finds the path minimizing bounty hunter encounters

### Adapters In (NestJS Controllers)

Thin HTTP layer using NestJS with Fastify. Controllers map HTTP requests to domain types and delegate to use-case functions. Classes are only used here because the framework requires decorators.

### Adapters Out (Infrastructure)

Implementations of the domain ports:

- **Drizzle + better-sqlite3** for reading the universe SQLite databases
- **JSON file reader** for loading `millennium-falcon.json` configuration

## Other Packages

### `@mfc/cli` — Command-Line Adapter

Imports `domain` and `adapters/out` from the backend package via subpath exports. Reads both config files from the filesystem and prints the success probability.

### `@mfc/web` — Frontend SPA

A React + Vite single-page application with a Star Wars terminal aesthetic. Calls the backend API — no direct domain dependency.

## Key Design Decisions

| Decision                         | Rationale                                                                                                                         |
| -------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| **Functional over OOP**          | Domain use cases are pure functions. Classes are only used where NestJS requires them (controllers, modules).                     |
| **Domain inside backend**        | The backend owns the hexagonal structure (domain + adapters). The CLI reuses domain and adapters/out via subpath exports.         |
| **Drizzle + better-sqlite3**     | The challenge provides SQLite databases. Drizzle gives type-safe queries while better-sqlite3 provides fast native SQLite access. |
| **0-1 BFS algorithm**            | Edge weights are 0 (no bounty hunter) or 1 (bounty hunter encounter). 0-1 BFS finds the minimum-cost path in O(V+E) time.         |
| **Monorepo with npm workspaces** | Shared code between backend and CLI without duplication. Simple setup, no extra tooling.                                          |
| **Pino logging**                 | Structured JSON logging in production, pretty-printed in development.                                                             |

## Data Flow

```
                                  empire.json
                                      │
          ┌───────────────────────────┤
          │                           │
    ┌─────▼─────┐              ┌──────▼──────┐
    │    Web     │──POST /api──│   Backend   │
    │  (C-3PO)  │   /odds     │  (NestJS)   │
    └───────────┘              └──────┬──────┘
                                      │
                               ┌──────▼──────┐
                               │   Domain    │
                               │ computeOdds │
                               └──────┬──────┘
                                      │
                               ┌──────▼──────┐
                               │  universe.db │
                               │  (SQLite)   │
                               └─────────────┘
```

## Algorithm

The odds computation uses a **0-1 BFS** (Breadth-First Search with a deque) over the state space `(planet, day, fuel)`:

1. **Build galaxy graph** from routes (bidirectional edges)
2. **Build bounty hunter lookup** (set of `planet:day` keys)
3. **BFS** from `(departure, day=0, fuel=autonomy)`:
   - **Refuel/Wait transition**: stay on planet, day + 1, fuel = autonomy (refueling always dominates waiting since it gives strictly more fuel for the same time cost)
   - **Travel transition**: move to adjacent planet, day + travel_time, fuel - travel_time
   - Edge weight: 1 if bounty hunters present at destination on arrival day, 0 otherwise
4. **Result**: minimum encounters at arrival planet -> success probability = (9/10)^k
