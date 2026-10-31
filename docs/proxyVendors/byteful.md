# Byteful

Byteful sells residential, static ISP, datacenter and mobile proxies. log-cli uses its residential
proxies now. Static ISP IPs (one dedicated IP per account) have been asked for, 2026-10-20.

- **Docs:** https://documentation.byteful.com. The full copy (172 pages and the OpenAPI spec,
  `pages/openapi.json`) is in `RESEARCH/MARKETPLACE_PROVIDERS/proxies/byteful/`.
- **API:** `https://api.byteful.com/1.0`, with two headers, `X-API-Public-Key` and
  `X-API-Private-Key`. The keys go in log-cli/.env.local as `BYTEFUL_PUBLIC_KEY` and
  `BYTEFUL_PRIVATE_KEY`; they are never printed.
- **Code:** `src/proxyVendor/byteful` (`client.ts`, `types.ts`, `helpers/pickCity.ts`, tests).
- **Model:** provider-agnostic, see [README.md](README.md).

## Residential (what log-cli uses now)

- **Connection:** `http://{proxyUser}_c_{country}_city_{city}_s_{session}_ttl_{ttl}:{password}@residential.byteful.com:8000`
  (SOCKS5 too). log-cli doesn't build this string itself: `GET /residential/list` returns it whole,
  so the format can change without breaking us.
- **Sticky session:** one IP for up to **24 hours** (`_ttl_24h`, the maximum). Byteful tries to hold
  it up to 7 days but doesn't promise that. A new list call is a new session, and so a new exit IP.
- **Targeting:** country, US state (`us-pa`), city, ZIP or ASN.
  - Pennsylvania had **34,101** residential devices on 2026-10-20.
  - Our cities: Philadelphia 10,147, Pittsburgh 1,786, Allentown 898, Reading 757, Erie 563,
    Bethlehem 548, Lancaster 548, Scranton 486.
  - Harrisburg and Wilkes-Barre aren't in Byteful's city list, so they use `--city` for a nearby city.
- **Billing:** per GB. The account has the 1 GB trial (1,000 MB left, 2026-10-20).
  `log proxy balance` shows it, and the warm-up meters it (rule 51).

## Static ISP (asked for)

- **Price:** $3.00 per IP per month in the US. 10 IPs quoted at $30.00 through `POST /checkout/quote`
  ("Static Residential ISP Proxies [Mixed]"), 2026-10-20.
- **Buying:** API checkouts are paid from account credit only, and log-cli never buys (rule 41):
  matt buys.
- **Location:** an order through the API can be pinned to a **country only**
  (`service_fulfillment_filter`: `country_id`, and `asn_id` with an account permission). The IPs
  come from "random locations" in it, so a city has to be arranged with Byteful's support.
- **Once issued:** each IP carries its city, state and coordinates (`GET /proxy/search`,
  `log proxy static`). Each one becomes one account's `proxy` in Twenty, after the same distance
  and speed check.

## Every endpoint, and what it is for us

From the OpenAPI spec, all 58 endpoints. The Use column:
- **Used:** log-cli calls it today.
- **Next:** for the static IPs, when they come.
- **Later:** useful, not built.
- **Not ours:** buys, cancels or deletes, or a product we don't use.

