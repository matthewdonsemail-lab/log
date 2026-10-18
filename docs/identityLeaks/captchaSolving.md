# Captcha solving: a third identity on the account's session

**Id:** `captchaSolving` · **Severity:** high · **Status:** fixed at `2de5ff5` (unitTested). No captcha occurred live

## Summary

When CaptchaKraken fails, log-cli sends reCAPTCHA and Arkose challenges to
2Captcha **with no proxy and no user agent**. A 2Captcha worker then loads and
solves the challenge from its own IP, browser and country. Google or Arkose
score a token made by that worker. Facebook reads the verdict next to a Galway
login. This doesn't show Vietnam. It does attach a third, unrelated identity to
the account's session (R2 §5, R4 H1). CaptchaKraken solves inside our proxied
page and adds no network identity.

## What leaks and to whom

- **To Google (reCAPTCHA Enterprise) or Arkose, and through their verdict to
  Facebook:** the 2Captcha worker's IP, country, user agent and (for Arkose)
  canvas fingerprint and JA4 hash, against a session that came from the Irish
  exit.
  - Arkose's Verify API returns `ip_intelligence.user_ip` ("The IP address of
    the device used for the session"), `is_proxy`, `country`, `timezone`,
    `session_details.ua`, `canvas_fingerprint` and `ja4_hash` to the site
    (S43). *vendorDocs*
  - reCAPTCHA Enterprise assessments take `userIpAddress`, `userAgent` and
    `ja3`/`ja4` from the site "to improve detection" (S41). *vendorDocs*
  - Facebook's checkpoint reCAPTCHA sits behind an fbsbx.com wrapper. Whether
    it is Enterprise is not known (R2 §5). *inference*
- **To CaptchaKraken:** element screenshots, sent from this PC's Vietnamese IP.
  Facebook doesn't see that (`outOfBrowserRequests.md`).

## Evidence

- **Our code.** `python/publishSession.py:461-496` (`solve_twocaptcha`):
  - `:469` `TwoCaptcha(key, defaultTimeout=180, recaptchaTimeout=600, pollingInterval=5)`
  - `:483` `solver.recaptcha(sitekey=site_key, url=s.page.url, enterprise=...)`
  - `:496` `solver.funcaptcha(**kwargs)` with `kwargs = {"sitekey": site_key, "url": s.page.url}`
  - No `proxy`, no `userAgent`, no cookies. *verifiedSource*
- **The library supports the fix.** 2captcha-python 2.1.1 takes
  `proxy={'type': 'HTTP', 'uri': 'user:pass@host:port'}` and `userAgent=` on
  both `recaptcha()` and `funcaptcha()` (`twocaptcha/solver.py:289-361`, per
  R4). *verifiedSource*
- **2Captcha's docs.** Proxyless means "We use our own pool of proxies to solve
  the captchas". The proxy variant is "for cases when IP matching is required"
  (S39). *vendorDocs*
- **Token lifetimes.** reCAPTCHA tokens are single-use and valid for 2 minutes
  (S40, S41). Turnstile's are single-use for 300 s, with an optional `remoteip`
  (S42). *vendorDocs*
- **CaptchaKraken stays in the page.** `solve_kraken`
  (`python/publishSession.py:437`) takes screenshots and clicks inside the
  proxied page. captchakraken 3.2.1 `page_solver.py` uses
  `element.screenshot`/`page.screenshot`. It makes no direct fetch of challenge
  assets, and its overlays are drawn with PIL, not in the DOM (R2 §5, R4).
  *verifiedSource*
