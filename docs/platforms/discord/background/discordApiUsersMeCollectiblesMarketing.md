# discordApiUsersMeCollectiblesMarketing

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | endpoint |
| doc_id | — |
| Path | `discord.com/api/users/@me/collectibles-marketing` |
| Sends | — |
| Reads | `marketings.0`, `marketings.2` |
| Called from | `runs/inspect/20261113T141543_<name:1>/script1.js:232 625075`, `runs/inspect/20261113T141543_<name:1>/script1.js:124 559868`, `runs/inspect/20261113T141543_<name:1>/script1.js:124 961943`, `runs/inspect/20261113T141543_<name:1>/script1294.js:1 634654` |
| rea | `ev_a9fa69c7432fa1fcc41058ba491790444cfcec72f4c96150b3d2566a4e5def67` |

Seen 8 time(s) in 6 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 1: goto /channels/@me/<id> | 1 | 200 | 334 ms | 11814 ms | — |
| inspect | step 5: click e40 | 1 | 200 | 358 ms | 12899 ms | — |
| inspect | step 9: goto /channels/@me | 1 | 200 | 438 ms | 9545 ms | — |
| inspect | step 25: goto /channels/@me | 1 | 200 | 362 ms | 8655 ms | — |
| inspect | step 1: goto /login | 3 | 200 | 328–9793 ms | 18485–1052571 ms | — |
| inspect | step 2: snapshot | 1 | 200 | 394 ms | 51734 ms | — |

### What it sent and what came back (the newest 3 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261113T141543_<name:1>**, step 1: goto /login: 200, 446 ms

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

**runs/inspect/20261030T222341_<name:1>**, step 2: snapshot: 200, 394 ms

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
      "version": 102,
      "title": "Día de Muertos",
      "body": "Ofrendas, calaveras, and more to celebrate the ones who came before. Now in the Shop.",
      "asset": "https://cdn.discordapp.com/media/v1/collectibles-shop/454ee5f4704cd6145ef6e9705e52cec037407cd90227d5489855942d778cda2a",
      "dismissible_content": 422,
      "ref_target_background": null
    },
    "2": {
      "type": 2,
      "version": 102,
      "title": "Give your profile a fresh look",
      "body": "Check out the latest Avatar Decorations, Nameplates, Profile Effects, and Profile Frames in the Shop.",
      "asset": "https://cdn.discordapp.com/media/v1/collectibles-shop/793148d58f5126ac9bfd6d13fcd2549470d9223173823ee5005968ddb89f25c8",
      "popout_asset": "https://cdn.discordapp.com/media/v1/collectibles-shop/02d7874003e7113ede42b2956f9ebb92f41055a9a3b37c823d56330fb97413ef",
      "revert_text_color": true
    }
  }
}
```

**runs/inspect/20261028T065202_<name:1>**, step 1: goto /channels/@me/<id>: 200, 334 ms

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
      "version": 101,
      "title": "The Pumpkin King has arrived!",
      "body": "Tim Burton's The Nightmare Before Christmas is here. Get ready for tricks and treats! ©Disney",
      "asset": "https://cdn.discordapp.com/media/v1/collectibles-shop/8d21487bb494ffa1def861801b71b2cbb995236910a1da6d69fc167a2227193e",
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
            "light": "https://cdn.discordapp.com/media/v1/collectibles-shop/e5a2d8bbf64a2c83290c346ec345b345c93d541f66bec760417364242316e9cd",
            "dark": "https://cdn.discordapp.com/media/v1/collectibles-shop/e5a2d8bbf64a2c83290c346ec345b345c93d541f66bec760417364242316e9cd"
          }
        }
      },
      "show_hover_gradient": true
    },
    "2": {
      "type": 2,
      "version": 101,
      "title": "Give your profile a fresh look",
      "body": "Check out the latest Avatar Decorations, Nameplates, Profile Effects, and Profile Frames in the Shop.",
      "asset": "https://cdn.discordapp.com/media/v1/collectibles-shop/793148d58f5126ac9bfd6d13fcd2549470d9223173823ee5005968ddb89f25c8",
      "popout_asset": "https://cdn.discordapp.com/media/v1/collectibles-shop/02d7874003e7113ede42b2956f9ebb92f41055a9a3b37c823d56330fb97413ef",
      "revert_text_color": true
    }
  }
}
```

<!-- facts:end -->

## What it does

Reads the shop's collectibles promo for the account.

## What our machine does with it

Nothing in log-cli waits for it or reads it. It is part of what Discord's client loads around the page; a watch or a send never depends on it.

## What can go wrong

The account carries on whatever it answers; a failure here changes nothing for our steps.
