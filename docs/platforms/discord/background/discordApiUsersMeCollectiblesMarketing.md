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
| Called from | `runs/inspect/20261028T065202_sourcedandsoldtothehighestbidder/script0.js:160 app_store_parental_revocation`, `runs/inspect/20261028T065202_sourcedandsoldtothehighestbidder/script892.js:1 parse`, `runs/inspect/20261028T065202_sourcedandsoldtothehighestbidder/script1090.js:2 anonymous`, `runs/inspect/20261028T065202_sourcedandsoldtothehighestbidder/script0.js:158 2242` |
| rea | `ev_8e6a64a3ca9f7f5379dec17edf0d5b861e9084b228f1377eabbfba37d24eb911` |

Seen 4 time(s) in 2 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 1: goto /channels/@me/<id> | 1 | 200 | 334 ms | 11814 ms | — |
| inspect | step 5: click e40 | 1 | 200 | 358 ms | 12899 ms | — |
| inspect | step 9: goto /channels/@me | 1 | 200 | 438 ms | 9545 ms | — |
| inspect | step 25: goto /channels/@me | 1 | 200 | 362 ms | 8655 ms | — |

### What it sent and what came back (the newest 3 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261028T065202_sourcedandsoldtothehighestbidder**, step 1: goto /channels/@me/<id>: 200, 334 ms

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

**runs/inspect/20261028T062914_sourcedandsoldtothehighestbidder**, step 5: click e40: 200, 358 ms

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

**runs/inspect/20261028T062914_sourcedandsoldtothehighestbidder**, step 9: goto /channels/@me: 200, 438 ms

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
