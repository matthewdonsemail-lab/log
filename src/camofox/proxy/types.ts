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
}
