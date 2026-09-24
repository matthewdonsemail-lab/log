# Contributing & Development Guide

We welcome contributions to **ListeningKit**! This repository is organized as a pnpm monorepo containing the web client, Convex backend, Fumadocs documentation site, and local social media adapters.

---

## Monorepo Layout

```
listeningkit-hackathon/
  apps/
    web/              # Vite + React + TypeScript client (Port 3000)
      public/         # Static assets and downloadable extension zip
      src/            # Dashboard views, state stores, and in-memory mock API
    extension/        # ListeningKit Connect — Chrome (MV3) extension for token extraction
    docs/             # Fumadocs documentation website (Port 3001)
    api/              # Hono bridge server (legacy fallback)
  convex/             # Convex backend: schema, queries, mutations, crons, HTTP actions
    lib/              # Business logic: matching, encryption, token handling, scoring
  clients/            # Python adapters for local reading (x_push.py, facebook_push.py)
  docs/               # Technical documentation, self-hosting guides, and diagrams
    diagrams/         # Domain-named Mermaid diagram sources (.mmd) and index
  packages/
    ui/               # Shared UI component library (@listeningkit/ui)
  scripts/            # Utility scripts (build-extension.py, build-site.mjs)
```

---

## Development Workflow & Rules

### 1. Code Standards & Linting
We enforce strict linting using **oxlint** and **@shadcn/lint**. After making any modifications, run:

```bash
pnpm run lint
```
Fix all reported warnings and errors prior to submitting pull requests.

### 2. Convex Backend Workflow
- When adding or renaming Convex queries, mutations, or actions:
  ```bash
  pnpm exec convex codegen
  ```
  This regenerates `convex/_generated/api.d.ts` so offline typechecking and `convex-test` remain synchronized.
- Push schema and function changes without continuous watch:
  ```bash
  pnpm exec convex dev --once --typecheck=disable
  ```
- Backend functions must enforce structural owner isolation: always call `requireOwner(ctx)`. Never accept a user ID parameter from the client.

### 3. Testing Standards
- **Backend Tests**: Run offline unit tests with `convex-test`:
  ```bash
  pnpm test:backend
  ```
- **Web App Tests**: Run Vitest component and API integration tests:
  ```bash
  pnpm --filter web test
  ```
- **Python Adapters**: Run client test suites:
  ```bash
  python -m pytest clients/tests
  ```

### 4. Secrets & Security Policy
- **Never commit credentials**: Never log, print, or commit session cookies, ingest keys, encryption keys, or third-party API tokens.
- **Sealed Storage**: Connected platform cookies are stored exclusively as AES-256-GCM ciphertext.
- **Untrusted Input**: Treat all social post text and scraped website content as untrusted input.

---

## Scripts Reference

| Command | Description |
|---|---|
| `pnpm dev` | Starts web app (3000) and docs (3001) concurrently |
| `pnpm build` | Builds all packages across the monorepo |
| `pnpm typecheck` | Typechecks frontend and backend TypeScript files |
| `pnpm lint` | Runs monorepo linting via oxlint |
| `pnpm test:backend` | Executes Convex backend test suite offline |
| `pnpm --filter web test` | Executes web client Vitest tests |
| `python scripts/build-extension.py` | Rebuilds the extension zip file |
| `pnpm exec convex run watch:tick` | Triggers a manual Reddit poll tick |

---

## Hackathon Contributors

ListeningKit was created for the Convex Hackathon by:

- **Matthew Dons** ([@matthewdonsemail-lab](https://github.com/matthewdonsemail-lab))
- **PACER1** ([@PACER1](https://github.com/PACER1))
- **deepmroot** ([@deepmroot](https://github.com/deepmroot))
- **john11099** ([@john11099](https://github.com/john11099))

---

## License

This project is licensed under the [MIT License](../LICENSE).
