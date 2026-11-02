---
title: "Browser gate"
---

# Browser gate

Before an account's browser loads anything, it goes through one gate: a headed launch, the account's proxy with its exit in the account's country, the account's one device, the locale of its home country, and a self-check in the page and a worker. The gate is `python/browser/proxyGate.py`, with the run's device and home prepared by `prepareRun`. Rules 11, 12, 15, 16, 17 and 92, with rule 84 for platforms that run without a proxy.

## Headed launch

### REQ-GATE-01: A Camoufox launch is never headless

Every Camoufox launch is headed, with humanize on and the cursor shown. A launch that asks for headless is refused with `unguardedLaunch`, and there is no flag that turns the headed window off. Rule 11.

### REQ-GATE-02: The caller can only pass the options the gate allows

A Camoufox launch takes only headless, humanize, geoip and proxy from its caller. Any other launch option is refused with `unguardedLaunch`, so a caller cannot change what the gate built.

### REQ-GATE-03: A launch that did not go through the gate is refused

Playwright's launch, persistent context and new context are guarded. A launch the gate did not build, or whose options differ from what it built, or that is not headed, is refused with `unguardedLaunch`.

## Proxy

### REQ-GATE-04: No browser opens without the account's proxy

A browser opens only when the run has a proxy file. Without one the gate refuses with `noProxy`, for every launch and for an attached browser alike. Rule 12.

### REQ-GATE-05: A Facebook account never runs direct

A proxy file that says the account runs direct is accepted only for a platform other than Facebook. For a Facebook account it is refused with `noProxy`. Rules 12 and 84.

### REQ-GATE-06: The exit IP must be in the account's country

The gate finds the proxy's exit IP and its country. When that country is not the account's, the gate refuses with `proxyCountryMismatch`. Rule 12.

### REQ-GATE-07: An exit with no known timezone is refused

When the exit IP has no known timezone, the gate refuses with `proxyCountryMismatch`, because the browser's timezone is set from it.

### REQ-GATE-08: A proxy too slow to reach Facebook is refused

The gate times Facebook files through the proxy. When the best time is over the limit (`LOG_PROXY_MAX_MS`, 2500 ms by default), it refuses with `proxyTooSlow`. Rule 33.

## Device

### REQ-GATE-09: The first launch makes the account's one device

When the run has no stored device, the gate makes one Windows device (screen, fingerprint config, preferences and a geolocation pinned near the home city, or near the exit when the city has no coordinates) and marks it created so it is saved to Twenty once. Rule 15.

### REQ-GATE-10: Every later launch replays the stored device

When the account has a stored device, every launch is built from it, and only the per-launch values (timezone, WebRTC IP, locale, humanize, cursor) are set fresh. A new device is never made over a stored one. Rule 15.

### REQ-GATE-11: An unreadable stored device is refused

A stored device that cannot be read, is not a version-1 Windows profile, has no pinned geolocation or stores per-launch keys is refused with `deviceProfileInvalid`, and no browser opens. Rule 15.

## Home locale

### REQ-GATE-12: The locale comes from the home country's table

The account's locale and Facebook locale come from `HOME_COUNTRIES` by its home country. A country not in the table is refused with `noHomeLocale`. Rule 16.

### REQ-GATE-13: The pinned locale reaches the launch

The run's languages are the locale and its base language. The launch sets the browser's locale, its language list and its requested locale from them, so navigator, Accept-Language and Intl agree. Rule 16.

## Self-check

### REQ-GATE-14: The timezone must be the exit IP's, in page and worker

Before any page loads, the gate reads the timezone in a page and in a worker. When either is not the exit IP's timezone (the same offsets all year count as the same), or the page and the worker disagree, it refuses with `browserTimezoneMismatch`. Rule 17.

### REQ-GATE-15: The language and Intl locale must be exactly the pinned locale

In the page and the worker, `navigator.language`, the Intl locale and the number locale must each be exactly the pinned locale, or the gate refuses with `browserLocaleMismatch`. Rules 17 and 92.

### REQ-GATE-16: The language list must start with the pinned languages

`navigator.languages` must start with the pinned languages, in order, in the page and the worker. Languages the browser adds after them are allowed. Anything else is refused with `browserLocaleMismatch`. Rule 92.

### REQ-GATE-17: The browser's exit IP is the one the gate checked, or in its country and timezone

The self-check reads the browser's own exit IP. When no IP echo answers, it refuses with `selfCheckFailed`. When the IP differs from the one the gate checked, it is refused with `browserExitIpMismatch`, except on an attached browser, where a residential proxy can change its IP between the gate's check and the browser opening: there a new exit is located and accepted only when it is in the account's country and on the same timezone. Rules 17 and 118.

### REQ-GATE-18: A failed self-check stops the browser before Facebook loads

When the self-check refuses, the browser is closed (Camoufox) or the error is raised before anything else loads (an attached browser, which its driver then stops). Rule 17.
