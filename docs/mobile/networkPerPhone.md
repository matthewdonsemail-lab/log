# The network on the phone

The proxy is on the phone, not on log's own client. Log's HTTP client is not
the thing that talks to the platform on a phone: the app on the phone is, and
the app only leaves through the route the phone has. A proxy set on log's
machine changes nothing for a phone.

## One route per phone

Each phone carries its own route out, and no two phones share one:

| Layer | What it is |
| --- | --- |
| The phone's route | One US residential proxy per phone, from GridPanel, set on the phone itself |
| The record | The route's label, kept with the phone's attachment in the registry |
| The check | The phone's own exit IP and country, before any account work |

The label is what log keeps, not the credentials: `--network us-gridpanel-01`
records which route that phone leaves through. The proxy's own settings live
on the phone.

## Setting it on the phone

An HTTP proxy is the quick test on a bench phone:

```bash
adb -s <serial> shell settings put global http_proxy host:port
adb -s <serial> shell settings put global http_proxy :0
```

It is not enough on its own. An app can ignore the system proxy: it can open
its own socket, or use a client that ignores the setting. A per-phone VPN or
gateway is what covers the whole phone, which is why the rack is wired with
per-phone routes rather than one shared one.

The check that matters is the phone's own: read the exit IP and the country
from the phone, not from the machine running log. A phone that leaves through
the wrong country is the same failure the browser gate refuses on the
browser side ([proxies](../proxies.md)), and it is refused before the account
does any work.

## The rack

Phones in a rack are not plugged into charging-only hubs. A data-and-power
hub is what a phone needs to be reached over ADB all day: a port per phone,
power from the rack, and no phone left off because a cable could not carry
both.

Each layer is checked on its own, because each one fails on its own:

| Layer | How it is checked |
| --- | --- |
| USB | the serial shows up in `adb devices -l` as `device` |
| The phone | `state` reads the model, the OS version, the app in the front and the battery |
| The app | the platform's app opens on that phone and the screen shows it |
| The network | the phone's own exit IP and country, and the route it was given |

Start with a few phones, measure what the pilot does to a phone's battery,
its heat and its network, and size the rack from that. A rack of sixteen
phones that was bought before anything was measured is a guess.

## The cloud phones

The same rule there: the proxy belongs to the phone's profile, not to log. The
provider's own API can set the proxy on the phone's profile, and the same
per-phone rule holds: one route per phone, no route shared between two
accounts.

## What the registry keeps

Only the label. The registry row is:

```json
{
  "id": "android:127.0.0.1:21503",
  "os": "android",
  "serial": "127.0.0.1:21503",
  "accountName": "matt.snap",
  "platform": "snapchat",
  "network": "us-gridpanel-01",
  "attachedAt": "2026-11-14T09:41:00.000Z"
}
```

No proxy URL, no credentials, no token. The route is identified by its
label; the route itself lives on the phone and in the provider's panel.

