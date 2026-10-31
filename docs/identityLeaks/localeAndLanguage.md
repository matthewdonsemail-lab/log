# Locale and language: a random language per launch

**Id:** `localeAndLanguage` · **Severity:** high · **Status:** fixed at `2de5ff5` (verifiedLive, proxied)

## Summary

log-cli launches with `geoip=<exit IP>` and no `locale`. Camoufox then picks
the browser language **at random** from the country's population language mix,
on every launch. About 28% of Irish launches come up in Irish (`ga-IE`) or
French (`fr-IE`). For GB it's about 40% non-English. The same account switches
language between sessions. Even when the language is `en-IE`, `Intl` resolves to
bare `en` and formats dates the US way. None of this shows Vietnam. It shows an
inconsistent, rare and changing language (R2 §3, §9, §16; R3 T3; R4 H3, L2).

## What leaks and to whom

- **To Facebook:** the `Accept-Language` header on every request,
  `navigator.language(s)` in the page and workers, and `Intl` formatting
  (dates, numbers, the hour cycle). Meta lists "Language" among the connection
  data it collects (S29). *vendorDocs*
- **What it reveals:** a rare language (Irish is very rare as a browser
  language) that changes between sessions, and a locale that disagrees with
  itself (header `en-IE`, Intl "American English"). Not Vietnam: no `vi`, `ja`,
  `zh` or host `en-US` list appeared anywhere (R3 T3).
- A language preference is not proof of anything by itself (R1 §2). The tell
  is the inconsistency.

## Evidence

**Why it happens**

- `camoufox/geolocation.py:257`: `locale = SELECTOR.from_region(iso_code)`.
  *verifiedSource*
- `camoufox/locales.py:265-271`: `language = np.random.choice(languages, p=probabilities)`,
  weighted by CLDR `territoryInfo.xml` population shares, on every launch.
  *verifiedSource*
- `python/browser/proxyGate.py:131` returns `geoip=<exit IP>` and no `locale`.
  *verifiedSource*
- `camoufox/utils.py:756-757` uses `config.setdefault`, so an explicit
  `locale=` beats the geoip draw. `:772` `handle_locales()` writes it.
  *verifiedSource*

**How often** (two independent measurements that agree)

| Country | R2: computed from the bundled CLDR data | R4: 2000 draws with the installed package |
|---|---|---|
| IE | en 71.5%, ga 16.1%, fr 12.4% | en-IE 1444 (72.2%), ga-IE 306 (15.3%), fr-IE 250 (12.5%) |
| GB | — | about 40% non-English: fr, de, es, pl, ur, pa, ta, gu |
| US | en 87.9%, es 8.8% | about 12% es-US |
| CA | en 63.5%, fr 22.1%, zh/yue/es/pa/ar/fil about 1% each | — |
| AU | en 96%, zh_Hant 2.1%, it 1.9% | — |

*verifiedSource* (R2) and *verifiedLive (local probe)* (R4 draws)

**Seen in real launches**

- Live gateB through the Galway proxy drew `ga-IE`: `navigator.languages`
  `["ga-IE","ga"]`, page text `Meán-Am Greenwich`, `1 lá ó shin` (R3 T3).
  *verifiedLive (proxied)*
- Local probes drew `fr-IE` (`Accept-Language: fr-IE,fr;q=0.9`,
  `heure moyenne de Greenwich`, numbers `1 234 567,891`), then `en-IE`, then
  `ga-IE` (R2 §3). *verifiedLive (local probe)*

**Intl resolves to bare `en`**

- With `en-IE`, `Intl.DateTimeFormat().resolvedOptions().locale` is `"en"`, and
  so are NumberFormat, Collator and PluralRules. `toLocaleString` gives
  `7/1/2026, 1:00:00 PM` (h12). CreepJS labels Intl "American English" and the
  worker "en-IE (1 US dollar)" (R3 T3, T10; R2 §16). *verifiedLive (proxied)*
- A real en-IE Firefox would format `01/07/2026, 13:00:00` (h23) (R3). That
  claim was not measured on a real en-IE Firefox. *inference*

**The context-locale trap** (R2 §9, run `B_ctx`) *verifiedLive (local probe)*

- geoip had drawn French. The Playwright context was given `locale='en-IE'`.
- Main-thread `navigator.languages` became `['en-IE']`, and the header
  `en-IE`. But `Intl...locale` stayed `fr`, `Date().toString()` was French, and
  workers reported `['fr-IE','fr']`.
- A main-thread vs worker language mismatch is a standard lie check. Setting
  the locale on the context alone makes things worse.

