# Camoufox Code References and Observable Browser Surfaces

## Executive Summary

- **Initialization ->** Camoufox wraps Playwright's context manager and launches Firefox through Playwright.[8][205.49-55]
- **Humanize ->** `humanize` accepts `True` or a maximum cursor-movement duration in seconds.[21]
- **Headless ->** `headless` accepts `True`, `False`, or `'virtual'`; `'virtual'` uses a virtual display.[8][206.99-102]
- **GeoIP ->** `geoip` derives longitude, latitude, timezone, country, and locale from an IP address.[21]
- **Clients ->** `camoufox-js` is a JavaScript Playwright client, while the Facebook repository is included only as a public reference.[18][211.0-1]
- **Evidence ->** Implementation, API documentation, and issue/discussion reports must be cited separately because their verification scope differs.[10][307.0-130]

## Verified Code and Documented Parameters

Primary references:  
https://github.com/daijro/camoufox  
https://camoufox.com/python/usage  
https://github.com/daijro/camoufox/issues?q=humanize

| Surface | Verified or documented fact | Primary URL |
|---|---|---|
| `headless` | `NewBrowser` accepts `bool`, `None`, or `'virtual'`; `'virtual'` creates a `VirtualDisplay` and then sets `headless = False`.[8] The documented API also states that `'virtual'` uses Xvfb on Linux.[21] | https://camoufox.com/python/usage |
| `humanize` | The documented API accepts `True` or a float duration in seconds.[21] Numeric values are mapped to `humanize:maxTime` as floating-point values.[7] | https://camoufox.com/python/usage |
| `showcursor` | `showcursor` is a configuration property, documented as a Boolean cursor highlighter toggle, not as an explicitly documented top-level Python parameter.[9] | https://github.com/daijro/camoufox |
| `geoip` | `geoip` accepts an IP address or `True` for automatic lookup and derives location, timezone, country, and locale.[7][207.127-134] The supplied initialization code does not document `geoip` or `showcursor` mappings.[8] | https://camoufox.com/python/usage |

The upstream synchronous and asynchronous wrappers use Playwright's `PlaywrightContextManager`; both automatically launch and close the browser through context-manager lifecycle handling.[8][205.22-27][208.12-14] `NewBrowser` and `AsyncNewBrowser` launch Firefox with either ordinary or persistent Playwright contexts.[8][208.48-55] The supplied evidence does not identify exact public file paths for these launch implementations.[10]

## Client References and Issue Reports

- **PRACE1/facebook-camofox:** https://github.com/PRACE1/facebook-camofox  
  This is a public repository reference. The retrieved material does not establish its exact launch implementation, maintenance status, or whether its code paths match upstream Camoufox.[10]

- **JavaScript client:** https://github.com/apify/camoufox-js  
  `camoufox-js` is described as a JavaScript port of the Python wrapper and launches Playwright-controlled Camoufox.[18][291.30-40] Its repository states that the browser is downloaded from official releases with integrity verification.[11] The following is documented discussion evidence, not an independently verified downstream implementation.

- **Discussion 212:** https://github.com/apify/camoufox-js/discussions/212  
  The discussion says `camoufox-js` accepts the original Python Camoufox settings and shows `showcursor: true` with `humanize: 1.5`; each cursor operation may take up to 1.5 seconds.[12] It is closed.[12]

- **Humanize issue and PR reports:**  
  https://github.com/daijro/camoufox/issues/677 reports endpoint-only movement on Linux after a Firefox migration, while https://github.com/daijro/camoufox/pull/679 describes restoring humanized trajectories.[15][307.114] https://github.com/daijro/camoufox/pull/682 addresses Python Boolean and numeric-duration serialization: `True` enables humanization without writing `humanize:maxTime`, while explicit integer or floating-point durations produce a floating-point value.[20] The report states that Boolean, integer, and floating-point configurations launched and completed mouse movement in its test.[20] These are issue/announcement claims, not a substitute for inspecting the implementation revision.

## Observable Browser Surfaces

