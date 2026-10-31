# Persistent Cloud Browser Fleets: Costs, Constraints, and Shortlist

## Executive Summary

- **No Fully Qualified Turnkey Winner**: [unverified/needs-validation] No reviewed offering establishes all of your requirements together: months-long identity continuity, your Firefox build, durable state, takeover, guaranteed residential-only platform egress, Vietnam purchasing eligibility, and permission for the proposed account operation -> treat the shortlist as infrastructure candidates, not approved production solutions.
- **Boat Sets The Lowest Published Compute Benchmark**: [official-docs] Boat sells 2,000,000 default VM-seconds for $20, with a half-size 2-vCPU/4-GB option and billing only while running. [6] [estimate] That implies approximately **$0.54/account/month** for 30 active hours on the small size, before any unquoted retention or network charges -> investigate this unusually inexpensive offer first, but do not assume its economics or capacity are contractually guaranteed.
- **Northflank Has Particularly Clear Idle-State Economics**: [official-docs] Pausing stops compute charges while persistent volumes remain billable; published CPU, memory, and disk meters imply approximately **$3.50/account/month** for the baseline below. [5][12] -> shortlist it when custom desktop engineering is acceptable.
- **Daytona And E2B Offer The Most Direct Desktop Paths**: [official-docs] Daytona documents graphical computer use and persistent sandboxes; E2B supplies an Ubuntu desktop/VNC template and indefinite paused retention. [7][72][74][46][1] -> use these as integration baselines rather than building every desktop component yourself.
- **Fleet Size Is Not Concurrent Compute**: [estimate] At one hour daily, 100,000 accounts require approximately **4,167 continuously distributed active environments**, but 100,000 retained states. With a 10-GiB state budget, retained data approaches **977 TiB** -> negotiate stored-environment capacity as well as concurrency.
- **GPU Availability Does Not Establish Durable Desktop Suitability**: [official-docs] Daytona GPU sandboxes are deleted on stop, while ordinary stopped sandboxes retain state. [46][63] [estimate] A GPU product can therefore solve rendering capacity while breaking your persistence model -> test the exact lifecycle and graphics stack, not just the GPU product name.
- **Some Familiar Names Are No Longer Comparable Products**: [official-docs] Cua's current Spaces pricing explicitly excludes rented compute. [34] [independent] Kernel's migration notice reports Scrapybara's desktop/browser shutdown on October 15, 2025. [68] -> do not procure from old cloud-fleet or Scrapybara pricing screenshots.
- **Independent Evidence Supports Caution, Not An Undetectability Ranking**: [independent] Camoufox issue reports describe Linux rendering inconsistencies under Windows/macOS identities and measurable differences in spoofed getters. These are reports, not controlled provider comparisons. [71] -> validate consistency and network isolation without interpreting a fingerprint-test score as platform approval.
- **Commercial Approval Remains A Separate Gate**: [unverified/needs-validation] Vietnam customer acceptance, payment/KYC requirements, and explicit permission for this particular persona-account/multi-account operation are not established for the reviewed providers -> obtain written approval before committing substantial funds.

This is an infrastructure assessment for authorized automation. It is not an assurance that the proposed seller-account operation complies with Facebook or other platforms, and it does not provide a recipe for bypassing their enforcement.


## 1. Thirty Active Hours Changes The Cost Model

### Evidence Grades And Important Unknowns

**[official-docs]** means a provider or project publishes the statement; it does not mean an independent production test confirmed it. **[independent]** covers third-party reports and relevant public issue reports. **[estimate]** identifies calculations, architectural judgments, and engineering effort. **[unverified/needs-validation]** means the relevant fact was not established.

For every provider dossier below, **Commercial-U** explicitly means: Vietnam signup/payment acceptance, KYC details, and permission for the described automation/multi-accounting use case are **not publicly confirmed in the reviewed evidence**. **Detection-U** means no provider-specific, independent comparative evidence was established for Facebook blocking rates, months-long fingerprint continuity, shared canvas output, or residential-IP reputation. These are separate findings for each provider, not assurances of safety.

Likewise, **Reliability-U** means no numerical SLA, measured cold-start distribution, complete status-history analysis, or production API-rate guarantee was established unless a dossier supplies one. An unknown outage history does not mean there were no outages.

### Comparable Baseline And Exclusions

[estimate] The normalized model uses **30 days, 720 calendar hours, 30 active hours/account/month, 2 vCPU, 4 GiB RAM, and 10 GiB retained state/account**. Where a provider forces a different size, the exception is stated. CPU is assumed busy throughout active time for active-CPU meters; actual consumption can be lower. Retained artifact size is a budget assumption, not a claim that every OS image fits in 10 GiB.

[estimate] Estimates exclude residential-proxy charges, taxes, engineering, support contracts, extra backups, image registries, unquoted storage/operations, and network transfer unless explicitly included. Trial credits, promotional discounts, and shared free allowances are generally ignored. Subscription fees are identified separately. **An unquoted charge is not treated as free.**

| Accounts | Active hours/month | Average concurrent, spread across 24 hours | Concurrent if concentrated into 8 hours/day | Retained state at 10 GiB each |
|---:|---:|---:|---:|---:|
| 100 | 3,000 | 5 | 13 | 1,000 GiB |
| 1,000 | 30,000 | 42 | 125 | 10,000 GiB |
| 10,000 | 300,000 | 417 | 1,250 | 100,000 GiB |
| 100,000 | 3,000,000 | 4,167 | 12,500 | 1,000,000 GiB |

[estimate] These are rounded-up scheduling averages, not safe peak-capacity reservations. Retries, login delays, takeover sessions, and uneven regional demand require additional headroom.

[estimate] The useful total-cost-of-ownership equation is:

`fleet cost = active compute + retained disk/snapshots + plan/support fees + storage operations + provider egress + residential-proxy traffic + desktop streaming + engineering/operations`.

[estimate] For perspective, a continuously watched 2-Mbit/s desktop produces approximately **27 GB/account/month** over 30 viewing hours. Viewing only during intervention can materially reduce that component. Platform traffic and the management/streaming channel are different traffic classes; the latter need not traverse the account's residential connection unless you deliberately require it.

### Case Study: Boat Versus Render Is A Lifecycle Decision

[official-docs] Boat says stopping snapshots the environment and pauses billing, with resume in a few seconds. Render prices a 2-CPU/4-GB service at $85/month and persistent disks at $0.25/GB/month. [6][36] [estimate] On the stated assumptions, Boat's small-size runtime is $0.54/month, while an always-allocated Render service plus 10 GB is $87.50/month.

[estimate] This is not a claim that Boat is universally faster or more reliable. It shows why **paying for 30 active hours versus allocating 720 hours** dominates the comparison. Render could become cheaper under a validated suspend/recreate workflow, but that workflow's billing and state guarantees must be established before substituting a 30-hour price into a budget.

**Decision:** prioritize durable stopped-state products before optimizing small differences in hourly CPU prices.


## 2. Desktop-First Candidates And Important Product Changes

Each dossier addresses the ten requested fields separately. Pricing details feed the fleet projection table in Section 7. Implementation effort is an estimate for an experienced engineer, excluding the shared production control plane described later.

### Boat: Low-Cost Persistent Ubuntu With Native Desktop Access

1. **Architecture/access - [official-docs]:** A full persistent Ubuntu VM per workspace, with SSH/SCP, Docker inside the VM, a dedicated IPv4 or IPv6 address, desktop access, snapshots, and forks. [6][38]
2. **Documentation - [official-docs]:** `https://boat.dev/` and `https://boat.dev/persistent-linux-vm-sandbox`. The latter includes the CLI installation entry point; a complete public API reference was not established. [38]
3. **Pricing - [official-docs]:** $20 monthly minimum; $20 buys 2,000,000 default VM-seconds. Small 2-vCPU/4-GB/12-GB disk is 0.5x, default 4/8/50 is 1x, and large 8/16/125 is 2x. Billing is per second while running; seven-day trial. [6] [estimate] Small runtime: **$0.018/hour; $0.54/account/month**. [unverified/needs-validation] Separate stopped-state, snapshot, bandwidth, and overage charges need contractual confirmation.
4. **Geography/commercial - [official-docs]:** Germany, Finland, France; data and snapshots remain in the EU. [6] [unverified/needs-validation] Commercial-U.
5. **Reliability - [official-docs]:** Resume in a few seconds; default one-hour TTL is overrideable. [6] [unverified/needs-validation] Reliability-U otherwise.
6. **Scale - [official-docs]:** Self-service plans span 100-2,000 active sandboxes/account; higher by agreement. [6] [unverified/needs-validation] Retained inactive-environment and API limits are not established.
7. **Capabilities - [official-docs]:** Linux, custom software, persistent filesystem, SSH, desktop, snapshots/forks. [6][38] [unverified/needs-validation] GPU, Windows, Android, media-device behavior, and residential-only egress enforcement are not established.
8. **Integration - [estimate]:** Wrap provisioning/CLI or confirmed API, SSH execution, state IDs, and desktop authorization; install your approved browser image. Approximately 3-7 engineer-days for a prototype.
9. **Detection - [unverified/needs-validation]:** Detection-U; neither a dedicated public IP nor VM isolation establishes residential identity.
10. **Verdict - [estimate]:** **High-priority cost pilot**, conditional on contract, storage retention, API maturity, and quota testing.

### Daytona: Strong Desktop Fit, But GPU Persistence Is Different

1. **Architecture/access - [official-docs]:** Persistent sandboxes with filesystem/process tooling and graphical computer-use/VNC support. Ordinary stopped environments retain identity, filesystem, and configuration. [46][72][7]
2. **Documentation - [official-docs]:** `https://www.daytona.io/docs/en/`, `/docs/en/persistence`, `/docs/en/billing`, `/docs/en/limits`, and `/docs/en/vnc-access`. [46][63][14][72]
3. **Pricing - [official-docs]:** CPU $0.0504/vCPU-hour; RAM $0.0162/GiB-hour; disk $0.000108/GiB-hour, with the first 5 GiB advertised free. Started resources bill CPU/RAM/disk; stopped resources bill disk. [7][63] [estimate] Conservative baseline ignoring the free allowance: **$5.90/account/month**. [official-docs] Windows is listed at $0.0858/vCPU-hour; its relationship to other charges needs clarification before a Windows quote. [7] GPU rates are listed below.
4. **Geography/commercial - [official-docs]:** Current shared-region documentation exposes `us` and `eu`; the homepage additionally names Frankfurt, London, Washington DC, Oregon, and India. GPU placement ignores requested region. [60][7] [unverified/needs-validation] Do not assume every advertised location is selectable for every SKU. Commercial-U.
5. **Reliability - [official-docs]:** 99.95% availability commitment with exclusions; service-credit eligibility is Tier 4 and above, with a maximum 50% monthly credit. The sub-90-ms creation figure is a vendor claim, not a measured desktop-ready time. [66][7]
6. **Scale - [official-docs]:** Regional pooled quotas rise from Tier 1's 10 vCPU/10 GiB/30 GiB disk to Tier 4's 500/1,000/5,000; top-up/verification requirements apply, and custom limits require support. [14] [estimate] At baseline size, Tier 4's CPU pool supports 250 simultaneously active environments, not hundreds of thousands.
7. **Capabilities - [official-docs]:** Linux, Windows, and macOS desktop offerings are advertised; VNC and computer-use APIs support interactive control. GPU sandboxes are ephemeral and deleted on stop; ordinary sandboxes and snapshots offer different persistence semantics. [7][72][46] [unverified/needs-validation] Exact OS/GPU/region combinations and all-traffic proxy guarantees need validation.
8. **Integration - [estimate]:** TypeScript lifecycle adapter, custom image, per-account state/configuration, controlled network egress, signed VNC access, and explicit deletion-policy handling; approximately 2-5 days for a CPU prototype, longer for Windows/GPU.
9. **Detection - [unverified/needs-validation]:** Detection-U. A GPU SKU does not establish that Firefox actually uses hardware rendering.
10. **Verdict - [estimate]:** **Top practical pilot**, especially for a desktop-first adapter. Obtain a separate persistence design for GPU workloads.

### E2B: Clear Pause/Resume Semantics And An Official Desktop Template

