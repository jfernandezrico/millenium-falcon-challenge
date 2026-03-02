# Web Frontend (`@mfc/web`)

C-3PO — a React single-page application that lets users upload intercepted Empire data and displays the odds of the Millennium Falcon reaching Endor safely.

## Prerequisites

- Node.js >= 22
- npm >= 10
- The backend server running (for API calls)

## Setup

From the repository root:

```bash
npm install
```

## Running

### Development

Make sure the backend is running first (see [backend docs](./backend.md)), then:

```bash
npm run start:web
```

The dev server starts at `http://localhost:5173` with a proxy to the backend at `http://localhost:3000`.

### Production build

```bash
npm run build:web
```

The built assets are output to `packages/web/dist/`.

## Usage

1. Open the application in your browser
2. Upload an `empire.json` file (drag & drop or click to browse)
3. The odds are displayed as a percentage (0% — 100%)

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `VITE_API_URL` | `""` (same origin) | Backend API URL for production builds |

## E2E Testing with Cypress

With both backend and frontend running:

```bash
# Headless
npm run test:e2e -w packages/web

# Interactive
npm run test:e2e:open -w packages/web
```

## Tech Stack

- **React 19** — UI library
- **Vite 6** — Build tool with HMR
- **Cypress** — E2E testing
- **CSS** — Custom styling with Star Wars terminal aesthetic
