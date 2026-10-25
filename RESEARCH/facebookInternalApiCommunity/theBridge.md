---
title: "The bridge: our machinery vs fbk's, and the name for what we've been doing"
tags: [facebook, fbk, methodology, directApi]
status: active
created: 2026-10-25
---

# Our machinery measured against fbk (SubQ)

Full scores: [`subqMechanismMatrix.md`](subqMechanismMatrix.md). Every pair does
the **same job** (89–100%), browser vs direct API. The useful split:

## Where fbk is stronger — lean on it
- **Request pacing / governor** — 97% stronger, 98% adopt (already vendored).
- **Deciding on internal-API answers** — direct `doc_id + variables → typed answer`.
- **Session/wire capture → templates**, **request docs → doc_id registry**,
  **family scoping** — fbk's versions are tighter; adopt their shape.

## Where WE are stronger — keep ours
- **The AST commit-log gate** — 86% stronger, 4% adopt. Our *machine-enforced*
  docs-stay-true-with-code (lefthook parses the AST and blocks the commit) beats
  fbk's hand-written doc-sync rules. Keep it; apply it to the ported code too.
- **Enforcement-state handling** — equal/complementary: we **resolve** states
  (checkpoint/captcha/2FA/identity resolvers), fbk **disengages** (cooldown). Our
  resolvers are the browser-side strength; keep them for onboarding.

## The bridge (what makes porting future flows direct)
The highest port-bridge scores are **deciding on answers (97%)**, **session/wire
capture (94%)**, **request documentation (91%)**, **flow-from-inspect (87%)** —
one chain. Read in order, that chain is the whole trick:

> **Our browser records a real session → we lift each request's
> `(doc_id, variables, answer-shape)` → that triple is exactly what fbk's extend
> workflow consumes to add a surface.**

So our capture pipeline *is* fbk's "live-calibration" input. The concrete thing to
build: have `capture --docs` emit, per request, an **fbk-ready registry entry**
(friendly_name → doc_id, and the captured variables as a template). Then exploring a
new flow in the browser once auto-produces everything fbk needs to run it directly
— no hand-porting.

## The name for what you've been doing
Scoping by **platform → family**, recording a flow, pinning its wire shape, and
mapping it into a typed home — that is a **reverse-engineering / live-calibration
pipeline**, and it already has fbk's vocabulary:

- A **surface** = one platform→family's wire knowledge (fbk: `surfaces/<family>.py`;
  ours: `src/<platform>/<area>/<domain>`). *That's the unit you've been building.*
- **Calibration** = exploring a flow and recovering its `(doc_id, variables)` so it
  can be replayed. *That's what `inspect` + `capture --docs` do.*
- The **registry** = the map of friendly_name → doc_id across a deploy.

Proposed log-cli name for the whole loop: **capture → calibrate → map** — the
browser captures a real session, rea/SubQ calibrate each request, and we map it to
its platform→family surface. Future flows enter through that loop and drop straight
into fbk.