| Surface | Evidence and scope | URL(s) |
|---|---|---|
| Canvas fingerprint stability | The supplied material does not establish canvas stability across calls or sessions. | https://github.com/daijro/camoufox |
| WebGL pixels vs GPU name | `readPixels()` reads framebuffer pixels into a typed array or data view.[17] Camoufox documentation describes spoofable renderer and vendor names plus WebGL parameters, extensions, context attributes, and shader precision.[13] A reported renderer name therefore does not by itself establish the actual rendered pixels. | https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/readPixels<br>https://camoufox.com/fingerprint/webgl |
| Timezone | `Intl.DateTimeFormat().resolvedOptions().timeZone` returns an IANA timezone name, normally the runtime default.[6][203.113-116] Camoufox applies proxy-derived timezone when it is not explicitly provided.[3][208.70-72] | https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat/ resolvedOptions |
| Locale and `Accept-Language` | `navigator.languages` returns preferred BCP 47 language tags in preference order.[5] `Accept-Language` generally lists corresponding locales with decreasing quality values, but privacy behavior may reduce the list.[5] | https://developer.mozilla.org/en-US/docs/Web/API/Navigator/languages<br>https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Accept-Language |
| WebRTC host candidates | An ICE `host` candidate exposes the candidate address as the true address of the remote peer.[2] This API fact does not establish that all Camoufox candidates are public addresses. | https://developer.mozilla.org/en-US/docs/Web/API/RTCIceCandidate |
| Geolocation accuracy | `GeolocationCoordinates.accuracy` is a positive value in meters representing 95% confidence for latitude and longitude.[1][202.68] Camoufox's documented `NewContext` geolocation accepts latitude and longitude floats.[8] | https://developer.mozilla.org/en-US/docs/Web/API/GeolocationCoordinates/accuracy |
| HTTP/3 | HTTP/3 uses QUIC over UDP rather than TCP.[16] The corpus contains no Camoufox-specific HTTP/3 implementation or guarantee.[15] | https://developer.mozilla.org/en-US/docs/Glossary/HTTP_3 |
| DNS | Firefox may use DNS over HTTPS, fall back to operating-system DNS when DoH fails, or disable DoH under network-policy conditions.[19] No Camoufox-specific DNS behavior is established.[15] | https://support.mozilla.org/en-US/kb/dns-over-https |
| Fonts or voices | Each context identity includes fonts and voices drawn by `fpgen` unless a preset is supplied.[3] The browser API `speechSynthesis.getVoices()` returns available voice objects.[14] | https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis/getVoices<br>https://github.com/daijro/camoufox |

## Synthesis

**Implementation evidence** covers Playwright lifecycle, Firefox launch selection, per-context identity generation, and documented proxy-derived values.[8][205.49-55][208.59-72] Its scope is code behavior represented by the supplied excerpts.

**Documentation evidence** defines public option contracts such as `headless`, `humanize`, `geoip`, and `showcursor`.[21][206.144-146][209.14-21] Browser documentation defines observable API semantics, not universal Camoufox implementation guarantees.[2][202.61][204.60-67]

**Issue and discussion evidence** records reported regressions, fixes, and usage examples, including the float-humanize serialization change and Discussion 212's JavaScript example.[20][290.15][307.118-114] It should not be labeled executable code or treated as proof of a maintained downstream implementation.[10]

Cite the source and revision appropriate to each claim: implementation claims to inspected code, API claims to documentation, and behavioral or maintenance claims to the specific issue, pull request, or discussion.

## References

1. *GeolocationCoordinates: accuracy property - Web APIs | MDN*. https://developer.mozilla.org/en-US/docs/Web/API/GeolocationCoordinates/accuracy
2. *RTCIceCandidate: type property - Web APIs | MDN*. https://developer.mozilla.org/en-US/docs/Web/API/RTCIceCandidate/type
3. *camoufox/pythonlib/camoufox/async_api.py at main · daijro/camoufox · GitHub*. https://github.com/daijro/camoufox/blob/main/pythonlib/camoufox/async_api.py
4. *Accept-Language header - HTTP | MDN*. https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Accept-Language
5. *Navigator: languages property - Web APIs | MDN*. https://developer.mozilla.org/en-US/docs/Web/API/Navigator/languages
6. *Intl.DateTimeFormat.prototype.resolvedOptions() - JavaScript | MDN*. https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat/resolvedOptions
7. *camoufox/pythonlib/camoufox/utils.py at main · daijro/camoufox · GitHub*. https://github.com/daijro/camoufox/blob/main/pythonlib/camoufox/utils.py
8. *camoufox/pythonlib/camoufox/sync_api.py at main · daijro/camoufox · GitHub*. https://github.com/daijro/camoufox/blob/main/pythonlib/camoufox/sync_api.py
9. *Cursor Movement | Camoufox*. https://camoufox.com/fingerprint/cursor-movement
10. *GitHub - PRACE1/facebook-camofox-client: Camofox-native ...*. https://github.com/PRACE1/facebook-camofox-client
11. *GitHub - jo-inc/camofox-browser: Stealth headless browser for ...*. https://github.com/jo-inc/camofox-browser
12. *How to configure "humanize" and "showcursor" in launchOptions ? · apify/camoufox-js · Discussion #212 · GitHub*. https://github.com/apify/camoufox-js/discussions/212
13. *WebGL | Camoufox*. https://camoufox.com/fingerprint/webgl
14. *SpeechSynthesis: getVoices() method - Web APIs | MDN*. https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis/getVoices
15. *Issues · daijro/camoufox · GitHub*. https://github.com/daijro/camoufox/issues?q=humanize
16. *HTTP/3 - Glossary | MDN*. https://developer.mozilla.org/en-US/docs/Glossary/HTTP_3
17. *WebGLRenderingContext: readPixels() method - Web APIs | MDN*. https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/readPixels
18. *GitHub - apify/camoufox-js: Experimental Camoufox JS port · GitHub*. https://github.com/apify/camoufox-js
19. [
  Firefox DNS over HTTPS | Firefox Help
](https://support.mozilla.org/en-US/kb/firefox-dns-over-https)
20. *api.github.com*. https://api.github.com/search/issues?q=repo%3Adaijro%2Fcamoufox+humanize
21. *Usage | Camoufox*. https://camoufox.com/python/usage
