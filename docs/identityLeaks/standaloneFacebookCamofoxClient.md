# facebook-camofox-client run on its own: no proxy, Vietnam everywhere

**Id:** `standaloneFacebookCamofoxClient` · **Severity:** critical (outside log-cli's path) · **Status:** mitigated in log-cli; leaking when that library runs on its own

## Summary

facebook-camofox-client launches every browser with `proxy=None` and
`geoip=True`. Run on its own (its scripts, its REST API, its relist watcher),
it sends the account's cookies to facebook.com from this PC's Vietnamese IP.
Camoufox then builds the whole identity from that IP: Vietnamese timezone,
language, coordinates and WebRTC address. Everything agrees with Vietnam, which
is the worst case (R2 §2, R4 C1). log-cli is safe from it only because
`force_visible()` replaces Camoufox's launchers before the library calls them.
That was confirmed live (R3 T12).

## What leaks and to whom

- **To Facebook:** the real IP 116.105.162.81 (Viettel AS24086, Da Nang,
  R3 ground truth), on a session that carries the account's cookies. Also a
  geoip identity drawn from that IP: timezone `Asia/Ho_Chi_Minh`, locale
  (statistically `vi-VN`), coordinates and `webrtc:ipv4`.
- **Scripts that skip geoip too** run on the host clock (`Asia/Bangkok`) and
  the host locale.
- **Between accounts:** the REST API and the relist watcher can apply one
  account's cookie file to another account.

## Evidence

- `facebook-camofox-client/src/facebook_camofox_client/domain_camofox/session_manager.py:95-113`:
  `acquire(..., proxy_config: dict | None = None, ...)` then
  `AsyncCamoufox(humanize=1.5, geoip=True, proxy=proxy_config)`. *verifiedSource*
- Every action calls `acquire(envelope.account_id)` with no proxy:
  `domain_marketplace/create.py:49`, `domain_marketplace/status.py:42`,
  `domain_groups/post.py:38`, `domain_groups/search.py:34`,
  `domain_posts/listen.py:70`. *verifiedSource*
- `camoufox/utils.py:741-743`: with no proxy, `geoip=True` calls `public_ip()`
  directly, which returns this PC's IP. `:746-748` then sets `webrtc:ipv4` to
  it. *verifiedSource*
- `scripts/spike_marketplace_e2e.py:292` and `scripts/diag_category.py:19`:
  `AsyncCamoufox(headless=False)`, with no proxy and no geoip. The spike
  published a real listing (`docs/listingPublish/sources.md`). *verifiedSource*
- `api/app.py:49`: falls back to `CAMOFOX_STORAGE_STATE_LISTEN_GROUP` for any
  account id. `scripts/relist_watcher.py:40-42, 54`: one
  `~/fb_cookies_playwright.json` for every watched account. *verifiedSource*
- `session_manager.py:126`: with no state file, cookies fall back to the
  environment variable `CAMOFOX_STORAGE_STATE_<ACCOUNT_ID>`. Not set on this PC
  (R4 L9). *verifiedSource*
- `deploy/facebook-relist-watcher.timer`, `.service` and
  `windows-task-scheduler.ps1.txt` would run the watcher unattended with
  `RELIST_LIVE=1`. No such scheduled task exists on this PC (R4, checked with
  `Get-ScheduledTask`). *verifiedSource*

**Why log-cli is safe today**

- `python/logWorker.py:266` arms the gate, and `:270` calls `force_visible()`
  before any library code runs. *verifiedSource*
- `session_manager.py:105` imports `AsyncCamoufox` inside `acquire()`, at call
  time, so it gets log-cli's wrapper. *verifiedSource*
- Live run fccC (R3 T12): with `proxy_config=None` from the library, the
  original `AsyncCamoufox` received the gate's 2Captcha proxy,
  `geoip=86.43.185.91`, `headless=False`, `humanize=1.5` and
  `config.showcursor=True`. The exit IP and timezone came out Irish.
  *verifiedLive (proxied)*

## Where in our code it can happen again

- Any log-cli code that imports facebook-camofox-client **before**
  `force_visible()` runs, or imports `from camoufox import AsyncCamoufox`
  (that name is not patched, see `gateBypasses.md`).
- If facebook-camofox-client moves its `AsyncCamoufox` import to module level,
  it binds the original launcher and skips the gate.
- Running anything in `facebook-camofox-client/scripts/`, `api/` or `deploy/`
  directly, on this PC or a server.
- Any copy of these patterns into log-cli. AGENTS.md says facebook-camofox-client
  is a page-driving library only.

## Mitigation

In facebook-camofox-client (another repo, not PR #6):

1. `acquire()` raises when `proxy_config is None`.
2. Replace `geoip=True` with the checked exit IP passed in by the caller.
3. Delete or quarantine `scripts/spike_marketplace_e2e.py`,
   `scripts/diag_category.py`, `scripts/relist_watcher.py` and `deploy/`.
4. Drop the shared cookie fallbacks in `api/app.py` and `session_manager.py:126`.

In log-cli:

5. Add `python/libraryGuard.py`. At import it asserts that
   `camoufox.async_api.AsyncCamoufox` is log-cli's launcher (it carries
   `_logCliVisible`), and refuses to run otherwise (R4 C1).
6. Strip `CAMOFOX_*` from the environment before the library runs (R4 L9).

## How to re-test

> **Disposable scripts.** Any script named below under `.scratch` sits outside git, was a throwaway, may be gone, and is not a supported tool. `python/leakProbe.py` and `log proxy probe` don't exist yet. Until they do, the repeatable check at `2de5ff5` is a `log publish` dry run against `python/fixtures/createItem.html`, with the page-side probes in this file (`docs/proxies.md`, "Checked").

1. Find unguarded launches in the library:
   ```bash
   cd C:/Users/0/.buzz/REPOS/facebook-camofox-client
   grep -rn "AsyncCamoufox(\|Camoufox(" src scripts api
   grep -rn "proxy_config" src
   ```
   **Pass:** every launch either raises without a proxy or is only reached
   through log-cli.
2. Confirm log-cli still intercepts it:
   `python C:\Users\0\.buzz\.scratch\leakTests\runFcc.py <sessionId> fccCheck`.
   **Pass:** the spy shows `proxy` set to the gate's proxy and `geoip` set to
   the exit IP.
3. Check no unattended job exists:
   `Get-ScheduledTask | Where-Object TaskName -like '*relist*'`. **Pass:** none.

## Status

Mitigated in log-cli (live-confirmed, R3 T12; re-confirmed at `2de5ff5`: the facebook-camofox-client path replayed the same device). Leaking whenever
facebook-camofox-client runs on its own. The fix belongs in that repo.