1. **Architecture/access - [official-docs]:** Programmable sandboxes with a desktop template, VNC/noVNC, files/process APIs, and network controls. Pause saves filesystem and memory; resume restores state. [74][1][41]
2. **Documentation - [official-docs]:** `https://docs.e2b.dev/`, `https://docs.e2b.dev/template/examples/desktop`, and `https://docs.e2b.dev/sandbox/persistence`. [74][1]
3. **Pricing - [official-docs]:** CPU $0.000014/vCPU-second; RAM $0.0000045/GiB-second; 10-GiB Hobby/20-GiB Pro storage listed free. Hobby has no subscription; Pro $150/month; Pro+ adds $500/month and Pro++ $1,000/month. Enterprise minimum $3,000/month. [11] [estimate] Baseline runtime **$5.118/account/month**, or **$5.27** at 1,000 accounts with one Pro subscription. [unverified/needs-validation] Confirm paused-state storage treatment and any overage/network charges in the commercial order.
4. **Geography/commercial - [unverified/needs-validation]:** Exact selectable regions and Vietnam approval were not established; Commercial-U.
5. **Reliability - [official-docs]:** Paused environments are retained indefinitely without automatic deletion. Pause is approximately four seconds/GiB RAM; resume approximately one second. [1] A published January 13 outage disrupted new and running sandboxes; paused environments/template data were unaffected. [67]
6. **Scale - [official-docs]:** Hobby 20 concurrent/one-hour continuous runtime; Pro 100/24 hours; Pro+ 600, Pro++ 1,100; Enterprise advertises tens of thousands. [11] Pausing resets continuous-runtime limits. [1]
7. **Capabilities - [official-docs]:** Ubuntu desktop, own installed software, persistent paused state, VNC, and outbound allow/deny controls; documentation references SOCKS5 proxy routing. [74][1][41] [unverified/needs-validation] Windows, GPU desktop availability, and complete UDP/DNS/media egress coverage are not established here.
8. **Integration - [estimate]:** TypeScript SDK adapter, desktop template, state IDs, pause scheduling, network restrictions, and authenticated live access; approximately 2-5 prototype days.
9. **Detection - [unverified/needs-validation]:** Detection-U; the desktop template is not an anti-detection certification.
10. **Verdict - [estimate]:** **Top persistence-first pilot**; model the Pro fee, pause overhead, and enterprise quotas explicitly.

### Orgo: Broad OS API, Subscription-Based Capacity

1. **Architecture/access - [official-docs]:** Full cloud desktops over HTTP/VNC, with start/stop/restart, cloning, and computer-control APIs. [45][22]
2. **Documentation - [official-docs]:** `https://docs.orgo.ai/` and `https://docs.orgo.ai/api-reference/introduction`; bearer-authenticated provisioning and action examples are provided. [22][45]
3. **Pricing - [official-docs]:** Hacker $29/month: one computer, 8 GB RAM/40 GB storage; Startup $99: four computers, 32 GB/160 GB pooled; Scale $399: 16 computers, 128 GB/640 GB pooled. Capacity add-ons are listed without public prices. [26] [estimate] Scale's capacity benchmark is **$24.94 per allocated computer/month**, not a 30-hour metered price.
4. **Geography/commercial - [unverified/needs-validation]:** Locations and Commercial-U.
5. **Reliability - [official-docs]:** Computers come online in seconds and run until stopped; some endpoints return 429 and require backoff. [45][22] [unverified/needs-validation] Numerical SLA and complete status history not established.
6. **Scale - [official-docs]:** Public plans include up to 16 computers plus add-ons; maximum fleet size is not established. [26]
7. **Capabilities - [official-docs]:** Linux and Windows self-service; Mac/iPhone by request. API values include Android/iOS, but acceptance of an API value does not establish general availability. Linux GPU options are `2q`/`4q`, with 2/4-GB VRAM; Windows requires licensing or an inclusive plan. [45][22] [unverified/needs-validation] GPU model, BYO proxy enforcement, and persistent-profile slot recycling economics need confirmation.
8. **Integration - [estimate]:** REST adapter, templates, VNC authorization, per-computer configuration and state handling; 2-5 prototype days.
9. **Detection - [unverified/needs-validation]:** Detection-U.
10. **Verdict - [estimate]:** **Good Windows/mobile discovery pilot**, but obtain a fleet quote rather than extrapolating subscription slots as usage-based sandboxes.

### Kernel: Managed Browser Convenience, Not A Confirmed Camoufox VM

1. **Architecture/access - [official-docs]:** Managed browsers with CDP endpoints, live view, computer controls, profiles, and automatic standby. [68]
2. **Documentation - [official-docs]:** `https://www.kernel.sh/docs/`; the migration guide contains concrete create/CDP/live-view/profile examples. [68]
3. **Pricing - [official-docs]:** Free, Hobbyist $30/month, Startup $200/month, Enterprise custom. Usage $0.0000166667/GB-second; idle time is not charged. Included monthly credits are $5/$10/$50 for those first three tiers. [3] [estimate] At an assumed 2-GB browser allocation, runtime is **$3.60/account/month**, or **$3.80** with Startup amortized across 1,000 accounts, before credits and unquoted state charges.
4. **Geography/commercial - [unverified/needs-validation]:** Obtain the region/SKU matrix and Commercial-U; precise selectable locations were not established in the evidence used here.
5. **Reliability - [official-docs]:** Enterprise advertises a 99.9% SLA. [3] [unverified/needs-validation] Measured live-view latency, outage history, and resume distributions are not established.
6. **Scale - [official-docs]:** Five, ten, and 150 concurrent browsers on Free, Hobbyist, and Startup; Enterprise custom. [3]
7. **Capabilities - [official-docs]:** Startup includes BYO proxy, GPU features, regional features, and extensions; live view and upload/download appear in lower tiers. [3] [unverified/needs-validation] Arbitrary Firefox/Camoufox installation and whole-machine network control are not established.
8. **Integration - [estimate]:** Straightforward managed-browser adapter, but your Firefox workflow may require a browser-engine migration; 2-5 days for a compatible browser prototype, substantially more for parity.
9. **Detection - [official-docs]:** Vendor advertises stealth features. [3] [unverified/needs-validation] Detection-U; vendor claims are not independent performance evidence.
10. **Verdict - [estimate]:** **Useful parallel benchmark for Chromium-compatible workloads**, not a demonstrated drop-in replacement for your present browser.

### Hyperbeam: Strong Streaming Features, Commercial Details Unresolved

1. **Architecture/access - [official-docs]:** Embeddable virtual computers driven through a REST API and browser client, with synchronized multi-user interaction. [19][42]
2. **Documentation - [official-docs]:** `https://docs.hyperbeam.com/`; example: `https://github.com/hyperbeam/hello-world`. [42]
3. **Pricing - [unverified/needs-validation]:** Current rates, subscriptions, persistent-state charges, bandwidth, and concurrency charges were not established. **Quote required**; no defensible per-account estimate.
4. **Geography/commercial - [official-docs]:** Advertises worldwide servers without a usable country/SKU list in the reviewed page. [42] [unverified/needs-validation] Commercial-U.
5. **Reliability - [unverified/needs-validation]:** Reliability-U.
6. **Scale - [official-docs]:** Advertises 1-10,000 active participants. [42] [estimate] Participants are not equivalent to isolated account environments.
7. **Capabilities - [official-docs]:** Chrome, Android, Linux/emulator offerings; WebGL support; saved sessions; synchronized audio/video, echo cancellation, and raw media access. [42] [unverified/needs-validation] Own Firefox build, proxy isolation, GPU model, and long-term profile guarantees remain unresolved.
8. **Integration - [estimate]:** REST/session adapter plus embedded viewer; 3-7 prototype days after commercial/API access.
9. **Detection - [unverified/needs-validation]:** Detection-U.
10. **Verdict - [estimate]:** **Streaming specialist to quote**, not yet a budgetable fleet choice.

### Cua: Current Spaces Pricing Is BYO Computer, Not Included Cloud VMs

1. **Architecture/access - [official-docs]:** Computer-use SDK/Driver plus Spaces for watching, taking over, and sharing files on connected machines. [39]
2. **Documentation - [official-docs]:** `https://cua.ai/docs`; SDKs include TypeScript, Python, Swift, and Rust. [39]
3. **Pricing - [official-docs]:** Spaces Free: two live sessions/20 relay hours; Pro $18/month or $180/year: five/200; Teams $30/seat/month or $300/year: five sessions and 200 relay hours per seat, pooled, with 1-100 seats. **The cloud computer is billed separately by its host.** [34]
4. **Geography/commercial - [estimate]:** Determined by your chosen rented host; no hardware purchase is necessary if you use cloud VMs. [unverified/needs-validation] Cua and underlying-host Commercial-U both apply.
5. **Reliability - [official-docs]:** Windows is preview; SSO and audit export are described as not yet included. [34] [unverified/needs-validation] Relay SLA and end-to-end host availability need validation.
6. **Scale - [official-docs]:** Teams self-service stops at 100 seats. [34] [estimate] Forty-two simultaneous live sessions would require nine seats, or $270/month, before host costs; relay-hour accounting must be confirmed for your session pattern.
7. **Capabilities - [official-docs]:** Drives macOS, Windows, and Linux; watch/takeover/files are documented. [39] [estimate] GPU, snapshots, persistent disks, and network enforcement belong to the underlying host.
8. **Integration - [estimate]:** Combine its TypeScript SDK with a separate VM adapter and provisioning system; approximately 3-7 prototype days once the host image works.
9. **Detection - [unverified/needs-validation]:** Detection-U; streaming/control software does not establish a device identity.
10. **Verdict - [estimate]:** **Potential control layer**, not a standalone current compute-price competitor.

### Scrapybara: Do Not Budget From The Old SDK 2.0 Plans

1. **Architecture/access - [independent]:** Kernel's migration guide describes the former browser/desktop service and its replacement API mapping. [68]
2. **Documentation - [official-docs]:** Historical SDK material remains at `https://scrapybara.com/blog/sdk2`; it is not evidence of current service availability.
3. **Pricing - [unverified/needs-validation]:** Old $29/$99 plans are not used in this report's current budget. Obtain direct confirmation before treating any historical price as purchasable.
4. **Geography/commercial - [unverified/needs-validation]:** Current service geography and Commercial-U are unresolved.
5. **Reliability - [independent]:** The migration notice states the virtual desktop/browser service shut down October 15, 2025. [68]
6. **Scale - [unverified/needs-validation]:** No current capacity commitment established.
7. **Capabilities - [unverified/needs-validation]:** Historical features do not establish a current available SKU.
8. **Integration - [estimate]:** Do not build a new dependency without written current-service confirmation.
9. **Detection - [unverified/needs-validation]:** Detection-U.
10. **Verdict - [estimate]:** **Exclude from the active shortlist unless the vendor confirms a replacement service.** The shutdown statement is a competitor's notice, not a first-party service guarantee.

### Case Study: E2B And Daytona Preserve Different Things

[official-docs] E2B explicitly describes preserving both memory and filesystem during pause, with indefinite paused retention. Runloop, by contrast, says suspend/resume preserves disk but not memory and requires daemons to restart. [1][62] [estimate] A browser process that resumes in memory and a newly launched browser opening the same profile are different operational behaviors, even when both are called persistent environments.

[official-docs] Daytona makes a second distinction: GPU sandboxes are deleted on stop, and persistent results need independent storage. [46] [estimate] For your fleet, the procurement question is therefore not simply whether snapshots exist. It is **which exact state survives each billed lifecycle transition**, including filesystem, RAM, credentials, device exposure, and control endpoints. Request and test that lifecycle matrix before choosing a GPU tier.


## 3. Developer Sandboxes That Need A Desktop Layer

### Modal Sandboxes: Flexible GPU Compute, Premium Sandbox Meters

1. **Architecture/access - [official-docs]:** Sandboxes support resource reservations, burst limits, custom execution, and GPU workloads. Billing is per second on the higher of requested and actual resources. [4]
2. **Documentation - [official-docs]:** `https://modal.com/docs/guide/sandboxes`, `https://modal.com/docs/guide/sandbox-resources`, and `https://modal.com/pricing`. [4]
3. **Pricing - [official-docs]:** Sandbox CPU $0.00003942/physical-core-second, where one physical core equals two vCPU; RAM $0.00000667/GiB-second. Volumes $0.09/GiB-month, first 1 TiB free; egress $0.04/GiB. Starter $0, Team $250/month, Enterprise custom; included credits apply. [15] Region selection can add 1.15-1.75x; non-preemptible execution is listed at 3x. [15] [estimate] Baseline **$8.04/account/month before subscription**, ignoring shared allowances.
4. **Geography/commercial - [unverified/needs-validation]:** Obtain exact region availability/pricing and Commercial-U.
5. **Reliability - [official-docs]:** GPU sandboxes are subject to the documented runtime/preemption restrictions. [4] [unverified/needs-validation] Reliability-U otherwise.
6. **Scale - [official-docs]:** Starter 100 containers/10 GPU concurrency; Team 5,000/50; Enterprise custom. [15] [unverified/needs-validation] Confirm these allowances for your exact sandbox product.
7. **Capabilities - [official-docs]:** Linux execution, persistent volumes, GPU sandbox support. [4][15] [estimate] Own Firefox/desktop/VNC is a custom image project. [unverified/needs-validation] Windows and turnkey GUI/media support are not established.
8. **Integration - [estimate]:** API/SDK bridge, image, volume attachment, desktop service, lifecycle, and network policy; 5-10 prototype days.
9. **Detection - [unverified/needs-validation]:** Detection-U; CUDA access does not prove the browser's graphics path.
10. **Verdict - [estimate]:** **Strong specialist GPU option**, but do not use Modal's cheaper function rates to price Sandboxes.

