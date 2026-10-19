# Residential Proxy Costs and Reliability for Persistent Accounts

## Executive Summary

- **The Main Constraint Is IP Persistence**: 2Captcha residential sessions last at most **120 minutes**, while Decodo sells dedicated ISP allocations and ProxyEmpire describes exclusive allocations lasting through an active subscription. A sticky rotating session is not a fixed IP for months. -> Start procurement with renewable, exclusive ISP allocations, not the largest rotating pool. [official-docs] [5][11][55]
- **City Availability Remains The Procurement Gate**: Decodo's ISP country list includes **Ireland, UK, Canada, US and Australia**, but that does not establish stock in each required city. ProxyEmpire's static product explicitly lacks city targeting. -> Obtain city-specific inventory commitments before buying account capacity. [official-docs] [11][55]
- **Budget By Traffic, Not Browser Hours**: At the planning assumption of **5 GB/account/month**, 1,000 accounts consume **5 TB/month**. Indicative network-only costs range from about **$2.50/account/month** for certain private/static products to **$40** at Bright Data's regular residential PAYG tariff. These are not equivalent products or guaranteed five-country offers. -> Measure traffic before committing. [estimate] [16][8]
- **Cheap Static Does Not Necessarily Mean Exclusive**: Oxylabs' inexpensive ISP offering is shared by up to **three users**; Evomi separately prices shared, private and virgin allocations. -> Specify exclusivity, renewal rights and replacement behavior in the order. [official-docs] [12][16]
- **Managed Mobile Avoids Your Hardware Constraint**: Proxidize advertises a managed mobile traffic service at **$2/GB** and sticky sessions up to **three days**. iProxy's published subscriptions are per device and are not an all-inclusive foreign mobile exit. -> Evaluate the managed product, not just the provider's brand name. [official-docs] [19][17]
- **Independent Quality Evidence Is Uneven**: Proxyway's 2026 study tests **3.6M residential requests over 21 days**; it reports differences in residential classification, uniqueness and IP risk. It does not establish Facebook acceptance or a universal fraud score for any provider. -> Treat a pool-level result as a screening signal, not an account-level guarantee. [independent] [50]
- **Proxy-Bound Captcha Support Is Product-Specific**: 2Captcha and Anti-Captcha document proxy-bearing FunCaptcha tasks. Proxyless tasks use the solver's network instead. -> If the integration requires the account's exit IP, require the appropriate task type and validate that behavior; do not assume that all solvers support it. [official-docs] [41][42][45]
- **No Network Provider Solves The Browser Layer**: None of the raw proxy products below supplies your persistent Camoufox machine, GPU, profile disk or VNC session. -> Keep browser hosting, persistent state and proxy procurement as separate adapters. [estimate]

**Bottom line:** There is no verified, ready-now offer in this review that guarantees one exclusive, city-correct residential exit per account for months, across all five countries, at 100,000-account scale. The strongest first procurement path is **dedicated ISP inventory**, followed by managed mobile where fixed ISP inventory is unavailable. Rotating residential remains useful for comparison and fallback, but it does not meet the strict fixed-IP requirement by itself. [unverified/needs-validation]

## 1. What This Network Layer Does And Does Not Supply

### Separate account persistence from exit persistence

A proxy subscription supplies access credentials, an endpoint and routing controls. Your browser host still supplies the OS, browser binary, cookies, local storage, downloaded files, renderer and live-view session. An IP session identifier is not an isolated machine, and an ISP allocation is not a persistent browser profile. [estimate]

Consequently, the following answers apply to **every raw proxy service** discussed below unless an exception is stated:

| Requested capability | Network-layer answer | Evidence grade |
|---|---|---|
| Linux, Windows or Android environment | Not supplied; the client environment is yours | [estimate] |
| GPU, GPU model, canvas or WebGL control | Not supplied | [estimate] |
| Run Camoufox or Firefox | Your host can use a compatible proxy; provider does not install the browser | [estimate] |
| CDP, WebDriver, SSH, VNC, live takeover | Not supplied by these proxy products | [estimate] |
| Persistent cookies, profile disk, snapshots | Your responsibility; not part of proxy pricing | [estimate] |
| File/photo uploads | Depend on the client, protocol, target policy and bandwidth allowance | [unverified/needs-validation] |
| Audio/video, WebRTC and QUIC | HTTP/SOCKS support alone does not establish working UDP transport | [estimate] |
| Bring-your-own proxy | These services are the proxy; chaining another provider is not a documented universal feature | [unverified/needs-validation] |
| Force all platform traffic through the account exit | Requires host-level enforcement and leak testing; not guaranteed by supplying browser credentials | [estimate] |
| Storage, snapshots, seats and browser concurrency charges | No browser/storage product is included in the estimates below; hosting charges remain additional | [estimate] |

**Decision:** Do not compare a $2.50 proxy allocation with a complete $2.50 browser environment. They are different cost layers.

### Case study: 2Captcha's sticky session versus a renewable ISP allocation

2Captcha is a useful baseline because you already use it. Its residential product supports geographic routing and HTTP, HTTPS and SOCKS5, but its documented residential session ceiling is **120 minutes**. That can cover a one-hour visit; it does not reserve the same exit for tomorrow. Its separate ISP product advertises exclusive allocations, but the reviewed material did not establish the required city inventory and full ISP tariff. [official-docs] [5]

Decodo's dedicated ISP pricing describes a different purchasing unit: an allocated IP rather than a succession of metered residential peers. Its country list includes all five requested countries. The remaining decision is commercial and operational: can it reserve the exact cities, renew the allocations without change, and provide sufficient bandwidth? [official-docs] [11]

The implication is not that one provider is universally better. It is that **session duration and allocation lifetime must be separate fields in your account configuration**. A cheap rotating endpoint cannot be substituted transparently for an exclusive monthly allocation when identity continuity is mandatory. [estimate]

## 2. Bandwidth And Monthly Cost Model

### A measurable 5 GB base case, not a Facebook benchmark

No reviewed source measures your exact Marketplace workflow. The following traffic assumptions are therefore planning estimates, not observed Facebook usage. [estimate]

| Scenario | Monthly traffic/account | Interpretation |
|---|---:|---|
| Light | **1 GB** | Text-heavy browsing, limited image loading, little video |
| Base | **5 GB** | Regular image-heavy browsing, photo uploads, retries and background traffic |
| Heavy | **15 GB** | More media, repeated image loading, video or inefficient navigation |

For an illustrative base case, 30 hours at 150 MB/hour consumes 4.5 GB; 0.5 GB covers uploads and other overhead. A hypothetical 100 uploaded photos at 2 MB each accounts for 0.2 GB of that overhead. These are deliberately transparent assumptions, not measurements. [estimate]

The network formula is:

`monthly cost = billable GB x tariff + reserved-IP fees + city/quality premiums + minimum-plan effects + tax`

For a genuinely unmetered reserved-IP product, the IP fee replaces the GB component, subject to fair use. Captcha charges and host-cloud egress are additional. [estimate]

| Accounts | Base traffic/month | Average simultaneously active over 24 hours | If activity is spread over 8 hours |
|---:|---:|---:|---:|
| 100 | 500 GB | 4.2 | 12.5 |
| 1,000 | 5 TB | 41.7 | 125 |
| 10,000 | 50 TB | 416.7 | 1,250 |
| 100,000 | 500 TB | 4,166.7 | 12,500 |

These are scheduling averages, not peak requirements. Multiple connections per browser can make socket concurrency much higher. A requirement for 100,000 persistent IP allocations is also different from 100,000 simultaneous sessions. [estimate]

### Comparable network-cost estimates at all four scales

**Reading the table:** Each cell is **per account/month / fleet total/month**, in USD unless marked EUR. All cells are [estimate]. They apply published tariffs to the assumed workload; they are **not checkout quotations or capacity guarantees**. Package rounding, tax, country premiums, city premiums, special target pricing and negotiated discounts are excluded unless noted. At large volumes, tariff continuation is an assumption. **Q** means no defensible complete tariff was established.

The product column matters: a static allocation and 5 GB of rotating traffic are not operational substitutes.

