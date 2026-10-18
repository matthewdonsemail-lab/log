# Scale architecture: SubQ matrix (2026-10-18)

matt's brief (`brief.md`): no physical hardware (he is in Vietnam). Cost and reliability come first, then scale to
hundreds of thousands of accounts across platforms. Environments must be isolated and viewable, use 2Captcha
residential egress instead of the host's datacenter IP, carry per-environment configs, allow provider swaps and be
tested against detection before going live.

SubQ (`subq-snap-preview`, Decisions API) read 50 files in one `state` (about 168K tokens): `deviceIsolation/`,
all 22 `identityLeaks/`, `vendors/`, the log-cli docs, and the Listaro_backup architecture, operations, cloud-posting,
AdsPower-server, auto-login, captcha and validation docs. 16 calls, 2.64M input tokens. Repeat runs gave identical
answers. Raw output: `subqResults.json`. Computed tables: `subqSummary.txt`. Rerun with `runSubqScaleMatrix.mjs`.

## Ranking (0-4)

Weights: cost, reliability and scalability ×3. No-physical, residential egress, render uniqueness, consistency,
cross-account isolation and provider swappability ×2. Everything else ×1.

| # | Option | Weighted | Plain |
|---|---|---|---|
| 1 | Provider-agnostic environment layer, boat default | 2.70 | 2.73 |
| 2 | Self-managed VPS + containers (Hetzner/OVH) | 2.44 | 2.51 |
| 3 | boat VM per account | 2.41 | 2.43 |
| 4 | This PC as is | 2.40 | 2.57 |
| 5 | Cloud Windows GPU VM | 2.26 | 2.42 |
| 6 | Anti-detect browser on servers (Listaro's AdsPower route) | 2.26 | 2.26 |
| 7 | boat VM packed with many accounts | 2.22 | 2.23 |
| 8 | Cloud browser vendor | 2.18 | 2.15 |
| 9 | 2Captcha Fingerprint API | 2.18 | 2.23 |
| 10 | GPU sandbox | 2.14 | 2.23 |
| 11 | Cloud phone | 2.02 | 2.00 |
| 12 | 2Captcha Browser API | 1.70 | 1.67 |

Option 1 is an architecture we proposed, not a vendor. It scores highest because it wraps the vendors. Read it as
"build the layer, then put boat behind it".

## Best option per criterion (choice pass)

boat VM per account wins 5 of 16: no-physical, reliability, residential egress, viewability, cross-account isolation.
The layer wins 4: scalability, swappability, multi-platform, detection testability. The PC wins 3: fit with log-cli,
evidence, data custody. Cloud GPU Windows wins 2: render uniqueness, consistency. Packed boat wins cost.
Cloud browser vendors win operational burden.

## Claims checked against the evidence (p true)

| Claim | p |
|---|---|
| Short boat trial (2 VMs, Irish proxy, compare renderer and hashes) before committing | 0.98 |
| Every environment must pass the leak suite and a live leak-site run before going live | 0.96 |
| Listaro's failure modes (AdsPower on Hetzner, cookie expiry, captchas, auto-login) apply | 0.96 |
| boat can force all browser traffic through 2Captcha residential | 0.93 |
| A provider-agnostic environment layer is required for this scale | 0.93 |
| Account quality, geo, session stability and behaviour drive bans more than GPU pixels | 0.93 |
| Datacenter IP on Facebook is unacceptable | 0.93 |
| boat is the cheapest viable remote host per account | 0.89 |
| llvmpipe software rendering is a VM tell | 0.87 |
| Other platforms will need cloud phones | 0.49 |
| GPUs are needed for safe scale | 0.21 |
| All boat VMs render identical pixels | 0.20 (our inference, unproven, test in trial) |
| Physical devices are required | 0.13 |
| Packing many accounts per VM is acceptable isolation | 0.04 |
| Meta links Marketplace accounts by canvas hash (public evidence) | 0.02 |
| 2Captcha Fingerprint API is worth buying | 0.01 |

## What it means

1. Build the environment layer in log-cli: per account in Twenty, `host provider + browser + device profile +
   proxy + schedule`, with adapters. boat is the first adapter. Self-managed VPS is the fallback adapter and the
   cost hedge at large scale.
2. One boat VM per account, not packed (packing scored 0.04). Browser egress through the account's 2Captcha
   residential proxy. The boat IP never touches the platform.
3. Weakest scores for boat: consistency 0.6 (llvmpipe on Linux) and render uniqueness 1.1. The boat trial must
   measure renderer strings and pixel hashes across 2 VMs before accounts move.
4. Every environment passes the identityLeaks suite plus a live leak-site run through its proxy before going live.
5. Don't buy the 2Captcha Fingerprint or Browser API. Physical devices and GPUs aren't required. Cloud phones are
   a later adapter for mobile-first platforms (a coin flip, 0.49).