### Vercel Sandbox: High Concurrency, But Not A Ready Desktop

1. **Architecture/access - [official-docs]:** SDK-created sandboxes with custom images, exposed ports, snapshots/drives, and configurable runtime limits. [18]
2. **Documentation - [official-docs]:** `https://vercel.com/docs/sandbox`, `/sandbox/sdk-reference`, and `/sandbox/pricing`.
3. **Pricing - [official-docs]:** Active CPU $0.128/hour; provisioned memory $0.0212/GB-hour; creations $0.60/million; snapshots $0.08/GB-month; drives $0.05/GB-month; drive reads $0.0015/GB and writes $0.004/GB. Default-region rates apply, with regional variation. Pro usage draws against its $20 monthly credit. [18] [estimate] Baseline with a 10-GB retained snapshot: **$11.02 plus plan/operations/network charges**. [unverified/needs-validation] Do not assume that snapshot and drive charges are interchangeable.
4. **Geography/commercial - [official-docs]:** Nineteen regions; default `iad1`. [18] [unverified/needs-validation] Confirm your selected cities and Commercial-U.
5. **Reliability - [official-docs]:** Default timeout five minutes; maximum session duration is plan-dependent. [18] [unverified/needs-validation] Reliability-U otherwise.
6. **Scale - [official-docs]:** Hobby ten concurrent/45-minute sessions; Pro 10,000 concurrent/24-hour sessions; custom Enterprise quotas. [18]
7. **Capabilities - [official-docs]:** Linux/custom-image execution, ports, snapshot/drive storage. [18] [estimate] Desktop/Firefox/live takeover must be built. [unverified/needs-validation] GPU/Windows/Android and whole-machine proxy enforcement not established.
8. **Integration - [estimate]:** Good TypeScript fit, but image, GUI streaming, durable-profile handling, and timeout recovery add work; 5-10 prototype days.
9. **Detection - [unverified/needs-validation]:** Detection-U.
10. **Verdict - [estimate]:** **Viable engineering platform**, not a cost-first desktop leader on published baseline meters.

### Cloudflare Containers / Sandbox SDK: Attractive Control Plane, External State Required

1. **Architecture/access - [official-docs]:** Worker-driven containers with a TypeScript Sandbox SDK; documented persistence mounts object storage into filesystem paths. [43]
2. **Documentation - [official-docs]:** `https://developers.cloudflare.com/sandbox/`, `/containers/`, and `/sandbox/tutorials/persistent-storage/`. [43][8]
3. **Pricing - [official-docs]:** Workers Paid starts at $5/month. Containers meter every 10 ms: CPU $0.000020/vCPU-second, memory $0.0000025/GiB-second, provisioned disk $0.00000007/GB-second after allowances. CPU is active usage; RAM/disk are provisioned. Workers and Durable Objects can add charges. [9] Egress: $0.025/GB North America/Europe, $0.05 selected Asia/Oceania markets, $0.04 elsewhere, with regional allowances. [9] [estimate] A 2-vCPU/8-GiB/16-GB standard-3 instance costs **$6.60 for 30 hours**, plus durable storage and the control plane.
4. **Geography/commercial - [unverified/needs-validation]:** A usable city-level placement guarantee and Commercial-U were not established.
5. **Reliability - [official-docs]:** Billing starts on request/manual start and stops after the container sleeps. [9] [unverified/needs-validation] Reliability-U otherwise; do not substitute the general CDN footprint for sandbox availability.
6. **Scale - [official-docs]:** Account resource pool: 1,500 vCPU, 6 TiB RAM, 30 TB disk; custom sizes up to four vCPU/12 GiB RAM/20 GB disk. [8] [estimate] At standard-3 size the CPU pool permits at most 750 concurrent instances before other constraints.
7. **Capabilities - [official-docs]:** Persistent data through R2/object-storage mounts survives destruction. [43] [estimate] Build a Linux browser/desktop image. [unverified/needs-validation] Browser-profile locking semantics on mounted object storage, GPU, Windows, and full proxy enforcement need validation.
8. **Integration - [estimate]:** TypeScript Worker, Durable Object mapping, image, streaming, and state export/import; 7-15 prototype days.
9. **Detection - [unverified/needs-validation]:** Detection-U.
10. **Verdict - [estimate]:** **Needs development and state-semantics testing**; not a direct persistent-desktop replacement.

### Morph Cloud: Snapshot Primitives And Devboxes Have Different Economics

1. **Architecture/access - [official-docs]:** Programmable devboxes plus lower-level VM instances/snapshots, API keys, and managed SSH keys. [61]
2. **Documentation - [official-docs]:** `https://cloud.morph.so/docs/documentation/overview`, `/docs/devboxes/getting-started`, and `/pricing`. [61][17]
3. **Pricing - [official-docs]:** Standard MCU $0.05; one MCU corresponds to one vCPU-hour/4-GB RAM-hours/16-GB disk-hours. Resource sizing uses the maximum relevant unit count, not an additive CPU-plus-memory charge. Small devbox 2-vCPU/4-GB/40-GB costs three MCU/hour. Team $40/month, Enterprise Scale $250/month, with advertised credit/discount arrangements. [17] [estimate] A 2-vCPU MorphVM baseline starts around **$3/month active compute**, versus **$4.50** for the listed small devbox, before snapshots and plan effects. [official-docs] An example 8-vCPU/8-GB/8-GB snapshot is quoted at $0.12/month; that example must not be substituted for your image. [17]
4. **Geography/commercial - [unverified/needs-validation]:** Region selection and Commercial-U not established.
5. **Reliability - [official-docs]:** Vendor advertises deployment in seconds. [17] [unverified/needs-validation] Reliability-U otherwise.
6. **Scale - [official-docs]:** Devbox concurrency/total counts: Free 8/32, Team 32/128, Enterprise Scale 128/512. MorphVM CPU/RAM/storage pools are separately listed. [17] [estimate] One thousand retained devboxes already exceeds the published total-count tiers.
7. **Capabilities - [official-docs]:** SSH, Linux-oriented environments, snapshot primitives. [61] [estimate] Browser, desktop, and live streaming require image work. [unverified/needs-validation] GPU/Windows/mobile availability and proxy enforcement not established.
8. **Integration - [estimate]:** VM/snapshot API adapter, SSH, image, viewer, and snapshot catalog; 5-10 prototype days.
9. **Detection - [unverified/needs-validation]:** Detection-U.
10. **Verdict - [estimate]:** **Promising snapshot-engine candidate**, but quote the correct product and retained-count limits.

### Runloop: Persistent Disk, Not A Resumed Browser Process

1. **Architecture/access - [official-docs]:** Persistent dev environments with TypeScript lifecycle APIs, SSH identity, snapshots, and suspend/resume. [62]
2. **Documentation - [official-docs]:** `https://docs.runloop.ai/`; pricing at `https://runloop.ai/pricing`. Lifecycle examples include `suspend`, `resume`, and readiness waits. [62]
3. **Pricing - [official-docs]:** Basic free subscription with 100 GB storage; Pro $250/month with 1 TB storage and suspend/resume features. CPU $0.108/CPU-hour, memory $0.0252/GB-hour, devbox storage $0.00034236/GB-hour, snapshot/blueprint/object storage $0.000072/GB-hour, builds $0.252/hour. Usage is per-second. [10] [estimate] Conservative 10-GB retained-devbox budget: **$11.97/account/month plus plan**, ignoring shared free storage; an extra snapshot is additional.
4. **Geography/commercial - [unverified/needs-validation]:** Locations and Commercial-U not established.
5. **Reliability - [official-docs]:** Suspend/resume takes seconds, preserves disk but not RAM; daemons must restart. Suspended devboxes retain storage charges; documentation recommends consistent snapshots. [62]
6. **Scale - [official-docs]:** Trial: three running devboxes, five blueprints, ten snapshots, three objects; paid fleet/API quotas require confirmation. [10]
7. **Capabilities - [official-docs]:** Disk persistence, SSH keys and devbox ID survive suspend/resume. [62] [estimate] Custom Linux desktop/browser/viewer work needed. [unverified/needs-validation] GPU/Windows and media capabilities not established.
8. **Integration - [estimate]:** TypeScript API, blueprint build, state mapping, desktop restart hooks, and viewer; 5-10 prototype days.
9. **Detection - [unverified/needs-validation]:** Detection-U.
10. **Verdict - [estimate]:** **Viable but relatively expensive** for a browser-only workload; price retained disk explicitly.

### CodeSandbox SDK / Together Code Sandbox: Confirm Which Product You Are Buying

1. **Architecture/access - [official-docs]:** Legacy CodeSandbox SDK creates/checkpoints/clones environments. Current Together documentation defines Docker-derived snapshots and running sandboxes with TypeScript/Python SDKs and CLI. [40][2]
2. **Documentation - [official-docs]:** `https://codesandbox.io/docs/sdk`, `https://github.com/codesandbox/codesandbox-sdk`, and `https://docs.together.ai/docs/together-code-sandbox`. [40][2] New integrations are directed to `together-sandbox`. [2]
3. **Pricing - [official-docs]:** CodeSandbox Scale starts at $170/workspace/month; published VM credit price $0.015, with Nano listed at $0.15/hour. Bulk enterprise credits advertise up to 50% off. [13] [estimate] Nano runtime is **$4.50/account/month**, before subscription and unquoted state/network charges. [unverified/needs-validation] Do not assume these legacy workspace prices apply unchanged to the new Together product.
4. **Geography/commercial - [unverified/needs-validation]:** Exact regions, new-product access conditions, and Commercial-U need confirmation.
5. **Reliability - [official-docs]:** Legacy SDK advertises snapshot restore within one second and cloning within two. Current Together sandboxes run until terminated unless TTL/removal is configured; termination discards the filesystem unless snapshotted. [40][2]
6. **Scale - [official-docs]:** Legacy Scale: 250 concurrent VMs, 1,000 creations/hour, 10,000 SDK requests/hour; Enterprise custom. [13] [unverified/needs-validation] Current Together quotas need a separate answer.
7. **Capabilities - [official-docs]:** Docker-derived environments, process/files/ports APIs, configurable resources, snapshot-on-termination. [2] [estimate] Own browser/GUI is image work. [unverified/needs-validation] GPU, Windows, native takeover, and residential-only egress are not established.
8. **Integration - [estimate]:** TypeScript is a natural fit, but select one product/API contract; 5-10 prototype days including desktop streaming.
9. **Detection - [unverified/needs-validation]:** Detection-U.
10. **Verdict - [estimate]:** **Viable after product/pricing clarification**, not an interchangeable legacy/new SDK purchase.

### Blaxel: Fast Standby, But Stored Sandboxes Consume Quota

1. **Architecture/access - [official-docs]:** Instant-launch microVMs with filesystem/process REST APIs, automatic standby, images, volumes, and networking controls. [44]
2. **Documentation - [official-docs]:** `https://docs.blaxel.ai/`; sandbox API, proxy/network, regions, and quota guides are linked from the overview. [44]
3. **Pricing - [official-docs]:** Sandbox meter $0.0000115/GB-RAM-second; snapshots $0.20/GB-month; images $0.045/GB-month; volumes $0.12/GB-month. Suspended time has no compute charge; egress-related features have included/beta pricing that should be contractually checked. [28] [estimate] Four-GB runtime costs $4.968/month; a conservative 14-GB RAM-plus-disk snapshot budget adds $2.80, giving **$7.77**, before image/other charges.
4. **Geography/commercial - [official-docs]:** Region selection is supported. [44] [unverified/needs-validation] Exact current region/capability matrix and Commercial-U need confirmation.
5. **Reliability - [official-docs]:** Vendor claims about five-second idle sleep and approximately 25-ms resume; automatic expiration can delete environments. [28][44] [unverified/needs-validation] These are not measured desktop-ready percentiles.
6. **Scale - [official-docs]:** Advertises 100,000+ concurrent sandboxes at high tiers. Quotas depend on rolling 30-day top-ups; top-ups are **spendable balance, not extra subscription fees**. Inactive standby sandboxes count against quota. [28][24]
7. **Capabilities - [official-docs]:** Full state standby, persistent volumes, networking; default minimal kernel lacks iptables unless enabled at creation. An Android-compatible kernel option is documented for Carbon. [44] [unverified/needs-validation] This does not establish a turnkey Android desktop, GPU rendering, or Windows.
8. **Integration - [estimate]:** TypeScript/REST adapter, image, expiration control, snapshot sizing, desktop service, and network-capability negotiation; 5-10 prototype days.
9. **Detection - [unverified/needs-validation]:** Detection-U.
10. **Verdict - [estimate]:** **Strong high-scale engineering candidate**, subject to retained-state pricing and actual graphics/network behavior.

