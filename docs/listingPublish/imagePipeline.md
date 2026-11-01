# Image pipeline

This page compares how three earlier projects loaded, changed and attached a listing's photos, and ends with what log should do. Each upload needs to be a slightly different file, and the upload needs to be confirmed rather than assumed. Read it if you're working on photo handling; for how log does it today, see [Listing photos](../listingMedia.md).

The three projects are the Camoufox client, the production poster (server and desktop agent) and the dashboard (see [Sources](sources.md)).

## Where the photos come from

| Project | Where photos come from | Format when posting | Photos per listing |
| --- | --- | --- | --- |
| **Production poster** | The dashboard compresses photos in the browser (`browser-image-compression`: up to 2 MB, 1920 px, JPEG; `image-uploader.tsx:41-46`) and uploads them to a public storage bucket at `${userId}/${uuid}.${ext}` (`:120-134`). URLs are stored on the template (`001_initial_schema.sql:167`). Up to 200 per template (`image-uploader.tsx:28`). | URL, downloaded to a temp file | **1** (`title-generator.ts:625-645`, `count = 1`; the "default 5" comment at `:622` is out of date) |
| **Camoufox client** | Local file paths only (`MarketplaceCreateInput.image_paths`, `domain_marketplace/schemas.py:7-16`). No downloads, no data URLs. | File path | Whatever is passed (relisting always uses 1, `relist_watcher.py:188`) |
| **Dashboard** | `FileReader.readAsDataURL` in the create form (`DashboardListingCreateForm.tsx:277-304`), stored as data-URL strings | Data URL | Up to 4 (`:23`, `server.ts:128`); the first is the cover (`types.ts:78`) |

**They don't fit together as they are.** The dashboard hands over data URLs and the Camoufox client needs file paths; connecting them directly fails with `images_not_found` (`create.py:89-97`). log has to turn data URLs and URLs into files first.

## Which photo gets picked

The production poster (`process-posts/route.ts:396-501`) picks from the template's images, leaving out:

- images used by **active** listings of the same template on this account;
- images already used in this batch;
- the image of the listing being reposted.

"Recently used" means the last 200 posting log rows with status `posted` (`:413-427`). Linked templates use the same index for title, description and image (`:431-446`).

The Camoufox client's relist does the same job with `assets.pick_pool_photo`: a random pick that skips used photos, and falls back to the whole pool once all have been used (`assets.py:35-40`).

## Downloading

- **Production poster, server:** `downloadImages` uses `fetch` with 3 attempts and a backoff of 2 s × attempt, saving to `os.tmpdir()/…/<ts>/image_i.(png|jpg)` (`facebook-poster.ts:2483-2514`). If every download fails, the post fails (`process-posts/route.ts:672-700`). Files are cleaned up afterwards (`:1100`, `facebook-poster.ts:2516-2523`).
- **Production poster, desktop agent:** one `fetch`, no retry (`agent/src/poster.ts:106-119`).
- **Camoufox client:** no download. It keeps only paths that exist (`create.py:85`) and silently drops missing ones, unless *all* are missing.

## Making each upload a new file

A listing whose photo and title repeat can be held as a duplicate. The Camoufox client's live listing went to duplicate hold for exactly that (`docs/okf/marketplace_create.md:50-52`).

**The production poster's version is the stronger one** (`image-variation.ts`, `sharp ^0.34.5`). Each call gives a different file, so the hash differs (`:73-74`):

| Step | Range | Line |
| --- | --- | --- |
| Crop each edge | 2–5% | `:101-106`, `:135` |
| Rotate, white fill | ±1–3° | `:109`, `:137` |
| `modulate` brightness / saturation / hue | 0.90–1.10 / 0.95–1.05 / ±8° | `:112-115`, `:139` |
| Contrast `linear(c, 128·(1−c))` | c 0.90–1.10 | `:140-143` |
| Blur σ 0.3–0.9 **or** sharpen σ 0.8 | 50/50 | `:146-151` |
| Resize to original × 0.95–1.05, `fit:"fill"` | aspect ratio drifts slightly | `:125-127`, `:154` |
| Monochrome noise layer, alpha 30, `blend:"add"` | every pixel | `:159-189` |
| JPEG, mozjpeg | quality 80–95 | `:130`, `:188` |

