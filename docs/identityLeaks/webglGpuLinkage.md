# WebGL and GPU: one real graphics card behind every account

**Id:** `webglGpuLinkage` · **Severity:** high (links accounts) · **Status:** leaking. No software fix; needs matt's decision (accept the risk or spread accounts across machines).

## Summary

Camoufox changes the GPU **name** WebGL reports. It can't change how the real
GPU **draws**. A fixed WebGL scene read back with `readPixels` gave the same
hash on three launches that claimed three different GPUs (R2 §8). So every
account run on this PC shares one stable rendering signature. A device that
claims to be one GPU but draws exactly like another is also a lie a
consistency checker can catch. This doesn't reveal Vietnam. It can link the
accounts to each other and to one machine.

## What leaks and to whom

- **To Facebook and to captcha vendors** (Arkose returns a canvas fingerprint
  to the site, S43): a rendering hash shared by every account on this PC.
- **What it reveals:** that different "people" use the same physical device.
  Also that the GPU name is spoofed, when the name doesn't fit the pixels.
- **Not leaked:** the real GPU names (AMD Radeon 780M, RTX 4060 Laptop). They
  never appeared in any string (R3 T8).

## Evidence

- **Local probe (R2 §8, `glprobe.py`).** A fixed fragment shader, read back with
  `readPixels`, gave the same hash (`36980450`, and the same `toDataURL` hash) on
  3 launches claiming Intel HD Graphics, Radeon HD 3200 and Intel HD Graphics
  400. 2D canvas and audio did change (seeded noise in beta.30). WebGL output
  didn't. *verifiedLive (local probe)*
- **Live (R3 T8).** WebGL strings were spoofed (`Apple M1, or similar`, or
  `ANGLE (NVIDIA, NVIDIA GeForce GTX 980 Direct3D11…)`). The real GPU never
  showed. R3 did not test the rendered pixels. *verifiedLive (proxied)*
- **bot.sannysoft (R3 T10):** canvas tests 1 to 5 gave the same hash
  (1106838076). *verifiedLive (proxied)*
- **Upstream.** camoufox#860: from v156, canvas noise and font-spacing noise
  are gone, so even 2D canvas is identical across profiles on one host.
  camoufox#729: consistency checkers flag implausible combinations.
  *upstreamIssue*
- **Camoufox docs.** WebGL vendor, renderer, extensions, parameters and shader
  precision can be set, with a warning against mixing incompatible values (S9).
  The README says canvas uses stock-style pixels on the host OS by default (S2).
  *vendorDocs*
- **Research.** FP-Scanner detects inconsistent fingerprints (S52). Meta's DEC
  system builds features from linked entities, including "Device: operating
  system → users sharing the device" and "IP Address: country, reputation →
  registered accounts" (S38, Table 1). *vendorDocs (paper)*
- Whether Meta's device entity uses a WebGL render hash is not public (R2 §8).
  *inference*
- **Blocking WebGL is worse.** Camoufox's own `block_webgl` warning says "Many
  WAFs will check if WebGL is enabled" (R2, `warnings.yml`). *verifiedSource*

### Where the reports disagree

There is no conflict. R3 shows the **strings** are spoofed. R2 shows the
**pixels** are not. Both are true. The pixels are what link accounts.

## Where in our code it can happen again

- **Every account launched on this PC.** This is a property of the machine, not
  of a line of code.
- **The persona's `webgl_config`** (`deviceFingerprintChurn.md`). A name far from
  the real GPU family makes the mismatch worse.
- **The Camoufox upgrade to v156** makes 2D canvas identical across profiles
  too (camoufox#860).
- **Adding accounts.** Each new account on this PC adds another link to the same
  device.

## Mitigation

No config key hides the real GPU's output (R2 §8). The options:

1. **Make the name fit the pixels.** Pick a `webgl_config` pair from the real
   GPU's family (AMD Radeon integrated or NVIDIA RTX laptop, under ANGLE
   Direct3D11) and keep it in the persona. The name then doesn't contradict the
   rendering. The link between accounts stays.
2. **Fewer accounts per physical machine.** Run accounts from different
   machines, ideally one machine per account or per small group.
3. **Accept the risk** knowingly, and record that decision here.
4. **Don't block WebGL.** It is a stronger tell.

## How to re-test

> **Disposable scripts.** Any script named below under `.scratch` sits outside git, was a throwaway, may be gone, and is not a supported tool. `python/leakProbe.py` and `log proxy probe` don't exist yet. Until they do, the repeatable check at `2de5ff5` is a `log publish` dry run against `python/fixtures/createItem.html`, with the page-side probes in this file (`docs/proxies.md`, "Checked").

1. Run `C:\Users\0\.buzz\.scratch\camoufox_probe\glprobe.py` (or `glprobe_js.py`)
   with two different accounts' personas.
2. Compare the `readPixels` hashes. Today they will match. That is the leak.
3. After any change of machine, GPU driver or Camoufox version, compare again,
   and record the new hash.
4. Check the persona's `UNMASKED_RENDERER_WEBGL` names a GPU from the real
   GPU's family.

## Status

Unchanged at `2de5ff5`. There is still no software fix. The pinned device reports
Intel HD 400, the same for every account, and the pixels still come from this
PC's real GPU. matt needs to decide whether to accept the risk or spread
accounts across machines (README, "Open decisions for matt").
