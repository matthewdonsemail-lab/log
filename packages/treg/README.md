# @listeningkit/treg

A Convex component that wraps [treg.to](https://treg.to) — one base URL and one team token for 2,630+ catalogued provider endpoints (SEO, SERP, backlinks, enrichment, ads, scraping). Built for ListeningKit's onboarding reveal: real domain-competitor data instead of typed-in guesses.

Layout follows the Convex component spec: `convex.config.ts` + `schema.ts` + functions + `lib/`.

## What it does

- **Generic catalog call** (`treg.call`): proxies any catalogued endpoint by id through `GET https://treg.to/call/<id>?params`, with the team token injected server-side. The upstream answer is relayed verbatim.
- **Spend safety baked in**: every call carries a cost ceiling (`X-Treg-Route-Max-Cost`), a fresh idempotency key (a retry is never billed twice), and tags the caller as a hashed owner id (`X-Treg-Meta: customer=…`) so usage can be attributed without exposing who called.
- **Receipts table** (`calls`): one row per spend, keyed by `X-Treg-Call-Id` / `X-Treg-Cost-Micro` response headers — never parsed from a provider body.

## Why it lives as a package (not `convex/components/`)

Convex CLI 1.45.0 cannot resolve a local `convex/components/*/` directory during codegen — it emits a bare specifier esbuild can't follow. The component therefore ships as a workspace package (`packages/treg`) registered by package name:

```ts
// convex/convex.config.ts
import treg from '@listeningkit/treg/convex.config'
app.use(treg)
```

Component bindings are generated with:

```bash
pnpm exec convex codegen --component-dir ./packages/treg
```

## Setup

1. **Install the package** (already a workspace dependency) and register it as above.
2. **Set the env on the Convex deployment** (both optional at install time so codegen never blocks):
   - `TREG_TOKEN` — your team token from [treg.to](https://treg.to). Without it, `call` throws `"Treg is not switched on yet."`
   - `TREG_BASE_URL` — defaults to `https://treg.to`.
3. **Regenerate bindings**: `pnpm exec convex codegen --component-dir ./packages/treg` (and root codegen once `AUTH_ISSUER` is available on the deployment).

## How to call it

Auth lives in the app wrapper ([`convex/treg.ts`](../../convex/treg.ts)): it verifies the caller with `requireOwner(ctx)`, then runs the component's internal `call` with the owner string. Component functions are internal — they are only reachable through a wrapper.

From a client (after sign-in):

```ts
// any catalogued endpoint id + flat params
await ctx.runAction(api.treg.call, {
  endpoint: 'spyfu.google.domain.competitors',
  params: { domain: 'example.com', pageSize: 10 },
  maxCostUsd: 0.05, // optional; defaults to $0.05
})
```

Raw HTTP equivalent (what the component issues server-side):

```bash
curl "https://treg.to/call/spyfu.google.domain.competitors?domain=example.com&pageSize=10" \
  -H "X-Treg-Token: $TREG_TOKEN" \
  -H "X-Treg-Route-Max-Cost: 0.05" \
  -H "Idempotency-Key: <fresh-uuid>" \
  -H "X-Treg-Meta: customer=<owner-hash>"
```

### Real endpoints used by the reveal (introspected from the live catalog)

Capability: `google.domain.competitors` — "Find a domain's keyword competitors."

| Endpoint id | Method | Key params | Cost (approx.) | Notes |
|---|---|---|---|---|
| `spyfu.google.domain.competitors` | GET | `domain` (required), `countryCode`, `pageSize` (1–550, default 5) | ~$0.0002/row | Primary. Organic competitors ranked by shared keywords. |
| `seranking.google.domain.competitors` | GET | `source` (required, e.g. `us`), `domain` (required), `limit` | ~$0.0179/call (flat) | Failover. Example response rows: `{ domain, common_keywords, domain_relevance, … }`. |
| `serpstat.google.domain.competitors` | POST | JSON-RPC body with `params.domain`, `params.se`, `params.size` | ~$0.0005/result | Alternate. |
| `spyfu.google.domain.ppc_competitors` | GET | same shape as SpyFu SEO | ~$0.0002/row | Paid-ads variant. |

Search the catalog by job, not vendor: `GET https://treg.to/catalog/search?q=competitors` (open, no token). Full protocol: [treg.to/llms.txt](https://treg.to/llms.txt), API reference: [treg.to/docs](https://treg.to/docs).

**Failover policy (treg's rule):** on 429/5xx/timeout, try the next provider row; never retry a 4xx elsewhere (bad parameters burn money on every provider). treg does not fail over between providers for you.

## Costs

- Price is visible before you call (`catalog/get` or the search result's `cost` block).
- **What you were actually charged** is the response header `X-Treg-Cost-Micro` — store it with `X-Treg-Call-Id` (the component writes both to the `calls` table).
- Hard ceiling: send `X-Treg-Route-Max-Cost: <usd>`; treg refuses with 402 (nothing charged) if the reserve would exceed it. The component defaults to `$0.05` per call.
- Out of balance → 402 with `balance_micro` / `topup_url`. Top up in the treg dashboard, or connect your own provider key (own-key calls are never metered to the balance).
- Failed calls (4xx/5xx from provider) are relayed unchanged and charged nothing.

## Still to build

- `domainCompetitors { owner, domain }` — validate bare domain, call SpyFu with SE Ranking failover, clean to `[{ domain, commonKeywords }]`.
- Per-owner 30s cooldown from the `calls` ledger before spending.
- Receipt writes on every call (wire `X-Treg-Call-Id` / `X-Treg-Cost-Micro` into `schema.ts`'s `calls` table).
- `balance` action so the UI can disable paid stages when the team balance is low.
- `convex/treg.test.ts` with fake `fetch` only (never a real model/API from tests).
- Reveal competitors stage goes live (typed-input Skip fallback stays).

## Files

| File | Role |
|---|---|
| [`convex.config.ts`](./convex.config.ts) | Component definition + typed env (`TREG_TOKEN`, `TREG_BASE_URL`). |
| [`schema.ts`](./schema.ts) | `calls` spend-receipt table. |
| [`treg.ts`](./treg.ts) | Generic `call` action (fetch, headers, error mapping). |
| [`lib/treg.ts`](./lib/treg.ts) | Pure helpers: URL builder, failure reasons, default base URL. |
| [`../../convex/treg.ts`](../../convex/treg.ts) | App-side auth wrapper (`requireOwner` → component `call`). |
| [`../../convex/convex.config.ts`](../../convex/convex.config.ts) | Registers the component via `app.use(treg)`. |
