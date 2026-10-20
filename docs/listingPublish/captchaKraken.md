# CaptchaKraken: the captcha solver

Read from the GitHub API on 2026-10-18 (`CaptchaKraken/CaptchaKraken`,
commit `a08b8ff`). The paths below are in that repo.

## What it is

- **Author:** Jake Writer (`JWriter20`). His bio says he maintains Camoufox's
  core. Its old repo, `JWriter20/CaptchaKraken`, redirects to
  `github.com/CaptchaKraken/CaptchaKraken` (source-available licence v1.1).
- **Packages:** npm `captchakraken` 3.2.1 (TS driver, 2026-10-17), PyPI
  `captchakraken` 3.2.1 (the engine the npm package runs), npm
  `captchakraken-mcp` 0.1.4 (signs you in and makes keys).
- **Model:** Qwen3.5-9B tuned for captchas, served on vLLM. The hosted API
  runs **Abyss**, with four experts picked per puzzle: `abyss-grid`,
  `abyss-general`, `abyss-video`, `abyss-text`. Open weights are on Hugging
  Face `CaptchaKraken/*` (Twilight v1.2 FP8 needs ~22 GB VRAM, Sunlight v1.2
  AWQ ~14 GB, plus a GGUF build that runs on CPU).

We use the **hosted API**. matt has credits.

## Keys and config

Put these in `.env.local` (see `.env.example`):

| Var | Value |
| --- | --- |
| `CAPTCHA_KRAKEN_API_KEY` | `ck_live_…` (also accepted as `VLLM_API_KEY`) |
| `VLLM_BASE_URL` | `https://api.captchakraken.com/v1` |

If both are unset, the driver reads `~/.captchakraken/credentials`, which
holds `KEY=VALUE` lines and is written by the MCP's `create_api_key`, then
falls back to `localhost:8000` (`python/src/captchakraken/config.py`).
Optional settings: `CAPTCHA_HUMANIZATION` (`mouse|mobile|none`),
`CAPTCHA_EXPERT`, `CAPTCHA_REPORT_OUTCOME=0`, `CAPTCHA_DEBUG=1`.

The `ck_live_` key can solve captchas but can't manage the account. The MCP's
`ckm_` token is the reverse (`docs/hosted-api.md`).

## Using it from TypeScript

```ts
import { CaptchaKrakenSolver, CaptchaKrakenAPIError } from 'captchakraken'

const solver = new CaptchaKrakenSolver({ humanization: 'none' }) // Camoufox already humanizes
const result = await solver.solve(page)
// { isSolved, finalMousePosition, tokenUsage, phases?, verdicts: [{ vendor, verdict }] }
```

- `npm install captchakraken` runs a `postinstall` step that creates a
  Python venv in `node_modules/captchakraken/python/.venv` and installs the
  PyPI engine (`js/scripts/setup-python.js`). **Python 3.11+** is needed: the
  script says 3.10, but PyPI requires 3.11. Each question to the model runs
  `python -m captchakraken.cli` as a subprocess (`js/src/solver.ts`).
- `solver.watch(page, { onSolved, onError })` keeps watching for captchas
  that appear at unpredictable times.
- Errors: `CaptchaKrakenAPIError.code` is one of `missing_api_key`,
  `invalid_api_key`, `insufficient_credits`, `rate_limited` (with
  `retryAfterSeconds`), `request_too_large`, `upstream_unavailable` and others.
  "No widget detected" is a plain `Error` (`js/src/errors.ts`, `kinds.ts`).
- Billing: each `solve()` sends one `X-CK-Session` id. Image response = 3
  credits ($0.30/1k), video = 10, checkbox/Turnstile free. Cap is 5 billable
  responses per solve. The live pricing endpoint (2026-10-18) says 10.

## Camoufox notes

- Supported officially: a `camoufox-js` page goes straight to `solve()`. The
  README shows Camoufox solving 3/3 live reCAPTCHA demos.
- **Turn one humanizer off.** Camoufox `humanize` on top of the solver's
  `mouse` mode took 82 s vs 13 s on one slide (`docs/usage.md`,
  `TRIBAL_KNOWLEDGE.md`). log-cli's Camoufox runs with humanize, so use
  `humanization: 'none'`.
- `mobile` mode doesn't work in Firefox (no touch dispatch,
  `js/src/humanize.ts:187-340`).
- **Our worker is Python.** log-cli drives Camoufox from `python/session/logWorker.py`,
  so the page lives in Python. The PyPI package gives the same solver in
  Python (`captchakraken` `page_solver.py`), which means the solve can run
  inside the worker with no extra hop to TS.

## What it can solve on Facebook

Vendors the code detects (`js/src/kinds.ts`): reCAPTCHA, Turnstile, GeeTest,
Tencent, Yidun, Yandex, Lemin, Prosopo, MTCaptcha, BotDetect, and hCaptcha (no
longer advertised).

- ✅ **reCAPTCHA v2 inside FB checkpoints**: detected by its
  `google.com/recaptcha` / `bframe` iframes and solved.
- ❌ **Arkose / FunCaptcha**: a search of the whole repo finds no match for
  arkose, funcaptcha, facebook or meta, and it isn't on `docs/roadmap.md`.
  FB uses Arkose on login and checkpoint walls.
- ❌ **FB's own image/text checkpoints**: detection is CSS selectors per
  vendor, so these come back as "no widget detected".

What Listaro did instead (`src/lib/auto-login/captcha-solver.ts`):
2Captcha, during **auto-login only**, never while posting. Its order:
Arkose (`FunCaptchaTaskProxyless`) → FB's
`iframe#captcha-recaptcha` (reCAPTCHA Enterprise, site key read from CDP
targets) → reCAPTCHA v2 → hCaptcha → image-to-text. **A fallback 2Captcha
API key is committed in that file (`:11-12`). Rotate it.**

So for log-cli: CaptchaKraken first (reCAPTCHA). If the page is
Arkose, stop with `unsupportedCaptcha` and mark the account as needing a
person. Don't guess.