| Provider and modeled product | 100 accounts | 1,000 accounts | 10,000 accounts | 100,000 accounts | Published tariff basis |
|---|---:|---:|---:|---:|---|
| 2Captcha rotating residential | $9.95 / $995 | $7.20 / $7,200 | $6.25 / $62,500 | $6.25 / $625,000 | $1.99, $1.44, $1.25/GB tiers [5] |
| Bright Data residential, regular PAYG | $40 / $4,000 | $40 / $40,000 | $40 / $400,000 | $40 / $4M | $8/GB; enterprise quote may differ [8] |
| Oxylabs rotating residential | $20 / $2,000 | $12.50 / $12,500 | $12.50 / $125,000 | $12.50 / $1.25M | $4 and $2.50/GB published tiers; subscription mechanics require quote [1] |
| Decodo dedicated ISP | $2.60 / $260 | $2.50 / $2,500 | $2.50 / $25,000 | $2.50 / $250,000 | 100-IP and 200-IP unit rates; larger capacity not established [11] |
| IPRoyal static residential | $2.70 / $270 | $2.70 / $2,700 | $2.70 / $27,000 | $2.70 / $270,000 | Starting 30-day price; country/city premium unknown [3] |
| SOAX | Q | Q | Q | Q | Complete applicable tariff not established |
| NetNut | Q | Q | Q | Q | Commercial continuity requires clarification |
| Webshare | Q | Q | Q | Q | Exact exclusive ISP/city configuration requires quote |
| Proxy-Cheap static residential | $2.71 / $271 | $2.71 / $2,710 | $2.71 / $27,100 | $2.71 / $271,000 | Advertised monthly unit price; inventory conditional [26] |
| PacketStream rotating | $5 / $500 | $5 / $5,000 | $5 / $50,000 | $5 / $500,000 | $1/GB [30] |
| Rayobyte rotating residential | $7.50 / $750 | $2.50 / $2,500 | $2.50 / $25,000 | $2.50 / $250,000 | $1.50 and $0.50/GB volume tiers [21] |
| Infatica rotating residential | $13.50 / $1,350 | $13 / $13,000 | $13 / $130,000 | $13 / $1.3M | $2.70 and $2.60/GB tiers [18] |
| Nimble | Q | Q | Q | Q | Current reviewed pricing is not a transferable raw-proxy tariff |
| Proxy-Seller rotating residential | $8.50 / $850 | $7.25 / $7,250 | $7.25 / $72,500 | $7.25 / $725,000 | $1.70 and $1.45/GB tiers [20] |
| ProxyEmpire static residential | $3.50 / $350 | $3.50 / $3,500 | $2 / $20,000 | $2 / $200,000 | $3.50/IP; $2 at 2,000 IPs; country-only targeting [55] |
| Live Proxies | Q | Q | Q | Q | Enterprise quote needed; small retail bundles are not a scale quote |
| Massive rotating residential | $24.50 / $2,450 | $24.50 / $24,500 | $24.50 / $245,000 | $24.50 / $2.45M | $4.90/GB 100-GB tariff held constant [27] |
| Evomi private static | $2.50 / $250 | $2.50 / $2,500 | $2.50 / $25,000 | $2.50 / $250,000 | Published private-IP monthly price [16] |
| DataImpulse rotating | $5 / $500 | $4 / $4,000 | $4 / $40,000 | $4 / $400,000 | $1 and $0.80/GB; **city surcharge additional** [32] |
| The Social Proxy | Q | Q | Q | Q | Headline plans insufficient to establish this allocation model |
| Proxidize managed mobile | $10 / $1,000 | $10 / $10,000 | $10 / $100,000 | $10 / $1M | $2/GB; above published bundles requires negotiation [19] |
| iProxy | Not an all-in exit price | Not an all-in exit price | Not an all-in exit price | Not an all-in exit price | Per-device software subscription excludes the complete foreign-device/SIM arrangement [17] |
| AirProxy dedicated mobile | EUR67 / EUR6,700 | EUR67 / EUR67,000 | EUR67 / EUR670,000 | EUR67 / EUR6.7M | Per proxy/30 days; **Italy, not requested countries** [25] |
| Coronium | Q | Q | Q | Q | Location-specific managed quote required |
| MobileHop monthly endpoint | $180 / $18,000 | $180 / $180,000 | $180 / $1.8M | $180 / $18M | Lower published monthly option; US-focused [23] |
| SimplyNode rotating residential | $11.25 / $1,125 | $11.25 / $11,250 | $11.25 / $112,500 | $11.25 / $1.125M | $2.25/GB at 500-999 GB; larger use is custom [22] |
| anyIP enterprise rotating | $10 / $1,000 | $10 / $10,000 | $10 / $100,000 | $10 / $1M | $1,000/500 GB, $2 extra GB [28] |

**Decision:** The cheapest apparently compatible static tariffs cluster around $2.50-$2.71/IP/month, but exact-city exclusivity is still unconfirmed. At 1,000 accounts, each additional $1/account/month adds $1,000/month; at 100,000 it adds $100,000/month. [estimate]

For metered products, multiply the base-case traffic component by **0.2** for the light scenario and **3** for the heavy scenario. Do not apply that multiplier to fixed IP fees, subscription minima or captcha charges. [estimate]

## 3. Global Residential And ISP Provider Dossiers

**Common commercial and technical qualifications:** Unless explicitly stated, Vietnam onboarding/payment acceptance, exact-city stock, contractual SLA, status-page incident history, API rate limits, credit terms, maximum organization size and 100,000-exclusive-IP availability are **[unverified/needs-validation]**. Country availability is not proof that a Vietnam customer can buy the product. Marketing success rates are not contractual uptime commitments.

For every provider below, the common OS/GPU/live-view/storage answers in Section 1 apply. Integration effort is estimated in Section 7; a credentials-only integration and a full provisioning/renewal adapter are different tasks.

### 2Captcha: retain as the current rotating baseline

1. **Architecture/access:** Residential gateways with geographic and session controls; HTTP, HTTPS and SOCKS5. Its separate ISP product advertises exclusive allocations. [official-docs] [5]
2. **Documentation/API:** `https://2captcha.com/proxy` and `https://2captcha.com/proxy/api`. The API generates connection details; a request can generate 1-2,000 connections, which is not a concurrency ceiling. [official-docs] [56]
3. **Pricing:** Residential tiers include 1 GB/$3.99, 100 GB/$225, 200 GB/$398, 1 TB/$1,800, 3 TB/$4,470, 5 TB/$7,200 and 10 TB/$12,500. Prepaid traffic expires after three months. ISP pricing and renewal conditions need a quote. [official-docs] [5]
4. **Geography/onboarding:** Advertises 220+ countries and city targeting; availability in each required city must be checked. The page describes worldwide service except China, not an unconditional Vietnam payment guarantee. [official-docs] [5]
5. **Reliability:** 99.9% is a vendor statement, not a reviewed credit-backed SLA. [official-docs] [5]
6. **Scale:** Unlimited threads are advertised; uniqueness of all purchased exits is not guaranteed. [official-docs] [5]
7. **Persistence/capabilities:** Residential sticky sessions are limited to 120 minutes. SOCKS5 alone does not establish UDP relay. [official-docs] [5]
8. **Implementation:** Reuse the existing adapter; add explicit product type, session expiration, quota and assigned-exit tracking. [estimate]
9. **Detection evidence:** No independently validated provider-specific Marketplace acceptance rate or fraud-score distribution was established. [unverified/needs-validation]
10. **Verdict:** Good benchmark and rotating fallback; not a confirmed weeks-long identity solution without an ISP contract. [estimate]

### Bright Data: strongest enterprise controls, quote-dependent economics

1. **Architecture/access:** Residential and shared/dedicated ISP networks; country, region, city and other routing controls. [official-docs] [60][9]
2. **Documentation/API:** `https://docs.brightdata.com/proxy-networks/residential/introduction`; API authentication at `https://docs.brightdata.com/api-reference/authentication`. [official-docs] [60]
3. **Pricing:** Regular residential PAYG is $8/GB. Published monthly plans include $499, $999 and $1,999; larger volume is custom. The page advertises a temporary 50% promotion, so promotional and regular prices must not be mixed. Dedicated ISP has 10/100/500/1,000-IP configurations, but a defensible complete unit-price quote was not established here. [official-docs] [8][9]
4. **Geography/onboarding:** Broad city targeting; exact five-country ISP inventory remains unconfirmed. Residential access involves KYC/compliance review, potentially including video verification. [official-docs] [60][8]
5. **Reliability:** Enterprise pricing refers to premium network uptime/SLA terms; the exact contracted coverage and incident history require review. [official-docs] [8]
6. **Scale:** Enterprise plans and larger ISP allocations are available by negotiation; no public promise establishes 100,000 exclusive city-correct allocations. [official-docs] [9]
7. **Persistence/capabilities:** Dedicated ISP allocations can be kept while subscribed; fair use is 100 GB/IP/month. SOCKS5 is listed; UDP remains unconfirmed for this configuration. [official-docs] [9]
8. **Implementation:** Implement zone/product configuration, credentials, usage reporting and approved target access; more configuration than a simple rotating endpoint. [estimate]
9. **Detection evidence:** Bright Data did not participate in the cited Proxyway residential comparison; do not infer its ranking from that study. [independent] [50]
10. **Verdict:** Enterprise procurement candidate, particularly for inventory and governance; obtain a dedicated ISP quote before judging affordability. [estimate]

### Oxylabs: distinguish shared ISP from dedicated inventory

1. **Architecture/access:** Residential and ISP networks under a unified subscription structure. Residential documentation lists HTTP(S), HTTP/3 and SOCKS5. [official-docs] [1]
2. **Documentation/API:** `https://developers.oxylabs.io/products/proxies/isp-proxies`; pricing at `https://oxylabs.io/pricing/residential-proxy-pool` and `https://oxylabs.io/pricing/isp-proxies`. [official-docs] [58]
3. **Pricing:** Subscription levels shown are $30/$100/$500/$2,500. Residential unit rates step from $6 to $5, $4 and $2.50/GB. Shared ISP rates step from $1.50 to $1.40, $1.20 and $1.10/IP. These cheap ISP rates must not be described as exclusive-account prices. [official-docs] [1][12]
4. **Geography/onboarding:** Required country/city inventory and dedicated allocation terms need confirmation; restricted targets and KYC apply to relevant products. [official-docs] [12]
5. **Reliability:** Residential marketing gives 99.95% success and 0.6-second average response; neither is a complete contracted uptime history. [official-docs] [1]
6. **Scale:** Residential concurrency is advertised as unlimited, with three proxy users and ten whitelisted IPs on the reviewed configuration. [official-docs] [1]
7. **Persistence/capabilities:** Reviewed ISP access is shared by up to three users. Sessions can be unlimited, but after 50 GB/IP, concurrency can drop from 100 to ten under fair use. [official-docs] [12]
8. **Implementation:** Add subscription/product selection, user/whitelist management, usage and fair-use monitoring. [estimate]
9. **Detection evidence:** Proxyway reports the most unique residential exits among participating providers, followed by Decodo and NetNut; this is not evidence of exclusive static inventory or Meta acceptance. [independent] [50]
10. **Verdict:** Strong enterprise benchmark; negotiate the correct dedicated product rather than buying the cheapest shared ISP tier. [estimate]

### Decodo: the clearest initial five-country dedicated-ISP candidate

