# Proxy providers

An account's proxy can come from any provider, and log treats them all the
same way. The account stores one proxy URL; log works out the provider from
the URL and handles assigning, checking and traffic metering for it. Read this
to see which providers are supported, or to add a new one.

## How log handles every provider

- **One field per account.** The account keeps its `proxy` as a URL
  (`scheme://user:pass@host:port`), whichever provider it came from. There is
  no provider field: the provider is read from the URL's host
  (`vendorOfProxy`, `src/proxyVendor/vendor`).
- **Every launch is the same.** The proxy gate, the exit-IP country check, the
  self-check and the request recording all read `proxy` and don't care who sold
  it. See [Proxies](../proxies.md).
- **Every assign is the same.** A provider gives candidate URLs, and
  `saveFirstGood` (`src/cli/proxy/index.ts`) checks each one through the proxy
  before saving it. It must exit in the home country, within `MAX_PROXY_KM`
  (100 km) of the home city, and be fast enough for Facebook. The first good
  one is saved.
- **Traffic is metered by the provider that bills for it** (`meterForProxy`):
  - a traffic-billed proxy reads its own provider's counter (2Captcha's
    `use_flow`, Byteful's residential bytes);
  - a static IP has its traffic in its price, so it isn't metered.

## Supported providers

| Provider | Product used | Billed | Code | Page |
|---|---|---|---|---|
| 2Captcha | Residential, city-targeted, sticky sessions of up to 120 minutes | per GB | `src/proxyVendor/twoCaptcha` | [Proxies](../proxies.md#getting-a-proxy-from-2captcha) |
| Byteful | Residential, city-targeted, sticky sessions of up to 24 hours (static ISP IPs possible) | per GB (static: per IP) | `src/proxyVendor/byteful` | [Byteful](byteful.md) |

## Commands

```bash
log proxy balance                                         # every provider that is set up: traffic left, credit
log proxy assign --account <a> --vendor byteful           # a checked Byteful residential proxy in the account's city
log proxy assign --account <a> --vendor byteful --city Scranton   # a nearby city when its own has none
log proxy static                                          # Byteful static IPs on the account, where each is
log proxy check --account <a>                             # the account's proxy as saved, any provider
```

## Adding a provider

Each provider is a folder of its own, `src/proxyVendor/<provider>`, with
`types.ts`, `client.ts`, `helpers/` and tests. Adding one means adding:

1. its folder;
2. its host in `vendorOfProxy`;
3. its meter in `meterForProxy`, if it bills by traffic;
4. its branch in `log proxy assign --vendor`;
5. its page here.
