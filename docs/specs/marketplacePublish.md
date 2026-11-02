---
title: "Marketplace publish and check"
---

# Marketplace publish and check

log-cli is read-only on Facebook except where matt asked for an action. Posting a listing is one he asked for: `log facebook publish` posts one listing through the publish machine, a dry run unless `--live`, with nothing retried once Publish is clicked. Once a listing is live, the account is checked on a schedule in the browser the host holds (`log facebook check` runs it once), reading Facebook's own answers and clicking nothing. Rules 8, 10 and 69.

## Publish

### REQ-LISTING-16: Publish is a dry run unless --live

Without `--live`, the publish machine fills and reviews the form and ends there with the result `dryRun`. It never reaches the Publish click.

Checked by: code and SubQ

### REQ-LISTING-17: Nothing is retried once Publish is clicked

Entering the Publish step marks Publish as clicked. From then on no step goes back to the form or to Publish: a runtime failure after the click ends as `unconfirmedId` (`crashedAfterPublish`), never as a retry.

Checked by: code and SubQ

### REQ-LISTING-18: Captchas go to CaptchaKraken first, then 2Captcha

A reCAPTCHA or a text captcha is sent to CaptchaKraken first (up to 2 tries), then to 2Captcha (1 try). Arkose goes to 2Captcha only. Facebook's own challenge, or a captcha nobody recognises, gets no solver and goes to a person (`needsPerson`).

Checked by: code and SubQ

### REQ-LISTING-19: A live publish stops at the account's daily cap

A `--live` publish is refused with `dailyCapReached` when the account has already posted its `dailyListingCap` listings in its own local day.

Checked by: code and SubQ

## The account check

### REQ-LISTING-20: The check reads three pages and clicks nothing

The check opens Marketplace status, Selling and the seller inbox in the account's open browser, one `goto` each, and reads each from its step's own recording. It clicks nothing. The host runs it in its watch round, and `log facebook check --account <a>` runs it once.

Checked by: code and SubQ

### REQ-LISTING-21: Anything but full access is the account's suspended issue

Marketplace status is read from Facebook's `CometMarketplaceStatusContentContainerQuery` answer. A ban, selling not `ELIGIBLE`, an enforcement on the account or a profile status other than `GOOD` is the account's `suspended` issue.

Checked by: code and SubQ

### REQ-LISTING-22: Each listing's state on Selling goes into Twenty

Each listing on Selling is matched to its Twenty row by its Facebook listing id, and its state (active, being reviewed, sold, rejected, duplicate) and clicks are written to the row.

Checked by: code and SubQ

### REQ-LISTING-23: Seller chats are counted and kept as sent

The seller inbox's chats are counted, and when there are any, the answer is kept as Facebook sent it in a file in the run folder, until a real chat has been recorded and mapped.

Checked by: code and SubQ