1. **Architecture/access:** Rotating residential plus shared and dedicated ISP products, supporting HTTP(S) and SOCKS5. [official-docs] [11][6]
2. **Documentation/API:** `https://help.decodo.com/docs/introduction`; pricing at `https://decodo.com/proxies/static-residential-proxies` and `https://decodo.com/proxies/residential-proxies/pricing`. [official-docs] [65]
3. **Pricing:** Dedicated ISP: 3 IPs/$9.99; 10/$29; 20/$56; 50/$135; 100/$260; 200/$500 monthly. Residential: 3 GB at $3.75/GB, 10 at $3.50, 25 at $3.25, 50 at $3, 100 at $2.75; PAYG $4/GB. VAT can be additional. [official-docs] [11][6]
4. **Geography/onboarding:** ISP country list explicitly includes all five target countries. City-specific dedicated stock and Vietnam approval remain unknown. [official-docs] [11]
5. **Reliability:** Advertises 99.99% uptime and response below 0.2 seconds; credit-backed terms and incident history were not established. [official-docs] [11]
6. **Scale:** Public dedicated tiers reach 200 IPs; larger allocations require confirmation rather than extrapolating stock from the price list. [official-docs] [11]
7. **Persistence/capabilities:** Dedicated ISP is the appropriate long-lived product. Rotating residential sticky sessions are 30 minutes and are not equivalent. ISP bandwidth quota/fair use needs product-specific confirmation. [official-docs] [11][6]
8. **Implementation:** Separate dedicated inventory records from rotating-session credentials; implement assignment, renewal and replacement handling. [estimate]
9. **Detection evidence:** Proxyway reports strong uniqueness and fast response in its participating residential sample. Those results should not be transferred automatically to ISP inventory. [independent] [50]
10. **Verdict:** First dedicated-ISP pilot, conditional on written city availability and renewal continuity. [estimate]

### IPRoyal: useful static pricing, but country/city stock must be established

1. **Architecture/access:** Rotating residential and separate static residential allocations; residential sticky sessions can last up to seven days. [official-docs] [2][3]
2. **Documentation/API:** `https://docs.iproyal.com/`; pricing at `https://iproyal.com/pricing/residential-proxies/` and `https://iproyal.com/pricing/static-residential-proxies`. [official-docs] [53]
3. **Pricing:** Residential subscription rates include $7/GB at 1 GB, $5.95 at 2 GB and $5.25 at 10 GB; custom pricing is advertised from $1.75/GB at 10 TB+. PAYG rates differ. Static residential starts at $2.70 for 30 days. Residential PAYG traffic is described as non-expiring. [official-docs] [2][3]
4. **Geography/onboarding:** Residential advertises 195 countries and city targeting; static availability in all five countries and requested cities is not established. [official-docs] [2]
5. **Reliability:** No reviewed credit-backed SLA or incident chronology supports an uptime conclusion. [unverified/needs-validation]
6. **Scale:** Unlimited residential concurrency is advertised; reserved static-IP capacity is a separate question. [official-docs] [2]
7. **Persistence/capabilities:** A seven-day sticky residential session is not a month-long reservation. Static allocations advertise reserved IPs and unlimited bandwidth. [official-docs] [2][3]
8. **Implementation:** Track whether an allocation is static or session-based; add balance/usage and renewal management. [estimate]
9. **Detection evidence:** Proxyway found substantial US Comcast representation and the cleanest IP results across two risk databases in its sample. This does not guarantee any individual IP's future score. [independent] [50]
10. **Verdict:** Strong second-line static pilot if location stock is confirmed; useful rotating comparison but not a guaranteed seven-day exit. [estimate]

### SOAX: valuable protocol options, incomplete procurement economics

1. **Architecture/access:** Residential/mobile routing with country, city, ISP/ASN controls and configurable rotation. [official-docs] [59]
2. **Documentation/API:** Official pricing: `https://soax.com/pricing`. A complete applicable API/quota reference was not established in this review. [unverified/needs-validation]
3. **Pricing:** A complete, internally consistent tariff for this workload, including minima and static allocation terms, was not established; obtain a written quote. [unverified/needs-validation]
4. **Geography/onboarding:** Global pool claims do not establish fixed inventory in the five requested countries/cities. Vietnam onboarding is unconfirmed. [unverified/needs-validation]
5. **Reliability:** Contractual SLA and status history unconfirmed. [unverified/needs-validation]
6. **Scale:** Organization limits and dedicated inventory capacity unconfirmed. [unverified/needs-validation]
7. **Persistence/capabilities:** The reviewed documentation lists HTTP, HTTPS, SOCKS5 and TCP/UDP, plus username/password or IP authorization. Node-locking/rotation controls should not be interpreted as a weeks-long exclusive-IP guarantee. [official-docs] [59]
8. **Implementation:** A potentially useful option when UDP is required, but protocol and product entitlement need an integration test. [estimate]
9. **Detection evidence:** Proxyway's sample encountered a Europe-only testing limitation requiring an undocumented parameter; results should be read with that qualification. [independent] [50]
10. **Verdict:** Needs commercial clarification and testing; not cost-qualified here. [estimate]

### NetNut: resolve commercial continuity before procurement

1. **Architecture/access:** The intended category is residential/ISP networking, not browser hosting. Current product continuity remains unconfirmed. [unverified/needs-validation]
2. **Documentation/API:** The reviewed `https://netnut.io/pricing/` endpoint displayed a seizure notice. An alternative domain must not be assumed to be the same contracting service without verification. [official-docs] [4]
3. **Pricing:** No current, reliable tariff used. [unverified/needs-validation]
4. **Geography/onboarding:** Current inventory, contracting entity and Vietnam acceptance unconfirmed. [unverified/needs-validation]
5. **Reliability:** The observed domain notice is a procurement risk; it is not evidence that every historical customer endpoint is down. [estimate]
6. **Scale:** Current quotas and provisioning availability unconfirmed. [unverified/needs-validation]
7. **Persistence/capabilities:** Current protocol and fixed-allocation commitments unconfirmed. [unverified/needs-validation]
8. **Implementation:** Do not build against unverified replacement endpoints or transfer credentials based only on branding. [estimate]
9. **Detection evidence:** Historical 2026 comparative results include NetNut among providers with high uniqueness, but that does not establish present commercial availability. [independent] [50]
10. **Verdict:** Hold procurement until legal/service continuity is resolved. [estimate]

### Webshare: require an exact ISP configuration, not the cheapest headline

1. **Architecture/access:** Candidate for proxy access, not an environment provider; the required exclusive ISP configuration remains to be qualified. [unverified/needs-validation]
2. **Documentation/API:** Pricing/configurator: `https://www.webshare.io/pricing`. An applicable provisioning reference and its current limits were not established here. [unverified/needs-validation]
3. **Pricing:** No defensible five-country, city-correct, exclusive ISP price was established. Do not substitute a cheap datacenter proxy price. [unverified/needs-validation]
4. **Geography/onboarding:** Exact static country/city inventory and Vietnam payment eligibility unconfirmed. [unverified/needs-validation]
5. **Reliability:** Contractual SLA and incident history unconfirmed. [unverified/needs-validation]
6. **Scale:** Dedicated inventory and account limits unconfirmed. [unverified/needs-validation]
7. **Persistence/capabilities:** Exclusive renewal terms, UDP and city-specific fixed assignment unconfirmed. [unverified/needs-validation]
8. **Implementation:** Budget a standard proxy adapter only after product/API qualification. [estimate]
9. **Detection evidence:** No provider-specific independent acceptance evidence established. [unverified/needs-validation]
10. **Verdict:** Keep on the RFQ list, not the validated shortlist. [estimate]

### Proxy-Cheap: low advertised static cost, incomplete five-country fit

1. **Architecture/access:** Dedicated static residential plus rotating residential and mobile products; static offering lists HTTP/SOCKS, unlimited bandwidth and 100+ threads. [official-docs] [26]
2. **Documentation/API:** `https://docs.proxy-cheap.com/`; REST API uses API key/secret headers and exposes product/location discovery, ordering and pricing. [official-docs] [61]
3. **Pricing:** Static monthly price shown is $2.71/IP; a one-week trial is $1.99. Rotating residential advertises a starting $0.78/GB. Starting prices are not guaranteed five-country quotes. [official-docs] [26]
4. **Geography/onboarding:** Reviewed country list includes US, UK, Australia and Canada; Ireland and exact cities remain unconfirmed. [official-docs] [26]
5. **Reliability:** Contracted SLA and status history unconfirmed. [unverified/needs-validation]
6. **Scale:** Thread allowance is not reserved-IP inventory; larger exclusive allocations need confirmation. [estimate]
7. **Persistence/capabilities:** Static allocation is relevant; renewal continuity and IP replacement rules need agreement. UDP unconfirmed. [unverified/needs-validation]
8. **Implementation:** Good candidate for an ordering/renewal adapter because pricing and order APIs are documented. [estimate]
9. **Detection evidence:** No independent product-specific fraud or acceptance distribution established. [unverified/needs-validation]
10. **Verdict:** Budget regional pilot, not a confirmed all-five-country solution. [estimate]

### PacketStream: inexpensive, but country-only targeting misses the requirement