### Sprites: Persistent Linux Filesystem Without Per-Sprite Subscription

1. **Architecture/access - [official-docs]:** Hardware-isolated Linux environments with persistent ext4 filesystems; idle data moves into durable backing storage. [20]
2. **Documentation - [official-docs]:** `https://sprites.dev/`; overview links CLI reference and quickstart. [20] Pricing is published on Fly's current pricing page. [30]
3. **Pricing - [official-docs]:** Current pricing lists CPU $0.0385/CPU-hour, memory $0.021875/GB-hour, hot storage $0.000683/GB-hour while awake, and cold storage $0.000027/GB-hour while retained; no plans or per-Sprite fee. [30] [estimate] Baseline **$5.33/account/month**. [unverified/needs-validation] Confirm these rates in the order because other published product material has carried different CPU/RAM figures; do not mix them.
4. **Geography/commercial - [unverified/needs-validation]:** Exact region controls and Commercial-U not established.
5. **Reliability - [official-docs]:** Persistent filesystem and rapid wake are advertised. [20] [unverified/needs-validation] SLA and measured wake distributions not established.
6. **Scale - [unverified/needs-validation]:** Maximum retained Sprites, concurrency, and API quotas need confirmation.
7. **Capabilities - [official-docs]:** Persistent Linux/ext4 execution. [20] [estimate] Browser, viewer, and networking integration must be added. [unverified/needs-validation] GPU/Windows/mobile and RAM-state continuity not established here.
8. **Integration - [estimate]:** CLI/API adapter, desktop image, durable profile, signed viewer, and lifecycle watchdog; 5-10 prototype days.
9. **Detection - [unverified/needs-validation]:** Detection-U.
10. **Verdict - [estimate]:** **Worth a persistent-filesystem pilot**, particularly if you want less snapshot orchestration.

### Exe.dev: Persistent KVM VMs, Multiple Billing Models

1. **Architecture/access - [official-docs]:** KVM-isolated VMs with persistent disks and pooled or standalone resource models. [27]
2. **Documentation - [official-docs]:** `https://exe.dev/`, `https://exe.dev/pricing`, `https://exe.dev/usage-pricing`, and the serverful documentation linked from pricing. [33][27]
3. **Pricing - [official-docs]:** Personal $15/month; Work regular $75, introductory $37.50 for three months; standalone 2-vCPU/4-GiB VMs $0.105/hour; additional disk $0.08/GiB-month. A separate usage page quotes CPU $0.05/core-hour and active memory $0.016/GiB-hour, billed by hourly peak, with inactive memory billed at disk prices. [27][33] [estimate] The two models imply approximately **$3.95-$5.72/account/month before applicable plan and idle-memory effects**. They are alternatives, not additive meters.
4. **Geography/commercial - [official-docs]:** Placement controls differ by plan. [27] [unverified/needs-validation] Exact locations and Commercial-U not established.
5. **Reliability - [official-docs]:** Persistent disks included; stopping inactive usage-billed VMs is recommended. [27][33] [unverified/needs-validation] Reliability-U otherwise.
6. **Scale - [official-docs]:** Work pools can reach 512 vCPU/1,024 GiB; standalone VM counts and pooled-VM counts differ. [27] [unverified/needs-validation] Obtain an organization-level quote for thousands of retained VMs.
7. **Capabilities - [official-docs]:** KVM VM/persistent disk. [27] [estimate] Linux desktop/own browser/viewer are an integration project. [unverified/needs-validation] GPU/Windows/Android and full proxy enforcement not established.
8. **Integration - [estimate]:** SSH/API lifecycle bridge, pooled-resource scheduling, image, viewer, and backup handling; 5-10 prototype days.
9. **Detection - [unverified/needs-validation]:** Detection-U.
10. **Verdict - [estimate]:** **Promising persistent-VM alternative**, but billing-model selection matters before comparing headline rates.

### Beam: Price Persistent VMs Separately From Premium Sandboxes

1. **Architecture/access - [official-docs]:** Separate persistent Linux VMs, serverless functions, sandboxes, and GPU machines. [29]
2. **Documentation - [official-docs]:** `https://www.beam.cloud/` and `https://www.beam.cloud/pricing`; sandbox configuration documents resources, images, lifetime, and durable storage. [25]
3. **Pricing - [official-docs]:** Persistent VM CPU $0.0252/vCPU-hour, RAM $0.0054/GiB-hour, 50-GiB root disk included; per-second billing while running, no stopped compute charge. Developer $20/month with $20 credits; Team $89/month plus usage; Growth custom. [29] [estimate] Baseline VM runtime **$2.16/account/month**, or **$2.25** with Team amortized over 1,000 accounts. [official-docs] Sandbox premium CPU/RAM rates differ; storage over 1 TB is $0.021/GB-month, snapshots included, egress advertised free. [29]
4. **Geography/commercial - [unverified/needs-validation]:** Exact VM/GPU regions and Commercial-U need confirmation.
5. **Reliability - [unverified/needs-validation]:** Reliability-U; confirm stopped-root retention and recovery guarantees for the precise VM SKU.
6. **Scale - [official-docs]:** Published plan table lists CPU concurrency 30/1,000/unlimited and GPU 5/50/1,000+. [29] [unverified/needs-validation] Confirm product scope rather than assuming every quota applies to persistent VMs.
7. **Capabilities - [official-docs]:** Linux VMs; GPU sandbox/machine offerings; durable disks have one writable attachment. [29][25] [estimate] Own desktop/browser/live view need development. [unverified/needs-validation] Windows and graphics-display compatibility not established.
8. **Integration - [estimate]:** VM API/SDK bridge, Linux image, lifecycle, viewer, and disk catalog; 5-10 prototype days.
9. **Detection - [unverified/needs-validation]:** Detection-U.
10. **Verdict - [estimate]:** **High-priority low-cost VM pilot**, conditional on confirming the new VM product's quotas and persistence guarantees.


## 4. Container Platforms And Self-Hosted Desktop Software

### Northflank: Clear Persistent-Volume Economics And GPU Options

1. **Architecture/access - [official-docs]:** CPU sandboxes use microVMs; GPU sandboxes use gVisor. API deployment examples support custom images and regional projects. [5]
2. **Documentation - [official-docs]:** `https://northflank.com/docs/v1/application/sandboxes/sandboxes-on-northflank-cloud`; this includes API examples, billing, and GPU-region guidance. [5]
3. **Pricing - [official-docs]:** CPU $0.01667/vCPU-hour; memory $0.00833/GB-hour; disk $0.15/GB-month; egress $0.06/GB; cross-zone transfer $0.02/GB. Second-based prorating, no seat fee; enterprise annual commitments/volume discounts. [12] [estimate] Baseline **$3.50/account/month**.
4. **Geography/commercial - [official-docs]:** Six-plus managed regions and broader BYOC coverage are advertised; GPU projects require compatible regions, such as `asia-southeast`. Project region cannot be moved after creation. Stripe accepts Visa/Mastercard/Amex. [12][5] [unverified/needs-validation] Commercial-U.
5. **Reliability - [official-docs]:** Paused sandboxes stop compute charges, but volumes remain billed; resizing restarts the sandbox and loses ephemeral state. Enterprise offers contractual support/SLA arrangements. [5][12] [unverified/needs-validation] Exact SLA and outage-history findings require the contract/status review.
6. **Scale - [official-docs]:** Pay-as-you-go and custom enterprise/BYOC capacity. [12] [unverified/needs-validation] No binding maximum desktop concurrency established.
7. **Capabilities - [official-docs]:** Linux custom images, durable volumes, GPU plans. [5] [estimate] Own Firefox, VNC/WebRTC, and proxy enforcement need image/network work. [unverified/needs-validation] Windows/Android ready images and graphics-driver behavior not established.
8. **Integration - [estimate]:** TypeScript API, image build, volume-per-account mapping, viewer, pause orchestration, and network acceptance tests; 5-10 prototype days.
9. **Detection - [unverified/needs-validation]:** Detection-U.
10. **Verdict - [estimate]:** **One of the strongest cost/control candidates** if you can own the desktop layer.

### Fly.io Machines: Good VM Primitives, But Do Not Assume GPUs Remain Available

1. **Architecture/access - [official-docs]:** API-managed Machines with persistent volumes and separate stopped-rootfs billing. [16]
2. **Documentation - [official-docs]:** `https://fly.io/docs/machines/`, `https://fly.io/docs/volumes/`, and `https://fly.io/docs/about/pricing/`. [16]
3. **Pricing - [official-docs]:** Performance-1x/4-GB is $0.0591/hour; volumes $0.15/GB-month; stopped rootfs $0.15/GB per 30 days; snapshots $0.08/GB-month after the shared first 10 GB. Dedicated public IPv4 $2/month; static egress $0.005/hour; regional egress $0.02/$0.04/$0.12 per GB. Annual compute reservations advertise 40% off. [16] [estimate] With 10-GB volume and assumed 3-GB stopped rootfs, about **$3.70/account/month**, before backups/network. This size has one performance CPU, not the baseline two-vCPU specification.
4. **Geography/commercial - [unverified/needs-validation]:** Confirm the current CPU-region map, local volume availability, and Commercial-U.
5. **Reliability - [official-docs]:** Volumes are local persistent storage; support plans are separately priced. [16] [unverified/needs-validation] Do not treat a local volume as a multi-region backup or assume an SLA from support availability.
6. **Scale - [official-docs]:** Organizations can face automated scaling limits; contact the address in the limit error to raise them. [16]
7. **Capabilities - [official-docs]:** Linux Machines/volumes. GPU documentation now states GPUs are deprecated and unavailable after August 1; historical setup/region tables should not be used as a current availability promise. [65] [estimate] Custom browser/desktop/viewer needed. [unverified/needs-validation] Windows/mobile and all-protocol proxy behavior not established.
8. **Integration - [estimate]:** Machines API/CLI, per-account volume, lifecycle, signed viewer, and volume backups; 5-10 prototype days.
9. **Detection - [unverified/needs-validation]:** Detection-U; a static Fly egress address remains a hosting-provider address.
10. **Verdict - [estimate]:** **Reasonable CPU-only alternative**; disqualify historical GPU assumptions.

### Koyeb: GPU Catalog Is Attractive, Persistent Volumes Are A Warning

1. **Architecture/access - [official-docs]:** Serverless container services with per-second billing and scale-to-zero. [35]
2. **Documentation - [official-docs]:** `https://www.koyeb.com/docs/`; volume documentation is essential, not optional. [23]
3. **Pricing - [official-docs]:** Pro $29/month plus compute, $10 included; Scale $299 plus compute, $100 included; Enterprise starts at $1,000/month. GPU examples include RTX-4000-SFF-ADA $0.50/hour, L4 $0.70/hour, RTX-A6000 $0.75/hour, and B200 $5.50/hour. [35] [unverified/needs-validation] A complete CPU-plus-persistent-volume quote was not established. Networking table and FAQ carry differing egress figures; confirm the contractual rate. [35]
4. **Geography/commercial - [official-docs]:** Seven managed regions across US/EU/Asia; more on-demand enterprise locations. Persistent volumes are documented only in Washington DC and Frankfurt. [35][23] [unverified/needs-validation] Commercial-U.
5. **Reliability - [official-docs]:** Volume documentation calls the feature public preview and suitable only for testing; local volumes can fail and require backups. [23] [estimate] This is a material mismatch with months-long irreplaceable account state.
6. **Scale - [official-docs]:** Published CPU concurrency 100 on Pro and 1,000 on Scale; GPU 20/40. [35] [unverified/needs-validation] Retained-state and service-count constraints also require a quote.
7. **Capabilities - [official-docs]:** Linux containers and substantial GPU catalog; persistent-volume attachment/mobility has limitations. [35][23] [estimate] Own browser and streaming need development. [unverified/needs-validation] Windows/mobile/full proxy enforcement not established.
8. **Integration - [estimate]:** Container adapter plus desktop and external durable-state backup design; 5-10 prototype days, longer to remove the preview-volume dependency.
9. **Detection - [unverified/needs-validation]:** Detection-U.
10. **Verdict - [estimate]:** **GPU experiment only until persistence is de-risked**, not a first-choice stateful fleet.

### Railway: Service Rates And Sandbox Rates Are Different Products

