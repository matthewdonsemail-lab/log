# Device isolation: which option fixes the shared-GPU problem

**Date:** 2026-10-18 · **Status:** decision pending (matt)

## The catch, in plain terms

Camoufox can change the **name** of the graphics card a page sees. It can't
change how the real card **draws**. Facebook-style scripts draw a hidden
picture (canvas/WebGL) and hash the pixels. On this PC every account produces
the **same hash**, because the same AMD/NVIDIA chips draw it. From Firefox 156
(Camoufox 0.5.8) the 2D canvas is identical too, and the maintainer says that
is intended (camoufox#860). So:

1. **The accounts share one rendering signature.** It doesn't say "Vietnam".
   It says "these accounts draw on the same machine".
2. **The pinned device says Intel HD 400, but the pixels come from AMD/NVIDIA.**
   A consistency checker can catch that name-vs-pixels lie.

Full study: `../identityLeaks/webglGpuLinkage.md`.

### Does 2Captcha's Fingerprint API fix it? No.

It's real (`/fingerprint/random`, `/fingerprint/generate`, $29–$199/mo). It
returns **values to report**: user agent, GPU name, screen, voices, even a
canvas *hash*. A hash is someone else's answer to someone else's drawing. It
can't make this PC's GPU draw different pixels for a new challenge. Faking the
readback is exactly what FP-Scanner and CreepJS look for. Camoufox already
fills the same fields from BrowserForge, so it would swap the source of the
strings and change nothing about the pixels. Its default format is Chromium,
and our engine is Firefox. See `vendorFacts.md`, deepResearch §1.

### Does boat.dev fix it? Not the pixels. It fixes other things.

boat's own docs: "All sizes are x86_64. No size has a GPU… Graphics run on the
CPU." (https://docs.boat.dev/machines). So on boat, each account would:

- **lose the GPU leak but gain a software-renderer one.** WebGL would report
  `llvmpipe`, a well-known server/VM tell, unless spoofed, and then it's
  the same name-vs-pixels lie as today;
- **likely share a hash with every other boat VM on the same image.** This is
  inferred, not measured; see the trial test below;
- **run on Linux in the EU.** A Windows persona needs Windows fonts and voices
  faked on Linux.

What boat does fix is real: a separate machine per account (disk, cookies,
processes), stable snapshots, ~$0.036/h (≈ $1–2/account/month at 1–2 h/day
inside the $20 minimum), and easy scaling. It's a good **host**. It is not a
**device**.

## How it was decided

- **Evidence loaded (one SubQ `state`, 69,675 tokens):**
  - all 22 `identityLeaks/` files (live tests, code audit, sources);
  - the Parallel ultra deep research (`deepResearch.md`, 81 sources,
    run `trun_088b9aad317442568b0a5110540e06cf`);
  - `vendorFacts.md` (2Captcha and boat, read first-hand).
- **11 options** (`options.json`) and **16 criteria** (`criteria.json`).
  Every criterion is worded so higher = better, on a 5-level scale.
- **SubQ Decisions API** (`subq-snap-preview`, `runSubqMatrix.mjs`).
  Docs: `subqDocs.md` (pulled from docs.subq.ai/llms-full.txt). 16 questions per
  request, the API's maximum.
  - **Pass A:** for each criterion, which option is best (`choice`), 3 repeats.
  - **Pass B:** per option, a 0–4 `score` on each criterion, 2 repeats.
  - **Run-to-run variation:** 0.00, so the answers are deterministic for
    this state.
  - **Usage:** 1,672,525 input tokens (output is always 0).
  - Raw output: `subqResults.json`.
- **Context window:** SubQ's limit is 384K tokens, not 320K
  (decisions-api docs). We used about 70K per call.

## The 16 criteria

| # | Criterion | Asks |
|---|---|---|
| 1 | renderUniqueness | Each account draws its own canvas/WebGL/audio |
| 2 | internalConsistency | No lies a checker can catch (GPU name vs pixels, OS vs fonts) |
| 3 | sessionStability | Same device every session for months |
| 4 | consumerLikeness | Looks like a home device, not a datacenter/VM/emulator |
| 5 | geoConsistency | No trace of Vietnam |
| 6 | crossAccountIsolation | One ban doesn't take the others with it |
| 7 | evidenceQuality | Independent proof it works, not marketing |
| 8 | fitWithLogCli | Reuses the gate, self-check, Twenty device pins |
| 9 | monthlyCostPerAccount | Cheap at 10 accounts |
| 10 | setupEffort | Fast to get the first account running |
| 11 | operationalBurden | Little day-to-day babysitting |
| 12 | scalability | 3 → 50 accounts without new linkage or cost cliffs |
| 13 | dataCustody | We hold the cookies and sessions, not a vendor |
| 14 | reversibility | Easy to back out |
| 15 | marketplaceFit | Matches how real sellers use Marketplace |
| 16 | captchaCompatibility | Captchas and checkpoints solved on the account's own IP and device |

Criteria 1–7 and 16 are the **detection** criteria. The weighted view
counts them double.

## The matrix (SubQ pass B, 0 = worst, 4 = best)

| Option | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | Mean | Weighted | Detection only |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| **Physical device per account** | 3.7 | 3.6 | 3.3 | 3.4 | 2.9 | 3.1 | 3.1 | 1.8 | 2.9 | 2.1 | 1.9 | 1.8 | 3.8 | 3.2 | 2.9 | 2.7 | **2.89** | **3.00** | **3.23** |
| Status quo (this PC) | 0.3 | 1.8 | 2.6 | 2.7 | 3.0 | 1.5 | 3.2 | 3.9 | 3.5 | 3.8 | 2.8 | 0.8 | 3.6 | 3.4 | 2.0 | 2.4 | 2.60 | 2.47 | 2.21 |
| Cloud Windows VM + GPU | 3.0 | 2.6 | 2.7 | 1.2 | 2.7 | 2.9 | 1.7 | 2.5 | 1.1 | 1.8 | 2.0 | 1.3 | 2.6 | 2.6 | 2.1 | 2.5 | 2.21 | 2.28 | 2.41 |
| Anti-detect browser | 2.8 | 2.1 | 2.5 | 2.5 | 2.5 | 2.0 | 1.7 | 1.7 | 2.5 | 2.2 | 2.2 | 2.0 | 2.8 | 2.3 | 2.0 | 2.0 | 2.26 | 2.26 | 2.28 |
| Software noise + split iGPU/dGPU | 2.3 | 1.5 | 2.0 | 2.6 | 3.1 | 1.5 | 1.6 | 2.7 | 3.8 | 1.7 | 2.0 | 0.6 | 3.8 | 3.1 | 2.1 | 2.3 | 2.30 | 2.24 | 2.12 |
| GPU sandbox (Daytona/Kernel/Modal) | 2.8 | 2.4 | 2.3 | 0.5 | 2.4 | 2.5 | 1.7 | 1.9 | 1.0 | 1.7 | 2.3 | 1.4 | 1.6 | 2.5 | 1.8 | 2.1 | 1.93 | 1.99 | 2.10 |
| 2Captcha Fingerprint API | 0.3 | 0.8 | 2.6 | 2.5 | 3.1 | 1.3 | 1.0 | 2.9 | 2.8 | 2.6 | 2.6 | 1.0 | 3.3 | 2.8 | 2.1 | 1.9 | 2.10 | 1.96 | 1.69 |
| **boat.dev VM per account** | 1.0 | 1.0 | 2.9 | 0.6 | 2.5 | 2.4 | 1.6 | 2.1 | 3.1 | 2.1 | 2.4 | 2.1 | 2.5 | 2.9 | 1.3 | 2.1 | 2.02 | 1.93 | 1.75 |
| Cloud phone (GeeLark etc.) | 2.1 | 2.1 | 2.5 | 1.4 | 2.2 | 2.2 | 1.1 | 0.8 | 2.1 | 1.9 | 2.3 | 1.8 | 1.1 | 2.4 | 2.9 | 1.8 | 1.92 | 1.92 | 1.92 |
| Cloud browser vendor | 1.4 | 2.0 | 2.3 | 0.7 | 2.4 | 2.1 | 1.2 | 1.2 | 1.7 | 2.0 | 2.8 | 2.1 | 1.1 | 2.2 | 1.7 | 2.0 | 1.81 | 1.80 | 1.77 |
| 2Captcha Browser API | 1.2 | 1.7 | 1.9 | 0.7 | 2.4 | 1.9 | 0.8 | 0.8 | 1.5 | 1.9 | 2.4 | 1.6 | 0.6 | 1.9 | 1.7 | 1.5 | 1.53 | 1.53 | 1.52 |

**Pass A** (head to head, which option wins each criterion):
- **Physical device per account wins 10 of 16:**
  - render uniqueness 0.85, consistency 0.87, stability 0.62, consumer-like 0.91;
  - geo 0.43, isolation 0.83, evidence 0.45;
  - custody 0.73, Marketplace fit 0.62, captcha 0.49.
- **Status quo wins 5:** fit with log-cli, cost, setup, operational burden,
  reversibility.
- **boat wins 1: scalability (0.56).**

## Where the three sources agree and disagree

- **They agree:**
  - 2Captcha's Fingerprint API, CPU-only sandboxes (boat) and random canvas
    noise don't solve real-pixel diversity. All three rank them low on
    criteria 1, 2 and 4. The deep research ranks them last (rank 7).
  - A physical device per account is the most coherent. It's rank 1 in the
    deep research and wins both SubQ passes.
- **They disagree on how much the shared hash matters.** The deep research
  stresses that no public evidence shows Meta links Marketplace accounts by
  canvas hash (DEC is graph/IP/device-group based). A shared hash can just
  mean "same hardware cohort": thousands of people own a Radeon 780M. SubQ
  scores render uniqueness as if it matters a lot. **The honest position:
  unknown weight, and a known contradiction (name vs pixels) we can remove
  for free.**
- **Our own correction to SubQ:** with no evidence, SubQ rated boat 3.6/4 on
  render uniqueness (smoke test). With the evidence loaded it dropped to 1.0.
  The answer is only as good as the `state`.

## Recommendation

1. **Sunday, on this PC (cost: nothing).** Make the pinned device **honest**:
   set each account's `webgl_config` to the real GPU family (AMD Radeon
   780M or RTX 4060 Laptop under ANGLE D3D11) instead of Intel HD 400. That
   removes the name-vs-pixels lie. The accounts still share a hardware
   cohort, but it's a common, real one. Keep it to a few accounts on this PC.
