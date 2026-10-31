# CaptchaKraken, the captcha solver

CaptchaKraken is the hosted service log uses first to solve captchas that appear in a browser session. This page covers how to set up its keys, how to call it, what to watch for with Camoufox, and which Facebook captchas it can and can't solve. Read it if you're configuring captcha solving or a run stopped on a captcha.

It was written from CaptchaKraken's GitHub repo (`CaptchaKraken/CaptchaKraken`, commit `a08b8ff`, read 2026-10-18). The paths below are in that repo.

## What it is

- **Packages:** npm `captchakraken` 3.2.1 (the TypeScript driver), PyPI `captchakraken` 3.2.1 (the engine the npm package runs), and npm `captchakraken-mcp` 0.1.4 (signs you in and makes keys). The repo moved from `JWriter20/CaptchaKraken` to `github.com/CaptchaKraken/CaptchaKraken` (source-available licence v1.1).
- **Model:** Qwen3.5-9B tuned for captchas, served on vLLM. The hosted API runs **Abyss**, which picks one of four experts per puzzle: `abyss-grid`, `abyss-general`, `abyss-video`, `abyss-text`. Open weights are on Hugging Face under `CaptchaKraken/*` (Twilight v1.2 FP8 needs about 22 GB VRAM, Sunlight v1.2 AWQ about 14 GB, and there's a GGUF build that runs on CPU).

log uses the **hosted API**.

## Keys and settings

Put these in `.env.local` (see `.env.example`):

| Variable | Value |
| --- | --- |
| `CAPTCHA_KRAKEN_API_KEY` | `ck_live_…` (also accepted as `VLLM_API_KEY`) |
| `VLLM_BASE_URL` | `https://api.captchakraken.com/v1` |

If both are unset, the driver reads `~/.captchakraken/credentials` (`KEY=VALUE` lines, written by the MCP's `create_api_key`), and then falls back to `localhost:8000` (`python/src/captchakraken/config.py`).

Optional settings: `CAPTCHA_HUMANIZATION` (`mouse|mobile|none`), `CAPTCHA_EXPERT`, `CAPTCHA_REPORT_OUTCOME=0`, `CAPTCHA_DEBUG=1`.

There are two kinds of key. The `ck_live_` key can solve captchas but can't manage the account. The MCP's `ckm_` token is the reverse (`docs/hosted-api.md`).

## Using it from TypeScript

```ts
import { CaptchaKrakenSolver, CaptchaKrakenAPIError } from 'captchakraken'

const solver = new CaptchaKrakenSolver({ humanization: 'none' }) // Camoufox already humanizes
const result = await solver.solve(page)
// { isSolved, finalMousePosition, tokenUsage, phases?, verdicts: [{ vendor, verdict }] }
```

- **Install:** `npm install captchakraken` runs a `postinstall` step that creates a Python venv in `node_modules/captchakraken/python/.venv` and installs the PyPI engine (`js/scripts/setup-python.js`). You need **Python 3.11+**: the script says 3.10, but the PyPI package requires 3.11. Each question to the model runs `python -m captchakraken.cli` as a subprocess (`js/src/solver.ts`).
- **Watching:** `solver.watch(page, { onSolved, onError })` keeps watching for captchas that appear at unpredictable times.
- **Errors:** `CaptchaKrakenAPIError.code` is one of `missing_api_key`, `invalid_api_key`, `insufficient_credits`, `rate_limited` (with `retryAfterSeconds`), `request_too_large`, `upstream_unavailable` and others. "No widget detected" is a plain `Error` (`js/src/errors.ts`, `kinds.ts`).
- **Billing:** each `solve()` sends one `X-CK-Session` id. An image response costs 3 credits ($0.30 per 1,000), a video 10, and a checkbox or Turnstile is free. The cap is 5 billable responses per solve in the code; the live pricing endpoint said 10 on 2026-10-18.

## With Camoufox

- **Supported directly:** a `camoufox-js` page goes straight to `solve()`. The README shows Camoufox solving 3 of 3 live reCAPTCHA demos.
- **Turn one humanizer off.** Camoufox's `humanize` on top of the solver's `mouse` mode took 82 s instead of 13 s on one slider (`docs/usage.md`, `TRIBAL_KNOWLEDGE.md`). log's Camoufox runs with humanize on, so use `humanization: 'none'`.
- **`mobile` mode doesn't work in Firefox** (no touch events, `js/src/humanize.ts:187-340`).
- **log's worker is Python.** log drives the browser from `python/session/logWorker.py`, so the page lives in Python. The PyPI package offers the same solver in Python (`page_solver.py`), so a solve can run inside the worker with no extra hop to TypeScript.

## What it can solve on Facebook

The code detects these vendors (`js/src/kinds.ts`): reCAPTCHA, Turnstile, GeeTest, Tencent, Yidun, Yandex, Lemin, Prosopo, MTCaptcha, BotDetect, and hCaptcha (no longer advertised).

- **Yes: reCAPTCHA v2 inside Facebook checkpoints.** Found by its `google.com/recaptcha` / `bframe` iframes, and solved.
- **No: Arkose / FunCaptcha.** Nothing in the repo mentions arkose, funcaptcha, facebook or meta, and it isn't on `docs/roadmap.md`. Facebook uses Arkose on login and checkpoint screens.
- **No: Facebook's own image and text checkpoints.** Detection uses CSS selectors per vendor, so these come back as "no widget detected".

An earlier production poster used 2Captcha instead, only while signing in, never while posting. It tried, in order: Arkose (`FunCaptchaTaskProxyless`), then Facebook's `iframe#captcha-recaptcha` (reCAPTCHA Enterprise, with the site key read from the browser's targets), then reCAPTCHA v2, then hCaptcha, then image-to-text.

**What log does:** CaptchaKraken first (reCAPTCHA). Facebook's own text captchas go to 2Captcha's image solver. If the page shows Arkose, the run stops with `unsupportedCaptcha` and the account is marked as needing a person. It never guesses.
