# Image pipeline

How photos get loaded, processed and attached to a Marketplace listing, in
each source, then what log-cli should do.

## Where the photos come from

| Source | Origin | Format at post time | Count per post |
| --- | --- | --- | --- |
| **Listaro** | Dashboard compresses in the browser (`browser-image-compression`: ≤2 MB, ≤1920 px, JPEG; `src/components/listings/image-uploader.tsx:41-46`). Uploads to the public Supabase bucket `listing-images` at `${userId}/${uuid}.${ext}` (`:120-134`). URLs stored in `listing_templates.images TEXT[]` (`supabase/migrations/001_initial_schema.sql:167`). Up to 200 per template (`image-uploader.tsx:28`) | URL, downloaded to a temp file | **1** (`src/lib/title-generator.ts:625-645`, `count = 1`; the "default 5" comment at `:622` is stale) |
| **FCC** | Local file paths only (`MarketplaceCreateInput.image_paths`, `domain_marketplace/schemas.py:7-16`). No download, no data-URLs | File path | Whatever is passed (relist always 1, `scripts/relist_watcher.py:188`) |
| **LKH** | `FileReader.readAsDataURL` in the create form (`DashboardListingCreateForm.tsx:277-304`), stored as data-URL strings | data-URL | ≤4 (`:23`, `server.ts:128`), first = cover (`types.ts:78`) |

**Mismatch:** LKH hands over data-URLs and FCC needs file paths. Connecting
them as they are fails with `images_not_found` (`create.py:89-97`). log-cli
has to turn data-URLs and URLs into files first.

## Which photo gets picked (Listaro)

`process-posts/route.ts:396-501`. The pool is the template's images, minus:

- images used by **active** listings of the same template on this account
- images already used in this batch
- the image of the listing being reposted

"Recently used" means the last 200 `posting_logs` rows with status `posted`
(`:413-427`). Linked "Kijiji mix" templates use the same index for title,
description and image (`:431-446`). FCC relist does the same job with
`assets.pick_pool_photo`: a random pick that skips `used_photos`, falling
back to the whole pool once all are used (`assets.py:35-40`).

## Download

- **Listaro server:** `downloadImages` uses `fetch`, 3 attempts with 2 s × attempt
  backoff, to `os.tmpdir()/listaro-images/<ts>/image_i.(png|jpg)`
  (`src/lib/poster/facebook-poster.ts:2483-2514`). If every download fails,
  the post fails (`process-posts/route.ts:672-700`). Cleaned up afterwards
  (`:1100`, `facebook-poster.ts:2516-2523`).
- **Listaro agent:** one `fetch`, no retry (`agent/src/poster.ts:106-119`).
- **FCC:** none. It keeps only the paths that exist (`create.py:85`) and
  silently drops missing ones, unless *all* are missing.

## Processing: making each upload a "new" photo

Facebook flags a listing as a duplicate when the photo and title repeat. FCC's live
listing went to duplicate hold for exactly that
(`docs/okf/marketplace_create.md:50-52`).

**Listaro (`src/lib/variations/image-variation.ts`, `sharp ^0.34.5`)** is the
stronger version. Each call gives a different binary, so the file hash
differs (`:73-74`):

| Step | Range | Line |
| --- | --- | --- |
| Crop each edge | 2–5 % | `:101-106`, `:135` |
| Rotate, white fill | ±1–3° | `:109`, `:137` |
| `modulate` brightness / saturation / hue | 0.90–1.10 / 0.95–1.05 / ±8° | `:112-115`, `:139` |
| Contrast `linear(c, 128·(1−c))` | c 0.90–1.10 | `:140-143` |
| Blur σ 0.3–0.9 **or** sharpen σ 0.8 | 50/50 | `:146-151` |
| Resize to original × 0.95–1.05, `fit:"fill"` | aspect drifts slightly | `:125-127`, `:154` |
| Monochrome noise layer, alpha 30, `blend:"add"` | every pixel | `:159-189` |
| JPEG, mozjpeg | quality 80–95 | `:130`, `:188` |