- **Earlier systems.** Listaro used `RecaptchaV2TaskProxyless` and
  `HCaptchaTaskProxyless` (`Listaro_backup/src/lib/auto-login/captcha-solver.ts:391-397`,
  `:455-461`). Its commit `b2529e5` concluded "Facebook interactive challenges
  need manual login, not 2Captcha". open-typesafe-camoufox passed the proxy
  (`src/capability/twocaptcha_client.py:15-19`: "mismatched IPs tank the risk
  score"). That is a code comment, not a measurement. *verifiedSource*
- **hCaptcha.** camoufox#847: hCaptcha rejects every Camoufox token, even ones a
  person solved, because the page can detect Juggler
  (`camoufoxDetectability.md`). *upstreamIssue*
- **Two non-leak bugs** (R4 H1). `url=s.page.url` is the facebook.com page, not
  the fbsbx captcha frame URL. The Arkose `data[blob]` isn't passed. Both make
  solves fail. They don't leak. *verifiedSource*

### Where the reports disagree

- **R1:** neither reCAPTCHA nor Turnstile documents a universal rule that a
  token is bound to the solving IP. `remoteip` is optional, and a failed solve
  also has other explanations: expiry, replay, session loss (R1 §6).
- **R2 and R4** rate this high.
- **Which is stronger:** both are right about different things. Binding is not
  proven. But Arkose documents sending the **solving device's** IP, country, UA
  and canvas to the site (S43). So Facebook can see the mismatch whether or not
  the token is bound. That vendor documentation supports "high" more than R1's
  general caution lowers it.

## Where in our code it can happen again

- `python/publishSession.py:461-496`: any new solver call, or any new task type
  (hCaptcha, Turnstile).
- `src/captcha/router/`: the order of solvers. AGENTS.md rule 10:
  CaptchaKraken first, then 2Captcha. Arkose goes to 2Captcha only, capped per
  account per day (`planNextSolver.ts:49`, `arkoseDailyCap`).
- **Any other solver vendor** added later. Check whether it solves in our page
  or on its own machines.

## Mitigation

1. **Keep CaptchaKraken first.** It adds no network identity.
2. **2Captcha with the account's own proxy.** Add
   `proxyGate.loaded_proxy()`, which returns the proxy `apply()` already read.
   Pass `proxy={"type": "HTTP" (or "SOCKS5"), "uri": "<user>:<pass>@<host>:<port>"}`.
   Then the worker solves through the same sticky session and exit IP. The
   proxy is 2Captcha's own, so no new party gets the credentials. 2Captcha
   tunnels from its gateway (`138.201.188.166`, per its extension docs, R2 §5),
   so the proxy must allow that.
3. **Pass the browser's user agent:** `userAgent=s.page.evaluate("navigator.userAgent")`,
   plus the page cookies, and the captcha **frame** URL.
4. **Refuse without a proxy.** New catalog code `captchaNoProxy`, added to
   `src/errors/catalog/types.ts` and exported to `python/errorCatalog.json`.
5. **Record it.** Write whether a proxy was used into the captcha ledger
   (`src/captcha/router/client.ts`, `~/.logCli/captcha/attempts.jsonl`).
6. **Treat Arkose through 2Captcha as account-burning.** That matches the
   existing `arkoseDailyCap` (R2 §5).

## How to re-test

1. Unit test: stub `TwoCaptcha` and assert that `recaptcha()` and `funcaptcha()`
   receive `proxy` (with the account's sticky session id), `userAgent` and the
   frame URL. Assert that a run with no proxy raises `captchaNoProxy`.
2. Ledger: after a live solve, `~/.logCli/captcha/attempts.jsonl` records the
   proxy as used.
3. Live: in the 2Captcha dashboard, the task should show the proxy. The IP
   2Captcha reports for the task should be the account's exit IP.

## Status

Leaking at `f033e63` (2Captcha path only). **Fixed at `2de5ff5`.** *unitTested*

- 2Captcha now gets the account's proxy, the browser's own `userAgent` and
  Google's cookies only. Facebook session cookies are never sent
  (`recaptcha_cookies` in `python/publishSession.py`).
- With no usable proxy it refuses with `captchaNoProxy`. CaptchaKraken is tried
  first.
- Not checked live: no captcha came up during the dry runs.
