# useCometAISupportConversationLoggerMutation

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | checkpoint |
| Kind | mutation |
| doc_id | `26372148759079397` |
| Path | `/api/graphql/` |
| Sends | `input` |
| Reads | `xfb_support_conversation_logging.viewer` |
| Called from | `useCometAISupportConversationLogger.react` |
| rea | `ev_9b8131e20d25cf5f2615540fd47b41670ee2c3b239082dde00fe6367de015a5b` |

Seen 23 time(s) in 5 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 1: goto / | 3 | 200 | 384–1322 ms | 6752–9345 ms | — |
| inspect | step 5: clickRole button "…" | 10 | 200 | 346–1280 ms | 954–11732 ms | — |
| inspect | step 6: clickRole button "…" | 3 | 200 | 343–579 ms | 1229–1990 ms | — |
| inspect | clickRole failed: RuntimeError: the element kept moving under the cursor: the point is on  | 5 | 200 | 348–594 ms | 1056–6931 ms | — |
| inspect | step 38: goto /marketplace/ | 1 | 200 | 512 ms | 22071 ms | — |
| inspect | scroll: +515px in 13 wheel steps, 656 ms | 1 | 200 | 349 ms | 501017 ms | — |

### What it sent and what came back (the newest 1 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261024T060921_61594063207669**, scroll: +515px in 13 wheel steps, 656 ms: 200, 349 ms

Sent:

```json
{
  "fb_api_caller_class": "RelayModern",
  "fb_api_req_friendly_name": "useCometAISupportConversationLoggerMutation",
  "server_timestamps": "true",
  "variables": {
    "input": {
      "actor_id": "61594063207669",
      "client_mutation_id": "1",
      "additional_data": [
        {
          "key": "component_context",
          "value": "CometAIHTSChatBubbleButton"
        },
        {
          "key": "source_surface"
        },
        {
          "key": "web_session",
          "value": "j2n11v:9fde91:20f3pj"
        }
      ],
      "attempt_token": "Q8CtDAEoCn4qCWgxsluih0G4Yxsz5XkrXIho1J1SOq2E7WLfu2N5GMj9wlNlrKfRoaZrHz7wc1CBC85tdDgKQtudxE4h3fwdfETVzeKGoRaXctkKfyJBzPLEtMLuL5EgjHKdFJdTGOcTnaaENp3VjhMSzzQW0IkXxM2hPF367ZpVNNF47nhvQB0JsufcbbjBpKnCj0kp6FG1qceh0XRisR3HsXQcbwcv7AcPsIy8Qpf-Mwl2dTHzK8V8oq0FN1A-NS5ORAUVDuQJR9tZmxVEndiZXIWMUBe23aAimwSf_mVTAhMHaSaekXLdHHMU7JjKcDgsOz2ET6qkEKM8CvfSi1sdDnV1p9xwCM6sXkNTXlkYvB0L-GROrS-QTBJ-hPRr_k_QOEd7hGX78OkG… (2007 chars)",
      "entry_point": "COMET_AI_HTS_GENPOP_FB_UFAC",
      "event": "START_CHAT_BUTTON_IMPRESSION"
    }
  },
  "doc_id": "26372148759079397"
}
```

Answered:

```json
{
  "data": {
    "xfb_support_conversation_logging": {
      "viewer": {
        "__typename": "Viewer"
      }
    }
  },
  "extensions": {
    "server_metadata": {
      "request_start_time_ms": 1792824698173,
      "time_at_flush_ms": 1792824698214
    },
    "is_final": true
  }
}
```

<!-- facts:end -->

## What it does

Logs that the support chat on a checkpoint page was shown (`xfb_support_conversation_logging`). Fires with `UFACAISupportChatExperienceQuery`, about 4.4 s after the page opened.

## What our machine does with it

Nothing. It is logging on a checkpoint page; no state of `marketplace/connect` or `marketplace/publish` waits for it or reads it.

## What can go wrong

Like the chat query, it only appears inside a checkpoint. Seeing it means the run already ended in a person's hands.
