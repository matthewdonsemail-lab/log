# FBScrapingWarningMutation

<!-- facts:start · written by `log firefoxCapture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | checkpoint |
| Kind | mutation |
| doc_id | `24406519995698862` |
| Path | `/api/graphql/` |
| Sends | — |
| Reads | `fb_scraping_warning_clear` |
| Called from | `FBScrapingWarningMutation` |
| rea | `ev_7af21ac9cd534e18a388ccd12dcf757cf78ca62bc92d96de74837a68b388ba73` |

Seen 2 time(s) in 2 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| connect | says: <name> We suspect automated behaviour on your account To prevent your account from b | 1 | 200 | 619 ms | 543 ms | — |
| connect | Page: automatedBehaviour /checkpoint/<id>/ | 1 | 200 | 921 ms | 528 ms | — |

<!-- facts:end -->

## What it does

Clears Facebook's scraping warning on the account (`fb_scraping_warning_clear`). It fires about 530 ms after the "We suspect automated behaviour on your account" page is dismissed: dismissing that page is this request. So Facebook had flagged the account as scraping before the page was shown.

## What our machine does with it

The connect machine's `automatedBehaviour` page kind dismisses the warning (Listaro's path, rule 23), which sends this. The machine reads the page, not this response; the next page read decides where it goes.

## What can go wrong

Seen only on Philadelphia, the account later sent to a video selfie. A scraping flag is the earliest sign in our recordings that Facebook distrusted it, so any run that meets this should be read back (rule 25) before the account runs again. No error seen yet; a non-200 would mean the warning stayed and the next page is likely a checkpoint.
