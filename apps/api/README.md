# ListeningKit authenticated API bridge

The API runs locally on loopback port 4000, matching the web app's Vite `/api` proxy. Convex functions and Clerk issuer/audience configuration have been deployed to development (`determined-cheetah-971`); production is untouched. Clerk React login UI and the `convex` JWT template are configured. Google sign-in is enabled and visible. First-user sign-in and authenticated live data reads still need browser verification.

## Routes

- `GET /healthz`: process liveness only, not deployment readiness.
- `GET /api/accounts`: current identity's account metadata.
- `POST /api/accounts`: `{ platform, label? }` -> `{ account, accounts }`, status 201. New accounts are disconnected; this does not verify platform credentials.
- `GET /api/feed[?platform=&search=]` and `GET /api/feed/:platform`: current identity's saved posts.
- Other authenticated `/api/*` operations return 501. No generic proxy to platform services.

All API routes require `Authorization: Bearer <user access JWT>`. JWT signatures, issuer, audience, expiry, issued-at and subject are checked against an HTTPS JWKS endpoint (RS256). Convex independently validates the same token and derives ownership from its verified identity. A new Convex client is created per request; no mutable authentication is shared across users. Responses are not cached. Client-supplied ownership/connection-state fields are rejected.

No deploy key is used by this API. No cookie-based authentication or broad CORS policy is enabled. Production should put the API behind the same-origin TLS reverse proxy and add rate limits/operational monitoring before public exposure.

## Configure development

1. Configure/deploy the `convex/` functions to a development deployment (not done by this change).
2. Select an RS256 OIDC identity provider. Configure matching `AUTH_ISSUER` and `AUTH_AUDIENCE` on the Convex development deployment. Its OIDC discovery keys must agree with `AUTH_JWKS_URL` used by the API.
3. Copy `apps/api/.env.example` to `apps/api/.env.local` and fill `CONVEX_URL`, `AUTH_ISSUER`, `AUTH_AUDIENCE`, `AUTH_JWKS_URL`.
4. Run `pnpm --filter api dev` in another terminal alongside `pnpm dev`.
5. `apps/web/src/components/AuthGate.tsx` integrates Clerk login/signup/user controls and supplies `getToken({ template: 'convex' })` to the transport. It waits for token setup before mounting data views and resets the token callback on logout. Query caches are recreated per session. Set the public `VITE_CLERK_PUBLISHABLE_KEY` using `clerk env pull` in `apps/web`; never expose a secret key through Vite.
6. Set `VITE_API_MODE=live` in `apps/web/.env.local`. Only accounts and feed use the live transport so far. Do not represent other mock domains as live.

Live requests without a configured token provider fail before any network request. Live platform connection/test helpers deliberately reject until actual session verification exists.

## Validation

```sh
pnpm --filter api test
pnpm --filter api typecheck
pnpm test:backend
pnpm --filter web test
pnpm typecheck
pnpm lint
```

Tests include signed JWT validation with mocked JWKS, HTTP routing/auth/validation, and an integration test of the Hono boundary against convex-test identities/functions. These are local tests, not proof of a deployed identity provider or live Reddit connection.

Next: configure sign-in, then build private Reddit session verification and scheduled ingestion, including account ownership checks, validated native IDs, retries/cursors and durable job state. No worker endpoint or public ingestion mutation was added here.
