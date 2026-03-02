# CLI (`@mfc/cli`)

R2-D2 — a command-line tool that computes the odds of the Millennium Falcon reaching Endor safely.

## Prerequisites

- Node.js >= 22
- npm >= 10

## Setup

From the repository root:

```bash
npm install
npm run build:cli
```

## Usage

```bash
node packages/cli/dist/index.js <millennium-falcon.json> <empire.json>
```

### Arguments

| Argument | Description |
|---|---|
| `millennium-falcon.json` | Path to the Millennium Falcon configuration file |
| `empire.json` | Path to the intercepted Empire data file |

### Output

Prints the probability of success as an integer percentage (0 to 100).

### Examples

```bash
# Example 1: 0% — cannot reach Endor in time
$ node packages/cli/dist/index.js examples/example1/millennium-falcon.json examples/example1/empire.json
0

# Example 2: 81% — 2 bounty hunter encounters
$ node packages/cli/dist/index.js examples/example2/millennium-falcon.json examples/example2/empire.json
81

# Example 3: 90% — 1 bounty hunter encounter
$ node packages/cli/dist/index.js examples/example3/millennium-falcon.json examples/example3/empire.json
90

# Example 4: 100% — all bounty hunters avoided
$ node packages/cli/dist/index.js examples/example4/millennium-falcon.json examples/example4/empire.json
100
```

## Using with Docker

```bash
# Build the CLI image
docker compose build cli

# Run against example files (mounted at /data)
docker compose run --rm cli /data/example2/millennium-falcon.json /data/example2/empire.json
```
