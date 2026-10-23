import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
mkdirSync(join(here, "prompts"), { recursive: true });

const context = `CONTEXT (who is asking and why)
An operator based in Vietnam runs automated Facebook Marketplace seller accounts (persona accounts living in Ireland, UK, Canada, the US and Australia), driven by a Node/TypeScript CLI (log-cli) using Playwright + Camoufox (anti-detect Firefox). Today it runs on one Windows PC. It must scale to thousands and eventually hundreds of thousands of accounts across many platforms beyond Facebook (other marketplaces, social and mobile-first apps). Hard constraints: no physical hardware can be bought, shipped or placed anywhere (the operator is in Vietnam); cost and reliability matter most, then scalability. Each account needs an isolated, persistent environment (own machine or profile, cookies, disk, stable device fingerprint for months), viewable live with takeover (VNC or live view), with ALL platform traffic exiting through that account's own residential proxy in its home city (2Captcha residential proxies today), never the host's datacenter IP. Environments must carry per-account configuration, be swappable between providers through an adapter layer, and be testable against detection (CreepJS-style leak tests) before going live. Known risks from our own study: software rendering (llvmpipe/SwiftShader) on GPU-less Linux VMs is a VM tell and may give identical canvas/WebGL output across VMs; a spoofed GPU name that contradicts the real pixels is caught by consistency checkers; datacenter IPs are unacceptable. Typical usage is about 1 hour of active browser time per account per day.

TASK
Find EVERY viable provider in the category below, not just the obvious ones. For each provider document, with source URLs:
1. What it is and how the service works (architecture, how you create and drive an environment, APIs/SDKs, CDP/WebDriver/SSH/VNC access).
2. Official documentation and API reference links, integration guides, examples.
3. Pricing in full: per-second/hour/month rates, subscriptions, minimum commitments, storage/snapshot/egress/bandwidth charges, concurrency or seat fees, volume discounts. Then compute the estimated cost per account per month assuming 1 active hour per day plus persistent storage, and projected monthly cost at 100, 1,000, 10,000 and 100,000 accounts (state assumptions).
4. Geography: regions and data-centre locations, countries supported, restrictions (including whether a customer in Vietnam can sign up and pay, KYC, and acceptable-use policy on automation and multi-accounting).
5. Reliability and performance: SLA/uptime commitments, status-page history, known outages, cold-start/boot times, persistence guarantees, rate limits, API quotas.
6. Scalability: maximum concurrent environments, account/organisation limits, how quotas are raised, bottlenecks.
7. Capabilities and limitations: OS options (Linux/Windows/Android), GPU availability and type, whether we can run our own browser (Camoufox/Firefox) or only theirs, bring-your-own proxy support and whether ALL traffic can be forced through it, fingerprint control, persistent profiles, snapshots, live view and takeover, file upload, audio/video.
8. Implementation requirements for us: what we would build to integrate it into a TypeScript CLI (auth, SDK, provisioning, proxy wiring, state storage), and estimated effort.
9. Detection-relevant facts: independent evidence (tests, GitHub issues, forum reports, papers) on how detectable environments from this provider are (VM tells, renderer strings, shared fingerprints, IP reputation), clearly separated from vendor claims.
10. Commercial viability verdict for our use case.

For every fact, label the evidence grade: [official-docs], [independent], [estimate], or [unverified/needs-validation]. Prefer current 2026 information. End with a comparison table of all providers in this category (cost per account per month at 1,000 accounts, regions, OS, GPU, BYO proxy, live view, max scale, readiness: ready-now / needs-dev / needs-testing) and a ranked shortlist with reasoning.

CATEGORY
`;

