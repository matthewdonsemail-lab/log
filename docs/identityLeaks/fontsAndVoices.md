# Fonts and speech voices: host fonts and voices

**Id:** `fontsAndVoices` · **Severity:** low · **Status:** not leaking (host fonts and voices hidden). OS-mismatch tells come from `deviceFingerprintChurn`.

## Summary

This PC has 623 font families, 536 of them not in Camoufox's Windows list. It
also has Japanese and Chinese speech voices. A page could use these to identify
the machine, or to guess the user's languages. Neither leaks. Font measurement
finds only Camoufox's configured fonts, and `speechSynthesis` returns only
Camoufox's configured voices (R3 T8, R2). What remains are tells caused by the
random OS. A "Mac" persona brings a macOS voice list, which can include a
Vietnamese voice, and its text is still drawn by Windows.

## What leaks and to whom

- **Could leak, to any page:** installed font families (measured by text width)
  and installed voices (`speechSynthesis.getVoices()`, with names and
  languages). The host has distinctive fonts (Cal Sans, Hagrid, FVH Shopee Text,
  Pesta Rakyat, HanyiSentyPagoda, Coolvetica, DIN Round Pro, Helvetica Neue LT
  Pro) and voices Haruka, Ayumi, Ichiro, Sayaka (ja-JP) and Huihui, Kangkang,
  Yaoyao (zh-CN) (R3 ground truth). None of them leaked.
- **Does show:** whatever the random persona's OS brings with it
  (`deviceFingerprintChurn.md`).

## Evidence

**Fonts**

- **Live (R3 T8).** Width measurement of 648 to 666 names: Camoufox's Windows
  list, all 536 host-only families, Mac and Windows system names, and legacy
  Vietnamese fonts (`VNI-*`, `.Vn*`). None of the user-installed fonts and no
  Vietnamese fonts were detected. *verifiedLive (proxied)*
  - Mac personas showed only Camoufox's bundled macOS fonts (Helvetica Neue,
    Menlo, Monaco, Geneva, Lucida Grande, PingFang SC, Galvji…). The browser
    folder has 442 font files, including `AppleColorEmoji.ttf`.
  - Windows personas showed only listed families or their localised names
    (`맑은 고딕` for Malgun Gothic, `宋体` for SimSun). One exception: `Arial
    Narrow`, a host Office face matched through the allowed Arial family. It is
    common and harmless.
- **Local probe (R2).** User and Office fonts (Hagrid, Bauhaus 93,
  FVHShopeeText) were not detectable. `document.fonts.check` gives false
  positives, so measure widths instead. *verifiedLive (local probe)*
- **Camoufox docs:** OS-specific font sets, plus font-list and spacing controls
  (S10). *vendorDocs*

**Voices**

- **Live (R3 T8).** `getVoices()` returned exactly Camoufox's list. gateE: 53 of
  53 configured Microsoft voices, including `Microsoft Sean – English
  (Ireland)`. The host's Japanese voices never appeared. *verifiedLive (proxied)*
- **Mac personas** returned 129 to 150 `urn:moz-tts:osx` voices. One random
  subset included `Linh|vi-VN`. That comes from Camoufox's macOS list, not the
  host. It is still a Vietnamese voice on a "Galway" device. *verifiedLive (proxied)*
- **Upstream.** camoufox#717: a past host-OS voice leak. #731: the voice schema
  fix. The v152.0.4-beta.30 release notes list a host speech-voice leak fix
  (S1, per R1). Camoufox's `voices:blockIfNotDefined` defaults to false (S7),
  and 0.5.5 doesn't set it (R2 §14). *upstreamIssue*, *vendorDocs*,
  *verifiedSource*

**Rendering (OS mismatch)**

- On Mac personas, canvas, text metrics and emoji are still drawn by this
  Windows machine's GPU and its Skia/DirectWrite stack. A site that compares
  rendering with known Apple M1 results could tell it isn't a Mac. That shows
  spoofing, not Vietnam (R3 T8). *inference*

### Where the reports disagree

- **R2 found 0 voices in all 5 launches** and called the empty list an anomaly
  (R2 §14).
- **R3 found the cause.** Its first probe waited only 3 s and got 0 (gateB).
  With polling every 250 ms for up to about 6 s, the full list appeared.
- R3 is stronger: it reproduced both results and explained the difference.
  "Empty voices" was a measurement artefact, not a browser fault. One question
  is left open: whether real Windows Firefox loads its voice list as late as
  this. *inference*

## Where in our code it can happen again

- **The persona's OS** (`deviceFingerprintChurn.md`). Pin `os='windows'`.
- **Persona fonts and voices.** Store Camoufox's generated `fonts` and `voices`
  lists. Don't hand-edit them to add host fonts.
- **Camoufox's `custom_fonts_only` or extra font folders,** if anyone adds them.
- **A Camoufox upgrade** that changes the font whitelist or voice handling.
- **Installing new fonts on this PC.** Re-run the font test afterwards.

## Mitigation

1. **Pin `os='windows'`** in the persona. That removes the macOS voice list (and
   its `vi-VN` voice) and the Mac-on-Windows rendering mismatch.
2. **Store the persona's font list and voice list,** so they stay the same every
   run.
3. **Consider `voices:blockIfNotDefined=True`** after the upgrade, so host
   voices can never appear even if the config is incomplete. Re-test the voice
   count afterwards.

## How to re-test

> **Disposable scripts.** Any script named below under `.scratch` sits outside git, was a throwaway, may be gone, and is not a supported tool. `python/leakProbe.py` and `log proxy probe` don't exist yet. Until they do, the repeatable check at `2de5ff5` is a `log facebook publish` dry run against `python/fixtures/createItem.html`, with the page-side probes in this file (`docs/proxies.md`, "Checked").

1. Fonts: measure text width in a fallback font, then in `'<family>', monospace`,
   for every name in
   `C:\Users\0\.buzz\.scratch\leakTests\extraFonts.json` (the host-only list).
   A width change means the font is present. **Pass:** none of the host-only
   families are detected.
2. Voices:
   ```js
   for (let i = 0; i < 24 && !speechSynthesis.getVoices().length; i++) await new Promise((r) => setTimeout(r, 250));
   speechSynthesis.getVoices().map((v) => `${v.name}|${v.lang}`)
   ```
   **Pass:** Windows Microsoft voices only, no `ja-JP`, `zh-CN` or `vi-VN`, and
   the same list every run.
3. `runGate.py` does both (R3 method).

## Status

Not leaking at `f033e63` for host fonts and voices (R3 T8). At `2de5ff5` the device
is made once and its font metrics replayed identically (`deviceFingerprintChurn.md`),
so the OS-mismatch tells are gone. *verifiedLive (proxied)*