It's called per image at `facebook-poster.ts:1246-1263`. The output is named `varied_<ts>_<i><original ext>`, so a `.png` name can hold JPEG bytes. If variation fails, the original is used.

**The Camoufox client's version is weaker** (`domain_marketplace/assets.py:43-65`, Pillow). It crops 2–4%, shifts brightness ±2% and contrast ±1%, and clears EXIF. The noise its docstring promises isn't implemented (`:3-4`). Without Pillow it copies the bytes unchanged (`:50-53`), and Pillow isn't in `pyproject.toml`. A normal create does **no** processing; only relisting does.

Neither applies the EXIF orientation first. A phone photo with an EXIF rotation can post sideways once the EXIF is removed.

## Attaching photos to the form

Both browser projects do the same thing: **`setInputFiles` on the hidden file input, with no file chooser and no click on "Add photos".**

| Project | Selector | Call | Line |
| --- | --- | --- | --- |
| Production poster, server | `input[accept="image/*,image/heif,image/heic"]`, waiting up to 10 s for it to be attached | `locator.setInputFiles(paths)` | `facebook-poster.ts:349-357`, `:1265` |
| Production poster, desktop agent | That, then `input[accept*="image/"]`, `input[type="file"][accept*="image"]`, `[multiple]`, plain `input[type="file"]`; clicks `Add photos` between tries; 3 tries | `elementHandle.setInputFiles` | `agent/src/poster.ts:58-65`, `:482-514` |
| Camoufox client | `input[type="file"][accept*="image"]` `.first` | `set_input_files(existing)` | `create.py:84-87` |

Order on the form: the Camoufox client uploads photos **after Category and before the text fields** (`create.py:65-97`). The production poster uploads them **first, before the title** (`facebook-poster.ts:1240-1287`). Both worked.

## Confirming the upload

This is the weakest step everywhere:

- The production server waits 3–5 s (`facebook-poster.ts:1266`). It retries once with the originals if the call *throws*, and otherwise carries on (`:1273-1280`).
- The desktop agent waits 2 s plus 0.5 s per image (`agent/src/poster.ts:491-494`).
- The Camoufox client's `create.py` waits 3 s (`:88`), then only *logs* the `(\d+)/10 photos` count (`:124-133`).
- The spike waits up to 15 s for `/1\s*\/\s*10|Photos\s*.\s*1/`, and warns and carries on if it never shows (`spike_marketplace_e2e.py:329-333`).
- The Camoufox client's photo edit waits 20 s for `/2\s*\/\s*10/` (`update_listing_photo.py:65-71`).

The only hard stop anywhere is that Next stays `aria-disabled` with 0 photos (`docs/okf/marketplace_create.md:40-41`). The production server even removes `aria-disabled` and clicks Next with JavaScript anyway (`facebook-poster.ts:1994-2076`).

## Changing photos on a live listing

The Camoufox client's `update_listing_photo.py` opens `you/selling`, clicks the card that matches a hard-coded title, clicks `Edit listing`, calls `set_input_files`, waits for `2/10`, and clicks `^Update$` (`:41-79`). It **adds** a photo rather than replacing one (`docs/okf/listing_photo_update.md:3-8`). This was proven on a live listing.

## What log should do

1. **Collect:** take URLs, data URLs or paths. Write each one to `~/.logCli/media/<listingId>/` and check it's really an image (by its first bytes, not its extension). Use at most 10, Facebook's limit.
2. **Vary:** port the production poster's `sharp` pipeline (it's already TypeScript), add `rotate()` first so EXIF orientation is applied, and always write `.jpg`. Store a perceptual hash of each varied file, so a repost can prove it differs from the last one.
3. **Pick:** use the production poster's pool rule (skip images on active listings and recent posts), kept in the account's state file.
4. **Attach:** `setInputFiles` on `input[type="file"][accept*="image"]`, driven from the Python worker, like every other live command.
5. **Confirm:** wait for Facebook's `N/10` counter to equal the number sent, with a hard timeout that ends in `photosNotConfirmed`. Never just wait a fixed time.
