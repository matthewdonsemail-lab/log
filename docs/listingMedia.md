# Listing photos

This page explains how a Marketplace listing's photos are stored, changed slightly for each upload, and sent to Facebook. Each upload gets its own fresh copy, so no two uploads of the same listing are the same file, and no camera or location details go with them. Read it if you're adding photos to a listing or running log on a different machine from where the photos live. The words that go with the photos follow `skills/listingCopy/SKILL.md`.

## Where photos are kept

A listing is a row in Twenty's `agencyListings`. Its photos are the `photos` field (RAW_JSON): a list of 1 to 10 sources, cover photo first. Each source is one of three kinds (`src/media/photo/helpers/photoSource.ts`):

| Source | Example | How it is read |
| --- | --- | --- |
| A path on this machine | `C:/Users/you/.logCli/listings/myListing/before.png` | Read from disk. |
| A URL | `https://…/before.jpg` | Fetched through the account's own proxy, never from this machine's IP. Refused when the account has no HTTP proxy. |
| A data URL | `data:image/png;base64,…` | Decoded in place. |

**Twenty keeps the addresses, not the files.** A path only works on the machine where the file is. If log runs on a separate browser server (see [Running log on servers](deployment.md)), a listing's photos must be URLs that server can fetch, or files copied to the same path there.

You set a listing's photos with the `photos` list in `listing.json` (`log facebook listing create --account <a> --file <listing.json>`), or by editing the row in Twenty.

## What happens when a listing is published

Each run makes its own copies (`preparePhotos`, `src/media/photo/client.ts`). The source files are never changed.

1. **Read** each source as in the table above. A URL gets three tries.
2. **Vary** each photo, with new random settings every run (`variationParams`):
   - turned upright;
   - each edge cropped 2–5%;
   - rotated 1–3°;
   - brightness, contrast and saturation shifted a little, hue by a few degrees;
   - slightly blurred or sharpened;
   - scaled 95–105%;
   - a little noise added;
   - saved as a JPEG at quality 80–95.

   The output carries no metadata (no EXIF, checked in `photo.test.ts`), so no camera, place or software details reach Facebook.
3. **Write** them to the run folder as `photo1.jpg`, `photo2.jpg`… (`<runFolder>/photos`).
4. **Upload** them through the create form's photo control:
   - **`log facebook publish`** uploads the whole list. Afterwards it saves each varied photo's sha256 in the listing's `photoHashes`, so you know exactly what went up.
   - **The recorded flow `marketplaceListingPublish`** uploads exactly two: `photo1` through "Add photos or drag and drop", then `photo2` through "Add photo". It doesn't write `photoHashes`.

The profile picture and cover photo work the same way (`socialAccounts.profilePhoto` and `coverPhoto`).

## Checks before publishing

`validateListing` (`src/marketplace/publish/helpers/validateListing.ts`) refuses a listing before any browser opens when:

- it has no photo (Facebook's Next button stays disabled without one);
- it has more than 10 photos;
- its title is over 100 characters;
- its price isn't a whole number of 1 or more;
- its category is empty.

## How many photos to use

The copy guidance asks for 4 to 6 real photos, with the strongest before-and-after first (`skills/listingCopy/SKILL.md`). Today:

- **`log facebook publish`** takes up to 10, so 4 to 6 fit.
- **The recorded flow** uploads two. A third photo onward needs the flow's second upload step repeated for each extra photo.
