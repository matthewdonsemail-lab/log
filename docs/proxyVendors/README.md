# Proxy providers

Every Facebook account's browser reaches the internet only through its proxy (AGENTS.md rule 12).
The proxy can come from any provider. log-cli handles each provider the same way:

- **Twenty keeps one thing per account:** the socialAccount's `proxy`, a URL
  (`scheme://user:pass@host:port`, rule 13), whichever provider it came from. There is no provider
  field. The provider is read from the URL's host (`vendorOfProxy`, `src/proxyVendor/vendor`).
- **Every launch is the same:** the proxy gate, the exit IP in the home country, the self-check and
  the HAR (rules 12, 17, 22). They read `proxy` and don't care who sold it.
- **Every assign is the same:** a provider gives candidate URLs, and `saveFirstGood`
  (`src/cli/proxy/index.ts`) checks each one through the proxy before saving it. It must exit in the
  home country, within `MAX_PROXY_KM` (100 km) of the home city, and be fast enough for Facebook.
  The first good one goes to Twenty.
- **Traffic is metered by the provider that bills for it** (rule 51, `meterForProxy`):
  - A traffic-billed proxy reads its own provider's counter: 2Captcha's `use_flow`, Byteful's
    residential bytes.
  - A static IP has its traffic in its price, so it isn't metered.

Each provider is a domain of its own, `src/proxyVendor/<provider>`, with `types.ts`, `client.ts`,
`helpers/` and tests (rule 2). Adding a provider means adding:

1. its domain;
2. its host in `vendorOfProxy`;
3. its meter in `meterForProxy`, if it bills by traffic;
4. its branch in `log proxy assign --vendor`;
5. its page here.

| Provider | Product we use | Billed | Domain | Page |
|---|---|---|---|---|
| 2Captcha | Residential, city-targeted, sticky sessions of up to 120 minutes | per GB | `src/proxyVendor/twoCaptcha` | [`../proxies.md`](../proxies.md) |
| Byteful | Residential, city-targeted, sticky sessions of up to 24 hours (static ISP IPs asked for, 2026-10-20) | per GB (static: per IP) | `src/proxyVendor/byteful` | [`byteful.md`](byteful.md) |

Commands:

```bash
log proxy balance                                         # every provider that is set up: traffic left, credit
log proxy assign --account <a> --vendor byteful           # a checked Byteful residential proxy in the account's city
log proxy assign --account <a> --vendor byteful --city Scranton   # a nearby city when its own has none
log proxy static                                          # Byteful static IPs on the account, where each is
log proxy check --account <a>                             # the account's proxy as saved, any provider
```