const categories = {
  agentVmHosts:
    "Cloud sandboxes and persistent VMs for AI agents and developers that can run a full desktop browser per environment: boat.dev (boat), E2B, Daytona, Modal Sandboxes, Fly.io Machines, Vercel Sandbox, Cloudflare Containers / Sandbox SDK, Northflank, Morph Cloud, Runloop, CodeSandbox SDK, Kernel (onkernel), Blaxel, Koyeb, Railway, Render, Firecracker-based hosts, Orgo, Scrapybara, Cua (trycua) cloud computers, Hyperbeam, Neko, and any others. Include which offer GPUs, Windows, desktop streaming, snapshots and per-second billing.",
  selfManagedCompute:
    "Self-managed compute we would operate ourselves to pack isolated per-account containers or VMs: budget VPS and bare metal (Hetzner, OVH / Kimsufi / So you Start, Contabo, Netcup, Vultr, DigitalOcean, Linode/Akamai, Scaleway, UpCloud, Oracle Cloud free/ARM, AWS EC2 incl. spot and Lightsail, Google Cloud, Azure), plus Windows and GPU options: Windows VPS providers, cloud desktops / VDI (AWS WorkSpaces, Azure Virtual Desktop, Windows 365, Shadow PC, Paperspace, Kamatera), and cheap GPU clouds (Vast.ai, RunPod, TensorDock, Lambda, Genesis Cloud, Hetzner GPU, OVH GPU, Salad, Akash). Cover per-VM consumer-like GPU rendering options (vGPU, GPU partitioning, consumer RTX cards in community clouds) and the cost of per-account Windows + GPU isolation at scale.",
  cloudBrowsersAndAntidetect:
    "Managed cloud browsers and commercial anti-detect browsers usable per account at scale: Browserbase, Kernel, Steel, Hyperbrowser, Anchor Browser, Browserless, Browser Use cloud, Bright Data Scraping Browser / Browser API, Oxylabs, Zyte, 2Captcha Browser API, Multilogin (incl. cloud profiles), GoLogin (incl. cloud browser), AdsPower, Octo Browser, Kameleo, Dolphin Anty, Incogniton, NSTBrowser, Undetectable.io, MoreLogin, Hidemyacc, VMLogin, Lalicat, BitBrowser, and any Camoufox-based hosted offerings. Include per-profile pricing tiers at thousands to hundreds of thousands of profiles, API/automation access, headless server deployment, real-device fingerprint databases vs noise, Firefox vs Chromium engines, team and scale limits, and independent detection test results (CreepJS, pixelscan, browserleaks, Meta checkpoint reports).",
  cloudPhonesAndDevices:
    "Remote mobile and real-device environments that need no physical hardware on our side: cloud phones and Android in the cloud (GeeLark, DuoPlus, VMOS Cloud, Redfinger, UgPhone, LDCloud, Multilogin cloud phones, MoreLogin cloud phones, AdsPower cloud phone, Genymotion SaaS, Anbox Cloud, Redroid hosting), real-device clouds (AWS Device Farm, BrowserStack, Sauce Labs, LambdaTest, Kobiton, HeadSpin), rentable remote phone farms and mobile-proxy device farms, and any service renting real consumer PCs or laptops remotely (dedicated remote desktop rentals, residential VPS on home connections). Assess whether they run real ARM phones or emulators, device fingerprint quality, automation APIs (ADB, Appium), proxy support, Facebook app suitability, price per device per month at scale, and terms on social-media multi-accounting.",
  proxiesAndCaptcha:
    "Residential, ISP (static residential) and mobile proxy providers plus captcha solving, as the network layer for each account: 2Captcha residential proxies, Bright Data, Oxylabs, Decodo (Smartproxy), IPRoyal, SOAX, NetNut, Webshare, Proxy-Cheap, PacketStream, Rayobyte, Infatica, Nimble, Proxy-Seller, ProxyEmpire, Live Proxies, Massive, Evomi, DataImpulse, and mobile proxy specialists (The Social Proxy, Proxidize, iProxy, AirProxy and similar). For each: city-level targeting in Ireland, UK, Canada, US and Australia; sticky session length and whether a fixed IP per account can be kept for weeks (ISP proxies); price per GB and per IP at scale; bandwidth needed per account per month for Facebook Marketplace browsing and photo uploads (estimate); IP pool quality and fraud scores; protocol support (HTTP/SOCKS5, UDP for WebRTC/QUIC); provisioning API; and captcha solvers (2Captcha, CapSolver, Anti-Captcha, CapMonster, NopeCHA) with support for Arkose/FunCaptcha as used by Meta and the requirement to solve from the account's own IP. Compute the per-account monthly network cost at 100, 1,000, 10,000 and 100,000 accounts.",
};

for (const [name, category] of Object.entries(categories)) {
  writeFileSync(join(here, "prompts", `${name}.txt`), `${context}${category}\n`);
}
console.log(Object.keys(categories).join("\n"));
