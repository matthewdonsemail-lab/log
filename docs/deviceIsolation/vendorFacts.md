# Vendor facts checked first-hand (2026-10-18)

Read straight from the vendors' own pages on 2026-10-18. These are vendor
claims, not independent tests. Each line says which.

## 2Captcha Fingerprint API

Source: https://2captcha.com/fingerprints/api

- **What it returns:** fingerprint *values*. `userAgent`, `navigator.platform`,
  `hardwareConcurrency`, `deviceMemory`, screen size, WebGL `vendor`/`renderer`,
  `glParameters`, `glAvailableExtensions`, speech voices, `intl` languages and
  timezone, `webgpu`. The `raw` generate format adds `canvas` (a hash string),
  `fonts` and `visitor_id` (a hash). *vendorDocs*
- **Endpoints:** `GET /fingerprint/random` returns "a random, real-world
  fingerprint from our database". `GET /fingerprint/generate` returns "a fresh
  fingerprint tailored to your exact specs". Filters: `tags` (OS, browser,
  device), `country`, browser version. *vendorDocs*
- **Default format is `chromium`.** The examples are Chrome/Edge profiles
  (`Google Inc.`, `ANGLE ...`). A `Firefox` tag exists. Our browser is Firefox
  (Camoufox). A Chromium profile in a Firefox engine is an engine mismatch.
  *vendorDocs + inference*
- **Price:** $29/mo (30 req/min) to $199/mo (unlimited, includes proxy). Sold
  as a subscription through sales. *vendorDocs*
- **What it can't do:** it hands us *numbers to report*. It can't change how
  this PC's GPU draws pixels. The `canvas` field is a hash of someone else's
  rendering. Nothing in Camoufox can make our GPU produce that hash. We could
  only intercept the readback and return fake data, which is the canvas "lie"
  CreepJS and FP-Scanner test for. *inference, see `../identityLeaks/webglGpuLinkage.md`*
- **Overlap with today:** Camoufox already fills these same fields from
  BrowserForge's real-world dataset, and log-cli pins them per account
  (`deviceProfile`). The Fingerprint API would swap the *source* of the
  strings. It doesn't touch the pixels. *verifiedSource (our code)*

## 2Captcha Browser API

Source: https://2captcha.com/scraper/browser-api

- A remote cloud browser you drive over CDP/WebSocket with Playwright or
  Puppeteer. "Chromium and Firefox" are listed. The FAQ says sessions run
  "headful (GUI) on 2Captcha servers". *vendorDocs*
- Claims it "dynamically spoofs hardware and software fingerprints at the
  kernel level" (Canvas, WebGL, WebRTC, fonts, TLS). No independent test is
  given. *vendorDocs (unverified claim)*
- Persistent profiles and sticky sessions: "maintain cookies, localStorage,
  and active login states". How long they last isn't stated. *vendorDocs*
- The hardware isn't described, so there's no evidence of real GPUs. The pixels
  come from 2Captcha's server fleet, shared with every other customer,
  including scrapers and abusers. *vendorDocs + inference*
- Price isn't published, and the page contradicts itself (per GB vs per
  session + bandwidth). *vendorDocs*
- Our gate (launch self-check, pinned device in Twenty, local hours) would
  have to be re-done against a browser we don't control. Cookies and the
  Facebook session would live on 2Captcha servers. *inference*

## boat (boat.dev)

Sources: https://boat.dev, https://docs.boat.dev/quickstart,
https://www.ycombinator.com/companies/boat,
https://github.com/ariana-dot-dev/cloud-sandbox-vm-skills

- **What it is:** persistent full Ubuntu Linux VMs for AI agents (YC).
  4 vCPU / 8 GB / 80 GB by default. SSH, Docker, Chrome preinstalled, a 60fps
  virtual desktop, a dedicated IPv4. Per-second billing, $20/mo minimum, which
  buys ~2,000,000 VM-seconds (~555 h) at the default size. Stopped sandboxes
  snapshot and don't bill. 100–2,000 active sandboxes self-serve. *vendorDocs*
- **Regions:** EU only (Germany, Finland, France). *vendorDocs*
- **No Windows images.** Linux only. *vendorDocs*
- **No GPU, stated outright.** https://docs.boat.dev/machines: "All sizes are
  x86_64. No size has a GPU." The GPU row reads "None. Graphics run on the
  CPU." Sizes: small $0.018/h (2 vCPU/4 GB), default $0.036/h (4/8), large
  $0.072/h (8/16), xlarge $0.200/h (16/32). *vendorDocs*
- **What that means for us** *(inference, to be tested on a trial VM)*:
  - With no GPU, Firefox renders WebGL and canvas in software (Mesa llvmpipe
    or SwiftShader). Software rendering is deterministic for the same Mesa
    version and CPU features, so **every boat VM on the same image would likely
    produce the same canvas/WebGL pixels**. That's the same linkage problem
    moved to boat's fleet, shared with every other boat customer.
  - The WebGL renderer would honestly read `llvmpipe`, which is a well-known
    VM/server tell. Spoofing it to a Windows GPU name while drawing llvmpipe
    pixels is the same name-vs-pixels lie we have today, only worse.
  - The OS is Linux. Claiming Windows needs Windows fonts and voices, and
    Linux font rendering differs. Claiming Linux desktop puts the account in
    a ~3–4% desktop OS bucket.
  - The good parts are real: a separate machine per account (CPU, memory,
    disk, storage, cookies), which fixes **host co-location** and
    cookie/profile cross-contamination; snapshot/resume gives a stable device;
    traffic would still exit through the account's 2Captcha proxy. The boat IP
    itself must never touch Facebook (the gate already refuses that).
  - Cost estimate: ~1 h/day per account ≈ 30 h/mo ≈ $1/account/mo on the
    default size, inside the $20 minimum for ~18 accounts.

## Corrections to the question

- SubQ's Decisions API window is **384K tokens (393,216)**, not 320K
  (https://docs.subq.ai/markdown/endpoints/decisions-api.md).
- A Decisions request takes **1–16 questions**, so 16 questions is exactly one
  request per pass.
- Our key can only use `subq-snap-preview` (Decisions). `GET /v1/models`
  returns nothing else, so SubQ returns probabilities, not written analysis.
