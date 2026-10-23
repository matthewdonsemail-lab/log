# Listing media: from Twenty to Facebook

How a listing's photos are stored in Twenty, made unique and uploaded. The
words that go with them follow `skills/listingCopy/SKILL.md`.

## Where they are kept

A listing is a row in Twenty's `agencyListings` (rule 13). Its photos are the
`photos` field (RAW_JSON): a list of 1 to 10 sources, the cover first. Each
source is one of three things (`src/media/photo/helpers/photoSource.ts`):

| Source | Example | How it is read |
| --- | --- | --- |
| A path on this machine | `C:/Users/0/.logCli/listings/bethlehemHoarderCleanout/before.png` | read from disk |
| A URL | `https://…/before.jpg` | fetched through the account's own proxy, never from this machine's IP; refused when the account has no HTTP proxy |
| A data URL | `data:image/png;base64,…` | decoded in place |

**Twenty keeps the addresses, not the files.** A path only works on the
machine where the file is. On the browser server (`docs/deployment.md`), a
listing's photos have to be URLs it can fetch, or files copied to that server
at the same path.

A listing gets its photos from `listing.json` through
`log facebook listing create --account <a> --file <listing.json>` (the
`photos` list), or by editing the row in Twenty.

## What happens at publish

Each run makes its own copies (`preparePhotos`, `src/media/photo/client.ts`).
The source files are never changed.

1. **Read** each source as in the table above (a URL gets three tries).
2. **Vary** each photo, with new random settings every run (`variationParams`):
   - turned upright;
   - each edge cropped 2–5%;
   - rotated 1–3°;
   - brightness, contrast and saturation shifted a little, hue a few degrees;
   - slightly blurred or sharpened;
   - scaled 95–105%;
   - a little noise added;
   - saved as a JPEG at quality 80–95.

   The output carries no metadata (no EXIF: `photo.test.ts`), so no camera,
   place or software details reach Facebook. No two uploads of the same
   listing are the same file.
3. **Write** them to the run folder as `photo1.jpg`, `photo2.jpg`…
   (`<runFolder>/photos`).
4. **Upload** them through the create form's photo control:
   - **`log facebook publish`** takes the whole list. Afterwards it saves each
     varied photo's sha256 in the listing's `photoHashes`, so it's known exactly
     what went up.
   - **The recorded flow `marketplaceListingPublish`** (rule 68) takes exactly
     two: `photo1` through "Add photos or drag and drop", then `photo2` through
     "Add photo". It doesn't write `photoHashes`.

The profile picture and cover photo work the same way
(`socialAccounts.profilePhoto` and `coverPhoto`, rule 28).

## Limits the publish checks first

`validateListing` (`src/marketplace/publish/helpers/validateListing.ts`) refuses
a listing before anything opens when:
- it has no photo: Facebook's Next stays disabled with none;
- it has more than 10 photos;
- its title is over 100 characters;
- its price isn't a whole number of 1 or more;
- its category is empty.

## Against the copy rules

The copy rules ask for 4 to 6 real photos, with the strongest before-and-after
first (`skills/listingCopy/SKILL.md`, from the research). Today:

- **`log facebook publish`** takes up to 10, so 4 to 6 fit.
- **The recorded flow** uploads two. A third photo onward needs the flow's
  second upload step repeated per photo.
- **The Bethlehem listing** has two photos, both generated
  (`~/.logCli/listings/bethlehemHoarderCleanout/images.jsonl`).