1. **Architecture/access - [official-docs]:** Usage-metered services and a separate isolated Linux Sandboxes/VMs offering. [32]
2. **Documentation - [official-docs]:** `https://docs.railway.com/`; current pricing: `https://railway.com/pricing`.
3. **Pricing - [official-docs]:** Current page lists Hobby $5 minimum and Pro $20 minimum, with usage credits; services meter CPU at $0.00000772/vCPU-second, RAM $0.00000386/GB-second, volumes $0.00000006/GB-second, egress $0.05/GB. Sandbox CPU and memory are each $0.00001929/unit-second. [32] [estimate] Service baseline **$4.89/account/month**, conditional on a valid stop/state workflow; sandbox runtime alone **$12.50**. [official-docs] Older documentation instead says Pro has no credits and publishes different resource rates. [31] [estimate] Use the current selected SKU/order, not a blended price.
4. **Geography/commercial - [official-docs]:** Global/concurrent-region deployment is advertised. [32] [unverified/needs-validation] Exact locations and Commercial-U need confirmation.
5. **Reliability - [official-docs]:** Pro lists a 99.99% availability target; Enterprise 99.999%. [32] [estimate] A target is not necessarily a compensating SLA.
6. **Scale - [official-docs]:** Pro advertises up to 42 replicas/service and large per-service resource ceilings. [32] [estimate] Replica counts are not a guarantee of thousands of independently retained desktop services.
7. **Capabilities - [official-docs]:** Linux sandbox VMs and persistent service-volume billing. [32] [estimate] Own desktop/browser/viewer needed. [unverified/needs-validation] GPU/Windows/mobile and stopped-volume access semantics need validation.
8. **Integration - [estimate]:** Service or sandbox API adapter, not both accidentally; image, state mount, viewer, lifecycle and quotas; 5-10 prototype days.
9. **Detection - [unverified/needs-validation]:** Detection-U.
10. **Verdict - [estimate]:** **Needs development and pricing clarification**; cheap service meters are not proof of cheap isolated VMs.

### Render: Reliable State Features, Poor Baseline Idle Economics

1. **Architecture/access - [official-docs]:** Paid services/workers can attach persistent disks; custom Docker containers are supported. [21][36]
2. **Documentation - [official-docs]:** `https://docs.render.com/disks` and `https://render.com/pricing`.
3. **Pricing - [official-docs]:** 2-CPU/4-GB service $85/month; disk $0.25/GB-month. Workspace Hobby $0, Pro $25, Scale $499, Enterprise custom; egress over allowance $0.15/GB. [36] [estimate] Conservative continuously allocated baseline **$87.50/account/month**, before workspace/network costs.
4. **Geography/commercial - [official-docs]:** Global region deployment advertised. [36] [unverified/needs-validation] Exact available locations and Commercial-U need confirmation.
5. **Reliability - [official-docs]:** Disk snapshots every 24 hours; only mounted-path changes persist. Attaching a disk prevents zero-downtime deploys. Enterprise contractual SLAs are available. [21][36]
6. **Scale - [official-docs]:** One disk is accessible by one service instance at runtime. [21] [unverified/needs-validation] Desktop service-count quotas need negotiation; workflow-task quotas are not substituted for desktop capacity.
7. **Capabilities - [official-docs]:** Linux/container execution with durable disk. [36][21] [estimate] Desktop/browser/viewer custom-built. [unverified/needs-validation] GPU/Windows/mobile not established.
8. **Integration - [estimate]:** Container API, profile mount, viewer, backup/recovery, and controlled redeploys; 5-10 prototype days.
9. **Detection - [unverified/needs-validation]:** Detection-U.
10. **Verdict - [estimate]:** **Technically possible, economically weak** unless a tested stop/recreate approach changes the allocation model.

### Neko: Useful Open-Source Streaming Layer, Not A Cloud Provider

1. **Architecture/access - [official-docs]:** Self-hosted Docker desktop streaming through WebRTC; supports Linux applications beyond browsers and multi-user access. [70]
2. **Documentation - [official-docs]:** `https://github.com/m1k1o/neko` and `https://neko.m1k1o.net/`; room orchestration is referenced through neko-rooms. [70]
3. **Pricing - [official-docs]:** Apache-2.0 software. [70] [estimate] Hosting, persistent disks, streaming transfer, orchestration, and operations are additional; no standalone cloud price exists.
4. **Geography/commercial - [estimate]:** Inherits the rented host's regions and commercial rules; no physical hardware purchase is required. [unverified/needs-validation] Host Commercial-U remains.
5. **Reliability - [estimate]:** You operate the service and backups; no managed-host SLA follows from the software license.
6. **Scale - [estimate]:** Depends on orchestration, host capacity, room scheduling, and streaming/network load; no binding global capacity promise established.
7. **Capabilities - [official-docs]:** Linux applications, WebRTC, synchronized audio/video, multi-user control. [70] [estimate] Custom Firefox image, persistent mount, and network boundary are your responsibility. [unverified/needs-validation] GPU passthrough/media compatibility must be tested on the host.
8. **Integration - [estimate]:** Room allocator, authentication, one persistent volume per account, session ownership/takeover, and host adapter; 5-10 prototype days plus ongoing operations.
9. **Detection - [unverified/needs-validation]:** Detection-U; streaming pixels does not change the underlying browser's observed environment.
10. **Verdict - [estimate]:** **Good build component**, especially on a low-cost persistent VM/container host, not an independent provider alternative.

### Case Study: Koyeb And Render Show Why Disk Features Matter More Than Marketing Scale

[official-docs] Koyeb's persistent-volume guide explicitly warns that volumes are preview/testing-only and tied to local machines. Render documents daily snapshots, but also single-instance attachment and deployment downtime for disk-backed services. [23][21] [estimate] Both can host browser software; neither statement alone establishes the durable, low-cost, independently resumable account machine you need.

[estimate] The practical outcome is different for each: Koyeb needs a safer state architecture before production, while Render needs a better economic lifecycle before large-scale adoption. A platform's GPU catalog or high aggregate task count does not remove those account-state bottlenecks.


## 5. Additional Candidates And Firecracker-Based Hosting

These are real additional findings, but several remain discovery-stage rather than fully qualified substitutes. Unpublished amounts remain unknown rather than being filled with historical or assumed prices.

### Deno Sandbox: Current Limits Do Not Establish Your One-Hour Session

1. **Architecture - [official-docs]:** Linux microVMs, API-driven through `@deno/sandbox`, with full processes/package managers and Node.js support. [53]
2. **Docs - [official-docs]:** `https://docs.deno.com/sandbox/` and `https://deno.com/deploy/pricing`.
3. **Pricing - [official-docs]:** Pro $20/month, Builder $200; active CPU overage $0.10/hour, memory $0.025/GiB-hour; egress $0.20/GiB beyond allowances. [54] [unverified/needs-validation] Sandbox-specific additional charges and durable-state costs are not fully established. [estimate] Two busy CPUs/four GiB imply $9/month active compute before state/plan costs.
4. **Geography - [official-docs]:** Amsterdam and Chicago in the overview. [53] [unverified/needs-validation] Commercial-U.
5. **Reliability - [official-docs]:** Under-one-second boot claim; Enterprise 99.95% SLA. [53][54] [unverified/needs-validation] Outage history not established.
6. **Scale - [official-docs]:** Current pricing lists three Pro/twenty Builder sandboxes per region; an older overview describes pre-release limits and a 30-minute maximum lifetime. [54][53] [unverified/needs-validation] Obtain a current limit waiver/clarification.
7. **Capabilities - [official-docs]:** Linux, durable-storage access, strict egress policies. [53] [unverified/needs-validation] GPU/Windows/native GUI not established.
8. **Build - [estimate]:** TypeScript adapter and custom desktop, 5-10 days; lifetime remains a blocker.
9. **Detection - [unverified/needs-validation]:** Detection-U.
10. **Verdict - [estimate]:** **Not ready under the documented session limits**; revisit if limits and storage semantics change.

### Hopx: Familiar Resource Rates, Persistent-Desktop Details Missing

1. **Architecture - [official-docs]:** Managed isolated microVMs for code/software execution and stored data. [49]
2. **Docs - [official-docs]:** `https://www.hopx.ai/`, `/pricing`, and `https://hopx.ai/terms`; public API access is advertised. [56][49]
3. **Pricing - [official-docs]:** No subscription/minimum; per-second CPU $0.000014/vCPU, RAM $0.0000045/GiB, disk $0.00000003/GiB. [56] [estimate] Baseline $5.90/month if 10 GiB can remain durably stored and billed for the month. [unverified/needs-validation] Snapshot, network, and stopped-retention treatment need confirmation. The page's simplified examples should not override its detailed meters. [56]
4. **Geography - [unverified/needs-validation]:** Exact regions and Commercial-U not established.
5. **Reliability - [official-docs]:** Terms target high availability but apply an SLA only when incorporated into the plan/order; status at `https://status.hopx.ai`. [49]
6. **Scale - [official-docs]:** Advertises unlimited sandboxes. [56] [unverified/needs-validation] Binding active/stored quotas and rate limits unknown.
7. **Capabilities - [official-docs]:** Filesystem, background execution, streaming, API. [56] [unverified/needs-validation] GUI, GPU, Windows and long-term profiles not established.
8. **Build - [estimate]:** Desktop/image/API adapter, 5-10 days after confirming access.
9. **Detection - [unverified/needs-validation]:** Detection-U.
10. **Verdict - [estimate]:** **Discovery-stage alternative**, not yet a qualified persistent desktop.

### Alibaba Cloud AgentBay: Important Windows/Mobile Coverage, Session Deletion Risk

1. **Architecture - [official-docs]:** Managed browser, computer, mobile, and code environments; Playwright/Puppeteer browser integration and customized Windows/Linux computer images. [50]
2. **Docs - [official-docs]:** `https://www.alibabacloud.com/help/en/agentbay/`; product overview and billing instructions are linked in References.
3. **Pricing - [official-docs]:** Basic free, Pro $149/month, Ultra $225/month; CPU $0.027/core-hour, RAM $0.0113/GB-hour, storage overage $0.000045/GiB-hour. Basic includes 100 GiB, paid plans 1 TiB. Credits $0.0267; premium inbound bandwidth $0.123/GB. [51] [estimate] Thirty-hour baseline with gross 10-GiB storage: $3.30 plus plan. **A continuously retained running session instead costs about $71.75/month before plan/network**, because idle sessions remain billed.
4. **Geography - [official-docs]:** Singapore deployment stated. Trial requires an Alibaba Cloud account, is once per account, and excludes RAM users. [50] [unverified/needs-validation] Vietnam account/product eligibility and Commercial-U need confirmation.
5. **Reliability - [official-docs]:** Running undeleted sessions bill even when idle; pay-as-you-go cannot be paused. [51] [unverified/needs-validation] General product SLA/status findings not established.
6. **Scale - [official-docs]:** Basic ten concurrent; Pro/Ultra 200. Ultra supports additional concurrency at $1.50/concurrent-session/month. [51]
7. **Capabilities - [official-docs]:** Windows/Linux and mobile use; Ultra advertises device-fingerprint features and custom images. [50][51] [unverified/needs-validation] GPU, exact mobile OS/device fidelity, takeover/media, proxy enforcement, and state restoration after deletion need testing.
8. **Build - [estimate]:** SDK/API adapter plus durable context/image lifecycle and viewer validation; 5-10 days for a prototype, longer for cross-mobile parity.
9. **Detection - [unverified/needs-validation]:** Detection-U; advertised fingerprint features are not independent evidence.
10. **Verdict - [estimate]:** **High-priority Windows/mobile evaluation**, but only cheap if deletion/recreation preserves the required account state.

### Runpod: A GPU Pool, Not A Guaranteed Graphics Desktop

1. **Architecture - [official-docs]:** GPU Pods with separate local, persistent, network, and global storage choices. [57][55]
2. **Docs - [official-docs]:** `https://www.runpod.io/pricing`; storage documentation is in References.
3. **Pricing - [official-docs]:** Listed Pod examples include RTX A5000 $0.27/hour, RTX 4090 $0.89/hour, RTX Pro 6000 $2.49/hour. Network volume $0.07/GB-month; local volume $0.10 running/$0.20 stopped. [57][55] [estimate] A5000 plus 10-GB network state starts at **$8.80/account/month**, or $27.40 on the listed RTX 4090, before container-disk/other charges.
4. **Geography - [official-docs]:** Advertises 30-plus regions. [57] [unverified/needs-validation] Exact GPU/network-volume pairing and Commercial-U need confirmation.
5. **Reliability - [official-docs]:** Container disk is lost on stop/restart; `/workspace` survives stops but not Pod deletion; network volumes persist independently. Reserved clusters advertise SLA-backed availability. [55][57]
6. **Scale - [official-docs]:** Large GPU catalog; clusters up to 64 GPUs are advertised. [57] [unverified/needs-validation] That is not a reserved quota for thousands of interactive desktops.
7. **Capabilities - [official-docs]:** GPU compute and persistent network volumes. [57][55] [estimate] Linux desktop/browser/streaming must be built. [unverified/needs-validation] Display-driver, GPU encoding, Windows/mobile and all-traffic proxy suitability need validation.
8. **Build - [estimate]:** GPU desktop image, Pod adapter, network-volume mapping and streaming; 7-15 prototype days.
9. **Detection - [unverified/needs-validation]:** Detection-U; real GPU hardware is not a consumer-device identity guarantee.
10. **Verdict - [estimate]:** **Specialist GPU test pool**, not the cheapest default for every account.