1. **Architecture/access:** Metered peer residential network supporting HTTP/HTTPS/SOCKS and reseller integrations. [official-docs] [30]
2. **Documentation/API:** `https://packetstream.io/residential-proxies`; reseller API/integration route is described on that page. [official-docs] [30]
3. **Pricing:** $1/GB, $50 minimum purchase, traffic without expiry. [official-docs] [30]
4. **Geography/onboarding:** Country selection is documented; city-level control was not established. [official-docs] [30]
5. **Reliability:** SLA, peer availability guarantees and historical incidents unconfirmed. [unverified/needs-validation]
6. **Scale:** Reseller API is not evidence of 100,000 exclusive exits. [estimate]
7. **Persistence/capabilities:** Sticky duration is 60 minutes, not weeks. UDP unconfirmed. [official-docs] [30]
8. **Implementation:** Relatively simple credential/routing adapter; cannot implement an unsupported city reservation through client code. [estimate]
9. **Detection evidence:** No independently established Marketplace acceptance/fraud-score distribution. [unverified/needs-validation]
10. **Verdict:** Reject for strict city-plus-fixed-IP requirements; retain only for a relaxed rotating use case. [estimate]

### Rayobyte: attractive published volume tariffs, separate ISP quote needed

1. **Architecture/access:** Rotating residential, ISP and mobile products with distinct billing units. [official-docs] [21]
2. **Documentation/API:** `https://rayobyte.com/pricing`; bandwidth API reference: `https://docs.rayobyte.com/proxies/reference/bandwidth-api`. Exact procurement API limits need confirmation. [unverified/needs-validation]
3. **Pricing:** Residential: $3.50/GB at 1-49 GB; $2 at 50-249; $1.50 at 250-999; $0.70 at 1,000-4,999; advertised $0.50 at 5,000+. ISP: $5/IP at 5-99, $4.80 at 100-999, $4.60 at 1,000-4,999, then quote. [official-docs] [21]
4. **Geography/onboarding:** Five-country city-specific static inventory and Vietnam eligibility unconfirmed. [unverified/needs-validation]
5. **Reliability:** Contractual uptime/incident record unconfirmed. [unverified/needs-validation]
6. **Scale:** Public ISP tiers reach 4,999; larger quantities require negotiation. [official-docs] [21]
7. **Persistence/capabilities:** Obtain written exclusivity, city, protocol and renewal terms for the exact ISP product. [unverified/needs-validation]
8. **Implementation:** Standard gateway integration first; automate usage/ordering only after API/product confirmation. [estimate]
9. **Detection evidence:** Proxyway's response-time comparison favors Decodo over Rayobyte; this is performance evidence, not account-detection evidence. [independent] [50]
10. **Verdict:** Include in a price-sensitive RFQ, especially for regional ISP inventory. [estimate]

### Infatica: clear usage tiers and documented gateway locations

1. **Architecture/access:** Residential gateways with HTTP/SOCKS5, geographic/session controls and authentication. [official-docs] [63]
2. **Documentation/API:** `https://infatica.io/documentation/residential` and `https://infatica.io/documentation/api-tool`; pricing: `https://infatica.io/residential-proxies`. [official-docs] [63]
3. **Pricing:** PAYG $4/GB; 25 GB/$96; 100/$360; 241/$700; 500/$1,350; 1,000/$2,600; larger custom plans. [official-docs] [18]
4. **Geography/onboarding:** Country/region/city/ISP/ZIP controls are documented. Gateway locations include Amsterdam, New York, California and Tokyo; these are not proof of exit inventory in the account's city. [official-docs] [63]
5. **Reliability:** Advertised 99.9% requires contractual clarification. [official-docs] [18]
6. **Scale:** Documentation describes 1,000 ports, including a 10000-10999 range; port count is not the number of exclusive residential identities. [official-docs] [63]
7. **Persistence/capabilities:** Sticky operation is documented, but the maximum useful lifetime and fixed-week allocation were not established. UDP unconfirmed. [official-docs] [63]
8. **Implementation:** Add gateway/port selection, geography and usage accounting. [estimate]
9. **Detection evidence:** No independent product-specific acceptance guarantee established. [unverified/needs-validation]
10. **Verdict:** Viable metered comparison provider; less compelling than a qualified dedicated ISP offer for persistent identities. [estimate]

### Nimble: current raw-proxy availability needs reconfirmation

1. **Architecture/access:** Reviewed current pricing emphasizes web-data/search/agent products rather than a directly comparable raw gateway. [official-docs] [13]
2. **Documentation/API:** `https://www.nimbleway.com/pricing`; request the current raw-proxy product/API reference specifically. [unverified/needs-validation]
3. **Pricing:** No current raw-proxy tariff used; historical review prices are not carried forward. [unverified/needs-validation]
4. **Geography/onboarding:** Required city inventory and Vietnam access unconfirmed. [unverified/needs-validation]
5. **Reliability:** Applicable raw-proxy SLA/history unconfirmed. [unverified/needs-validation]
6. **Scale:** Applicable organization, concurrency and inventory limits unconfirmed. [unverified/needs-validation]
7. **Persistence/capabilities:** Fixed ISP, sticky duration, UDP and unrestricted own-browser use unconfirmed for the current offer. [unverified/needs-validation]
8. **Implementation:** Do not substitute a scraping API for a browser-wide network adapter without confirming the product boundary. [estimate]
9. **Detection evidence:** No current product-specific independent evidence established. [unverified/needs-validation]
10. **Verdict:** RFQ only; not qualified as a drop-in network layer. [estimate]

### Proxy-Seller: broad API surface and explicit residential tiers

1. **Architecture/access:** Residential/ISP/mobile offerings; residential product lists city/state targeting and HTTP(S)/SOCKS5. [official-docs] [20]
2. **Documentation/API:** `https://docs.proxy-seller.com/api-v1/overview`; product APIs use separate keys. SDK languages include Node, PHP, Python, Java and Go. [official-docs] [68][20]
3. **Pricing:** Residential tiers include 100 GB/$2.20 per GB; 200/$2.10; 300/$2; 500/$1.70; 750/$1.50; 1,000/$1.45. Headline ISP prices were not converted into monthly exclusive-city costs without confirmed duration. [official-docs] [20]
4. **Geography/onboarding:** City controls exist, but all-five-country city stock and Vietnam acceptance remain unconfirmed. [official-docs] [20]
5. **Reliability:** Advertises 99.7%+ uptime; contractual coverage/history unknown. [official-docs] [20]
6. **Scale:** Per-product quotas and reserved inventory limits need confirmation. [unverified/needs-validation]
7. **Persistence/capabilities:** Exact rotating sticky ceiling and dedicated ISP renewal terms not established; UDP unconfirmed. [unverified/needs-validation]
8. **Implementation:** Node SDK/API can reduce integration work; isolate keys by product. [estimate]
9. **Detection evidence:** No independent product-specific fraud/acceptance distribution established. [unverified/needs-validation]
10. **Verdict:** Worth an automated-provisioning pilot after fixed-city inventory qualification. [estimate]

### ProxyEmpire: attractive static economics, but no static city targeting

1. **Architecture/access:** Rotating residential/mobile plus exclusive static residential. HTTP/HTTPS/SOCKS support is listed for the network. [official-docs] [29][55]
2. **Documentation/API:** `https://proxyempire.io/pricing` and `https://proxyempire.io/static-residential-proxies`; full provisioning limits need confirmation. [unverified/needs-validation]
3. **Pricing:** Static $3.50/IP/month, falling to $2 at 2,000 IPs. A 100 GB/IP soft cap applies despite unlimited-bandwidth wording. Rotating bundles include 500 GB/$875 and 1,000 GB/$1,500; rollover/no-expiry terms are advertised. [official-docs] [55][29]
4. **Geography/onboarding:** Static product covers 19 countries but explicitly does not offer city, region, ISP or carrier targeting. [official-docs] [55]
5. **Reliability:** 99.9% is advertised; incident history and credit terms unconfirmed. [official-docs] [29]
6. **Scale:** A published 2,000-IP price does not establish 100,000-IP stock. [estimate]
7. **Persistence/capabilities:** Exclusive allocation lasts during the active subscription; city requirement remains unsatisfied. [official-docs] [55]
8. **Implementation:** Simple static allocation ledger plus renewal monitoring. [estimate]
9. **Detection evidence:** No independent product-specific acceptance/fraud distribution established. [unverified/needs-validation]
10. **Verdict:** Good country-level alternative; not compliant with a strict home-city requirement as documented. [estimate]

### Live Proxies: enterprise inquiry required; retail bundles are not a fixed-IP substitute

