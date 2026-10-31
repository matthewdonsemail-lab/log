# TwoStepVerificationChallengePickerDialogQuery

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | checkpoint |
| Kind | query |
| doc_id | `26515739554748267` |
| Path | `/api/graphql/` |
| Sends | `encryptedContext`, `loginAccountType` |
| Reads | `xfb_two_step_verification_challenge_contact_points.contact_points`, `xfb_two_step_verification_challenge_contact_points.see_more_options_response`, `xfb_two_step_verification_recovery_content.title`, `xfb_two_step_verification_recovery_content.subtitle`, `xfb_two_step_verification_recovery_content.link_text`, `xfb_two_step_verification_recovery_content.link_url` |
| Called from | `TwoStepVerificationChallengePickerDialog.react` |
| rea | `ev_41b465cd968017dd0ffbd98621f878ed3694949e43a70e2b660fc944252f0bba` |

Seen 1 time(s) in 1 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| host | step 15: click e45 | 1 | 200 | 450 ms | 1352 ms | — |

### What it sent and what came back (the newest 1 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/host/20261024T222706_61593981307720**, step 15: click e45: 200, 450 ms

Sent:

```json
{
  "qpl_active_flow_ids": "241973805",
  "fb_api_caller_class": "RelayModern",
  "fb_api_req_friendly_name": "TwoStepVerificationChallengePickerDialogQuery",
  "server_timestamps": "true",
  "variables": {
    "encryptedContext": "AWTUEHDUcB9PBQd5kdy9OgqSr7d1xncXAqTkIoIW4y_pYnHoLJDSCrIj-tyG_APliv1g1WN7hU2K4irzi4h-W4KX5Uout76RvX6aEdoxMG4ex_zi3zDRt5AYBqYVKeIBYCuBzhpIaaWYKr3-WzCBl40ltprT1ZBTesRIkkp-uBaZzFr-Z5pqT9qmuwG3t_M6VFRPNdB0Gam75M2WCJ-Ja-Lod899r2eO6nP_k9Vtsi0zUNT-N8mT6Dbk6ER93490GH2mJ-PCAvp-FafB1YCuFhi-7Fq0_HCKU_CJmtE53SugBLtra5RDGRUL3Cp8Z63r4FVKlk6pkrMpyGveHj9dfzXEbA0j_b6oPNB5WlKBowNbwBiEhgF9WHbrnJIPfqiEcHMS4vlvoXlwfyrW… (802 chars)"
  },
  "doc_id": "26515739554748267",
  "fb_api_analytics_tags": [
    "qpl_active_flow_ids=241973805"
  ]
}
```

Answered:

```json
{
  "data": {
    "xfb_two_factor_login_methods": {
      "methods": [
        {
          "method": "PASSKEY",
          "method_representation": null,
          "method_screen_content": {
            "heading": "Use face scan, fingerprint or screen lock to confirm it's you",
            "subheading": [
              "Your saved passkey securely and quickly confirms it's you, the same way you unlock your device."
            ]
          },
          "method_picker_content": {
            "heading": "Passkey",
            "subheading": "Use face scan, fingerprint or screen lock."
          },
          "method_screen_image_uri": "/images/assets_DO_NOT_HARDCODE/xmds_f3_meta_account/f3-passkey-nux-hero-mobile_light-3x.png",
          "is_disabled": false,
          "disabled_reason": null
        },
        {
          "method": "TOTP",
          "method_representation": null,
          "method_screen_content": {
            "heading": "Go to your authentication app",
            "subheading": [
              "Enter the 6-digit code for this account from the two-factor authentication app you set up (such as Duo Mobile or Google Authenticator)."
            ]
          },
          "method_picker_content": {
            "heading": "Authentication app",
            "subheading": "Get a code from your authentication app."
          },
          "method_screen_image_uri": "/images/assets_DO_NOT_HARDCODE/xmds_f3_meta_account/F3-2FA-AuthenticatorApp-WWW_light-3x.png",
          "is_disabled": false,
          "disabled_reason": null
        },
        {
          "method": "BACKUP_CODES",
          "method_representation": null,
          "method_screen_content": {
            "heading": "Enter a backup code",
            "subheading": [
              "A list of backup codes is shown when you set up two-factor authentication.\n\nIf you saved them, you might have them as a screenshot, a downloaded file or a note."
            ]
          },
          "method_picker_content": {
            "heading": "Backup code",
            "subheading": "Use a backup code you saved."
          },
          "method_screen_image_uri": "/images/assets_DO_NOT_HARDCODE/xmds_f3_meta_account/F3-2FA-BackupCodes-WWW_light-3x.png",
          "is_disabled": false,
          "disabled_reason": null
        }
      ]
    },
    "xfb_two_factor_login_content": {
      "method_picker_screen_title": "Choose a way to confirm it’s you",
      "method_picker_screen_description": "These are your available confirmation methods.",
      "contact_point_chooser_header": "Choose where to get the code"
    },
    "xfb_two_step_verification_challenge_contact_points": {
      "contact_points": [
        {
          "challenge": "PASSKEY",
          "contact_points": []
        },
        {
          "challenge": "TOTP",
          "contact_points": []
        },
        {
          "challenge": "BACKUP_CODES",
          "contact_points": []
        }
      ],
      "see_more_options_response": null
    },
    "xfb_two_step_verification_recovery_content": {
      "title": "Need another option?",
      "subtitle": "To keep your account safe, accessing it without your usual login methods can take a few days. To get started, go to",
      "link_text": "account recovery",
      "link_url": null
    }
  },
  "extensions": {
    "server_metadata": {
      "request_start_time_ms": 1792880987697,
      "time_at_flush_ms": 1792880987798
    },
    "is_final": true
  }
}
```

<!-- facts:end -->

## What it does

When the user takes "Try another way" on a two-step prompt, Facebook fetches the account's available second-factor methods (PASSKEY, TOTP, BACKUP_CODES) with each method's screen content, so it can render the method picker.

## What our machine does with it

Our sign-in (host, flow and inspect) reads the answer to confirm the authentication app (TOTP) is among the methods (`authAppOffered`) before choosing it; the state is `twoStepMethodPicker`. If TOTP is absent it raises `twoStepNoAuthApp` and stops for matt, since log-cli holds a TOTP secret, not a passkey.

## What can go wrong

If it offers only PASSKEY or backup codes, log-cli cannot proceed (no device for a passkey). A non-200 leaves the picker unconfirmed and the step waits.