2. **Spread across machines as accounts grow.** A cheap used Android phone or
   mini PC per account, or per 2–3 accounts, is the strongest option on
   every source. It's roughly $3–6/account/month amortised. Planning
   figures, not quotes.
3. **boat: use it as a host, not as the fix.** It's the cheapest way to run
   log-cli per account in isolation and to scale. Before any account goes
   on it, run the **boat trial test** below. If the two VMs hash the same
   and report `llvmpipe`, keep Facebook sessions off boat and use it for the
   non-browser work (orchestration, scans of public data, the CLI itself).
4. **Don't buy:**
   - 2Captcha Fingerprint API: strings only;
   - 2Captcha Browser API: a third party holds the sessions, no GPU evidence,
     price unpublished;
   - random-per-read canvas noise: breaks stability.

### boat trial test (free trial, 25 h)

1. Create two default boat VMs from the same image.
2. In each, launch Camoufox headed through a 2Captcha Irish proxy (the gate
   needs the proxy). Record:
   - `UNMASKED_RENDERER_WEBGL`;
   - the `readPixels` hash from `glprobe`;
   - the 2D canvas `toDataURL` hash;
   - the fonts list.
3. **Pass:** the hashes differ between the VMs, the renderer isn't
   `llvmpipe`/SwiftShader, and Windows fonts are present.
4. **Fail:** anything else. Then boat stays a host for non-Facebook work.

## Files

| File | What |
|---|---|
| `vendorFacts.md` | 2Captcha Fingerprint API, Browser API and boat, read first-hand |
| `deepResearch.md` / `.json` | Parallel ultra deep research, 81 sources |
| `options.json`, `criteria.json` | The 11 options and 16 criteria |
| `runSubqMatrix.mjs` | Reproduces the SubQ run (`SUBQ_API_KEY=... node docs/deviceIsolation/runSubqMatrix.mjs`) |
| `subqResults.json` | Raw SubQ answers (pass A and B) |
| `subqDocs.md` | docs.subq.ai, the full docs as pulled on 2026-10-18 |