1. **Architecture/access:** Retail rotating residential/mobile and enterprise geographic products. [official-docs] [15]
2. **Documentation/API:** `https://liveproxies.io/pricing`; enterprise API availability is described, but complete public provisioning quotas were not established. [official-docs] [15]
3. **Pricing:** Example residential bundle: 200 IPs/4 GB/30 days for $70. Another is 500 IPs/50 GB/**90 days** for $530; do not read it as 50 GB/month. Mobile examples include 50 IPs/4 GB/30 days/$70. [official-docs] [15]
4. **Geography/onboarding:** Enterprise geographic routing needs a location-specific quote; retail availability is not proof of all five countries. [unverified/needs-validation]
5. **Reliability:** Contracted SLA and incident history unconfirmed. [unverified/needs-validation]
6. **Scale:** Enterprise capacity must be negotiated. [unverified/needs-validation]
7. **Persistence/capabilities:** Residential sticky sessions are 60 minutes, mobile 30 minutes; HTTP(S) is listed. The reviewed static section was unavailable. [official-docs] [15]
8. **Implementation:** Keep bundle expiry and traffic allocation separate; enterprise integration needs API documentation. [estimate]
9. **Detection evidence:** No independently established product-specific acceptance score. [unverified/needs-validation]
10. **Verdict:** Enterprise RFQ only for this requirement. [estimate]

### Massive: documented integrations, expensive rotating baseline

1. **Architecture/access:** Opt-in residential network and a separate ISP offer; country/region/city routing, HTTP/HTTPS/SOCKS5. [official-docs] [57][27]
2. **Documentation/API:** `https://docs.joinmassive.com/`; product/pricing: `https://www.joinmassive.com/pricing`. [official-docs] [27]
3. **Pricing:** 10 GB/$80; 30/$225; 70/$385; 100/$490. Unused traffic rollover is described. ISP advertises a starting $1.80/IP, but a complete monthly location-qualified price was not established. [official-docs] [27]
4. **Geography/onboarding:** Advertises 195+ countries and city routing; exclusive fixed stock in the five cities remains unconfirmed. [official-docs] [27]
5. **Reliability:** 99.9% SLA is stated; applicable credits/exclusions need review. [official-docs] [27]
6. **Scale:** Large network claims are not exclusive-IP allocation commitments. [estimate]
7. **Persistence/capabilities:** Residential sticky duration is 12 minutes; weeks-long persistence requires a separately qualified ISP allocation. [official-docs] [27]
8. **Implementation:** Documented gateway integration; add traffic/rollover accounting and separate ISP purchasing logic. [estimate]
9. **Detection evidence:** No independent product-specific acceptance distribution established. [unverified/needs-validation]
10. **Verdict:** Technically viable rotating candidate, but unattractive base-case price without an ISP/enterprise quote. [estimate]

### Evomi: low-cost private static deserves testing, not automatic trust

1. **Architecture/access:** Separate Core residential and shared/private/virgin static products; HTTP/HTTPS/SOCKS5. [official-docs] [16]
2. **Documentation/API:** `https://docs.evomi.com/`; pricing: `https://evomi.com/pricing`. Detailed procurement quotas need confirmation. [unverified/needs-validation]
3. **Pricing:** Core monthly 100 GB/$49, additional traffic $0.49/GB. PAYG starts with 15 GB at $0.99/GB and advertises $0.79 at 1,000 GB. Static monthly: shared $1, private $2.50, virgin $4.50/IP. [official-docs] [16]
4. **Geography/onboarding:** City/region/ISP controls are advertised for relevant products; do not assume the same controls or inventory apply to private static allocations. [official-docs] [16]
5. **Reliability:** 99.9% SLA is advertised; exact remedy and product scope need review. [official-docs] [16]
6. **Scale:** Large private-IP quantities and organization limits unconfirmed. [unverified/needs-validation]
7. **Persistence/capabilities:** Use private rather than shared for the stated requirement; fixed-city renewal guarantees and UDP unconfirmed. [unverified/needs-validation]
8. **Implementation:** Standard credentials plus private allocation and subscription-renewal tracking. [estimate]
9. **Detection evidence:** Proxyway includes favorable performance observations, but no cited result establishes Meta acceptance or equal quality across Core/private/virgin products. [independent] [50]
10. **Verdict:** High-priority price/quality pilot, conditional on city inventory and exclusivity. [estimate]

### DataImpulse: cheap rotating traffic, with city fees and classification caveats

1. **Architecture/access:** Residential gateway, HTTP/HTTPS/SOCKS5 and geographic/session controls. [official-docs] [32]
2. **Documentation/API:** `https://docs.dataimpulse.com/`; its documentation index includes targeting, session IDs, traffic limits and a UDP page. The existence of that page is not a validated UDP entitlement. [official-docs] [54]
3. **Pricing:** 5 GB/$5; 50 GB/$50; 1 TB/$800; traffic does not expire. City targeting costs extra, with the applicable surcharge not established here. [official-docs] [32]
4. **Geography/onboarding:** Advertises 195 countries; exact city supply and Vietnam approval unconfirmed. [official-docs] [32]
5. **Reliability:** Contractual SLA and incident history unconfirmed. [unverified/needs-validation]
6. **Scale:** Organization quota, fixed inventory and large-volume throughput commitments unconfirmed. [unverified/needs-validation]
7. **Persistence/capabilities:** Sticky duration is 120 minutes, not weeks. [official-docs] [32]
8. **Implementation:** Add city-premium accounting and explicit session expiry; validate any claimed UDP mode separately. [estimate]
9. **Detection evidence:** Proxyway reports a comparatively high non-residential share in its tested pool. This warrants exit classification checks rather than assuming every delivered IP meets the residential requirement. [independent] [50]
10. **Verdict:** Low-cost rotating benchmark, not the fixed-IP primary. [estimate]

## 4. Managed Mobile Specialists And Additional Candidates

### Case study: Proxidize's managed traffic versus iProxy's device software

Proxidize's reviewed mobile pricing is traffic-based: 25 GB/$50, 100 GB/$200, 500 GB/$1,000 and 5 TB/$10,000. It advertises city/ASN controls, an included API, HTTP/HTTPS/SOCKS5 and sessions lasting up to three days. This is a candidate managed network purchase rather than a requirement that you place modems in five countries. It still does not promise a fixed public IP for weeks. [official-docs] [19]

iProxy's published subscriptions instead charge **$9 or $12.50 per device per 30 days**. These are software prices, not an all-inclusive price for a foreign phone, SIM, data plan, power, hosting and maintenance. Under your no-hardware constraint, those missing components cannot be silently treated as free or available. A separate fully managed partner offer would need its own qualification. [official-docs] [17] [estimate]

**Decision:** Shortlist managed mobile endpoints, not DIY modem/phone systems. Mobile carrier NAT and rotation also mean that a dedicated SIM or modem does not automatically imply an exclusive, immutable public IP. [estimate]

### Mobile and supplementary provider records

| Provider | Product, pricing and persistence | Geography and protocols | API, reliability and scale | Implementation, independent evidence and verdict |
|---|---|---|---|---|
| **The Social Proxy** | Reviewed page shows residential/mobile headline plans around $119/month; the exact one-IP-per-account economics and session terms remain unclear. [official-docs] [24] | Listed mobile locations include US/UK and several European/other locations; IE/CA/AU city stock unconfirmed. [official-docs] [24] | API advertised. The reviewed pricing page also displayed a service-down warning, without a reliable incident timeline. [official-docs] [24] | Docs/pricing: `https://thesocialproxy.com/pricing/`. Auth, inventory, SLA, organization limits, UDP and Vietnam eligibility unknown. Independent quality evidence not established. **Needs commercial/service clarification before a pilot.** [unverified/needs-validation] |
| **Proxidize managed mobile** | $2/GB; monthly bundles from 25 GB to 10 TB. Traffic expires after a month without rollover. Sticky up to three days. [official-docs] [19] | City/ASN controls; HTTP/HTTPS/SOCKS5. Exact five-country/city inventory and UDP unconfirmed. [official-docs] [19] | API included. Advertised 99.5% success is not an uptime SLA. Above published bundles requires negotiation. [official-docs] [19] | `https://proxidize.com/mobile-proxy-pricing`. Build usage/session adapter. No independent account-acceptance evidence established. **Best managed-mobile RFQ starting point, but not fixed for weeks.** [estimate] |
| **iProxy** | Basic $9, Pro $12.50/device/30 days; 1,000+ device enterprise pricing custom. Not a complete foreign exit price. [official-docs] [17] | HTTP, SOCKS5 and SOCKS5 UDP listed; device location is decisive. [official-docs] [17] | REST API; Basic/Pro advertise ten/20 connections. No all-in hosted SLA established. [official-docs] [17] | `https://iproxy.online/en/pricing`. Would require a separately qualified managed-device arrangement; independent quality evidence unknown. **Not qualified under the hardware constraint as priced.** [estimate] |
| **AirProxy** | EUR67/proxy/30 days, dedicated SIM, unlimited bandwidth; 72-hour trial EUR9.90; bulk discounts described. [official-docs] [25] | Reviewed service is Italy-only, so it misses all five requested countries. [official-docs] [25] | Rotation API described; protocol, SLA, hard capacity and renewal-IP guarantees unconfirmed. [official-docs] [25] | `https://airproxy.io/en`. Simple API adapter if geography were suitable; no independent acceptance evidence established. **Exclude for this geography.** [estimate] |
| **Coronium** | Managed mobile candidate; exact location-qualified monthly price and fixed-IP term not established. [unverified/needs-validation] | Advertises 10+ countries, HTTP(S), SOCKS5 and OpenVPN. Exact IE/UK/CA/US/AU city coverage unknown. [official-docs] [14] | Dashboard/API rotation; advertised rotation 10-20 seconds and uptime 99.5%+. Contract SLA and inventory limits unconfirmed. [official-docs] [14] | `https://www.coronium.io/` and `/mobile-proxies`. VPN mode warrants testing for whole-host routing. No independent quality distribution established. **Managed-mobile RFQ candidate.** [estimate] |
| **MobileHop** | Published monthly options include $180 and $225; shorter hourly/daily/weekly rentals also listed. Fixed public IP for weeks not established. [official-docs] [23] | US-focused, 50+ locations advertised; HTTP/HTTPS/SOCKS5 plus L2TP/IPsec and SSL VPN options. [official-docs] [23] | API/custom rotation and 99.9% uptime advertised; contractual history and large inventory unknown. [official-docs] [23] | `https://mobilehop.com/`. Build endpoint/rotation/VPN adapter if used. No independent acceptance evidence established. **US specialist, costly at one endpoint/account.** [estimate] |
| **SimplyNode** | Residential $4/GB at 1-14 GB, falling to $2.25 at 500-999 GB; 1,000+ custom. Traffic non-expiring; no dedicated product. Sticky up to six hours. [official-docs] [22] | Advertises 185 countries/700 cities, HTTP(S)/SOCKS5. Exact city stock unconfirmed. [official-docs] [22] | Advertised 99.3% is success, not uptime. Provisioning limits, SLA and UDP unknown. [official-docs] [22] | `https://www.simplynode.io/`. Standard rotating adapter; no independent acceptance evidence established. **Rotating alternative, not persistent fixed identity.** [estimate] |
| **anyIP** | $25/5 GB; $80/20 GB; $300/100 GB; $1,000/500 GB, with extra GB at $5/$4/$3/$2 respectively. Sticky up to seven days; rollover requires timely renewal. [official-docs] [28] | 38+ countries; HTTPS/SOCKS listed. All five target countries and cities unconfirmed. [official-docs] [28] | API/product quotas, credit-backed SLA and fixed-IP inventory unknown. [unverified/needs-validation] | `https://anyip.io/pricing/residential-proxies`. Add bundle/renewal accounting. No independent acceptance distribution established. **Longer sticky comparison, not guaranteed fixed ISP replacement.** [estimate] |

These specialists broaden the options, but only the managed products satisfy the no-owned-hardware condition. For every row, Vietnam onboarding/payment, account limits and acceptable use for the exact application remain unconfirmed unless separately contracted. [unverified/needs-validation]

### Seven additional leads: not yet qualified as viable

The following names belong in an expanded RFQ, but the available evidence does not support promoting them into a validated price or capacity comparison. Every field in this table is **[unverified/needs-validation]**; no prices are carried into the budget.

| Additional provider | Official-site lead to qualify | Missing decision-critical evidence | Readiness |
|---|---|---|---|
| NodeMaven | `https://nodemaven.com/` | Exclusive ISP city inventory, applicable tariff, renewal, API quotas | needs-testing |
| Shifter | `https://shifter.io/services/dedicated-proxies` | Five-country city stock, duration, exclusivity, complete price | needs-testing |
| ASocks | Brand requires current product/documentation qualification | Current official API/tariff, city stock, fixed-IP product | needs-testing |
| Geonode | `https://geonode.com/products/residential-proxies` | Applicable targeting premiums, session limits, exclusive fixed inventory | needs-testing |
| MarsProxies | `https://marsproxies.com/pricing/isp-proxies` | Billing duration, exclusivity and five-country city stock | needs-testing |
| LunaProxy | Contracting domain/entity requires clarification | Verified commercial identity and applicable documentation | needs-testing |
| Byteful, formerly Ping | `https://byteful.com/proxy-service/residential-proxies` | Current tariff/targeting terms, persistent inventory and quotas | needs-testing |

**Decision:** Do not turn an unqualified homepage or starting-price claim into a fleet budget. This report identifies these leads, but does not claim that every commercial proxy seller has been exhaustively validated.

## 5. Captcha Services: Arkose Support And Account-IP Binding

### Product support is not a universal Meta challenge guarantee

2Captcha and Anti-Captcha explicitly document FunCaptcha tasks that carry a proxy. Their proxyless alternatives use the solver's infrastructure. That distinction matters if a challenge integration expects the same exit IP as the browser. It does not establish that every Meta challenge is FunCaptcha, that every challenge requires identical IPs, or that a solver token will always be accepted. [official-docs] [41][42][45]

| Solver | Arkose/FunCaptcha evidence | Account's own proxy/IP | Published pricing relevant here | Docs/integration and verdict |
|---|---|---|---|---|
| **2Captcha** | Explicit Arkose/FunCaptcha task documentation. [official-docs] [41] | Proxy-bearing task accepts HTTP/SOCKS4/SOCKS5; proxyless uses solver pool. [official-docs] [41] | **$1.45-$50/1,000**, a wide product-dependent range, not one flat tariff. [official-docs] [44] | `https://2captcha.com/api-docs/arkoselabs-funcaptcha`; `https://2captcha.com/p/funcaptcha`. **First integration candidate where permitted**, with end-to-end IP behavior validated. [estimate] |
| **Anti-Captcha** | Explicit `FunCaptchaTask` and proxyless variants. [official-docs] [42][45] | Proxy fields documented; proxyless uses worker/solver network. [official-docs] [42][45] | Advertised **$3/1,000**. A displayed solve time/capacity is not a fixed SLA. [official-docs] [38] | `https://anti-captcha.com/apidoc/task-types/FunCaptchaTask`; Node example documented. [official-docs] [42] **Second candidate.** [estimate] |
| **CapMonster Cloud** | Official article says FunCaptcha became available again, dated December 2, 2025. [official-docs] [47] | Applicable customer-proxy task mode was not established. [unverified/needs-validation] | Article advertises **$2/1,000**. [official-docs] [47] | `https://capmonster.cloud/en/blog/funcaptcha-solver`; `https://capmonster.cloud/en/prices`. **Conditional candidate**, not qualified for mandatory own-IP use yet. [estimate] |
| **CapSolver** | Reviewed current getting-started task list does not establish Arkose/FunCaptcha support. Absence from that list is not proof of permanent non-support. [official-docs] [43] | Arkose customer-proxy behavior unconfirmed. [unverified/needs-validation] | No applicable current Arkose tariff established. [unverified/needs-validation] | `https://docs.capsolver.com/en/guide/getting-started/`; request current product confirmation. **Do not assume compatibility from other captcha support.** [estimate] |
| **NopeCHA** | Recognition API and token API are distinct; end-to-end Arkose token support for this integration was not established. [official-docs] [39] | Account-IP binding for the required token workflow unconfirmed. [unverified/needs-validation] | Monthly quotas include $4.99/2,000 daily requests, $19.99/20,000, $49.99/80,000 and $99.99/200,000. These are not verified FunCaptcha-token prices. [official-docs] [46] | `https://developers.nopecha.com/`; `https://nopecha.com/api-reference`; `https://nopecha.com/pricing`. **Needs product validation.** [estimate] |

**Decision:** Start with documented proxy-bearing task types, but keep human takeover available. Do not budget recognition calls as interchangeable with successful challenge completion. [estimate]

### Captcha cost sensitivity

Assume **30 billable challenge attempts/account/month**, solely for budgeting. This is not an observed challenge rate, and retries can increase it. All following calculations are **[estimate]**.

| Solver tariff | Cost/account/month | 100 accounts | 1,000 accounts | 10,000 accounts | 100,000 accounts |
|---|---:|---:|---:|---:|---:|
| 2Captcha $1.45-$50/1,000 | $0.0435-$1.50 | $4.35-$150 | $43.50-$1,500 | $435-$15,000 | $4,350-$150,000 |
| Anti-Captcha $3/1,000 | $0.09 | $9 | $90 | $900 | $9,000 |
| CapMonster $2/1,000, own-IP mode unconfirmed | $0.06 | $6 | $60 | $600 | $6,000 |
| CapSolver / NopeCHA for this Arkose workflow | Q | Q | Q | Q | Q |

At 1,000 accounts, a hypothetical qualified $2.50 static allocation plus Anti-Captcha at this challenge rate totals **$2.59/account/month, or $2,590/month**, before hosting, taxes and other charges. This combines two assumptions; it is not a bundled vendor offer. [estimate]

## 6. Reliability, Acceptable Use And Independent Detection Evidence

### Case study: low cost and low IP risk are different questions

Evomi's Core traffic costs $0.49/GB on the reviewed monthly tariff, while its private static allocation costs $2.50/IP/month. At the 5 GB base case, the rotating traffic component is $2.45, almost the same as the static fee. The economic break-even is approximately **5.1 GB/month**, before product-specific targeting, fair use or quality differences. [official-docs] [16] [estimate]

The static offer would therefore be attractive if it actually supplies exclusive city-correct inventory. But the price says nothing about a particular IP's residential classification, prior abuse or future availability. Conversely, IPRoyal's favorable sampled risk-database results do not establish that its static inventory in your required cities has the same distribution. [independent] [50] [estimate]

**Decision:** Buy a small sample of the exact product and location being quoted. A benchmark of one provider's rotating pool cannot certify its separate static or mobile inventory.

### What the independent evidence supports

| Question | Evidence available | What remains unknown |
|---|---|---|
| Does any participating pool offer more distinct exits? | Proxyway reports Oxylabs leading, followed by Decodo and NetNut, in its tested sample. [independent] [50] | Guaranteed exclusive allocations for your fleet |
| Are delivered addresses always classified residential? | Proxyway identifies comparatively high non-residential shares for DataImpulse and Proxyrack. [independent] [50] | Classification of the exact address delivered tomorrow |
| Are fraud/risk scores uniformly low? | IPRoyal performs favorably across two tested databases. [independent] [50] | Meta's private risk model and future score changes |
| Is one network faster? | Decodo leads the cited response-time comparison; several others also perform well. [independent] [50] | Vietnam-to-gateway-to-city latency for your workload |
| Does an exit prevent browser detection? | No reviewed provider-specific test establishes this | Renderer, TLS/browser consistency, behavioral signals and account legitimacy |
| Does a clean IP mean the account is permitted? | No | Platform authorization and account-policy compliance |

These results justify prioritizing tests, not declaring a provider undetectable. There is no defensible universal fraud-score number to assign to each provider from the reviewed material. [estimate]

### Reliability and commercial terms to resolve

For the complete provider set, a comparable status-page incident history, enforceable repair time, API rate-limit schedule and allocation-replacement guarantee were not established. Where an uptime or SLA claim is cited above, its product scope, exclusions and service-credit remedy still matter. [unverified/needs-validation]

The most important reliability event for this use case may be **an IP change**, even when the gateway remains available. A replacement exit restores connectivity but does not restore the original account-to-IP mapping. Specify whether the provider can retain an allocation during billing problems, maintenance and temporary suspension. [estimate]

Vietnam signup and payment acceptance remain unconfirmed across the set. Bright Data's KYC and Oxylabs' KYC/restricted-target provisions show why technical access should not be confused with commercial approval. None of the prices in this report establishes permission for automated persona accounts or large-scale multi-accounting on Facebook. Obtain explicit provider approval for the actual activity and comply with the target platform's rules. [official-docs] [8][12] [estimate]

**Decision:** Make permission, inventory continuity and escalation terms purchase conditions. A low unit price without these terms is not a reliable account-network service.

## 7. TypeScript Integration And Acceptance Requirements

### Build one adapter contract, not one provider-specific account format

Keep account identity separate from provider credentials. A practical configuration record contains account ID, authorized target platform, required country/city, allocation type, provider product, secret reference, assigned exit, session expiry, allocation renewal date, traffic allowance and replacement policy. These are implementation recommendations, not vendor-supported universal fields. [estimate]

| Component | What you build | Estimated effort |
|---|---|---:|
| Basic provider connector | Credential retrieval, endpoint configuration, health/egress check, usage attribution | 1-2 engineering days/provider |
| Full commercial adapter | Provisioning, location discovery, renewal, cancellation, usage/balance and replacement events where API exists | 3-5 days/provider after API qualification |
| Shared account-network control plane | Typed configuration, secrets, allocation ledger, concurrency scheduling and audit logs | 2-3 engineering weeks |
| Host routing enforcement | No direct fallback, appropriate DNS routing, protocol restrictions and failure handling | Included in a separate host/network workstream; environment-dependent |
| Acceptance and soak testing | Location, continuity, protocol coverage, upload behavior and operational support tests | 2-4 elapsed weeks for shortlisted products |

All effort figures are **[estimate]**, assume an experienced TypeScript engineer and exclude provider onboarding delays, browser-host development and account-policy approval.

### Test network correctness separately from browser consistency

A provider acceptance test should establish the observed exit country/city, address classification, allocation exclusivity as contracted, continuity across reconnections, traffic accounting and behavior when the proxy is unavailable. Test your own controlled endpoints before relying on production activity. [estimate]

For the requirement that **all platform traffic** use the assigned exit, verify the actual routing of DNS, HTTP(S), browser background requests, WebRTC and any application-specific UDP. A browser proxy setting alone is not proof. An unavailable proxy should fail closed rather than silently use the host's datacenter IP. [estimate]

CreepJS-style browser consistency tests belong to a separate acceptance track. Changing proxy provider cannot remove llvmpipe/SwiftShader rendering or manufacture a physical GPU. Likewise, a clean browser result does not prove network exclusivity or authorization to operate an account. [estimate]

### Questions that must appear in the RFQ

Ask for the exact city list in Ireland, UK, Canada, US and Australia; available exclusive quantities; guaranteed renewal behavior; replacement policy; per-IP and per-GB charges; fair-use limits; protocol/UDP support; API quotas; peak throughput; escalation support; KYC/payment acceptance for a Vietnam operator; and written acceptance of the described activity. [estimate]

Request separate quotes for **100, 1,000, 10,000 and 100,000 allocations**, not merely the same quantities of rotating sessions. Ask for city-level stock reservations and staged delivery dates, rather than treating a global pool-size headline as an inventory commitment. [estimate]

**Decision:** Build the common adapter once, qualify two providers first, and expand only when allocation continuity and complete routing have passed acceptance.

## 8. Synthesis: Comparison And Ranked Procurement Shortlist

### Three trade-offs determine the shortlist

**Persistence versus geographic flexibility:** Rotating residential products often offer city selection but short sessions. Static products offer longer allocation lifetimes, yet may offer only country-level selection, as ProxyEmpire explicitly does. Decodo's five-country ISP list is therefore valuable but insufficient without city-specific stock. [official-docs] [55][11] [estimate]

**Price versus evidence:** Evomi, Proxy-Cheap and IPRoyal advertise inexpensive static allocations. Bright Data and Oxylabs provide stronger documented enterprise/compliance surfaces, but their relevant exclusive inventory needs a quote. The rational choice is not automatically the cheapest or the largest brand: it is the lowest qualified total cost for the required cities and continuity. [official-docs] [16][26][3][8][12] [estimate]

**Mobile access versus stable public identity:** Managed mobile avoids your own hardware and may support app traffic, but SIM/modem exclusivity and public-IP exclusivity are different properties. Proxidize's three-day stickiness, AirProxy's Italy-only geography and MobileHop's US focus each solve a narrower problem than the full five-country requirement. [official-docs] [19][25][23] [estimate]

### Final provider comparison

**Legend:** Costs are the estimated network-only monthly amount per account at **1,000 accounts**, using Section 2's chosen product and base case. **E/N/E** means external OS / no supplied GPU / external live view. **P** means the provider supplies the proxy; it does not establish support for chaining another BYO proxy. **Q** means quote/qualification required. Readiness refers to this particular use case, not whether the vendor generally sells a working service.

| Provider | $/account at 1,000 | Relevant regions / location fit | OS / GPU / live view | BYO proxy | Maximum scale evidence | Readiness and principal gap |
|---|---:|---|---|---|---|---|
| 2Captcha | 7.20 rotating | Global/city; exact static cities Q | E/N/E | P | Unlimited threads claim; 100K exclusive Q | needs-testing: 120-minute residential limit |
| Bright Data | 40 PAYG; ISP Q | Global/city; fixed inventory Q | E/N/E | P | Enterprise/custom | needs-testing: dedicated price and stock |
| Oxylabs | 12.50 rotating; dedicated Q | Global; exact dedicated cities Q | E/N/E | P | Unlimited residential concurrency; reserved stock Q | needs-testing: cheap ISP is shared |
| Decodo | 2.50 dedicated ISP | All five countries listed; cities Q | E/N/E | P | Public 200-IP tier; larger Q | needs-testing: strongest first fixed-IP pilot |
| IPRoyal | 2.70 static starting price | Global rotating; static city stock Q | E/N/E | P | Unlimited residential concurrency; static Q | needs-testing: confirm static geography |
| SOAX | Q | Global/city; fixed stock Q | E/N/E | P | Q | needs-testing: tariff and persistence |
| NetNut | Q | Current service continuity Q | E/N/E | P | Q | needs-testing: procurement hold |
| Webshare | Q | Exact exclusive ISP cities Q | E/N/E | P | Q | needs-testing: qualify correct product |
| Proxy-Cheap | 2.71 static starting price | US/UK/CA/AU listed; IE/cities Q | E/N/E | P | Threads advertised; inventory Q | needs-testing: five-country stock |
| PacketStream | 5 rotating | Country targeting, not confirmed city | E/N/E | P | Exclusive scale Q | needs-testing: fails strict city/fixed requirement |
| Rayobyte | 2.50 rotating; ISP 4.60 at 1K tier | Required static cities Q | E/N/E | P | ISP public tiers to 4,999, then Q | needs-testing: city inventory |
| Infatica | 13 rotating | Global targeting; gateway regions documented | E/N/E | P | 1,000 documented ports; inventory Q | needs-testing: fixed weeks Q |
| Nimble | Q | Current raw product Q | E/N/E | P if available | Q | needs-dev: product qualification first |
| Proxy-Seller | 7.25 rotating | City targeting; static stock Q | E/N/E | P | Q | needs-testing: exclusive renewal terms |
| ProxyEmpire | 3.50 static | 19 static countries; no static city targeting | E/N/E | P | 2,000-IP price published; capacity Q | needs-testing: fails strict city requirement |
| Live Proxies | Q | Enterprise location quote | E/N/E | P | Enterprise Q | needs-dev: enterprise/API qualification |
| Massive | 24.50 rotating; ISP Q | 195+ countries/city routing | E/N/E | P | Reserved scale Q | needs-testing: short sticky, ISP quote |
| Evomi | 2.50 private static | Static city/country stock Q | E/N/E | P | Q | needs-testing: price-quality pilot |
| DataImpulse | 4 plus city fees | 195 countries; city premium | E/N/E | P | Q | needs-testing: classification and 120-minute limit |
| The Social Proxy | Q | Listed mobile regions; full five Q | E/N/E | P | Q | needs-testing: service warning and terms |
| Proxidize managed | 10 | Exact city/country inventory Q | E/N/E | P | Public bundles to 10 TB; beyond Q | needs-testing: managed mobile, not fixed weeks |
| iProxy | Not all-in | Depends on separately supplied device | E/N/E | P through device | 1,000+ device enterprise | needs-dev: no qualified hardware-free arrangement |
| AirProxy | EUR67 | Italy only | E/N/E | P | Q | needs-testing: exclude for geography |
| Coronium | Q | 10+ countries; exact five/cities Q | E/N/E | P | Q | needs-testing: managed quote |
| MobileHop | 180 | US specialist | E/N/E | P | Q | needs-testing: US-only role, high unit cost |
| SimplyNode | 11.25 tariff-held | 185 countries/700 cities claimed | E/N/E | P | 1 TB+ custom | needs-testing: no dedicated product |
| anyIP | 10 | 38+ countries; five-city fit Q | E/N/E | P | Custom capacity Q | needs-testing: seven-day sticky, not reserved |
| NodeMaven | Q | Unqualified inventory | E/N/E | Q | Q | needs-testing |
| Shifter | Q | Unqualified inventory | E/N/E | Q | Q | needs-testing |
| ASocks | Q | Unqualified inventory | E/N/E | Q | Q | needs-testing |
| Geonode | Q | Unqualified inventory | E/N/E | Q | Q | needs-testing |
| MarsProxies | Q | Unqualified inventory | E/N/E | Q | Q | needs-testing |
| LunaProxy | Q | Commercial identity/product Q | E/N/E | Q | Q | needs-testing |
| Byteful | Q | Unqualified inventory | E/N/E | Q | Q | needs-testing |

The factual bases for the first 27 rows are the cited dossiers above; the final seven are unqualified leads, not verified offers. No provider earns **ready-now** for the complete requirement because city-specific exclusive persistence, commercial approval and end-to-end routing have not all been established. [unverified/needs-validation]

### Ranked shortlist

1. **Decodo dedicated ISP - first procurement pilot.** It combines explicit coverage of the five countries with a published dedicated tariff around $2.50/IP at the 200-IP tier. Request exact-city stock, bandwidth terms and renewal continuity before expanding. [official-docs] [11] [estimate]
2. **Evomi private static - price challenger.** The $2.50/IP monthly price is attractive, but private static geography and quality must be tested independently of the Core rotating product. [official-docs] [16] [estimate]
3. **IPRoyal static residential - quality-oriented alternative.** Starting $2.70/30 days and favorable independent sampled risk results justify a pilot; neither establishes city stock or the same quality in static inventory. [official-docs] [3] [independent] [50] [estimate]
4. **Bright Data dedicated ISP and Oxylabs dedicated inventory - enterprise RFQ lane.** Use them to benchmark inventory, support and commercial commitments. Do not compare Bright Data's promotional residential tariff or Oxylabs' shared ISP tariff with exclusive fixed-IP offers. [official-docs] [8][9][12] [estimate]
5. **Rayobyte and Proxy-Cheap - regional cost alternatives.** Published ISP/static prices justify requests for city-qualified allocations, but neither is confirmed as the complete five-country solution. [official-docs] [21][26] [estimate]
6. **Proxidize managed mobile, then Coronium - mobile contingency.** Evaluate a hosted service where ISP stock is unsuitable. Require exact location, public-IP behavior and all-in billing terms; do not substitute a DIY hardware product. [official-docs] [19][14] [estimate]
7. **2Captcha, then DataImpulse - rotating baseline and cost benchmark.** Keep the existing 2Captcha integration while evaluating alternatives; neither reviewed rotating offer supplies weeks-long fixed IPs, and DataImpulse's city fees/classification need special attention. [official-docs] [5][32] [independent] [50] [estimate]

**Recommended purchase decision:** Commission city-qualified quotes from the first three static candidates and the enterprise lane, then run a small product-specific acceptance test before signing a fleet commitment. At 100,000 accounts, exclusive city inventory and continuity terms are more consequential than an advertised pool size or an unsupported volume discount. [estimate]

## References

1. *Residential Proxies Pricing*. https://oxylabs.io/pricing/residential-proxy-pool
2. *Residential Proxies Monthly, Pay As You Go, GB Pricing*. https://iproyal.com/pricing/residential-proxies/
3. *Static Residential Proxies Pricing*. https://iproyal.com/pricing/static-residential-proxies
4. *Seized by the Federal Bureau of Investigation*. https://netnut.io/pricing/
5. *Proxy Service - World Leading Proxy Provider - 2Captcha*. https://2captcha.com/proxy
6. *Residential Proxy Pricing – Decodo (formerly Smartproxy)*. https://decodo.com/proxies/residential-proxies/pricing
7. *Simple, predictable pricing that scales with you — SOAX*. https://soax.com/pricing
8. *Residential Proxies Pricing*. https://brightdata.com/pricing/proxy-network/residential-proxies
9. *ISP Proxies Pricing*. https://brightdata.com/pricing/proxy-network/isp-proxies
10. *Proxy Pricing - Datacenter, ISP & Rotating Residential Plans Compared*. https://www.webshare.io/pricing
11. *Static Residential Proxies from $0.27/IP – Decodo*. https://decodo.com/proxies/static-residential-proxies
12. *Oxylabs ISP Proxies Pricing*. https://oxylabs.io/pricing/isp-proxies
13. *Nimble Pricing | Web Search Agent Platform & SDK Plans*. https://www.nimbleway.com/pricing
14. *Buy 4G/5G/LTE Mobile Proxies | Coronium.io Marketplace*. https://www.coronium.io/
15. *Buy Proxy Plans: Flexible Pricing for Residential & Mobile Proxies | Live Proxies*. https://liveproxies.io/pricing
16. *Proxy Pricing: Plans and Rates From $0.49/GB | Evomi*. https://evomi.com/pricing
17. *iProxy.online prices | Rate Plans for Any Budget | iProxy Online*. https://iproxy.online/en/pricing
18. *Buy Residential Proxies > 40 M+ Fast Proxy IPs > Easy Trial! | Infatica*. https://infatica.io/residential-proxies
19. *Mobile Proxies Pricing — Proxidize*. https://proxidize.com/mobile-proxy-pricing
20. *Proxy-Seller proxies price & packages from $0.58/IP*. https://proxy-seller.com/price
21. *Rayobyte Proxy Pricing | Reliable, Affordable Products*. https://rayobyte.com/pricing
22. *SimplyNode - Your Trusted Proxy Solutions Provider*. https://www.simplynode.io/
23. *Home - Mobile Proxy & VPN Service - MobileHop*. https://mobilehop.com/
24. *Plans & Pricing - The Social Proxy: High Quality 5G & 4G Proxies*. https://thesocialproxy.com/pricing/
25. *Buy Mobile 4G Proxies | AIRPROXY*. https://airproxy.io/en
26. *Affordable Proxy Solutions (Pricing) - Proxy-Cheap*. https://www.proxy-cheap.com/pricing
27. *Residential Proxies | Massive Web Access API*. https://www.joinmassive.com/pricing
28. *Residential Proxies Pricing - Plans From $25/mo*. https://anyip.io/pricing/residential-proxies
29. *Proxy Pricing: Plans From $0.75/GB - ProxyEmpire*. https://proxyempire.io/pricing
30. *Residential Proxies with Rotation, Sticky Sessions & Country Targeting*. https://packetstream.io/residential-proxies
31. *Nimble Way*. https://www.nimbleway.com/
32. *DataImpulse: Buy proxy - Cheap proxy services*. https://dataimpulse.com/
33. *Residential Proxies Quick-Start Guide*. https://iproyal.com/quick-start-guides/residential-proxies
34. *Residential Proxies | NetNut*. https://netnut.ai/products/residential
35. *Proxy IP Servers in Any Location*. https://oxylabs.io/location-proxy
36. *Sticky vs Rotating Proxy Sessions Explained - Residential ...*. https://dataimpulse.com/blog/sticky-vs-rotating-sessions
37. *Decodo - All-in-One Proxy & Web Scraping Platform*. https://decodo.com/
38. *Anti Captcha: Captcha Solving Service since 2007. Solve Recaptcha, image captchas, FunCaptcha, GeeTest, Turnstile, Amazon, and many more.*. https://anti-captcha.com/
39. *NopeCHA*. https://developers.nopecha.com/
40. *Capsolver: Fastest AI Captcha Solver, Auto Captcha Solving Service*. https://www.capsolver.com/pricing/
41. *Arkose Labs captcha*. https://2captcha.com/api-docs/arkoselabs-funcaptcha
42. *Solve FunCaptcha from Arkose Labs with proxy*. https://anti-captcha.com/apidoc/task-types/FunCaptchaTask
43. *Getting Started| Capsolver*. https://docs.capsolver.com/en/guide/getting-started/
44. *Arkose Labs captcha (FunCaptcha) solver*. https://2captcha.com/p/funcaptcha
45. *Solve FunCaptcha from Arkose Labs*. https://anti-captcha.com/apidoc/task-types/FunCaptchaTaskProxyless
46. *NopeCHA - Captcha Solver*. https://nopecha.com/pricing
47. *Return of Funcaptcha Solver*. https://capmonster.cloud/en/blog/funcaptcha-solver
48. *capmonster.cloud*. https://capmonster.cloud/en/prices
49. *Welcome*. https://docs.dataimpulse.com/
50. *Proxy Market Research 2026 - Proxyway*. https://proxyway.com/research/proxy-market-research-2026
51. *Pricing | NetNut*. https://netnut.ai/pricing
52. *Overview – Evomi Proxies Documentation*. https://docs.evomi.com/
53. *Overview*. https://docs.iproyal.com/
54. *DataImpulse*. https://docs.dataimpulse.com/llms.txt
55. *Buy Static Residential Proxies - ProxyEmpire*. https://proxyempire.io/static-residential-proxies
56. *Proxy API*. https://2captcha.com/proxy/api
57. *Introduction - Massive*. https://docs.joinmassive.com/
58. *ISP Proxies*. https://developers.oxylabs.io/products/proxies/isp-proxies
59. *The web changes. Your access doesn't. — SOAX*. https://soax.com/
60. *Introduction to Residential proxies - Bright Data Docs*. https://docs.brightdata.com/proxy-networks/residential/introduction
61. *Proxy-Cheap API documentation*. https://docs.proxy-cheap.com/
62. *NetNut Takedown: What Buyers Need to Know*. https://aimultiple.com/netnut-shutdown
63. *Residential Proxy Documentation*. https://infatica.io/documentation/residential
64. *Bright Data&#039;s Acceptable Use Policy*. https://brightdata.com/acceptable-use-policy
65. *Introduction*. https://help.decodo.com/docs/introduction
66. *Buy Proxy Plans: Flexible Pricing for Residential & Mobile Proxies | Live Proxies*. https://liveproxies.io/pricing?type=enterprise
67. *Meta Terms of Service*. https://www.facebook.com/terms
68. *Overview | Proxy-seller*. https://docs.proxy-seller.com/api-v1/overview
69. *The FBI & Google Disrupt NetNut’s Residential Proxy Network - Proxyway*. https://proxyway.com/news/fbi-google-disrupt-netnut
70. *Mobile Proxies 2026: Full Guide to Real 4G/5G Carrier IPs | Coronium.io | Coronium.io*. https://www.coronium.io/mobile-proxies
71. *Create 3G/4G/5G/LTE Mobile Proxy Farm For $9 Per Month | iProxy Online*. https://iproxy.online/
72. *FAQ - Mobile Proxy & VPN Service - MobileHop*. https://mobilehop.com/faq/
73. *Best 5G/4G/LTE Mobile Proxies — Free Sign-Up | Proxidize*. https://proxidize.com/proxy-server/mobile-proxies
