/**
 * Countries and the proxy check. An account's proxy lives in Twenty
 * (`socialAccounts.proxy`), its country in `homeCountry`; `camofox/run` hands
 * both to `python/proxyGate.py`, which refuses any launch whose exit IP isn't
 * in that country (AGENTS.md rule 12, docs/proxies.md).
 */

/** `log proxy check`: what the proxy's exit IP looks like from outside. */
export interface ProxyCheck {
  ok: true;
  exitIp: string;
  exitCountry: string;
  country: string;
  /** Where Camoufox's GeoIP puts the exit IP. */
  latitude?: number;
  longitude?: number;
  /** The slowest Facebook file through the proxy, in ms (null for SOCKS). Over `SLOW_FACEBOOK_MS` a launch is refused. */
  facebookMs?: number | null;
}

/** Same limit as `SLOW_MS` in python/proxyGate.py: over it, pages sit on Facebook's loading skeleton. */
export const SLOW_FACEBOOK_MS = 2500;
