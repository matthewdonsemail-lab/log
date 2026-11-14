# discordApiUsersMeCollectiblesMarketing

<!-- facts:start · written by `log capture docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | endpoint |
| doc_id | — |
| Path | `discord.com/api/users/@me/collectibles-marketing` |
| Sends | — |
| Reads | `marketings.0`, `marketings.2` |
| Called from | `runs/inspect/20261114T184328_deepman2/script0.js:232 625075`, `runs/inspect/20261114T184328_deepman2/script0.js:124 559868`, `runs/inspect/20261114T184328_deepman2/script0.js:124 961943`, `runs/inspect/20261111T233723_deepman2/script1280.js:1 anonymous` |
| rea | `ev_f6daff8038b4f477b27b852e31fc1f2f76f7dd725b1883891e74b824ed6f0ac3` |

Seen 15 time(s) in 13 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 1: goto /channels/@me/<id> | 1 | 200 | 334 ms | 11814 ms | — |
| inspect | step 5: click e40 | 1 | 200 | 358 ms | 12899 ms | — |
| inspect | step 9: goto /channels/@me | 1 | 200 | 438 ms | 9545 ms | — |
| inspect | step 25: goto /channels/@me | 1 | 200 | 362 ms | 8655 ms | — |
| inspect | step 1: goto /login | 7 | 200 | 189–9793 ms | 18485–1052571 ms | — |
| inspect | step 2: snapshot | 1 | 200 | 394 ms | 51734 ms | — |
| inspect | step 6: wait 45s | 1 | 200 | 164 ms | 25493 ms | — |
| inspect | step 1: goto /channels/@me | 1 | 200 | 169 ms | 4494 ms | — |
| inspect | step 9: wait 45s | 1 | 200 | 159 ms | 16549 ms | — |

### What it sent and what came back (the newest 3 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261114T184328_deepman2**, step 9: wait 45s: 200, 159 ms

Sent:

```json
{
  "query": {
    "platform": "0"
  },
  "body": null
}
```

Answered:

```json
{
  "marketings": {
    "0": {
      "type": 4,
      "version": 104,
      "title": "Zenless Zone Zero",
      "body": "Gear up, Proxy! New ZZZ styles in Shop now.",
      "asset": "https://cdn.discordapp.com/media/v1/collectibles-shop/97113b02dbd82917bdbf1b5e5435e5e0529bfef1182cf8d53c794d2b9ba75c96",
      "dismissible_content": 422,
      "ref_target_background": {
        "style": {
          "resting": {
            "light": null,
            "dark": null
          },
          "hovered": {
            "light": null,
            "dark": null
          }
        },
        "asset": {
          "resting": {
            "light": null,
            "dark": null
          },
          "hovered": {
            "light": "https://cdn.discordapp.com/media/v1/collectibles-shop/eafc8065f4565b79b1e44ac1cb7ee5e388726af8494e1d1cb8fe51d2b5e6231f",
            "dark": "https://cdn.discordapp.com/media/v1/collectibles-shop/eafc8065f4565b79b1e44ac1cb7ee5e388726af8494e1d1cb8fe51d2b5e6231f"
          }
        }
      }
    },
    "2": {
      "type": 2,
      "version": 104,
      "title": "Give your profile a fresh look",
      "body": "Check out the latest avatar decorations, profile effects, and nameplates and collect your favorite styles.",
      "asset": "https://cdn.discordapp.com/media/v1/collectibles-shop/f19c079782566789c0d0b7d3cfe22ae038bf753be33cfaaed07e41df718a9932",
      "popout_asset": "https://cdn.discordapp.com/media/v1/collectibles-shop/2441a494c1263bd6b5c96e0618e4fd7dfd470d87890df578bd75c874314670cc"
    }
  }
}
```

**runs/inspect/20261113T231616_deepman2**, step 6: wait 45s: 200, 164 ms

Sent:

```json
{
  "query": {
    "platform": "0"
  },
  "body": null
}
```

Answered:

```json
{
  "marketings": {
    "0": {
      "type": 4,
      "version": 104,
      "title": "Zenless Zone Zero",
      "body": "Gear up, Proxy! New ZZZ styles in Shop now.",
      "asset": "https://cdn.discordapp.com/media/v1/collectibles-shop/97113b02dbd82917bdbf1b5e5435e5e0529bfef1182cf8d53c794d2b9ba75c96",
      "dismissible_content": 422,
      "ref_target_background": {
        "style": {
          "resting": {
            "light": null,
            "dark": null
          },
          "hovered": {
            "light": null,
            "dark": null
          }
        },
        "asset": {
          "resting": {
            "light": null,
            "dark": null
          },
          "hovered": {
            "light": "https://cdn.discordapp.com/media/v1/collectibles-shop/eafc8065f4565b79b1e44ac1cb7ee5e388726af8494e1d1cb8fe51d2b5e6231f",
            "dark": "https://cdn.discordapp.com/media/v1/collectibles-shop/eafc8065f4565b79b1e44ac1cb7ee5e388726af8494e1d1cb8fe51d2b5e6231f"
          }
        }
      }
    },
    "2": {
      "type": 2,
      "version": 104,
      "title": "Give your profile a fresh look",
      "body": "Check out the latest avatar decorations, profile effects, and nameplates and collect your favorite styles.",
      "asset": "https://cdn.discordapp.com/media/v1/collectibles-shop/f19c079782566789c0d0b7d3cfe22ae038bf753be33cfaaed07e41df718a9932",
      "popout_asset": "https://cdn.discordapp.com/media/v1/collectibles-shop/2441a494c1263bd6b5c96e0618e4fd7dfd470d87890df578bd75c874314670cc"
    }
  }
}
```

**runs/inspect/20261111T233723_deepman2**, step 1: goto /login: 200, 707 ms

Sent:

```json
{
  "query": {
    "platform": "0"
  },
  "body": null
}
```

Answered:

```json
{}
```

<!-- facts:end -->

## What it does

Reads the shop's collectibles promo for the account.

## What our machine does with it

Nothing in log-cli waits for it or reads it. It is part of what Discord's client loads around the page; a watch or a send never depends on it.

## What can go wrong

The account carries on whatever it answers; a failure here changes nothing for our steps.