### Vultr: Conventional Compute And GPU Alternatives

1. **Architecture - [official-docs]:** VM and GPU catalog with hourly on-demand billing. [59]
2. **Docs - [official-docs]:** `https://www.vultr.com/pricing`; provision/API details need separate integration validation.
3. **Pricing - [official-docs]:** Example 2-vCPU/8-GB VM $0.060/hour; 10-GB block storage $1/month; automatic backups add 20% to base instance fees. [59] [estimate] Conservative 720-hour allocation plus 10-GB storage is **$44.20/account/month**. A $2.80 active-only arithmetic result is not used because a state-preserving no-compute-charge stop workflow was not established.
4. **Geography - [official-docs]:** Pricing can vary by location. [59] [unverified/needs-validation] Exact applicable cities and Commercial-U need confirmation.
5. **Reliability - [unverified/needs-validation]:** SLA, status history, stop-billing behavior and boot distribution not established here.
6. **Scale - [unverified/needs-validation]:** Organization limits and capacity reservations need a quote.
7. **Capabilities - [official-docs]:** VM/block storage and GPU catalog. [59] [unverified/needs-validation] Exact OS licensing, graphics, snapshots and streaming combinations need confirmation.
8. **Build - [estimate]:** Conventional VM image/SSH/API/viewer adapter, 5-10 prototype days.
9. **Detection - [unverified/needs-validation]:** Detection-U.
10. **Verdict - [estimate]:** **Useful conventional-host benchmark**, particularly where broader OS/region choices can be contracted.

### Scaleway: European VMs With Included Egress

1. **Architecture - [official-docs]:** European virtual-instance catalog with separate storage/IPv4 charges. [58]
2. **Docs - [official-docs]:** `https://www.scaleway.com/en/pricing/virtual-instances/`.
3. **Pricing - [official-docs]:** BASIC3-X2C-4G is EUR 0.03945/hour; prices exclude tax, storage and attached IPv4, but include egress and IPv6. [58] [estimate] Conservative 720-hour compute is **EUR 28.40/account/month plus storage/IP**. A 30-hour EUR 1.18 compute result is conditional on a validated delete/recreate-state workflow and is not a confirmed total.
4. **Geography - [official-docs]:** European data centers; the reviewed price selection uses PAR-1. [58] [unverified/needs-validation] Full availability matrix and Commercial-U need confirmation.
5. **Reliability - [unverified/needs-validation]:** SLA/status/boot and stopped-instance billing not established in this evidence.
6. **Scale - [unverified/needs-validation]:** Fleet/API quotas require a quote.
7. **Capabilities - [official-docs]:** Compute/storage/IPv6 choices. [58] [unverified/needs-validation] Specific OS/GPU/desktop-streaming combinations need confirmation.
8. **Build - [estimate]:** VM/API/image/viewer adapter, 5-10 prototype days.
9. **Detection - [unverified/needs-validation]:** Detection-U.
10. **Verdict - [estimate]:** **European conventional-VM option**, not yet a fully priced low-duty-cycle desktop.

### Hetzner: Worth A Quote, But No Verified Numeric Price In This Evidence

1. **Architecture - [official-docs]:** Shared or dedicated-vCPU cloud servers. [52]
2. **Docs - [official-docs]:** `https://www.hetzner.com/cloud/pricing/`; account provisioning through Hetzner Console is described. [52]
3. **Pricing - [unverified/needs-validation]:** The reviewed page did not expose reliable numeric SKU prices. Compute, snapshots, volumes, IP and transfer overages need a current quote; no invented per-account cost is supplied.
4. **Geography - [official-docs]:** Worldwide locations are advertised. [52] [unverified/needs-validation] Exact selected region, Vietnam payment/KYC and Commercial-U need confirmation.
5. **Reliability - [official-docs]:** 99.9% uptime SLA and 24/7 support advertised. [52] [unverified/needs-validation] Actual incident history and restoration performance not established.
6. **Scale - [unverified/needs-validation]:** Organization/server limits and reserved fleet capacity need approval.
7. **Capabilities - [official-docs]:** Ubuntu, Debian, Fedora and other Linux distributions. [52] [estimate] Own browser/desktop feasible as a custom image project. [unverified/needs-validation] GPU/Windows/mobile and streaming packages not established.
8. **Build - [estimate]:** VM API, SSH, image, volumes, viewer, and backup automation; 5-10 prototype days.
9. **Detection - [unverified/needs-validation]:** Detection-U.
10. **Verdict - [estimate]:** **Useful rented-VM price negotiation candidate**, but not numerically ranked without a verified quote.

### Polaris: Per-Second Capacity, Desktop Suitability Unresolved

1. **Architecture - [official-docs]:** Sandbox/direct capacity with named-computer capabilities and runtime guardrails. [48][47]
2. **Docs - [official-docs]:** `https://polaris.computer/` and `/pricing`.
3. **Pricing - [official-docs]:** Per-second running-time billing; stopped metering ceases. Direct H100 capacity starts at $4.31/hour. [48] [estimate] Thirty GPU hours alone are **$129.30/account/month**, before state/other resources; ordinary CPU desktop pricing is not established.
4. **Geography - [unverified/needs-validation]:** Locations and Commercial-U unknown.
5. **Reliability - [unverified/needs-validation]:** SLA/status/persistence guarantees unknown.
6. **Scale - [unverified/needs-validation]:** Fleet and API quotas unknown.
7. **Capabilities - [official-docs]:** Computer/filesystem capabilities advertised. [47] [unverified/needs-validation] Exact OS, browser installation, VNC, snapshots, GPU graphics and proxy control unknown.
8. **Build - [estimate]:** Discovery/API/image work before a reliable effort estimate; allow at least a multi-day technical spike.
9. **Detection - [unverified/needs-validation]:** Detection-U.
10. **Verdict - [estimate]:** **Watchlist**, not a cost-first shortlist entry.

### Firecracker-Based Hosts And CubeSandbox Are Not A Single Purchasable Service

1. **Architecture - [official-docs]:** CubeSandbox's architecture describes a RustVMM/KVM VMM, VM lifecycle/snapshots, and a separate Linux kernel per sandbox. [73]
2. **Docs - [official-docs]:** `https://github.com/TencentCloud/CubeSandbox`; architecture source is linked in References.
3. **Pricing - [estimate]:** Open-source VMM/runtime architecture does not supply a hosted compute price; rented host, durable disks, networking, backups and operations determine TCO.
4. **Geography - [estimate]:** Determined by the rented infrastructure. [unverified/needs-validation] Commercial-U applies to that host.
5. **Reliability - [estimate]:** You operate the lifecycle/control plane and recovery unless a managed host contracts for it.
6. **Scale - [estimate]:** Bound by physical host capacity, VM density, storage IOPS, orchestration and host quotas; a framework has no global capacity commitment.
7. **Capabilities - [official-docs]:** Kernel isolation and snapshot/restore primitives are documented. [73] [unverified/needs-validation] Windows, Android, GPU passthrough, desktop streaming and provider-specific deployment rights are not established by those primitives.
8. **Build - [estimate]:** Several weeks for an initial production-oriented multi-host system, substantially more than adapting an existing managed desktop.
9. **Detection - [unverified/needs-validation]:** Detection-U. Strong tenant isolation is a security property, not an anti-fingerprinting property.
10. **Verdict - [estimate]:** **Longer-term infrastructure strategy**, not the fastest route from one Windows PC. Renting permitted cloud capacity can satisfy the no-hardware-purchase constraint; verify nested-virtualization/KVM rights first.

**Decision:** keep conventional VM and GPU providers as negotiating alternatives, but do not let an incomplete 30-hour compute calculation masquerade as a complete persistent-environment price.


## 6. Integration, Network Acceptance, And Independent Evidence

### A Provider Adapter Must Preserve Logical Account State, Not Promise Identical Hardware

[estimate] Build one capability-aware adapter interface around `create`, `start`, `pauseOrStop`, `resume`, `exec`, `openView`, `snapshot`, `exportState`, `importState`, and `delete`. Record whether each operation preserves disk, RAM, local device exposure, credentials, and environment identity. A common interface must not hide differences such as Runloop's disk-only resume or Daytona's ephemeral GPU stop behavior. [62][46]

[estimate] Keep an encrypted per-account manifest containing the approved OS/browser build, profile location, state-generation/version, locale/time-zone configuration, proxy-secret reference, provider IDs, snapshot IDs, and retention policy. Keep credentials out of images and logs. Treat provider migration as a tested cutover, not an assurance that a restored profile produces the same hardware fingerprint on a different host.

[estimate] Expected effort for one experienced engineer is approximately 2-5 days for a native desktop proof of concept, 5-10 days for a custom Linux desktop adapter, and 7-15 days for a GPU/media prototype. A shared production control plane - scheduling, locks, encrypted state, backups, billing limits, alerting and recovery - is a separate **3-6-week initial project**, not included in those adapter estimates. These are planning estimates, not delivery commitments.

### Residential-Only Platform Egress Is An Acceptance Test, Not A Checkbox

[official-docs] E2B exposes outbound restrictions and references SOCKS5 routing; Blaxel documents proxy/network controls but notes that iptables support is not enabled by default. [41][44] [estimate] Those features are useful building blocks, but neither statement proves that your exact image, browser, resolver, media stack and auxiliary processes cannot fall back to a host IP.

[estimate] For authorized workloads, require fail-closed network acceptance tests covering browser traffic, background requests, DNS, IPv4/IPv6 and media-related paths, plus behavior when the configured proxy fails. Separate management-plane access from platform traffic. A provider should not be marked compliant merely because it accepts a Playwright proxy option.

[unverified/needs-validation] No reviewed provider establishes ownership, city stability, session persistence, or reputation for your current residential-proxy supply. Host region and residential exit location are separate attributes. [estimate] Choose host proximity to reduce latency where useful, but do not assume placing a VM in Ireland makes its hosting IP residential.

### What Independent Evidence Actually Says

| Evidence | Grade | Supported conclusion | What it does not establish |
|---|---|---|---|
| SwiftShader project describes a CPU implementation of Vulkan intended for hardware independence. [64] | [official-docs] | Software rendering is a real, identifiable graphics configuration. | That every software-rendered browser is a VM, or that every VM produces identical pixels. |
| Camoufox issue reports describe Windows/macOS identities rendering text/codecs/colors as Linux. [71] | [independent] | Cross-layer consistency is a reported concern. | A measured failure rate for Boat, E2B, Daytona, or another host. |
| Camoufox reports mention measurable spoofed-getter timing and worker/font inconsistencies. [71] | [independent] | Browser-level modifications can expose additional inconsistencies. | That a GPU or proxy removes these inconsistencies. |
| CreepJS says it researches weaknesses/privacy leaks in anti-fingerprinting browsers and tests many browser/runtime surfaces. [69] | [independent] | It is useful for repeatable consistency/privacy observations. | That its score predicts Facebook acceptance or certifies an account operation. |

[estimate] Your original rendering concern is directionally sensible, but the strongest defensible formulation is narrower: software rendering and contradictory environment surfaces **may** expose unusual configurations. The evidence does not justify declaring all GPU-less VMs identical, every spoofed renderer detectable, or any provider undetectable.

[estimate] Use permitted internal tests to compare your current approved baseline against candidate images before and after stop/resume, migration and maintenance. Measure correctness, privacy leakage, resource stability, crash rate and recovery, not only fingerprint entropy. Do not use a single test-page result as a substitute for platform authorization.

### Case Study: E2B's Outage And Fly's GPU Notice Expose Different Reliability Risks

[official-docs] E2B's postmortem reports control-plane scheduling/quorum problems after a production rollout, with new sandbox creation failures and malfunctions in already-running sandboxes; paused sandboxes and template data were unaffected. [67] [estimate] The lesson is to distinguish **control-plane availability, running-session availability, and durable-state survival**. A provider can fail the first two without losing saved state, which supports a recovery design but still interrupts work.

[official-docs] Fly's GPU guide retains historical setup instructions while prominently stating GPU deprecation/unavailability after August 1. [65] [estimate] This is a different failure mode: documentation longevity is not a product-lifecycle commitment. For a months-long environment fleet, require notice periods, export rights, supported image lifetimes and capacity commitments, not just an uptime percentage.

**Decision:** keep an independently restorable state copy, test recovery on a second provider, and contract for product continuity. The aim is resilience, not rapid identity rotation.


## 7. Published Rates And Fleet Projections

### GPU And OS Features Need Their Own Quote