| Use | Method | Path | Endpoint | What it is for us |
|---|---|---|---|---|
| Used | POST | /checkout/quote | Generate Checkout Quote | The price of static ISP IPs for a country and quantity, without buying (`quoteIsp`; 10 US ISP IPs quoted at $3.00 each, 2026-10-20). |
| Used | GET | /city/search | Search City | The account's city by name, nearest its home coordinates, with devices (`searchCities`, `pickCity`). |
| Used | GET | /customer/retrieve | Retrieve Current Customer | `log proxy balance`: the credit balance API checkouts are paid from (`getCreditCents`). |
| Used | GET | /proxy/search | Search Proxies | `log proxy static`: the static IPs on the account with each one's city, state and coordinates (`staticProxies`). |
| Used | GET | /residential/list | Generated Residential List | `log proxy assign --vendor byteful`: one sticky (24 h) residential URL pinned to the account's city, then checked and saved to Twenty's `proxy` (`residentialProxyUrl`). |
| Used | GET | /residential/summary | Retrieve Residential Service Summary | `log proxy balance` and the warm-up's traffic meter (rule 51): bytes used and left, and the proxy user (`getResidentialSummary`, `bytefulMeter`). |
| Next | GET | /checkout/catalog | Retrieve Simplified Product Checkout Catalog | Which products are on sale per country, with stock (`product_stock`), before a quote. |
| Next | GET | /ip_address/geolocate/{ip_address} | Retrieve IP Address Geolocation | Where an IP is: a second opinion on an exit IP next to our own proxy check. |
| Next | POST | /proxy/list_by_id | Generate Proxy List By ID | One static IP as a connection string, by its id. |
| Next | GET | /proxy/list_by_search | Generate Proxy List By Search | The static IPs as connection strings (`list_format`, `list_authentication`) once bought: each one becomes an account's `proxy` in Twenty. |
| Next | GET | /proxy/retrieve/{proxy_id} | Retrieve Proxy | One static IP's details (location, ports, online) for a check. |
| Next | GET | /residential_availability/search | Search Residential Availability | How many residential devices each city of a state has (`group_by=city`), to pick the nearest city with devices for an account whose own city has none (Harrisburg, Wilkes-Barre). |
| Next | GET | /service/retrieve/{service_id} | Retrieve Service | One service, with its proxies (`proxies=true`). |
| Next | GET | /service/search | Search Services | The services on the account (the residential plan, a static order) and their status. |
| Later | GET | /analytics/breakdown | Analytics Breakdown | Traffic by hostname and proxy user over a period (what Reels cost per account). |
| Later | GET | /analytics/graph | Graph Proxy Analytics | Traffic over time. |
| Later | GET | /asn/retrieve/{asn_id} | Retrieve ASN | One ASN. |
| Later | GET | /asn/search | Search ASN | ISP networks (ASNs), e.g. AT&T 7018, for an ISP order's `asn_id` filter (needs an account permission). |
| Later | GET | /blacklist/search | Search Blacklists | Domains blocked per product. |
| Later | GET | /city/retrieve/{city_id} | Retrieve City | One city. |
| Later | GET | /continent/retrieve/{continent_id} | Retrieve Continent | One continent. |
| Later | GET | /continent/search | Search Continent | Continents. |
| Later | GET | /country/retrieve/{country_id} | Retrieve Country | One country. |
| Later | GET | /country/search | Search Country | Countries. |
| Later | GET | /log/retrieve/{log_id} | Retrieve Log | One log entry. |
| Later | GET | /log/search | Search Logs | Request logs by proxy user, session, location: what a run sent through the proxy. |
| Later | GET | /log_summary/retrieve/{log_summary_id} | Retrieve Log Summary | One log summary. |
| Later | GET | /log_summary/search | Search Log Summary | Requests and errors per hostname. |
| Later | GET | /product/search | Search Product | The product list by type and country. |
| Later | POST | /proxy/list/options | Get Proxy User List Options | The proxy users that can authenticate a set of proxies. |
| Later | GET | /proxy_test_server/search | Search Proxy Test Servers | Byteful's test servers by city. |
| Later | POST | /proxy_user/create | Create Proxy User | A proxy user per account, so each account has its own credentials and traffic limit (`proxy_user_residential_bytes_limit`): a per-account budget enforced by Byteful (rule 51). |
| Later | PATCH | /proxy_user/edit/{proxy_user_id} | Edit Proxy User | Change a proxy user's limit or IP authentication. |
| Later | GET | /proxy_user/retrieve/{proxy_user_id} | Retrieve Proxy User | One proxy user. |
| Later | GET | /proxy_user/search | Search Proxy Users | The proxy users. |
| Later | POST | /proxy_user_acl/create | Create Proxy User ACL | Restrict a proxy user to one static IP, so an account's credentials only open its own IP. |
| Later | GET | /proxy_user_acl/retrieve/{proxy_user_acl_id} | Retrieve Proxy User ACL | One access rule. |
| Later | GET | /proxy_user_acl/search | Search Proxy User ACLs | The access rules. |
| Later | GET | /residential_availability/count | Get Residential Availability Count | Devices in a country, state, city or ZIP: a quick stock check. |
| Later | GET | /residential_ledger/retrieve/{residential_ledger_id} | Retrieve Residential Ledger | One ledger entry. |
| Later | GET | /residential_ledger/search | Search Residential Ledger | Residential traffic per day: an independent check of the warm-up's traffic ledger. |
| Later | GET | /service_adjustment/retrieve/{service_adjustment_id} | Retrieve Service Adjustment | One service change. |
| Later | GET | /service_adjustment/search | Search Service Adjustments | Changes to a service (replacements, top-ups). |
| Later | GET | /subdivision/retrieve/{subdivision_id} | Retrieve Subdivision | One state. |
| Later | GET | /subdivision/search | Search Subdivision | US states and their ids (`us-pa`). |
| Later | GET | /zip_code/retrieve/{zip_code_id} | Retrieve Zip Code | One ZIP code. |
| Later | GET | /zip_code/search | Search Zip Code | ZIP codes, for ZIP-level targeting. |
| Not ours yet | POST | /checkout/create | Create Checkout | Buys a service from credit. log-cli never buys (rule 41): matt buys in the dashboard. |
| Not ours | GET | /mobile/list | Generated Mobile List | Mobile proxies: not a product we use. |
| Not ours | GET | /mobile/summary | Retrieve Mobile Service Summary | Mobile plan. |
| Not ours | GET | /mobile_availability/count | Get Mobile Availability Count | Mobile stock. |
| Not ours | GET | /mobile_availability/search | Search Mobile Availability | Mobile stock. |
| Not ours | GET | /mobile_ledger/retrieve/{mobile_ledger_id} | Retrieve Mobile Ledger | Mobile traffic. |
| Not ours | GET | /mobile_ledger/search | Search Mobile Ledger | Mobile traffic. |
| Not ours | DELETE | /proxy_user/delete/{proxy_user_id} | Delete Proxy User Record | Deletes a proxy user. |
| Not ours | DELETE | /proxy_user_acl/delete/{proxy_user_acl_id} | Delete Proxy User ACL Record | Removes an access rule. |
| Not ours | DELETE | /service/cancel/{service_id} | Cancel Service | Cancels a service: matt only. |
| Not ours | PATCH | /service/edit/{service_id} | Edit Service | Auto-renew, payment method, cancel flag: matt, in the dashboard. |
