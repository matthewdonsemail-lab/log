# Photos and uploads: metadata, filenames and where the bytes come from

**Id:** `photosAndUploads` · **Severity:** low (medium if photo sources are fbcdn URLs) · **Status:** fixed at `2de5ff5` (verifiedLive, proxied). Metadata and filenames were already mitigated

## Summary

A photo file can carry GPS coordinates, the capture time and the camera model
(S49, S50). The proxy does nothing about that, because it's in the bytes. log-cli's
photo pipeline re-encodes every photo with no metadata and names it
`photo<N>.jpg`, so this is clean. One gap remains. Photo URLs are downloaded by
Bun straight from this PC's Vietnamese IP. If a source is a Facebook CDN URL,
Facebook's CDN sees Vietnam fetch an image that an Irish account uploads
minutes later (R2 §15, R4 L1).

## What leaks and to whom

- **Could leak, to Facebook (upload endpoint):** EXIF/XMP GPS, capture time,
  camera model, the original filename. Meta says it processes content and
  message metadata (S29). Which EXIF fields Marketplace keeps is not public
  (R1 §7). *vendorDocs*
- **Does leak, to the photo's host:** this PC's IP, when a URL is downloaded.
  That host is Facebook only if the URL is `*.fbcdn.net` or `facebook.com`.
- **Photo content:** what's visible in the image (a street sign, a Vietnamese
  plug or label) is not metadata. No code checks it (R1 §7). *inference*

## Evidence

- **log-cli's pipeline strips metadata.** `src/media/photo/client.ts` re-encodes
  with sharp. Without `withMetadata()`, sharp drops EXIF, GPS and the camera
  model (R4 L1). R2 describes the output as "JPEG (mozjpeg, no metadata)".
  *verifiedSource*
- **Generic filenames.** `src/media/photo/client.ts:121` names each file
  ``` `photo${index + 1}.jpg` ```. Playwright sends only the base name.
  *verifiedSource*
- **Fails closed.** `src/media/photo/client.ts:133-134`: a failed variation
  returns `variationFailed`. It never falls back to the original. Listaro did
  ("If variation fails, use original", `facebook-poster.ts:1258-1261`).
  *verifiedSource*
- **Direct download.** `src/media/photo/client.ts:42`:
  `const res = await fetchFn(source)`, with no proxy. *verifiedSource*
- **facebook-camofox-client's `mutate_photo()`** (only reached if its own publish
  path is used). R2 fed it a test JPEG with EXIF (Samsung SM-A536E, GPS for Ho
  Chi Minh City), XMP (City "Ho Chi Minh City"), ICC and a comment. None came
  out, only an empty `Exif` header. *verifiedLive (local probe)*. But it keeps
  the original filename stem:
  `facebook-camofox-client/src/facebook_camofox_client/domain_marketplace/assets.py:49`
  (`stem = Path(src).stem`), `:51` (`{stem}_poolcopy_{n}`), `:63`
  (`{stem}_mut_{n}`). R2's output was `IMG_20261001_142211_mut_9117.jpg`, which
  carries the capture time and a `_mut_` marker. *verifiedSource*
- **Variation per account** (PR #6 body): each photo gets a varied JPEG so its
  hash is new. Perceptual hashing could still match two variations of one photo.
  Whether Facebook does this across accounts is not public. *inference*

## Where in our code it can happen again

- `src/media/photo/client.ts`: any change to the sharp call (`withMetadata`,
  `keepExif`, `keepIccProfile`), to file naming, or to the fetch.
- Any other upload path: facebook-camofox-client's `assets.py`, or a future
  "upload original" shortcut.
- `agencyListings.photos` in Twenty: where the URLs come from.
- Listing text and photo content (`listingContentAndCurrency.md`).

## Mitigation

1. **Keep** the sharp pipeline: no metadata, generic names, fail closed.
2. **Refuse Facebook-hosted sources.** In `media/photo/client.ts`, refuse
   `*.fbcdn.net` and `facebook.com` URLs with a new code `photoFromFacebook`
   (R4 L1).
3. **Download through the account's proxy.** Use an undici `ProxyAgent` built
   from `run.proxyPath` for the remaining URLs (R4 L1). R2 §15 also recommends
   this.
4. **If facebook-camofox-client's photo path is ever used,** rename its outputs
   to neutral names.
5. **Look at the photo.** A person checks for addresses, signs, labels or plugs
   that point to Vietnam.

## How to re-test

1. Run a photo with known EXIF GPS through the pipeline, then:
   `exiftool -a -G1 <output>.jpg`. **Pass:** no GPS, no DateTimeOriginal, no Make
   or Model, no XMP, and the name is `photo<N>.jpg`.
2. Unit test: `preparePhotos` (`src/media/photo/client.ts:96`) refuses an `https://scontent-*.fbcdn.net/...`
   source with `photoFromFacebook`.
3. Proxy check: point a photo URL at a server you control. **Pass:** the request
   arrives from the account's exit IP, not 116.105.162.81.

## Status

Mitigated at `f033e63` for metadata and filenames. The direct download was
leaking (low). **Fixed at `2de5ff5`.** *verifiedLive (proxied)*

- URL photos download through the account's proxy: the exit was 86.41.85.43,
  this PC is 116.105.162.81.
- With no proxy it refuses with `photoNeedsProxy`.
- Files are named `photoN.jpg`.
- Not done: refusing fbcdn sources outright.