| Provider | Published GPU examples | Windows/mobile position | Key qualification |
|---|---|---|---|
| Daytona | [official-docs] Preemptible RTX 4090 $0.57/h, RTX 5090 $0.74/h, RTX Pro 6000 $1.74/h, H100 $2.27/h, H200 $2.61/h, MI355X $3.44/h, B200 $3.59/h, B300 $4.08/h. [7] | [official-docs] Windows/macOS advertised. [7] | [official-docs] GPU deleted on stop; placement differs. [46][60] |
| Modal | [official-docs] T4 $0.000164/s, L4 $0.000222/s, A10 $0.000306/s; larger accelerators up to B300 $0.001972/s. [15] | [unverified/needs-validation] No Windows desktop established. | [official-docs] Sandbox CPU/RAM premium and GPU-runtime restrictions apply. [15][4] |
| Northflank | [official-docs] L4 $0.80/h; A100 40/80 GB $1.42/$1.76; H100 $2.74; RTX Pro 6000 $3.00. [12] | [unverified/needs-validation] Windows/mobile desktop not established. | [official-docs] GPU region and gVisor constraints. [5] |
| Koyeb | [official-docs] RTX-4000-SFF-ADA $0.50/h; L4 $0.70; RTX-A6000 $0.75; B200 $5.50. [35] | [unverified/needs-validation] Not established. | [official-docs] Persistent-volume preview caveat. [23] |
| Beam | [official-docs] On-demand machine examples: RTX 4090 $0.44/h, H100 $1.83/h, B200 $4.11/h; serverless/sandbox rates are separate. [29] | [official-docs] Persistent VMs described as Linux. [29] | [unverified/needs-validation] Product-specific graphics and VM quota compatibility. |
| Runpod | [official-docs] A5000 $0.27/h, RTX 4090 $0.89/h, RTX Pro 6000 $2.49/h. [57] | [unverified/needs-validation] Exact supported desktop OS combinations not established. | [official-docs] Select storage carefully; Pod deletion differs from stop. [55] |
| Orgo | [official-docs] Linux `2q`/`4q` GPU profiles; prices/model not established. [22] | [official-docs] Windows self-service; Mac/iPhone request-based; Android/iOS API values require availability confirmation. [45][22] | [estimate] Obtain OS/license/GPU combinations in writing. |
| Kernel | [official-docs] GPU features on Startup; model/extra pricing not established. [3] | [unverified/needs-validation] Arbitrary OS/Firefox guest not established. | [estimate] Managed browser, not proven full custom desktop. |
| Hyperbeam | [official-docs] WebGL support; hardware model/price not established. [42] | [official-docs] Chrome/Android/Linux/emulators advertised. [42] | [unverified/needs-validation] Exact custom-browser and proxy controls. |
| Fly Machines | [official-docs] GPU service marked deprecated/unavailable after August 1. [65] | [unverified/needs-validation] Windows/mobile not established. | [estimate] Treat as CPU-only unless Fly supplies a current replacement contract. |

[estimate] These GPU prices are not interchangeable desktop totals. Some include machine resources, some require additional CPU/RAM, some are preemptible, and none establishes that your browser uses a compatible hardware-accelerated display stack.

### Monthly Fleet Costs: Bases, Not Procurement Quotes

[estimate] All USD figures below use the model in Section 1, rounded. **U** means additional unquoted charges; **S** means retained-state pricing not established; **P/Q** means applicable plan or negotiated contract. All large-fleet extrapolations are conditional on quota/capacity approval and unchanged rates, not claims that the fleet is self-service purchasable.

[estimate] E2B uses Pro at 100/1,000 accounts, Pro+ at 10,000, and a quote at 100,000. Modal and Beam examples amortize Team plans; shared credits/free storage are ignored. Runloop includes gross retained-devbox disk and Pro, ignoring shared allowances. Railway's service figure is conditional on the stop/state implementation. Boat excludes unquoted retention/network charges.

| Provider / model | 100 accounts | 1,000 accounts | 10,000 accounts | 100,000 accounts |
|---|---:|---:|---:|---:|
| Boat small | $54 + U | $540 + U | $5,400 + U | $54,000 + U/Q |
| Beam persistent VM + Team | $305 + U | $2,249 + U | $21,689 + U | $216,000 + Q/U |
| Northflank | $350 + U | $3,500 + U | $35,000 + U | $350,000 + U/Q |
| MorphVM active compute | $300 + S/P | $3,000 + S/P | $30,000 + S/Q | $300,000 + S/Q |
| Fly performance-1x/4-GB exception | $370 + U | $3,704 + U | $37,043 + U | $370,425 + U/Q |
| Kernel, assumed 2-GB browser | $560 + U | $3,800 + U | $36,000 + Q/U | $360,000 + Q/U |
| CodeSandbox legacy Nano | $620 + U | $4,670 + U | $45,000 + Q/U | $450,000 + Q/U |
| Railway services, conditional | $489 + U | $4,890 + U | $48,902 + U/Q | $489,024 + U/Q |
| E2B | $662 + U | $5,268 + U | $51,830 + U | $511,800 + Q/U |
| Sprites | $533 + U | $5,334 + U | $53,343 + U | $533,430 + U/Q |
| Daytona, conservative disk | $590 + U | $5,896 + U | $58,956 + U | $589,560 + U/Q |
| Hopx, conditional retained disk | $590 + U | $5,896 + U | $58,956 + U | $589,560 + U/Q |
| Cloudflare standard-3 compute | $665 + S/U | $6,606 + S/U | $66,015 + S/U/Q | $660,101 + S/U/Q |
| Blaxel, assumed 14-GB snapshot | $777 + U | $7,768 + U | $77,680 + U | $776,800 + U/Q |
| Modal Sandboxes + Team | $1,054 + U | $8,289 + U | $80,638 + U | $804,130 + U/Q |
| Vercel + 10-GB snapshot | $1,102 + P/U | $11,024 + P/U | $110,240 + P/U | $1,102,400 + Q/U |
| Runloop + Pro, gross storage | $1,447 + U | $12,219 + U | $119,940 + U | $1,196,899 + U/Q |
| Orgo, prorated Scale capacity benchmark | $2,494 + U | $24,938 + U | $249,375 + U/Q | $2,493,750 + U/Q |
| Exe.dev, alternative published meters | $395-$572 + P/U | $3,950-$5,720 + P/U | $39,500-$57,200 + Q/U | $395,000-$572,000 + Q/U |
| AgentBay, conditional delete/restore workflow | $479 + U | $3,449 + U | $33,551 + U | $336,176 + U/Q |
| AgentBay, continuously retained running sessions | $7,324 + U | $71,897 + U | $717,480 + Q/U | $7,174,800 + Q/U |
| Runpod A5000 + network state, lower bound | $880 + U | $8,800 + U | $88,000 + U/Q | $880,000 + U/Q |
| Vultr, always-allocated example | $4,420 + U | $44,200 + U | $442,000 + U/Q | $4,420,000 + U/Q |
| Render, always allocated | $8,750 + P/U | $87,500 + P/U | $875,000 + Q/U | $8,750,000 + Q/U |
| Scaleway, always-allocated compute only | EUR 2,840 + S/U | EUR 28,404 + S/U | EUR 284,040 + S/U/Q | EUR 2,840,400 + S/U/Q |
| Deno active compute only, not qualified | $900 + S/P/U | $9,000 + S/P/U | $90,000 + S/Q/U | $900,000 + S/Q/U |
| Polaris H100 compute only | $12,930 + S/U | $129,300 + S/U | $1,293,000 + S/Q/U | $12,930,000 + S/Q/U |
| Cua Spaces | Host cost + relay/seats | Host cost + approximately $270 for 42 simultaneous views | Host cost + seat/relay quote | Host cost + custom quote |
| Hyperbeam / Hetzner | Quote | Quote | Quote | Quote |
| Neko / self-hosted VMM | Host + storage + transfer + operations | Same model | Same model, negotiated capacity | Same model, negotiated capacity |
| Scrapybara | No current purchasable price established | Same | Same | Same |

[estimate] The table's most important contrast is between confirmed stopped-compute economics and conditional delete/recreate economics. AgentBay illustrates the risk: $3.30 of monthly resource arithmetic is irrelevant if the required identity cannot survive deleting the session and the real alternative is a running environment billed all month.

[estimate] At 1,000 accounts, $1/account/month is $1,000/month. A small provider-price advantage can disappear behind residential bandwidth, state growth, support, or one additional engineering burden. Request a representative invoice simulation with your actual profile size and viewing pattern before committing.


## 8. Synthesis: Final Comparison And Ranked Shortlist

### Compare Economics, Continuity, Control, And Contracted Scale

[estimate] Desktop-native services minimize integration effort, but their subscription slots or managed-browser restrictions may dominate cost. Developer sandboxes offer better programmable lifecycle control, but you supply the desktop and network acceptance layer. Conventional VMs offer broad machine control, but can be expensive when inactive allocation remains billed. GPU clouds offer accelerators, not automatically persistent consumer-like desktops.

[estimate] The non-obvious tension is that **portability and identity continuity pull in different directions**. Exportable filesystem state helps provider portability, but does not preserve the physical GPU, driver, kernel, virtual devices, media stack, or every browser-observed surface. Likewise, very fast RAM snapshot/resume can improve continuity while increasing retained-state cost and stored-environment quota pressure.

[estimate] The following table is an infrastructure-readiness comparison, not a detection ranking. **BYO proxy: Build** means a possible custom integration, not a proven whole-environment guarantee. **U** means unverified. Costs are the estimated per-account base at 1,000 accounts; suffixes retain the exclusions above. No provider is marked fully ready-now for all your hard constraints.

| Provider | Monthly base/account at 1,000 | Regions established here | OS established here | GPU | BYO proxy / all-traffic guarantee | Live view / takeover | Published scale signal | Readiness |
|---|---:|---|---|---|---|---|---|---|
| Boat | $0.54 + U | Germany, Finland, France | Ubuntu | U | Build / U | Native desktop | 100-2,000 active; higher agreed | needs-testing |
| E2B | $5.27 + U | U | Ubuntu desktop | U | Documented routing/controls / U | VNC/noVNC | 100 Pro; 600/1,100 upgrades; Enterprise higher | needs-testing |
| Daytona | $5.90 + U | Shared US/EU; broader advertised locations | Linux, Windows, macOS advertised | Yes, SKU dependent | Build / U | VNC/computer use | Resource-tier pools; custom above | needs-testing |
| Modal Sandboxes | $8.29 + U | Quote selected region | Linux execution | Yes | Build / U | Build | Team 5,000 containers/50 GPUs; confirm sandbox scope | needs-dev |
| Fly Machines | $3.70 + U; CPU-size exception | Confirm current map | Linux | Deprecated GPU offering | Build / U | Build | Organization approval | needs-dev |
| Vercel Sandbox | $11.02 + P/U | 19 regions | Linux/custom images | U | Build / U | Build | Pro 10,000 concurrent | needs-dev |
| Cloudflare | $6.61 + S/U; larger RAM size | Placement guarantee U | Linux containers | U | Build / U | Build | 1,500-vCPU/6-TiB pool | needs-dev |
| Northflank | $3.50 + U | 6+ managed; GPU region-specific | Linux | Yes | Build / U | Build | Custom/BYOC; no binding maximum established | needs-dev |
| Morph Cloud | $3.00 + S/P, MorphVM | U | Linux-oriented | U | Build / U | Build | Devboxes 128 active/512 total on listed top tier; VM quotas separate | needs-dev |
| Runloop | $12.22 + U | U | Linux-oriented | U | Build / U | Build | Paid quote; trial 3 active | needs-dev |
| CodeSandbox/Together | $4.67 + U, legacy price only | U | Docker-derived environments | U | Build / U | Build | Legacy 250 concurrent; new quotas separate | needs-dev |
| Kernel | $3.80 + U, assumed 2 GB | Region features; exact map U | Managed browser | Startup feature | BYO on Startup / U | Native live view | 150 Startup; Enterprise quote | needs-dev for Camoufox |
| Blaxel | $7.77 + U | Region-selectable; exact map U | Linux; Android-kernel option | U | Documented controls / U | Build | 100,000+ advertised; standby counts | needs-dev |
| Koyeb | Quote | 7 managed; volumes DC/Frankfurt | Linux containers | Yes | Build / U | Build | 100/1,000 CPU concurrency; 20/40 GPU | needs-testing; storage caveat |
| Railway | $4.89 + U conditional; VM meter higher | Global advertised | Linux | U | Build / U | Build | Per-service replica/resource limits | needs-dev |
| Render | $87.50 + P/U, always allocated | Global advertised | Linux/Docker | U | Build / U | Build | Stateful single-instance disks; fleet quota U | needs-dev |
| Orgo | $24.94 capacity benchmark + U | U | Linux/Windows; other OS by request/availability | Linux 2q/4q | U / U | HTTP/VNC | 16 computers plus add-ons; fleet quote | needs-testing |
| Scrapybara | Not established | Not applicable | Historical offering | Not current | Not current | Not current | Shutdown notice | Excluded unless replacement confirmed |
| Cua | Host + about $0.27 relay/seats | Host-dependent | macOS/Linux; Windows preview in Spaces | Host-dependent | Host-dependent / U | Watch/takeover | Up to 100 Teams seats self-service | needs-dev; not standalone compute |
| Hyperbeam | Quote | Worldwide, cities U | Chrome/Android/Linux/emulators | WebGL; model U | U / U | Native streaming/control | 10,000 participants, not environments | needs-testing |
| Neko | Host + storage/transfer/ops | Host-dependent | Linux apps | Host-dependent/U | Build / U | WebRTC/control | Self-operated | needs-dev |
| Firecracker/VMM hosts; CubeSandbox | Host + storage/transfer/ops | Host-dependent | Linux kernel architecture | Host-dependent/U | Build / U | Build | Self-operated/host quota | needs-dev |
| Sprites | $5.33 + U | U | Linux | U | Build / U | Build | Quote active/stored limits | needs-dev |
| Exe.dev | $3.95-$5.72 + P/U | Placement controls; cities U | KVM environment; Linux desktop project | U | Build / U | Build | Pool/standalone limits differ | needs-dev |
| Beam VM | $2.25 + U | U | Linux | Separate GPU products | Build / U | Build | Listed CPU 1,000 on Team; confirm VM scope | needs-dev |
| Deno | $9 compute + S/P/U | Amsterdam, Chicago | Linux | U | Egress controls / U | Build | Pro 3/Builder 20 per region; lifetime clarification | needs-testing; limits blocker |
| Hopx | $5.90 + U conditional | U | MicroVM/software execution | U | U / U | Build/U | Unlimited advertised; binding quotas U | needs-testing |
| AgentBay | $3.45 conditional; about $71.90 if retained running | Singapore stated | Windows/Linux/mobile | U | U / U | Remote-control capability; takeover details U | 200 paid; Ultra paid expansion | needs-testing |
| Runpod | $8.80+ A5000; $27.40+ RTX 4090 | 30+ advertised | Desktop OS combination U | Yes | Build / U | Build | Inventory/reservations; desktop quota U | needs-dev |
| Vultr | $44.20 + U, 8-GB always-allocated example | Location-specific; exact map U | Exact selected OS/license U | Yes catalog | Build / U | Build | Quote | needs-dev |
| Scaleway | EUR 28.40 compute + S/U | Europe; PAR-1 priced | Selected OS U | Not established here | Build / U | Build | Quote | needs-dev |
| Hetzner | Quote | Worldwide advertised | Linux distributions | U | Build / U | Build | Quote | needs-dev |
| Polaris | CPU quote; H100 compute $129.30+ | U | U | H100 direct capacity | U / U | U | Quote | needs-testing |

