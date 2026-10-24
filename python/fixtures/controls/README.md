# Control fixtures

Excerpts of the accessibility snapshots of Facebook pages the flows click through, read by
`src/browser/flow/controlMatch.test.ts` against `python/browser/controlMatch.py`. Each keeps the
page's structure (roles, names, the dialog around a control, disabled states) and drops people's
names and page copy.

| File | From | What it pins |
|---|---|---|
| `twoStepCode.yml` | Exeter host run 20261024T163457, step 08 | the two-step code box is a textbox named by its label "Code", none of `CODE_FIELD`'s attributes |
| `automatedBehaviour.yml` | Exeter host run 20261024T163457, step 18 | Dismiss is a button with no accessible name, only its text |
| `choosePicture.yml` | Exeter inspect run 20261024T164523, step 04 | the button reads "Upload photo"; the flow recorded on 2026-10-19 says "Upload Photo" |
| `cropPicture.yml` | Exeter inspect run 20261024T164523, step 06, plus a page "Save" outside the dialog | Save is picked inside the dialog the step names |
