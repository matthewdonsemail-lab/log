# useCDSWebLoginMutation

<!-- facts:start · written by `log capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | login |
| Kind | mutation |
| doc_id | `28077768681846394` |
| Path | `/api/graphql/` |
| Sends | `input`, `scale` |
| Reads | `caa_login_web.error_code`, `caa_login_web.error_message`, `caa_login_web.error_style`, `caa_login_web.redirect_uri`, `caa_login_web.two_factor_result`, `caa_login_web.reg_nta_context`, `caa_login_web.is_3pl`, `caa_login_web.is_xapp_login`, `caa_login_web.recaptcha_needed`, `caa_login_web.is_ig_login_recaptcha`, `caa_login_web.should_show_profile_selector`, `caa_login_web.should_show_save_password_dialog` and 14 more |
| Called from | `useCDSWebLoginMutation` |
| rea | `ev_7543806195ba80ee29295f7f912b572624ba9a9d878999614d2a53b06a616590` |

Seen 1 time(s) in 1 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| host | signIn: password typed; submitting with Enter | 1 | 200 | 4726 ms | 79 ms | — |

<!-- facts:end -->

## What it does

The sign-in on Facebook's newer login page (`/login/`, the Comet "CDS" form): the password is sent as a GraphQL mutation instead of the old form POST (`loginDeviceBasedRegularLogin`). It fired 79 ms after the host's `signIn` pressed Enter and took 4.7 s. Its answer, `caa_login_web`, carries the outcome: `error_code`/`error_message`, `redirect_uri`, `two_factor_result`, `recaptcha_needed`.

## What our machine does with it

The host's `signIn` actor (`src/cli/host/helpers/hostActors.ts`) and the inspect `signIn` step press Enter, then wait for the URL or the password field to change (up to 15 s) instead of a fixed time, because this request takes several seconds. Signed in is then decided by the `c_user` and `xs` cookies, never by this answer's wording.

## What can go wrong

`error_code` set means the form came back (wrong password: `wrongPassword`). `two_factor_result` set means the two-step page follows (the `code` step). `recaptcha_needed` true means a captcha (rule 10's solvers). A `redirect_uri` to `/checkpoint/` is the cause line for a checkpoint at sign-in. No sighting after Enter means the submit never left the page.
