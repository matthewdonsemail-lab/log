# useUFACSubmitActionMutation

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | checkpoint |
| Kind | mutation |
| doc_id | `39380767754901151` |
| Path | `/api/graphql/` |
| Sends | `designSystem`, `input`, `scale` |
| Reads | `ufac_client_submit_action.ufac_client` |
| Called from | `useUFACSubmitAction` |
| rea | `ev_b1dae3f7e5417b34bbe335e2babb4a546ac1e6cf382c2d77f0e26d77634eecb9` |

Seen 6 time(s) in 3 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 3: click e53 | 1 | 200 | 2820 ms | 1209 ms | — |
| inspect | Text captcha: Continue is plain text here, clicking it. | 1 | 200 | 4558 ms | 1157 ms | — |
| inspect | step 41: click e69 | 1 | 200 | 2488 ms | 1196 ms | — |
| inspect | step 43: click e113 | 1 | 200 | 4046 ms | 1143 ms | — |
| inspect | scroll: +515px in 13 wheel steps, 656 ms | 2 | 200 | 1626–2288 ms | 531486–538788 ms | — |

### What it sent and what came back (the newest 1 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261024T060921_61594063207669**, scroll: +515px in 13 wheel steps, 656 ms: 200, 1626 ms

Sent:

```json
{
  "fb_api_caller_class": "RelayModern",
  "fb_api_req_friendly_name": "useUFACSubmitActionMutation",
  "server_timestamps": "true",
  "variables": {
    "designSystem": "FDS",
    "input": {
      "actor_id": "61594063207669",
      "client_mutation_id": "2",
      "action": "PROCEED",
      "caller": null,
      "enrollment_id": null
    },
    "scale": 1
  },
  "doc_id": "39380767754901151"
}
```

Answered:

