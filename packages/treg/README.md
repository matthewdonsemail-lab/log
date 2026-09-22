# @listeningkit/treg — scaffold

Local Convex component wrapping treg.to (tool catalog: one base URL, one
team token, 3,600+ endpoints). First capability: domain competitors for the
onboarding reveal. Layout follows the Convex component spec
(`convex.config.ts` + `schema.ts` + functions + `lib/`).

## Why it lives here, unregistered

CLI 1.45.0 cannot consume a local component in this repo: any
`convex/components/*/` directory breaks **all** codegen/dev commands —
"Finding component definitions" emits a bare `components/…/convex.config.js`
specifier that esbuild cannot resolve (verified with the documented
`convex/components/<name>` layout and `./components/…` import). So the
scaffold waits here until one of these unblocks it:

1. Package it (`packages/treg-component` with a real `package.json`, built
   `_generated` via `convex codegen --component-dir`) and register the
   package specifier in `convex/convex.config.ts` via `app.use(...)` — the
   same shape as `@convex-dev/static-hosting` already in use.
2. Or a CLI fix for relative component imports.

## Registering (when unblocked)

```ts
// convex/convex.config.ts
import treg from '@listeningkit/treg-component/convex.config'
app.use(treg)
```

```bash
pnpm exec convex codegen          # picks up the component's _generated
pnpm exec convex dev --once --typecheck=disable
```

## Still to build (in order)

- `domainCompetitors { domain }` (spyfu row primary, seranking failover)
- per-owner 30s cooldown from the `calls` ledger
- receipt writes (`X-Treg-Call-Id`, `X-Treg-Cost-Micro`) on every call
- `balance` action for the UI spend gate
- `convex/treg.test.ts` with fake `fetch` only
- reveal competitors stage goes live (Skip fallback stays)
