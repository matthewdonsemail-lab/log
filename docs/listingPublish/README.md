# listingPublish

How a Facebook Marketplace listing gets **posted**: the state machine, how
images get loaded, processed and attached, and how captchas get solved. This
folder is written from the source of the three earlier projects. It does not
describe anything log-cli does yet. Every claim cites `file:line` in the repo
it came from.

log-cli has no publish code today (`AGENTS.md` rule 8: read-only on Facebook).
This is the map to build it from.

| File | What it covers |
| --- | --- |
| [`stateMachine.md`](stateMachine.md) | The publish flow as states and transitions: what each source does, and the machine log-cli should run |
| [`imagePipeline.md`](imagePipeline.md) | Where photos come from, how they're changed, how they're attached to the form, how the upload is confirmed |
| [`formFill.md`](formFill.md) | The create form at `facebook.com/marketplace/create/item`, field by field, with the selectors that worked |
| [`captchaKraken.md`](captchaKraken.md) | The captcha solver (CaptchaKraken): package, keys, Camoufox notes, what it can and can't solve on Facebook |
| [`sources.md`](sources.md) | The three source repos, what was verified live in each, and the bugs not to copy |

## Sources

| Short name | Repo (local checkout) | Language | Status |
| --- | --- | --- | --- |
| **FCC** | `facebook-camofox-client` | Python, Camoufox | Real browser driver. One live publish (spike), photo edit live |
| **Listaro** | `Listaro_backup` | TypeScript, Playwright over AdsPower | Production poster with paying users. Server path is the live one |
| **LKH** | `listeningkit-hackathon` `apps/web/src/lib/listings` | TypeScript | Dashboard store, no browser. Owns the listing status machine log-cli already ports |

`open-typesafe-camoufox` is **stale** (matt, 2026-10-18). It was an
experiment with vision models. Only its CaptchaKraken notes carry over, in
`captchaKraken.md`.

## The short version

1. **One photo per post is what production did.** Listaro picks 1 image
   from the template pool and runs it through `sharp`: crop, rotate, colour,
   noise, re-encode. That gives it a new file hash, so Facebook's duplicate
   check doesn't flag it. It attaches the image with
   `setInputFiles` on the hidden `input[accept="image/*,…"]`, with no file
   chooser (`imagePipeline.md`).
2. **Nobody confirms the upload finished.** Both repos sleep 3–5 s. The
   only real check is FB's own `N/10 photos` counter. FCC's spike waits for
   it, and log-cli should make that a hard gate.
3. **Publish isn't proven by either production path.** Listaro returns
   success with no URL. FCC takes the first `/marketplace/item/` link on the
   page, which can belong to another listing. The spike's flow is the one
   that worked live: Next, then Publish, then a possible second audience
   screen, then the `you/selling` toast, then the card's id.
4. **Captcha:** Listaro used 2Captcha, only during auto-login, never while
   posting. CaptchaKraken (matt has credits) covers reCAPTCHA v2 inside FB
   flows but **not Arkose/FunCaptcha**. Arkose is the other captcha FB uses.