[estimate] Entries with unknowns are not claimed to meet your hard constraints. They remain in the comparison because they are relevant candidates or specifically requested names; excluding them entirely would hide potentially useful options and product changes.

### Ranked Shortlist For Your Priorities

1. **Daytona - best first integration baseline.** [estimate] Native graphical access, persistent CPU environments, and an accessible automation model reduce implementation risk. [official-docs] Persistence and VNC are documented. [46][72] [estimate] Pilot CPU first; treat GPU/Windows as separate SKUs, and negotiate substantially larger quotas.
2. **Boat - best published cost opportunity.** [estimate] The $0.54 small-VM runtime benchmark deserves immediate commercial diligence. [official-docs] Its EU footprint, native VM/desktop model and stopped billing are explicit. [6] [estimate] Promote it only after confirming long-term retained-state charges, support, restore reliability and stored-environment limits.
3. **E2B - best explicit pause/retention baseline.** [official-docs] Indefinite paused retention, memory/filesystem capture, and a documented desktop template are unusually relevant. [1][74] [estimate] It is a strong second-provider recovery target, subject to quota, network and commercial approval.
4. **Northflank - best custom-stack cost/control balance.** [official-docs] Paused compute stops billing while durable volume charges remain clear. [5] [estimate] At about $3.50/account/month before network and operations, it is attractive if you can maintain the desktop image and streaming layer.
5. **Beam persistent VMs - best additional low-cost lead.** [official-docs] Per-second persistent-VM rates and included root disk are compelling. [29] [estimate] Rank it below the first four until VM-specific stopped retention, API maturity, desktop support and quota scope are confirmed.
6. **Blaxel / Sprites / MorphVM - evaluate for specialized state models.** [estimate] Blaxel is attractive for high advertised scale and rapid standby, Sprites for persistent filesystem simplicity, and Morph for snapshot primitives. Their retained-state costs, stored-count quotas and custom GUI work decide the winner, not headline resume speed. [28][24][20][61]
7. **Orgo and AgentBay - separate Windows/mobile workstream.** [official-docs] Both expose broader OS-oriented capabilities than a generic Linux sandbox. [45][50] [estimate] Orgo needs a fleet-capacity quote; AgentBay needs a proven account-state lifecycle across deletion because idle sessions remain billed. [51]
8. **Runpod / selected Northflank, Modal, Beam or Koyeb GPU SKUs - specialist graphics pool.** [estimate] Use only where tests establish a real functional need and supported graphics stack. Do not pay for one GPU per account by default, and do not interpret GPU availability as a guarantee of platform acceptance.

**Bottom line:** [estimate] Start with a small, authorized-workload comparison of **Daytona, Boat, E2B, and Northflank**, with Beam as the additional cost challenger. Contract for commercial eligibility, retained-state capacity, exports and support before expanding. None currently has enough established evidence to promise hundreds of thousands of persistent, residential-only, stable-fingerprint account environments without substantial validation and engineering.

## References

1. *Sandbox persistence - E2B Docs*. https://docs.e2b.dev/sandbox/persistence
2. *Code sandbox*. https://docs.together.ai/docs/together-code-sandbox
3. *Pricing | Kernel*. https://www.kernel.sh/pricing
4. *Sandbox resources and pricing | Modal Docs*. https://modal.com/docs/guide/sandbox-resources
5. *Sandboxes on Northflank cloud | Compute | Sandboxes | Northflank Application docs*. https://northflank.com/docs/v1/application/sandboxes/sandboxes-on-northflank-cloud
6. *boat: Cheapest, Most Powerful Sandboxes for Agents*. https://boat.dev/
7. *Daytona - Secure Infrastructure for Running AI-Generated Code*. https://www.daytona.io/
8. *Limits and Instance Types*. https://developers.cloudflare.com/containers/platform-details/limits/
9. *Pricing*. https://developers.cloudflare.com/containers/pricing/
10. *Runloop - Pricing*. https://runloop.ai/pricing
11. *Pricing | E2B — The AI Agent Cloud*. https://e2b.dev/pricing
12. *Pricing — Northflank*. https://northflank.com/pricing
13. *codesandbox.io*. https://codesandbox.io/pricing
14. *Limits | Daytona*. https://www.daytona.io/docs/en/limits
15. *Pricing: Pay per second for GPUs and CPUs | Modal*. https://modal.com/pricing
16. *Fly.io Resource Pricing · Fly Docs*. https://fly.io/docs/about/pricing/
17. *Subscribe*. https://cloud.morph.so/pricing
18. *Vercel Sandbox pricing and quotas*. https://vercel.com/docs/sandbox/pricing
19. *Introduction - Hyperbeam*. https://docs.hyperbeam.com/
20. *Sprites Overview - Fly.io*. https://docs.sprites.dev/
21. *Persistent Disks — Preserve your service's filesystem changes across deploys.*. https://render.com/docs/disks
22. *API Reference*. https://docs.orgo.ai/api-reference/introduction
23. *Volumes | Koyeb*. https://www.koyeb.com/docs/reference/volumes
24. *Usage and quotas*. https://docs.blaxel.ai/Security/Quotas
25. *Sandbox Configuration*. https://docs.beam.cloud/v2/sandbox/configuration
26. *Pricing | Orgo*. https://www.orgo.ai/pricing
27. *Pricing - exe.dev*. https://exe.dev/pricing
28. *Pricing | Blaxel*. https://blaxel.ai/pricing
29. *Pricing | Beam*. https://www.beam.cloud/pricing
30. *Fly.io pricing*. https://sprites.dev/pricing
31. *Pricing Plans | Railway Docs*. https://docs.railway.com/reference/pricing/plans
32. *Pricing | Railway*. https://railway.com/pricing
33. *Usage Pricing - exe.dev*. https://exe.dev/usage-pricing
34. *Pricing | Cua Spaces*. https://cua.ai/pricing
35. *Pricing for intensive infractrucure - Koyeb*. https://www.koyeb.com/pricing
36. *Render Pricing*. https://render.com/pricing
37. *Documentation | morphcloud Docs*. https://cloud.morph.so/docs/documentation
38. *Persistent Linux VM Sandbox for AI Agents | boat by ASCII*. https://boat.dev/persistent-linux-vm-sandbox
39. *Cua documentation*. https://cua.ai/docs
40. *GitHub - codesandbox/codesandbox-sdk: Programmatically start (AI) sandboxes on top of CodeSandbox · GitHub*. https://github.com/codesandbox/codesandbox-sdk
41. *Internet access*. https://docs.e2b.dev/sandbox/networking
42. *Hyperbeam — Embed Virtual Computers in your website*. https://hyperbeam.com/
43. *Data persistence with R2*. https://developers.cloudflare.com/sandbox/tutorials/persistent-storage/
44. *Sandboxes*. https://docs.blaxel.ai/Sandboxes/Overview
45. *Introduction*. https://docs.orgo.ai/introduction
46. *Persistence | Daytona*. https://www.daytona.io/docs/en/persistence
47. *A computer for your agent | Polaris*. https://polaris.computer/
48. *Sandbox pricing, billed per second | Polaris*. https://polaris.computer/pricing
49. *Hopx - Secure Sandboxes for AI Agents | Run Untrusted Code Safely*. https://hopx.ai/terms
50. *AgentBay*. https://www.alibabacloud.com/en/product/agentbay
51. [
 AgentBay billing plans and pricing - AgentBay - Alibaba Cloud Documentation Center

](https://www.alibabacloud.com/help/en/agentbay/product-overview/agentbay-billing-instructions)
52. *Cloud-hosting provider for developers & teams*. https://www.hetzner.com/cloud/pricing
53. *Deno Sandbox | Deno Docs*. https://docs.deno.com/sandbox
54. *Deno Deploy Pricing*. https://deno.com/deploy/pricing
55. *Storage options*. https://docs.runpod.io/pods/storage/types
56. *Hopx - Secure Sandboxes for AI Agents | Run Untrusted Code Safely*. https://www.hopx.ai/pricing/
57. *GPU Cloud Pricing | Per-Second H100, A100, RTX | Runpod*. https://www.runpod.io/pricing
58. *Virtual Instances Pricing | Scaleway*. https://www.scaleway.com/en/pricing/virtual-instances/
59. *High Performance, High Frequency, Bare Metal, Affordable Cloud Computing - Vultr.com*. https://www.vultr.com/pricing/
60. *Regions*. https://www.daytona.io/docs/en/regions.md
61. *Documentation Overview | morphcloud Docs*. https://cloud.morph.so/docs/documentation/overview
62. *The Devbox Lifecycle*. https://docs.runloop.ai/docs/devboxes/lifecycle
63. *Billing | Daytona*. https://www.daytona.io/docs/en/billing
64. *GitHub - google/swiftshader: SwiftShader is a high-performance CPU-based implementation of the Vulkan graphics API. Its goal is to provide hardware independence for advanced 3D graphics. · GitHub*. https://github.com/google/swiftshader
65. *Getting Started with Fly GPUs · Fly Docs*. https://fly.io/docs/gpus/getting-started-gpus
66. *Daytona - Secure Infrastructure for Running AI-Generated Code*. https://www.daytona.io/sla
67. *Postmortem: Service disruption on Jan 13, 2026 — E2B Blog*. https://e2b.dev/blog/postmortem-service-disruption-on-jan-13-2026
68. *Scrapybara*. https://www.kernel.sh/docs/migrations/scrapybara
69. *GitHub - abrahamjuliot/creepjs: Creepy device and browser fingerprinting · GitHub*. https://github.com/abrahamjuliot/creepjs
70. *GitHub - m1k1o/neko: A self hosted virtual browser that runs in docker and uses WebRTC. · GitHub*. https://github.com/m1k1o/neko
71. *Issues · daijro/camoufox · GitHub*. https://github.com/daijro/camoufox/issues
72. *VNC Access | Daytona*. https://www.daytona.io/docs/en/vnc-access
73. *raw.githubusercontent.com*. http://raw.githubusercontent.com/TencentCloud/CubeSandbox/master/docs/architecture/overview.md
74. *Desktop*. https://docs.e2b.dev/template/examples/desktop