Called per image at `facebook-poster.ts:1246-1263`. The output is written as
`varied_<ts>_<i><original ext>`, so a `.png` name can hold JPEG bytes. If
variation fails, the original is used.

**FCC (`domain_marketplace/assets.py:43-65`, Pillow)** is weaker. It crops
2–4 %, shifts brightness ±2 % and contrast ±1 %, and clears EXIF. The
docstring promises noise that isn't implemented (`:3-4`). Without Pillow it
copies the bytes unchanged (`:50-53`), and Pillow isn't in `pyproject.toml`.
Normal create does **no** processing. Only relist does.

Neither applies `exif_transpose`. A phone photo with an EXIF rotation can
post sideways once the EXIF is gone.

## Attaching photos to the form

Both repos use the same mechanism: **`setInputFiles` on the hidden file
input, with no file chooser and no click on "Add photos".**

| Source | Selector | Call | Line |
| --- | --- | --- | --- |
| Listaro server | `input[accept="image/*,image/heif,image/heic"]`, waits for *attached* (10 s) | `locator.setInputFiles(paths)` | `facebook-poster.ts:349-357`, `:1265` |
| Listaro agent | that, then `input[accept*="image/"]`, `input[type="file"][accept*="image"]`, `[multiple]`, plain `input[type="file"]`; clicks `Add photos` between tries; 3 tries | `elementHandle.setInputFiles` | `agent/src/poster.ts:58-65`, `:482-514` |
| FCC | `input[type="file"][accept*="image"]` `.first` | `set_input_files(existing)` | `create.py:84-87` |

Order on the form: FCC uploads photos **after Category, before the text
fields** (`create.py:65-97`). Listaro uploads them **first, before the
title** (`facebook-poster.ts:1240-1287`). Both worked.

## Confirming the upload

This is the weakest step in every source:

- Listaro server sleeps 3–5 s (`facebook-poster.ts:1266`). It retries once with the
  originals if the call *throws*, otherwise carries on (`:1273-1280`).
- Listaro agent sleeps 2 s + 0.5 s per image (`agent/src/poster.ts:491-494`).
- FCC `create.py` sleeps 3 s (`:88`), then only *logs* the `(\d+)/10 photos`
  count (`:124-133`).
- FCC spike waits up to 15 s for `/1\s*\/\s*10|Photos\s*.\s*1/`, and warns
  and carries on if it never shows (`scripts/spike_marketplace_e2e.py:329-333`).
- FCC photo edit waits 20 s for `/2\s*\/\s*10/` (`scripts/update_listing_photo.py:65-71`).

The only hard stop anywhere is that Next stays `aria-disabled` with 0 photos
(`docs/okf/marketplace_create.md:40-41`). Listaro's server even removes
`aria-disabled` and JS-clicks Next anyway (`facebook-poster.ts:1994-2076`).

## Changing photos on a live listing (FCC)

`scripts/update_listing_photo.py`: open `you/selling`, click the card that
matches a hard-coded title, click `Edit listing`, run `set_input_files`, wait
for `2/10`, click `^Update$` (`:41-79`). It **adds** a photo and doesn't
replace one (`docs/okf/listing_photo_update.md:3-8`). Verified live on
listing `1583545526797714`.

## What log-cli should do (proposed)

1. **Collect:** take URLs, data-URLs or paths. Write each to
   `~/.logCli/media/<listingId>/` and check it's an image (sniff the magic
   bytes, not the extension). Use at most 10, the FB limit.
2. **Vary:** port Listaro's sharp pipeline (it's TypeScript already), add
   `rotate()` first so EXIF orientation is applied, and always write `.jpg`.
   Store a perceptual hash of each varied file, so a repost can prove it's
   different from the last one.
3. **Pick:** Listaro's pool rule (skip images on active listings and recent
   posts), kept in the account's state file.
4. **Attach:** `setInputFiles` on `input[type="file"][accept*="image"]`,
   driven from the Python worker (`camofox/worker`), the same as every other
   live command.
5. **Confirm:** wait for FB's `N/10` counter to equal the number sent,
   with a hard timeout that ends in `photosNotConfirmed`, never a sleep.
