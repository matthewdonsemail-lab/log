# ListeningKit backend foundation

Deployed to development `determined-cheetah-971` with Clerk authentication configuration. Production was not touched. The local gateway and frontend login UI are configured, but first-user browser authentication and live API reads still await verification. No production key is needed for the tests below.

## Implemented

- Accounts, communities, keywords and posts tables with ownership/indexes.
- `accounts:create` / `accounts:list`: authenticated metadata only; new accounts are disconnected until an actual platform handshake is implemented.
- `feed:ingest`: internal-only, atomic batch ingestion (maximum 100), stable deduplication by account + native post ID, numeric metrics and timestamp validation.
- `feed:list`: authenticated, owner-isolated feed response matching the current UI's numeric metrics; platform/search filters operate on the latest 200 inserted records. No full-history search or cursor pagination yet.
- Tests exercise authentication, ownership, filters, deduplication, and atomic rejection without network access.

Ownership currently means one verified identity per private workspace. Team membership is not implemented. Communities/keywords have schemas only, not public CRUD functions.

## Local checks

```sh
pnpm test:backend
pnpm typecheck:backend
pnpm --filter web test
pnpm --filter web typecheck
pnpm lint
```

## Frontend transport

Put `VITE_API_MODE=mock` (default) or `live` and `VITE_API_BASE_URL=/api` in `apps/web/.env.local`.

Accounts and feed are switched by this setting. Other dashboard domains still use mocks. The authenticated Hono bridge now lives in `apps/api`; it requires a configured identity provider, user access token provider, and development Convex deployment. Requests fail honestly if no backend or sign-in is configured. Platform-service keys must never be `VITE_*` values. The old direct-to-Python feed transport was intentionally replaced, not kept as an unsafe fallback.

## Deployment and next work

1. Select/configure a development Convex deployment with `pnpm exec convex dev`; do not target production by default.
2. Configure the issuer/audience for `auth.config.ts` and the authenticated dashboard/API session flow. The configuration file and gateway verifier exist; provider setup and login UI are still needed. Public account/feed functions deny requests without a verified identity; no shared production admin key is used as application authentication.
3. Run Convex code generation after configuring dev. `lib/server.ts` currently derives server types directly from the schema so offline typechecking needs no generated files. The offline test module map includes a root marker for convex-test, not a generated production client.
4. Configure/run the Hono boundary in `apps/api`, which translates accounts/feed routes to Convex. `accounts:createWithResponse` now atomically returns the frontend create response shape; `accounts:create` remains the ID-returning function for existing callers.
5. Implement a private scheduled ingestion action that loads account credentials securely, validates platform responses, then calls internal `feed:ingest`. Do not expose ingestion publicly or trust a browser-supplied owner.
6. Add verified session management, community/keyword CRUD, cursor persistence, job locks/backoff, pagination, and account health propagation before claiming a live listening MVP.

Do not deploy root test/config files as application functions: Convex ignores test files by naming convention; keep build tooling out of function entry points. No social-platform calls were executed for this foundation.