```json
{
  "data": {
    "ufac_client_submit_action": {
      "ufac_client": {
        "ui_action": null,
        "active_challenge_id": null,
        "id": "__UFAC_CLIENT__",
        "show_stepper": false,
        "state_hash": "bot_captcha_challenge_ui_state",
        "stepper_current_step": 1,
        "stepper_total_steps": 4,
        "state": {
          "__typename": "UFACBotCaptchaState",
          "button_label": "Continue",
          "cancel_button_label": "Cancel",
          "title": "Confirm that you're human",
          "captcha_variant": "TEXT_CAPTCHA",
          "text_captcha_audio_url": "https://www.facebook.com/captcha/tfbaudio/?captcha_persist_data=AZ0RfHjuiLRkUQLe2ncipwUlC7a0mSzmGjodGRXzr5Ta0wDAAWH2l39SYJHlgG69shjTuiPuzUGrXd4MIHDJbs6__QDcr3epztg4wFKfaBK2Rgt-gekm-2OoVDVikarT-Wl1E61nJPIVbq4ATF34OvWsI0Gey3Sh5SnplMT1fA4hK9cmc-LHJ1yQfSdag5c35j4ffmr7mMtwuWhPF-tfIUqwEQxOCsZjtSgSfXV1IFBKffppDImmGtAJxx7lUsKLT8Yj-aZ-55qrHaNIJQIW9mKWNIZuFhI598uAuB8BI-8yKR6Ucbp4ZNBD61QgVjBBv_v5YlJ8fUCG1b2i… (577 chars)",
          "text_captcha_image_url": "https://www.facebook.com/captcha/tfbimage/596103/?captcha_challenge_code=1792824729-4909a2d050dd5da3b00206ac932eb80d&captcha_challenge_hash=AZ3gWoYORWu05SwdUikJmm2C45Xw-SCR0ku0PyNq-J9T8i0z7NYABIbEikfFoDQmyVYI1bMXJOaGEvb9x5JNe0Mp__dEs843P9E2fyDWaI3thS0giFoq1Sx3qZnT3WVa2nNIV_oIQnCjOe4f5PaD2ynyJXPf7OjjNy_jKWse0r-4H_roRH8pLDcsMA",
          "captcha_persist_data": "AZ0RfHjuiLRkUQLe2ncipwUlC7a0mSzmGjodGRXzr5Ta0wDAAWH2l39SYJHlgG69shjTuiPuzUGrXd4MIHDJbs6__QDcr3epztg4wFKfaBK2Rgt-gekm-2OoVDVikarT-Wl1E61nJPIVbq4ATF34OvWsI0Gey3Sh5SnplMT1fA4hK9cmc-LHJ1yQfSdag5c35j4ffmr7mMtwuWhPF-tfIUqwEQxOCsZjtSgSfXV1IFBKffppDImmGtAJxx7lUsKLT8Yj-aZ-55qrHaNIJQIW9mKWNIZuFhI598uAuB8BI-8yKR6Ucbp4ZNBD61QgVjBBv_v5YlJ8fUCG1b2iDiZOYmqgD9PbFvuVlQKsiqK8qTICAqi9GoqB_QMHJKfQSiVpShD8hmGjYyu0rzEV… (479 chars)",
          "text_captcha_placeholder": "Type the text",
          "text_captcha_body": "Enter the text from the image.",
          "text_captcha_error": null,
          "captcha_client_config_name": "ufac_captcha_arkose_config",
          "enrollment_id": "122128165683468773",
          "__module_operation_UFACStateRenderer_client": {
            "__dr": "UFACBotCaptcha_state$normalization.graphql"
          },
          "__module_component_UFACStateRenderer_client": {
            "__dr": "UFACBotCaptcha.react"
          }
        },
        "xfac_alr_conversational_context": null
      }
    }
  },
  "extensions": {
    "server_metadata": {
      "request_start_time_ms": 1792824728633,
      "time_at_flush_ms": 1792824729617
    },
    "is_final": true,
    "sr_payload": {
      "ddd": {
        "hsrp": {
          "hsdp": {
            "bxData": "(12 fields)",
            "clpData": "(15 fields)",
            "gkxData": "(165 fields)",
            "ixData": "(57 fields)",
            "qexData": "(70 fields)",
            "qplData": "(388 fields)",
            "justknobxData": "(22 fields)"
          },
          "hblp": {
            "consistency": "(1 fields)",
            "rsrcMap": "(9 fields)",
            "compMap": "(2 fields)",
            "indexUpgrades": "(2 fields)"
          }
        },
        "jsmods": {
          "define": [
            "(4 items)",
            "(4 items)",
            "(4 items)",
            "(4 items)",
            "(4 items)",
            "(4 items)",
            "… 109 more"
          ],
          "require": [
            "(1 items)",
            "(1 items)",
            "(4 items)",
            "(1 items)",
            "(1 items)",
            "(1 items)",
            "… 15 more"
          ],
          "phd2_indexes": ":5243,5241,3344,3343,3416"
        },
        "allResources": [
          "h+DkWHc",
          "YkPI/cA",
          "2gtKE3t",
          "csr:_i_0_Cl",
          "csr:_i_1_xu"
        ],
        "tieredResources": {
          "r": [
            "h+DkWHc",
            "YkPI/cA",
            "2gtKE3t",
            "csr:_i_0_Cl"
          ],
          "rdfds": [],
          "rds": [
            "csr:_i_1_xu"
          ]
        }
      }
    }
  }
}
```

<!-- facts:end -->

## What it does

Sends an answer to a checkpoint step (`ufac_client_submit_action`): here, the solved text captcha. It took 2.3 s and fired 3.7 s after the captcha page opened.

## What our machine does with it

The connect machine's `captcha` page kind types the solver's answer and presses Enter, then waits for Continue (rule 10's solvers). This request is that submit reaching Facebook: if it is in the step HAR, the answer was sent.

## What can go wrong

A 200 only means Facebook received the answer, not that it was right: the next page says that (another captcha means wrong). If it is missing after a submit, the Enter never reached Facebook (the bug fixed this session).
