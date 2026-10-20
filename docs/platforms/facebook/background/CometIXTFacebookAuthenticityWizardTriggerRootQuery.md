# CometIXTFacebookAuthenticityWizardTriggerRootQuery

<!-- facts:start · written by `log capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | query |
| doc_id | `39059966040317376` |
| Path | `/api/graphql/` |
| Sends | `input`, `scale` |
| Reads | `ixt_authenticity_wizard_trigger.screen` |
| Called from | `CometIXTFacebookAuthenticityWizardTriggerRoot.react` |
| rea | `ev_6150497d1b443ddefeb7a0fa6d42ad1908ddf84117060e33a416bae343af3513` |

Seen 1 time(s) in 1 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 3: click e97 | 1 | 200 | 2734 ms | 873 ms | — |

<!-- facts:end -->

## What it does

Starts the identity check wizard on a checkpoint (`ixt_authenticity_wizard_trigger.screen`): it fired on run 20261020T161400 when "Start video selfie" was pressed on Reading's checkpoint/1501092823525282 (2734 ms), and the answer opened the "Confirm your identity" dialog asking for camera access.

## What our machine does with it

It marks the video selfie state that only a person can clear (rules 10, 23, 54): `pageStateOf` maps that page to `videoSelfie`, and the account is set CHECKPOINT (videoSelfieRequired) in Twenty. No machine of ours goes past it; the dialog's Upload stays disabled without a camera.

## What can go wrong

None seen. If it failed the dialog would not open and the page would stay on "Confirm your identity".