**Launch-level fix works** (R2 run `C_fixed`) *verifiedLive (local probe)*

`locale='en-IE'` at launch gave `en-IE` in the page, iframes, a dedicated
worker, a shared worker and a service worker.

**Header shape is stock.** `en-IE,en;q=0.9` matches stock Firefox's
q-values (S19). *verifiedSource*

**The create-form URL forces US English**

- `python/session/publishSession.py:41`:
  `CREATE_URL = "https://www.facebook.com/marketplace/create/item?locale=en_US"`.
  An Irish browser asks for a US UI (R4 L2). *verifiedSource*
- Listaro went further and rewrote the account language through
  `/a/intl/save_locale/?new_locale=en_US` (R4). log-cli doesn't. *verifiedSource*

### Where the reports disagree

The R2 and R4 percentages differ by less than one point. R2 computed exact
shares from the data. R4 sampled them. They agree. No report disputes the
mechanism.

## Where in our code it can happen again

- `python/browser/proxyGate.py:123-131` (`apply()`): where the locale must be set.
- Caller kwargs pass through `apply()` unchecked: `locale=`,
  `config={'locale:*': ...}`. A caller passing `locale="vi-VN"` would get it
  (`gateBypasses.md`).
- Any `new_context(locale=...)` that doesn't equal the launch locale.
- `python/session/publishSession.py:41` and `:386`, `:422` (`CREATE_URL`, `formUrl`).
- The device persona, once it exists (`deviceFingerprintChurn.md`).
- Account sign-in by hand: keyboard layout and IME (`manualSignIn.md`).

## Mitigation

1. **Set the locale at launch, from the account.** In `proxyGate.apply()`,
   pass `locale=<homeLocale>` with a map from `homeCountry`: IE → `en-IE`,
   GB → `en-GB`, US → `en-US`, CA → `en-CA`, AU → `en-AU` (R4 H3).
2. **Store it.** Better as part of the persona, or a `socialAccounts.homeLocale`
   field added through `scripts/twenty/twentySetup.mjs`. If a bought account's profile
   language is something else (a French-Canadian account, say), use the
   account's own language, not a population draw. *inference*
3. **If the context also sets `locale`, use the same value.** Never only on the
   context.
4. **Fix the form URL.** Derive it from the persona (`en_GB` for IE and GB), or
   drop the `locale` parameter (R4 L2). Selectors need English, and `en_GB`
   works for them.
5. **Watch the Intl `en` issue after upgrading.** Check that
   `toLocaleDateString` gives the country's format.

## How to re-test

> **Disposable scripts.** Any script named below under `.scratch` sits outside git, was a throwaway, may be gone, and is not a supported tool. `python/leakProbe.py` and `log proxy probe` don't exist yet. Until they do, the repeatable check at `2de5ff5` is a `log facebook publish` dry run against `python/fixtures/createItem.html`, with the page-side probes in this file (`docs/proxies.md`, "Checked").

1. Launch at least 5 times through the production path
   (`runGate.py <sessionId> light langN`).
2. In the page and in a worker:
   ```js
   ({ lang: navigator.language, langs: navigator.languages, intl: Intl.DateTimeFormat().resolvedOptions().locale, date: new Date(2026, 6, 1, 13).toLocaleString() })
   ```
3. Read the header that was actually sent: load `https://httpbin.org/headers`
   in the browser and read `Accept-Language`.
4. **Pass for IE:** `en-IE` in every run, in page, worker and header. Intl
   resolves to `en-IE` (or at least not `en` with US formatting). The date reads
   `01/07/2026, 13:00:00`. **Fail:** any `ga`, `fr`, or a page/worker
   difference.

## Status

Leaking at `f033e63`: about 28% of IE launches drew ga-IE or fr-IE. **Fixed at
`2de5ff5`** (rule 16, `HOME_COUNTRIES` in `src/marketplace/home/types.ts`).
*verifiedLive (proxied)*

- Page, dedicated worker and shared worker all gave `en-IE`, with
  `navigator.languages` `["en-IE","en"]`.
- Intl now resolves `en-IE` (date `1/7/2026`, time `13:00:00`). Before, it
  collapsed to `en` because of the locale:script key.
- `Accept-Language` was `en-IE,en;q=0.9`.
- The Marketplace form URL no longer forces `locale=en_US`; it uses `en_GB`
  for IE (`facebookLocale`).
- A wrong pinned locale is refused by the launch self-check
  (`browserLocaleMismatch`), and the browser closes before Facebook.
